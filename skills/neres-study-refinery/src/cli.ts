#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import {
  Command,
  CommanderError,
  InvalidArgumentError,
  Option
} from "commander";
import { loadDefaultConfig, type RefineryConfig } from "./config.ts";
import {
  COMPRESSION_MODES,
  DIAGRAM_MODES,
  INPUT_TYPES,
  PROFILES,
  VISUAL_PROVIDERS,
  type BuildRequest,
  type CompressionMode,
  type DiagramMode,
  type InputType,
  type Profile,
  type VisualProvider
} from "./contracts.ts";
import { RefineryError, toSafeErrorMessage } from "./errors.ts";
import { buildDryRunPlan } from "./planning/dry-run.ts";
import { formatDryRunPlan } from "./planning/format-plan.ts";
import { buildTransformation } from "./transformation/build.ts";

interface CliIO {
  stdout: { write(value: string): unknown };
  stderr: { write(value: string): unknown };
}

interface BuildOptions {
  vault: string;
  input: string;
  inputType: InputType;
  includeSubfolders: boolean;
  profile: Profile;
  output?: string;
  compression: CompressionMode;
  diagrams: DiagramMode;
  dryRun: boolean;
  visualProvider: VisualProvider;
  visualManifest?: string;
  allowExternalAi: boolean;
  openaiModel?: string;
}

function parseBoolean(value: string): boolean {
  const normalized = value.toLocaleLowerCase("en-US");
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }
  throw new InvalidArgumentError("Expected true or false.");
}

function buildCommand(config: RefineryConfig, io: CliIO): Command {
  const program = new Command();
  program
    .name("neres-study-refinery")
    .description(
      "Compile authorized Obsidian study sources into traceable V2 notes."
    )
    .version("0.0.0")
    .exitOverride()
    .configureOutput({
      writeOut: (value) => io.stdout.write(value),
      writeErr: (value) => io.stderr.write(value)
    });

  const build = program
    .command("build")
    .description("Plan or build a closed-source study-note transformation.")
    .requiredOption("--vault <path>", "Obsidian vault root.")
    .requiredOption("--input <path>", "Authorized note or folder inside the vault.")
    .addOption(
      new Option("--input-type <type>", "Input kind.")
        .choices([...INPUT_TYPES])
        .makeOptionMandatory()
    )
    .addOption(
      new Option(
        "--include-subfolders <boolean>",
        "Include nested folders (true or false)."
      )
        .argParser(parseBoolean)
        .default(config.input.include_subfolders)
    )
    .addOption(
      new Option("--profile <profile>", "Didactic profile.")
        .choices([...PROFILES])
        .default(config.classification.profile)
    )
    .option("--output <path>", "Separate output note or folder.")
    .addOption(
      new Option("--compression <mode>", "Compression mode.")
        .choices([...COMPRESSION_MODES])
        .default(config.transformation.compression)
    )
    .addOption(
      new Option("--diagrams <mode>", "Diagram planning mode.")
        .choices([...DIAGRAM_MODES])
        .default(config.diagrams.mode)
    )
    .addOption(
      new Option("--visual-provider <provider>", "Visual extraction provider.")
        .choices([...VISUAL_PROVIDERS])
        .default("none")
    )
    .option(
      "--visual-manifest <path>",
      "Agent-produced visual evidence manifest inside the vault."
    )
    .option(
      "--allow-external-ai",
      "Explicitly authorize sending each selected image to the configured AI provider.",
      false
    )
    .option("--openai-model <model>", "Explicit OpenAI multimodal model.")
    .option(
      "--dry-run",
      "Dry-run does not write files.",
      false
    );

  build.action(async (options: BuildOptions) => {
    const request: BuildRequest = {
      vault: options.vault,
      input: options.input,
      inputType: options.inputType,
      includeSubfolders: options.includeSubfolders,
      profile: options.profile,
      output: options.output,
      compression: options.compression,
      diagrams: options.diagrams,
      dryRun: options.dryRun,
      visualProvider: options.visualProvider,
      visualManifest: options.visualManifest,
      allowExternalAi: options.allowExternalAi,
      openAiModel: options.openaiModel
    };
    if (options.dryRun) {
      const plan = await buildDryRunPlan(request, config);
      io.stdout.write(formatDryRunPlan(plan));
      return;
    }
    const result = await buildTransformation(request, config);
    io.stdout.write(
      `Built ${String(result.noteCount)} note(s) from ${String(result.sourceCount)} source(s).\n`
    );
    for (const createdFile of result.createdFiles) {
      io.stdout.write(`Created: ${createdFile}\n`);
    }
  });

  return program;
}

export async function runCli(
  argv: string[],
  io: CliIO = { stdout: process.stdout, stderr: process.stderr }
): Promise<number> {
  try {
    const config = await loadDefaultConfig();
    const program = buildCommand(config, io);
    await program.parseAsync(argv, { from: "user" });
    return 0;
  } catch (error) {
    if (error instanceof CommanderError) {
      return error.code === "commander.helpDisplayed" ? 0 : error.exitCode;
    }
    io.stderr.write(`${toSafeErrorMessage(error)}\n`);
    return error instanceof RefineryError ? 2 : 1;
  }
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
