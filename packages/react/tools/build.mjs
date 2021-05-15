import jetpack from 'fs-jetpack';
import { execSync } from 'child_process';

async function main() {
  const { BUILD_MODULE = 'es2015', BUILD_OUT_DIR = './dist/esm' } = process.env;

  // clean output dir
  await jetpack.removeAsync(BUILD_OUT_DIR);

  execSync(`tsc -p tsconfig.json -m ${BUILD_MODULE} --outDir ${BUILD_OUT_DIR}`);

  await jetpack.copyAsync(`./src`, BUILD_OUT_DIR, {
    overwrite: true,
    matching: '**/*.css'
  });
}
main();