variable "github_token" {
  default = env("GITHUB_TOKEN")

  validation {
    condition     = length(var.github_token) > 0
    error_message = <<EOF
The github_token var is not set: make sure to at least set the GITHUB_TOKEN env var.
To fix this you could also set the github_token variable from the arguments, for example:
$ packer build -var=github_token=...
EOF
  }
}

variable "tailscale_machine_key" {
  default = env("TAILSCALE_MACHINE_KEY")

  validation {
    condition     = length(var.tailscale_machine_key) > 0
    error_message = <<EOF
The tailscale_machine_key var is not set: make sure to at least set the TAILSCALE_MACHINE_KEY env var.
To fix this you could also set the tailscale_machine_key variable from the arguments, for example:
$ packer build -var=tailscale_machine_key=...
EOF
  }
}

variable "cloudflare_email" {
  default = env("CLOUDFLARE_EMAIL")

  validation {
    condition     = length(var.cloudflare_email) > 0
    error_message = <<EOF
The cloudflare_email var is not set: make sure to at least set the CLOUDFLARE_EMAIL env var.
To fix this you could also set the cloudflare_email variable from the arguments, for example:
$ packer build -var=cloudflare_email=...
EOF
  }
}

variable "cloudflare_token" {
  default = env("CLOUDFLARE_TOKEN")

  validation {
    condition     = length(var.cloudflare_token) > 0
    error_message = <<EOF
The cloudflare_token var is not set: make sure to at least set the CLOUDFLARE_TOKEN env var.
To fix this you could also set the cloudflare_token variable from the arguments, for example:
$ packer build -var=cloudflare_token=...
EOF
  }
}

variable "ssl_cert" {
  default = env("SSL_CERT")

  validation {
    condition     = length(var.ssl_cert) > 0
    error_message = <<EOF
The ssl_cert var is not set: make sure to at least set the SSL_CERT env var.
To fix this you could also set the ssl_cert variable from the arguments, for example:
$ packer build -var=ssl_cert=...
EOF
  }
}

variable "ssl_key" {
  default = env("SSL_KEY")

  validation {
    condition     = length(var.ssl_key) > 0
    error_message = <<EOF
The ssl_key var is not set: make sure to at least set the SSL_KEY env var.
To fix this you could also set the ssl_key variable from the arguments, for example:
$ packer build -var=ssl_key=...
EOF
  }
}

source "googlecompute" "oxide-console-base" {
    project_id = "oxide-console"
    // FROM: https://console.cloud.google.com/compute/images
    source_image = "debian-10-buster-v20210316"
    ssh_username = "packer"
    zone = "us-central1-a"
}

build {
    sources = ["sources.googlecompute.oxide-console-base"]
    provisioner "file" {
        source = "packer/iptables-routing.service"
        destination = "/tmp/iptables-routing.service"
    }
    provisioner "file" {
        source = "packer/omicron.toml"
        destination = "/tmp/omicron.toml"
    }
    provisioner "file" {
        source = "packer/oxapi_demo"
        destination = "/tmp/oxapi_demo"
    }
    provisioner "file"{
        source = "packer/nginx"
        destination = "/tmp/nginx"
    }
    provisioner "shell" {
        script = "packer/provision.sh"
        pause_before = "10s"
        timeout      = "10s"
		environment_vars = [
            "GITHUB_TOKEN=${var.github_token}",
            "TAILSCALE_MACHINE_KEY=${var.tailscale_machine_key}",
            "CLOUDFLARE_EMAIL=${var.cloudflare_email}",
            "CLOUDFLARE_TOKEN=${var.cloudflare_token}",
            "SSL_CERT=${var.ssl_cert}",
            "SSL_KEY=${var.ssl_key}"
        ]
    }
    provisioner "shell" {
        script = "packer/bootstrap-cockroach.sh"
        pause_before = "10s"
        timeout      = "10s"
    }
    provisioner "shell" {
        script = "packer/bootstrap-omicron.sh"
        pause_before = "10s"
        timeout      = "10s"
    }
}
