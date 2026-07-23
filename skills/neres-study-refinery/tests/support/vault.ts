import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach } from "vitest";

const temporaryRoots = new Set<string>();

afterEach(async () => {
  for (const root of temporaryRoots) {
    await rm(root, { recursive: true, force: true });
  }
  temporaryRoots.clear();
});

export interface TreeEntry {
  path: string;
  type: "directory" | "file" | "symlink";
  size: number;
  sha256?: string;
}

export interface TestVault {
  root: string;
  outsideRoot: string;
  writeMarkdown(relativePath: string, content?: string): Promise<string>;
  writeImage(relativePath: string): Promise<string>;
  snapshot(): Promise<TreeEntry[]>;
}

async function ensureParent(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function snapshotTree(root: string): Promise<TreeEntry[]> {
  const entries: TreeEntry[] = [];

  async function visit(current: string): Promise<void> {
    const children = await readdir(current, { withFileTypes: true });
    children.sort((left, right) =>
      left.name.localeCompare(right.name, "pt-BR", { sensitivity: "base" })
    );

    for (const child of children) {
      const absolute = path.join(current, child.name);
      const relative = path.relative(root, absolute).split(path.sep).join("/");

      if (child.isSymbolicLink()) {
        entries.push({ path: relative, type: "symlink", size: 0 });
        continue;
      }

      if (child.isDirectory()) {
        entries.push({ path: relative, type: "directory", size: 0 });
        await visit(absolute);
        continue;
      }

      const bytes = await readFile(absolute);
      const metadata = await stat(absolute);
      entries.push({
        path: relative,
        type: "file",
        size: metadata.size,
        sha256: createHash("sha256").update(bytes).digest("hex")
      });
    }
  }

  await visit(root);
  return entries;
}

export async function createVault(prefix = "neres-refinery-"): Promise<TestVault> {
  const root = await mkdtemp(path.join(tmpdir(), prefix));
  const outsideRoot = await mkdtemp(path.join(tmpdir(), `${prefix}outside-`));
  temporaryRoots.add(root);
  temporaryRoots.add(outsideRoot);

  return {
    root,
    outsideRoot,
    async writeMarkdown(relativePath, content = "# Fonte autorizada\n") {
      const target = path.join(root, relativePath);
      await ensureParent(target);
      await writeFile(target, content, "utf8");
      return target;
    },
    async writeImage(relativePath) {
      const target = path.join(root, relativePath);
      await ensureParent(target);
      await writeFile(target, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
      return target;
    },
    snapshot: () => snapshotTree(root)
  };
}

export async function createOutsideMarkdown(
  outsideRoot: string,
  name = "outside.md",
  content = "# Conteúdo externo proibido\n"
): Promise<string> {
  const target = path.join(outsideRoot, name);
  await ensureParent(target);
  await writeFile(target, content, "utf8");
  return target;
}

export async function createPrefixSiblingMarkdown(
  vaultRoot: string
): Promise<string> {
  const target = `${vaultRoot}-backup.md`;
  await writeFile(target, "# sibling externo\n", "utf8");
  temporaryRoots.add(target);
  return target;
}

export async function createDirectoryJunction(
  target: string,
  linkPath: string
): Promise<void> {
  await mkdir(path.dirname(linkPath), { recursive: true });
  await symlink(target, linkPath, process.platform === "win32" ? "junction" : "dir");
}
