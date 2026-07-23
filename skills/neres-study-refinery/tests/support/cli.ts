import { access } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
  missingEntrypoint: boolean;
}

const packageRoot = path.resolve(import.meta.dirname, "../..");
const cliPath = path.join(packageRoot, "src", "cli.ts");

export async function runCli(args: string[]): Promise<CliResult> {
  try {
    await access(cliPath);
  } catch {
    return {
      code: 127,
      stdout: "",
      stderr: `CLI entrypoint is missing: ${cliPath}`,
      missingEntrypoint: true
    };
  }

  return await new Promise<CliResult>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--experimental-strip-types", cliPath, ...args],
      {
        cwd: packageRoot,
        env: { ...process.env, NO_COLOR: "1" },
        windowsHide: true
      }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({
        code: code ?? 1,
        stdout,
        stderr,
        missingEntrypoint: false
      });
    });
  });
}

export function buildArgs(options: {
  vault: string;
  input: string;
  inputType: "note" | "folder";
  extra?: string[];
}): string[] {
  return [
    "build",
    "--vault",
    options.vault,
    "--input",
    options.input,
    "--input-type",
    options.inputType,
    "--dry-run",
    ...(options.extra ?? [])
  ];
}

export function buildWriteArgs(options: {
  vault: string;
  input: string;
  inputType: "note" | "folder";
  extra?: string[];
}): string[] {
  return [
    "build",
    "--vault",
    options.vault,
    "--input",
    options.input,
    "--input-type",
    options.inputType,
    ...(options.extra ?? [])
  ];
}
