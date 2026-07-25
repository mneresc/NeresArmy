import { chmod } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(packageRoot, "dist", "neres-study-refinery.mjs");

await build({
  absWorkingDir: packageRoot,
  entryPoints: [path.join(packageRoot, "src", "cli.ts")],
  outfile: output,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  sourcemap: false,
  banner: {
    js:
      'import { createRequire as __neresCreateRequire } from "node:module"; ' +
      "const require = __neresCreateRequire(import.meta.url);"
  },
  logLevel: "info"
});

if (process.platform !== "win32") {
  await chmod(output, 0o755);
}
