import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import type { ArchifyRenderResult, DiagramCandidate } from "./types.ts";
import { RefineryError } from "../errors.ts";
import { prepareArchifyInput } from "./archify-input.ts";
import { validateRenderedTopology } from "./topology.ts";

export type ArchifyRunner = (args: string[]) => Promise<void>;

interface ArchifyAdapterOptions {
  executablePath: string;
  runner?: ArchifyRunner;
}

function defaultRunner(executablePath: string): ArchifyRunner {
  return async (args) =>
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, [executablePath, ...args], {
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"]
      });
      let stderr = "";
      child.stderr.setEncoding("utf8");
      child.stderr.on("data", (chunk: string) => {
        stderr += chunk;
      });
      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) {
          resolve();
          return;
        }
        reject(
          new RefineryError(
            "ERR_ARCHIFY",
            `Archify command failed with exit code ${String(code ?? 1)}${
              stderr.trim() ? `: ${stderr.trim().split(/\r?\n/u)[0]}` : ""
            }.`
          )
        );
      });
    });
}

function extractCanonicalSvg(html: string): string {
  const match = html.match(/<svg\b[\s\S]*?<\/svg>/iu);
  if (!match) {
    throw new RefineryError(
      "ERR_ARCHIFY",
      "Archify HTML has no canonical SVG."
    );
  }
  return `${match[0]}\n`;
}

export class ArchifyAdapter {
  readonly executablePath: string;
  readonly #runner: ArchifyRunner;
  #doctorPassed = false;

  constructor(options: ArchifyAdapterOptions) {
    this.executablePath = options.executablePath;
    this.#runner = options.runner ?? defaultRunner(options.executablePath);
  }

  async doctor(): Promise<void> {
    try {
      await access(this.executablePath);
    } catch (error) {
      throw new RefineryError(
        "ERR_ARCHIFY",
        "Archify installation is missing. Install tt-a1i/archify and run doctor.",
        { path: this.executablePath, cause: error }
      );
    }
    await this.#runner(["doctor"]);
    this.#doctorPassed = true;
  }

  async render(
    candidate: DiagramCandidate,
    outputDirectory: string
  ): Promise<ArchifyRenderResult> {
    if (!this.#doctorPassed) {
      await this.doctor();
    }
    await mkdir(outputDirectory, { recursive: true });
    const inputPath = `${outputDirectory}/${candidate.id}.archify.json`;
    const htmlPath = `${outputDirectory}/${candidate.id}.html`;
    const svgPath = `${outputDirectory}/${candidate.id}.svg`;
    await writeFile(
      inputPath,
      `${JSON.stringify(prepareArchifyInput(candidate), null, 2)}\n`,
      "utf8"
    );
    await this.#runner([
      "deliver",
      candidate.type,
      inputPath,
      htmlPath,
      "--json",
      "--quality",
      "standard"
    ]);
    await this.#runner(["check", htmlPath]);
    const html = await readFile(htmlPath, "utf8");
    validateRenderedTopology(candidate, html);
    await writeFile(svgPath, extractCanonicalSvg(html), "utf8");
    return { inputPath, htmlPath, svgPath };
  }
}
