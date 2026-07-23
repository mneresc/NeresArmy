import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { atomicWriteFile } from "../../src/output/atomic-write.js";
import { createVault } from "../support/vault.js";

test("atomically replaces a text artifact without a residual temporary file", async () => {
  const vault = await createVault();
  const target = path.join(vault.root, "_V2", "note.md");

  await atomicWriteFile(target, "first\n");
  await atomicWriteFile(target, "second\n");

  expect(await readFile(target, "utf8")).toBe("second\n");
  await expect(
    access(path.join(path.dirname(target), ".note.md.neres-tmp-constant"))
  ).rejects.toThrow();
});

