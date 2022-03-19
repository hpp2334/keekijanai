import { program } from "commander";
import * as path from "path";
import * as glob from "glob-promise";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as babel from "@babel/core";
import { getBabelConfig } from "./get-babel-config";

interface BuildOptions {
  environment?: "prod" | "dev";
  input: string;
  outputDir: string;
}

interface FileInfo {
  source: string;
  absoluteSource: string;
  absoluteDest: string;
}

const group = <T>(array: T[], test: (value: T) => boolean) => {
  const a: T[] = [];
  const b: T[] = [];
  array.forEach((item) => (test(item) ? a : b).push(item));
  return [a, b] as const;
};

const smartWriteFile = async (filepath: string, buf: string | Buffer) => {
  const dir = path.dirname(filepath);
  if (!existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(filepath, buf);
};

const calcCopyInfo = (sources: string[], destDir: string): Array<FileInfo> => {
  if (sources.length === 0) {
    return [];
  }
  const splitedSources = sources.map((x) => x.split("/"));
  let lcaLength = 0;
  const isCP = (x: string[][], index: number) => {
    const ps = x.map((x) => (x.length <= index ? null : x[index]));
    return ps.slice(1).every((x) => ps[0] !== null && x !== null && x === ps[0]);
  };
  while (splitedSources.length > 1 && isCP(splitedSources, lcaLength)) {
    lcaLength += 1;
  }
  const destSuffix = splitedSources.map((x) => x.slice(lcaLength).join("/"));

  const info = Array.from({ length: sources.length })
    .map((_, i) => i)
    .map((index) => {
      const baseSource = sources[index];
      const baseDestSuffix = destSuffix[index];
      const source = path.resolve(process.cwd(), baseSource);
      const dest = path.join(path.resolve(process.cwd(), destDir), baseDestSuffix);

      return {
        source: baseSource,
        absoluteSource: source,
        absoluteDest: dest,
      };
    });
  return info;
};

const build = async (params: { fileInfos: FileInfo[]; isProd: boolean }) => {
  await Promise.all(
    params.fileInfos.map(async (info) => {
      const res = await babel.transformFileAsync(
        info.absoluteSource,
        getBabelConfig({
          isTSX: info.source.endsWith(".tsx"),
          isProd: params.isProd,
        })
      );
      if (res && res.code !== null && res.code !== undefined) {
        const dest = info.absoluteDest.replace(/\.ts(x?)$/, ".js$1");
        await smartWriteFile(dest, res.code);
      }
    })
  );
};

program
  .command("build")
  .option("-e, --environment <environment>", "environment", "dev")
  .option("--input <input>", "input glob", "./src/**/*.+(ts|tsx|json)")
  .option("--outputDir <output>", "output dir", "./dist")
  .action(async function (opts: BuildOptions) {
    const env = opts.environment ?? "dev";
    const inputGlob = opts.input;
    const outputDir = path.resolve(process.cwd(), opts.outputDir);

    const filePaths = await glob.promise(inputGlob).then((paths) => paths.filter((p) => !p.endsWith(".d.ts")));
    const copyInfo = calcCopyInfo(filePaths, outputDir);

    const [toCompileFileInfos, skipCompileFileInfos] = group(copyInfo, (p) => /\.tsx?$/.test(p.source));

    await Promise.all([
      build({
        fileInfos: toCompileFileInfos,
        isProd: env === "prod",
      }),
      skipCompileFileInfos.map(async (info) => {
        const dir = path.dirname(info.absoluteDest);
        if (!existsSync(dir)) {
          await fs.mkdir(dir, { recursive: true });
        }
        await fs.copyFile(info.absoluteSource, info.absoluteDest);
      }),
    ]);
  });
