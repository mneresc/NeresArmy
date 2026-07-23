import { stat } from "node:fs/promises";
import path from "node:path";
import type { BuildRequest, ResolvedScope } from "../contracts.ts";
import { RefineryError } from "../errors.ts";
import {
  isSameOrDescendant,
  resolveExistingWithinVault,
  resolveOutputWithinVault,
  resolveVaultRoot
} from "./boundary.ts";

function defaultOutput(inputPath: string, inputType: BuildRequest["inputType"]): string {
  if (inputType === "folder") {
    return path.join(inputPath, "_V2");
  }
  const extension = path.extname(inputPath);
  const stem = path.basename(inputPath, extension);
  return path.join(path.dirname(inputPath), "_V2", `${stem}-V2.md`);
}

export async function resolveScope(
  request: BuildRequest,
  excludedDirectoryNames: readonly string[]
): Promise<ResolvedScope> {
  const vaultRoot = await resolveVaultRoot(request.vault);
  const inputPath = await resolveExistingWithinVault(vaultRoot, request.input);
  const metadata = await stat(inputPath);

  if (request.inputType === "note") {
    if (!metadata.isFile() || path.extname(inputPath).toLocaleLowerCase() !== ".md") {
      throw new RefineryError(
        "ERR_INPUT_TYPE",
        "Input type 'note' requires an existing Markdown .md file.",
        { path: inputPath }
      );
    }
  } else if (!metadata.isDirectory()) {
    throw new RefineryError(
      "ERR_INPUT_TYPE",
      "Input type 'folder' requires an existing directory.",
      { path: inputPath }
    );
  }

  const outputPath = await resolveOutputWithinVault(
    vaultRoot,
    request.output ?? defaultOutput(inputPath, request.inputType)
  );

  if (
    outputPath === inputPath ||
    (request.inputType === "note" &&
      isSameOrDescendant(outputPath, inputPath)) ||
    (request.inputType === "folder" &&
      isSameOrDescendant(outputPath, inputPath))
  ) {
    throw new RefineryError(
      "ERR_OUTPUT_COLLISION",
      "Output would overwrite or contain the original input.",
      { path: outputPath }
    );
  }

  return {
    vaultRoot,
    inputPath,
    inputType: request.inputType,
    includeSubfolders: request.includeSubfolders,
    outputPath,
    excludedDirectoryNames
  };
}
