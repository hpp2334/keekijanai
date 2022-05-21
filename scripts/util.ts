import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";

interface RawPackageJson {
  version?: string;
  private?: boolean | string;
  name?: string;
}

interface PackageJson {
  version?: string;
  private: boolean;
  name: string;
}

export const readJSON = async <T = any>(path: string): Promise<T | null> => {
  if (!existsSync(path)) {
    return null;
  }
  const data = await fs.readFile(path, "utf-8");
  return JSON.parse(data) as T;
};

export const readPackageJSON = async (path: string): Promise<PackageJson | null> => {
  const pkgJson = await readJSON<RawPackageJson>(path);
  if (!pkgJson) {
    return null;
  }

  const name = pkgJson.name;
  assert(name, `"name" should exists (${path})`);

  return {
    ...pkgJson,
    private: pkgJson.private === "true" || pkgJson.private === true,
    name,
  };
};

export function assert(value: unknown, msg: string): asserts value {
  if (!value) {
    throw new Error(msg);
  }
}

export function parseReleaseTag(version: string): "beta" | "alpha" | "latest" {
  if (version.includes("-alpha")) {
    return "alpha";
  }
  if (version.includes("-beta")) {
    return "beta";
  }
  if (/\w+\.\w+\.\w/.test(version)) {
    return "latest";
  }
  throw new Error(`parse release tag for version "${version}" fail`);
}
