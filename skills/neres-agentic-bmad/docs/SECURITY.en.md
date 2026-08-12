# Security and supply chain

[Português](SECURITY.md) · [English](SECURITY.en.md) · [Español](SECURITY.es.md)

The `Supply Chain Security` workflow runs on pull requests, main pushes and manual
dispatch. It attempts GitHub Dependency Review with OpenSSF signals, blocks
high/critical runtime vulnerabilities through `npm audit`, validates every vendored file, and creates
an npm audit result, CycloneDX SBOM and readable report retained for 90 days.

Dependency Review requires the repository Dependency Graph. When unavailable, the
workflow records a warning while runtime audit, SBOM and vendor validation remain
mandatory gates.

The public package also has an independent
[Socket analysis](https://socket.dev/npm/package/%40mneresc%2Fneres-agentic-bmad).

`vendor/bmad/PROVENANCE.json` pins BMAD 6.11.0 origin, MIT license, shasum and npm
integrity. `VENDOR_MANIFEST.json` records SHA-256 and size for every shipped file.
Upstream installer dependencies and install scripts are not shipped or executed.

Report exploitable details through a private GitHub security advisory, not a
public issue, and never include secrets.
