{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    nixpkgs-playwright.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, nixpkgs-playwright, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        inherit (pkgs) lib;

        playwrightDriver = nixpkgs-playwright.legacyPackages.${system}.playwright-driver;

        # The @playwright/test dependency in package.json expects you to run `playwright install`,
        # which installs binaries that won't run on nix. We install from playwright-driver instead;
        # as long as the major.minor version matches, we'll have compatible browsers.
        npmPlaywrightVersion =
            (lib.importJSON ./package-lock.json).packages."node_modules/@playwright/test".version;

        node = pkgs.nodejs_24;

        # nodejs_x doesn't always bundle the npm/npx you want. but npm and npx
        # are just scripts bundled with node, so they're easy to shadow
        npm = pkgs.stdenvNoCC.mkDerivation rec {
          pname = "npm";
          version = "12.0.2";
          src = pkgs.fetchurl {
            url = "https://registry.npmjs.org/npm/-/npm-${version}.tgz";
            hash = "sha256-XbuGxx0HoZV/LpBzQJLdali9zZ68LY1ByhxuaiHTZOE=";
          };
          nativeBuildInputs = [ pkgs.makeWrapper ];
          dontBuild = true;
          installPhase = ''
            mkdir -p $out/lib/node_modules/npm
            cp -r . $out/lib/node_modules/npm
            for cli in npm npx; do
              entry=$out/lib/node_modules/npm/bin/$cli-cli.js
              if [ ! -f "$entry" ]; then
                echo "npm/x issue: expected entry point $entry wasn't found. The npm tarball layout may have changed." >&2
                exit 1
              fi
              makeWrapper ${node}/bin/node $out/bin/$cli --add-flags "$entry"
            done
          '';
        };
      in
      {
        devShells.default =
          assert lib.assertMsg
            (lib.versions.majorMinor npmPlaywrightVersion == lib.versions.majorMinor playwrightDriver.version) ''
            Playwright version mismatch: package.json @playwright/test is ${npmPlaywrightVersion}
            but the nixpkgs-playwright input's playwright-driver is ${playwrightDriver.version}.
            Repin nixpkgs-playwright or upgrade (don't downgrade!) @playwright/test so they share a
            major.minor for browser compatibility.
          '';
          pkgs.mkShell {
            packages = [
              # npm needs to come first to shadow the npm/npx commands
              npm
              node
            ];
            env = {
              PLAYWRIGHT_BROWSERS_PATH = "${playwrightDriver.browsers}";
              # https://wiki.nixos.org/wiki/Playwright thinks you need this, but i haven't found it necessary
              # PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
            };
            shellHook = ''
              echo "Node $(node --version), npm $(npm --version)"
            '';
          };
      }
    );
}
