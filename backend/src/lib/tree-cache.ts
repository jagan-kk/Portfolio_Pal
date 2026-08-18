import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import type { TreeNode } from "../rag";

export interface TreeCacheEntry {
  hash: string;
  tree: TreeNode[];
}

export function hashFile(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

export function loadTreeCache(cachePath: string): TreeCacheEntry | null {
  if (!existsSync(cachePath)) return null;
  try {
    return JSON.parse(readFileSync(cachePath, "utf8")) as TreeCacheEntry;
  } catch {
    return null;
  }
}

export function saveTreeCache(cachePath: string, entry: TreeCacheEntry): void {
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, JSON.stringify(entry), "utf8");
}