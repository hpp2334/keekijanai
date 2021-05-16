import jetpack from 'fs-jetpack';
import { execSync } from 'child_process';
import { build } from 'esbuild';
import glob from 'glob-promise';

async function main() {
  const { FORMAT = 'esm' } = process.env;
  const BUILD_OUT_DIR = './dist/' + FORMAT;

  // clean output dir
  await jetpack.removeAsync(BUILD_OUT_DIR);

  const fslist = await glob('./src/**/*.@(tsx|ts|jsx|js|json|css)');

  await build({
    entryPoints: fslist,
    outdir: BUILD_OUT_DIR,
    format: FORMAT,
    inject: ['./react-shim.js']
  });

  execSync(`tsc -p tsconfig.prod.json -m ${FORMAT === 'esm' ? 'es2020' : 'commonjs'} --outDir ${BUILD_OUT_DIR} --emitDeclarationOnly`, { stdio: 'inherit' });

  console.log(`Build ${FORMAT} module in "${BUILD_OUT_DIR}" successfully.`);
}
main();