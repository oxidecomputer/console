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
		environment_vars = ["GITHUB_TOKEN=${var.github_token}"]
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
