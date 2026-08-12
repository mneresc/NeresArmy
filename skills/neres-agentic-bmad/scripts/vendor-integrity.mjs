import { createHash } from "node:crypto";

export function canonicalVendorBytes(content) {
  const bytes = [];
  for (let index = 0; index < content.length; index += 1) {
    if (content[index] === 13 && content[index + 1] === 10) continue;
    bytes.push(content[index]);
  }
  return Buffer.from(bytes);
}

export function vendorFileEvidence(content) {
  const canonical = canonicalVendorBytes(content);
  return {
    sha256: createHash("sha256").update(canonical).digest("hex"),
    size: canonical.length
  };
}
