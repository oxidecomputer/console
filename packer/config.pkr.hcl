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
    provisioner "shell" {
        script = "packer/provision.sh"
        pause_before = "10s"
        timeout      = "10s"
		environment_vars = [
            "GITHUB_TOKEN=${var.github_token}",
            "TAILSCALE_MACHINE_KEY=${var.tailscale_machine_key}"
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
