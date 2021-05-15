import { execSync } from 'child_process';
import jetpack from 'fs-jetpack';
import path from 'path';

async function main() {
  // execSync('lerna run build');

  execSync('rimraf ./dist');

  const pkgs = jetpack.list('./packages');

  for (const pkgDir of pkgs) {
    const gp = (s) => path.resolve('./packages', pkgDir, s);

    const pkgJsonPath = gp('./package.json');

    console.log(pkgJsonPath);

    const pkgJson = await jetpack.readAsync(pkgJsonPath, 'json');
    const name = pkgJson.name;

    ['dependencies', 'devDependencies'].forEach(field => {
      if (!pkgJson[field]) {
        return;
      }
      const obj = pkgJson[field];
      for (const key in obj) {
        if (key.startsWith('keekijanai-')) {
          obj[key] = '../' + key;
        }
      }
    });

    const cpDirs = [
      [gp('./dist'), `./dist/${name}/dist`],
      [gp('./package.json'), `./dist/${name}/package.json`],
      [gp('./tsconfig.json'), `./dist/${name}/tsconfig.json`],
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
      `./dist/${name}/package.json`,
      pkgJson,
    );
  }
}
main();
