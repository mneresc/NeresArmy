import { randomUUID } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export async function atomicWriteFile(
  target: string,
  content: string | Uint8Array
): Promise<void> {
  const directory = path.dirname(target);
  await mkdir(directory, { recursive: true });
  const temporary = path.join(
    directory,
    `.${path.basename(target)}.neres-tmp-${String(process.pid)}-${randomUUID()}`
  );
  try {
    await writeFile(target === temporary ? `${temporary}.write` : temporary, content);
    await rename(temporary, target);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
}

