import { program } from "commander";
import * as esBuild from "esbuild";
import * as path from "path";
import * as glob from "glob-promise";

interface BuildOptions {
  environment?: "prod" | "dev";
  input: string;
  outputDir: string;
}

program
  .command("build")
  .option("-e, --environment <environment>", "environment", "dev")
  .option("--input <input>", "input glob", "./src/**/*.ts")
  .option("--outputDir <output>", "output dir", "./dist")
  .action(async function (opts: BuildOptions) {
    const env = opts.environment ?? "dev";
    const inputGlob = opts.input;
    const outputDir = path.resolve(process.cwd(), opts.outputDir);

    const filePaths = await glob.promise(inputGlob);

    const commonOpts: esBuild.BuildOptions = {
      entryPoints: filePaths,
      outdir: outputDir,
      bundle: false,
    };

    const esBuildOpts = env === "dev" ? { ...commonOpts } : { ...commonOpts, minify: true };

    await esBuild.build(esBuildOpts);
  });
