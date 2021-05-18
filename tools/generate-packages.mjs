import { execSync } from 'child_process';
import jetpack from 'fs-jetpack';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;

async function main() {
  const { outDir = './dist' } = argv;

  execSync('lerna run build');

  const pkgs = jetpack.list('./packages');

  for (const pkgDir of pkgs) {
    const gp = (s) => path.resolve('./packages', pkgDir, s);

    const pkgJsonPath = gp('./package.json');

    const pkgJson = await jetpack.readAsync(pkgJsonPath, 'json');
    const name = pkgJson.name;

    ['dependencies', 'devDependencies'].forEach(field => {
      if (!pkgJson[field]) {
        return;
      }
      const obj = pkgJson[field];
      for (const key in obj) {
        if (key.startsWith('keekijanai-')) {
          obj[key] = 'file:../' + key;
        }
      }
    });

    const outDirWithName = path.join(outDir, name);
    execSync(`rimraf ${outDirWithName}`);
    const cpDirs = [
      [gp('./dist'), `${outDirWithName}/dist`],
      [gp('./package.json'), `${outDirWithName}/package.json`],
      [gp('./tsconfig.json'), `${outDirWithName}/tsconfig.json`],
    ];
    for (const [from, to] of cpDirs) {
      await jetpack.copyAsync(from, to);
    }


    // await jetpack.copyAsync(
    //   gp('./'),
    //   `./dist/${name}`,
    //   {
    //     matching: ['src', 'package.json', 'tsconfig.json', '!(*modules)/**']
    //   }
    // );
    await jetpack.writeAsync(
      `${outDirWithName}/package.json`,
      pkgJson,
    );
  }
}
main();
