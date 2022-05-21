import * as constants from "./constants";
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { assert, parseReleaseTag, readPackageJSON } from "./util";

const log = console.log.bind(console);
const execAsync = promisify(exec);

const rootPkgDir = path.resolve(constants.ROOT, "./packages");

(async function () {
  const pkdDirs = await fs
    .readdir(rootPkgDir)
    .then((pkgDirs) => pkgDirs.map((pkgDir) => path.resolve(rootPkgDir, pkgDir)));

  for (const pkgDir of pkdDirs) {
    const pkgJsonPath = path.resolve(pkgDir, "./package.json");
    const pkgJson = await readPackageJSON(pkgJsonPath);

    if (!pkgJson) {
      continue;
    }
    if (pkgJson.private) {
      log(`[${pkgJson.name}] private package, skip.`);
      continue;
    }

    const version = pkgJson.version;
    assert(version, `[${pkgJson.name}] "version" field is missing in package.json`);

    const publishedVersions = await execAsync(`npm view ${pkgJson.name} versions --json`).then(
      ({ stdout }) => JSON.parse(stdout) as string[]
    );
    if (publishedVersions.includes(version)) {
      log(`[${pkgJson.name}] version ${version} is already published, skip.`);
      continue;
    }

    const releaseTag = parseReleaseTag(version);
    log(`[${pkgJson.name}] to publish version ${version} with tag ${releaseTag}`);
  }
})();
