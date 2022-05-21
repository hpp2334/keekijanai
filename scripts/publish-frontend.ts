import * as constants from "./constants";
import * as fs from "fs/promises";
import * as path from "path";
import { exec as _exec, execSync } from "child_process";
import { promisify } from "util";
import { assert, parseReleaseTag, readPackageJSON } from "./util";

interface ToPublishInfo {
  dir: string;
  pkgName: string;
  version: string;
  tag: string;
}

const log = console.log.bind(console);
const execAsync = promisify(_exec);

const rootPkgDir = path.resolve(constants.ROOT, "./packages");

(async function () {
  const pkdDirs = await fs
    .readdir(rootPkgDir)
    .then((pkgDirs) => pkgDirs.map((pkgDir) => path.resolve(rootPkgDir, pkgDir)));

  const toPublishInfos: ToPublishInfo[] = [];

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
    toPublishInfos.push({
      dir: pkgDir,
      pkgName: pkgJson.name,
      version: version,
      tag: releaseTag,
    });
  }

  log("=========");

  log(`${toPublishInfos.length} packages are ready to publish to NPM registry:`);
  toPublishInfos.forEach((pkgInfo) => {
    log(`  ${pkgInfo.pkgName}: ${pkgInfo.version}`);
  });
  log("=========");

  for (const pkgInfo of toPublishInfos) {
    execSync(`npm publish --access public -tag ${pkgInfo.tag}`, {
      cwd: pkgInfo.dir,
      stdio: "inherit",
    });
  }
})();
