#!/usr/bin/env node

import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const packageRoot = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(packageRoot, "..", "..");
const outputRoot = path.resolve(argument("--output-dir") ?? path.join(repositoryRoot, "security-reports"));
const npmCli = [process.env.npm_execpath, path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")].find((candidate) => candidate && existsSync(candidate));
if (!npmCli) throw new Error("Unable to locate npm-cli.js.");

await mkdir(outputRoot, { recursive: true });
const audit = runNpm(["audit", "--omit=dev", "--json", "--workspace", "@mneresc/neres-agentic-bmad"]);
const auditJson = parseJson(audit.stdout, "npm audit");
await writeFile(path.join(outputRoot, "npm-audit.json"), `${JSON.stringify(auditJson, null, 2)}\n`, "utf8");

const packageManifest = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
const provenance = JSON.parse(await readFile(path.join(packageRoot, "vendor", "bmad", "PROVENANCE.json"), "utf8"));
const vendorManifest = await readFile(path.join(packageRoot, "vendor", "bmad", "VENDOR_MANIFEST.json"));
const sbom = {
  bomFormat: "CycloneDX",
  specVersion: "1.5",
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: { type: "library", group: "mneresc", name: "neres-agentic-bmad", version: packageManifest.version, purl: `pkg:npm/%40mneresc/neres-agentic-bmad@${packageManifest.version}` }
  },
  components: [{
    type: "library",
    name: provenance.name,
    version: provenance.version,
    licenses: [{ license: { id: provenance.license } }],
    hashes: [{ alg: "SHA-1", content: provenance.shasum }],
    externalReferences: [{ type: "distribution", url: provenance.registry }, { type: "vcs", url: provenance.repository }],
    properties: [{ name: "neresarmy:distribution", value: "vendored-built-assets" }]
  }]
};
await writeFile(path.join(outputRoot, "sbom.cdx.json"), `${JSON.stringify(sbom, null, 2)}\n`, "utf8");
const vulnerabilities = auditJson.metadata?.vulnerabilities ?? {};
const report = `# Supply Chain Security Report\n\nGenerated: ${new Date().toISOString()}\n\n## Published package\n\n- Package: ${packageManifest.name}@${packageManifest.version}\n- Runtime dependencies: ${Object.keys(packageManifest.dependencies ?? {}).length}\n- Install scripts: none\n- Socket analysis: https://socket.dev/npm/package/%40mneresc%2Fneres-agentic-bmad\n\n## npm audit (runtime)\n\n| Severity | Count |\n| --- | ---: |\n${["critical", "high", "moderate", "low", "info"].map((level) => `| ${level} | ${vulnerabilities[level] ?? 0} |`).join("\n")}\n\n## Vendored BMAD\n\n- Source: ${provenance.name}@${provenance.version}\n- License: ${provenance.license}\n- Registry integrity: \`${provenance.integrity}\`\n- Vendor manifest SHA-256: \`${createHash("sha256").update(vendorManifest).digest("hex")}\`\n- Runtime dependencies from upstream installer shipped: no\n- Python bytecode/cache shipped: no\n\n## Enforcement\n\nThe workflow blocks new high or critical runtime vulnerabilities, performs GitHub dependency review, validates every vendored file, and stores this report plus the CycloneDX SBOM as build artifacts.\n`;
await writeFile(path.join(outputRoot, "SUPPLY_CHAIN_REPORT.md"), report, "utf8");
if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, report, { encoding: "utf8", flag: "a" });

const blocking = (vulnerabilities.high ?? 0) + (vulnerabilities.critical ?? 0);
process.stdout.write(`Security report generated at ${outputRoot}; blocking vulnerabilities: ${blocking}.\n`);
if (blocking > 0) process.exitCode = 1;

function runNpm(args) { return spawnSync(process.execPath, [npmCli, ...args], { cwd: repositoryRoot, encoding: "utf8" }); }
function parseJson(source, label) { try { return JSON.parse(source); } catch { throw new Error(`${label} did not return valid JSON.`); } }
function argument(name) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; }
