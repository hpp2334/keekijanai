import { execSync } from "child_process";
import jetpack from 'fs-jetpack';
import * as _ from 'lodash';
import tsConfig from '../tsconfig.production.json';

const outDir = tsConfig.compilerOptions.outDir;

async function clearOutputDir() {
  execSync(`rimraf ${outDir}`, { stdio: 'inherit' });
}

async function generatePkgJson() {
  const from = './package.json';
  const to = `${outDir}/package.json`;

  const pkgJson = await jetpack.readAsync(from, 'json');

  const updatedPkgJson = _.assign(pkgJson, {
    main: 'index.js',
    types: 'index.d.ts',
    devDependencies: undefined,
    scripts: undefined,
  });

  await jetpack.writeAsync(to, updatedPkgJson);
}

async function main() {
  await clearOutputDir();
  execSync('tsc -p ./tsconfig.production.json', { stdio: 'inherit' });

  await generatePkgJson();
}

main();