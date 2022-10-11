#!/usr/bin/env python3

# Automatically update tools/console_version in ../omicron with current console
# commit hash and tarball hash. Then create PR in Omicron with that change.
#
# Requirements/assumptions:
#
# - GitHub CLI
# - Omicron is a sibling dir to console

from subprocess import check_output
import shutil
import os
import argparse
import requests  # needs to be installed

OMICRON_DIR = "../omicron"
VERSION_FILE = os.path.join(OMICRON_DIR, "tools/console_version")

GH_MISSING = "GitHub CLI not found. This script needs it to create a PR. Please install it and try again."
OMICRON_MISSING = f"This script assumes omicron shares a parent directory with console. Directory not found at {OMICRON_DIR}."

parser = argparse.ArgumentParser()
parser.add_argument(
    "-d",
    "--dry-run",
    action="store_true",
    help="Print instead of PRing Omicron",
)


def parse_env_vars(s: str):
    """turn file of env vars into a dict"""
    pairs = [line.split("=") for line in s.strip().split("\n")]
    return dict((k, v.strip("\"'")) for k, v in pairs)


def serialize_vars(commit: str, sha2: str):
    return f'COMMIT="{commit}"\nSHA2="{sha2}"\n'


def main():
    dry_run = parser.parse_args().dry_run

    new_commit = check_output(["git", "rev-parse", "HEAD"], text=True).strip()

    new_sha2_resp = requests.get(
        f"https://dl.oxide.computer/releases/console/{new_commit}.sha256.txt"
    )
    new_sha2_resp.raise_for_status()
    new_sha2 = new_sha2_resp.text.strip()

    if dry_run:
        print(serialize_vars(new_commit, new_sha2))
        return

    if not shutil.which("gh"):
        raise Exception(GH_MISSING)

    if not os.path.isdir(OMICRON_DIR):
        raise Exception(OMICRON_MISSING)

    os.chdir(OMICRON_DIR)
    check_output(["git", "checkout", "main"])
    check_output(["git", "pull"])
    check_output(["git", "checkout", "-b", f"bump-console-{new_commit[:8]}"])

    with open(VERSION_FILE, "r") as f:
        old_commit = parse_env_vars(f.read())["COMMIT"]

    pr_title = "Bump console to latest main"
    pr_body = f"Changes: https://github.com/oxidecomputer/console/compare/{old_commit}...{new_commit}"

    with open(VERSION_FILE, "w") as f:
        f.write(serialize_vars(new_commit, new_sha2))

    check_output(["git", "add", "--all"])
    check_output(["git", "commit", "-m", pr_title, "-m", pr_body])
    check_output(["gh", "pr", "create", "--title", pr_title, "--body", pr_body])


if __name__ == "__main__":
    main()
