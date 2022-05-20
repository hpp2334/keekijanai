import { program } from "commander";
import * as path from "path";
import * as glob from "glob-promise";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as babel from "@babel/core";
import { getBabelConfig } from "./get-babel-config";
import { buildRenameMapper, forceWriteFile, group } from "./util";
import "./async-util";
import * as sass from "sass";
import postcss, { Plugin as PostcssPlugin } from "postcss";
import * as postcssModules from "postcss-modules";

interface BuildOptions {
  environment?: "prod" | "dev";
  input: string;
  outputDir: string;
}

interface FileInfo {
  /** source file path */
  source: string;
  /** absolute source file path */
  absoluteSource: string;
  /** absolute destination file path, calculated with output directory */
  absoluteDest: string;
}

const toFileInfos = (sources: string[], destDir: string): Array<FileInfo> => {
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

const REGEX_MODULE_SCSS = /\.module\.scss$/;
const REGEX_SCSS = /\.scss$/;
const CSSRenameMapper = buildRenameMapper([
  {
    group: "css",
    test: (p) => REGEX_MODULE_SCSS.test(p),
    mapper: (p) => p.replace(REGEX_MODULE_SCSS, ".css"),
  },
  {
    group: "js",
    test: (p) => REGEX_MODULE_SCSS.test(p),
    mapper: (p) => p.replace(REGEX_MODULE_SCSS, ".css.js"),
  },
  {
    group: "css",
    test: (p) => REGEX_SCSS.test(p),
    mapper: (p) => p.replace(REGEX_SCSS, ".css"),
  },
]);

/**
 * If module scss:
 *
 * - Input: /SOURCE/[name].module.scss
 * - Output:
 *
 *     - /DIST/[name].css
 *     - /DIST/[name].css.js (contains map of "name -> compiled name")
 *
 * If non-module scss:
 *
 *   - Input: /SOURCE/[name].scss
 *   - Output: /DIST/[name].css
 */
const buildSCSS = async (params: {
  fileInfos: FileInfo[];
  isProd: boolean;
  beforeWrite?: (res: babel.BabelFileResult) => void;
}) => {
  await params.fileInfos.asyncForeach(async (info) => {
    const isModule = info.source.endsWith(".module.scss");
    const { css } = sass.compile(info.absoluteSource);
    const outputCSSFilePath = CSSRenameMapper.map(info.absoluteDest, "css");
    const outputCSSFileName = path.basename(outputCSSFilePath);

    const filterPlugins = (list: Array<PostcssPlugin | boolean>): Array<PostcssPlugin> =>
      list.filter((x: unknown): x is PostcssPlugin => Boolean(x));
    const { css: processedCSS } = await postcss(
      filterPlugins([
        isModule &&
          postcssModules({
            getJSON: async function (cssFileName, json, outputFilename) {
              const code = `import "./${outputCSSFileName}"\nexport default ${JSON.stringify(json, null, 2)}`;
              await forceWriteFile(CSSRenameMapper.map(info.absoluteDest, "js"), code);
            },
            localsConvention: "camelCaseOnly",
          }),
      ])
    ).process(css, {
      from: undefined,
    });

    await forceWriteFile(outputCSSFilePath, processedCSS);
  });
};

/**
 * input: /SOURCE/[name].tsx?
 * output: /DIST/[name].jsx?
 */
const buildTypeScript = async (params: {
  fileInfos: FileInfo[];
  isProd: boolean;
  importReplacers?: Array<{ test: RegExp; replacer: (value: string) => string }>;
  beforeWrite?: (res: babel.BabelFileResult) => void;
}) => {
  await params.fileInfos.asyncForeach(async (info) => {
    const res = await babel.transformFileAsync(
      info.absoluteSource,
      getBabelConfig({
        isTSX: info.source.endsWith(".tsx"),
        isProd: params.isProd,
        importReplacers: params.importReplacers,
      })
    );
    if (res && res.code !== null && res.code !== undefined) {
      const dest = info.absoluteDest.replace(/\.ts(x?)$/, ".js$1");
      if (params.beforeWrite) {
        params.beforeWrite(res);
      }

      await forceWriteFile(dest, res.code);
    }
  });
};

const copyFileInfos = async (params: { fileInfos: FileInfo[] }) => {
  return params.fileInfos.map(async (info) => {
    const dir = path.dirname(info.absoluteDest);
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.copyFile(info.absoluteSource, info.absoluteDest);
  });
};

program
  .command("build")
  .option("-e, --environment <environment>", "environment", "dev")
  .option("--input <input>", "input glob", "./src/**/*.+(ts|tsx|json|scss)")
  .option("--outputDir <output>", "output dir", "./dist")
  .action(async function (opts: BuildOptions) {
    const env = opts.environment ?? "dev";
    const inputGlob = opts.input;
    const outputDir = path.resolve(process.cwd(), opts.outputDir);

    const filePaths = await glob.promise(inputGlob).then((paths) => paths.filter((p) => !p.endsWith(".d.ts")));
    const fileInfos = toFileInfos(filePaths, outputDir);

    const fileInfoMap = group(fileInfos, [
      // collect dts files but skip copying
      {
        key: "dts",
        test: (p) => /\.d\.ts$/.test(p.source),
      },
      {
        key: "ts",
        test: (p) => /\.tsx?$/.test(p.source),
      },
      {
        key: "scss",
        test: (p) => /\.scss$/.test(p.source),
      },
      {
        key: "$other",
        test: () => true,
      },
    ]);

    await buildSCSS({
      fileInfos: fileInfoMap.scss,
      isProd: env === "prod",
    });
    await buildTypeScript({
      fileInfos: fileInfoMap.ts,
      isProd: env === "prod",
      importReplacers: [
        {
          test: REGEX_MODULE_SCSS,
          replacer: CSSRenameMapper.findAnyRuleOrThrow("example.module.scss", "js").mapper,
        },
        {
          test: REGEX_SCSS,
          replacer: CSSRenameMapper.findAnyRuleOrThrow("example.scss", "css").mapper,
        },
      ],
    });
    await copyFileInfos({
      fileInfos: fileInfoMap.$other,
    });
  });
