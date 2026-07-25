import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const skillsRoot = join(root, "skills");
const candidates =
  process.platform === "win32"
    ? [
        ["python", []],
        ["py", ["-3"]],
      ]
    : [
        ["python3", []],
        ["python", []],
      ];

function findPython() {
  for (const [command, prefix] of candidates) {
    const probe = spawnSync(command, [...prefix, "--version"], {
      encoding: "utf8",
      windowsHide: true,
    });
    if (probe.status === 0) {
      return { command, prefix };
    }
  }
  throw new Error(
    "Python 3 não encontrado. Instale Python 3 para validar scripts das skills.",
  );
}

function discoverTests() {
  return readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const scripts = join(skillsRoot, entry.name, "scripts");
      try {
        return readdirSync(scripts, { withFileTypes: true })
          .filter(
            (file) =>
              file.isFile() &&
              file.name.startsWith("test_") &&
              file.name.endsWith(".py"),
          )
          .map((file) => join(scripts, file.name));
      } catch (error) {
        if (error?.code === "ENOENT") return [];
        throw error;
      }
    })
    .sort();
}

const tests = discoverTests();
if (tests.length === 0) {
  console.log("No Python skill tests found.");
  process.exit(0);
}

const python = findPython();
for (const test of tests) {
  console.log(`Running ${test.slice(root.length + 1)}`);
  const result = spawnSync(python.command, [...python.prefix, test], {
    cwd: root,
    env: {
      ...process.env,
      PYTHONDONTWRITEBYTECODE: "1",
      PYTHONUTF8: "1",
    },
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
