import { execSync } from "child_process";
import jetpack from 'fs-jetpack';
import * as _ from 'lodash';

async function generatePkgJson() {
  const from = './package.json';
  const to = '../../dist/keekijanai-server/package.json';

  const pkgJson = await jetpack.readAsync(from, 'json');

  const updatedPkgJson = _.merge({
    main: 'index.js',
    types: 'index.d.ts',
  }, pkgJson);

  await jetpack.writeAsync(to, updatedPkgJson);
}

async function main() {
  execSync('tsc -p ./tsconfig.production.json', { stdio: 'inherit' });

  await generatePkgJson();
}

main();