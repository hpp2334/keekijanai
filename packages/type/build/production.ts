import { execSync } from "child_process";
import jetpack from 'fs-jetpack';
import * as _ from 'lodash';

async function clearOutputDir() {
  execSync('rimraf ../../dist/type', { stdio: 'inherit' });
}

async function generatePkgJson() {
  const from = './package.json';
  const to = '../../dist/type/package.json';

  const pkgJson = await jetpack.readAsync(from, 'json');

  const updatedPkgJson = _.merge({
    types: 'index.d.ts',
  }, pkgJson);

  await jetpack.writeAsync(to, updatedPkgJson);
}

async function main() {
  await clearOutputDir();
  execSync('tsc -p ./tsconfig.production.json', { stdio: 'inherit' });

  await generatePkgJson();
}

main();