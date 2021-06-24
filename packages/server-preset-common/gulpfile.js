const gulp = require('gulp');
const { execSync } = require('child_process');
const babel = require('@babel/core');
const path = require('path');
const through2 = require('through2');
const { glob } = require('glob-promise');
const jetpack = require('fs-jetpack');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

Object.defineProperty(String.prototype, 'slash', {
  get: function () {
    return this.split(path.sep).join(path.posix.sep)
  }
})

const cwd = () => process.cwd().slash;

const clean = async () => {
  await jetpack.removeAsync('./dist');
}

const build = async () => {
  // const fslist = await glob('./src/**/*.@(ts|js|json)');
  // await esbuild.build({
  //   entryPoints: fslist,
  //   outdir: './dist',
  //   format: 'cjs',
  //   plugins: [
  //     alias({
  //       '@': path.resolve(__dirname, './dist'),
  //     })
  //   ],
  // });
  return gulp
    .src('./src/**/*.@(ts|js|json)')
    .pipe(through2.obj(async function (file, encoding, next) {
      const { code, map } = await babel.transformAsync(
        file.contents.toString(),
        {
          filename: path.resolve(cwd(), file.path),
        }
      );
      file.contents = Buffer.from(code);
      file.path = file.path.replace(/\.ts$/, '.js');
      this.push(file);
      next();
    }))
    .pipe(gulp.dest('./dist'))
}

const emitTypes = async () => {
  execSync(`tsc -p tsconfig.json --emitDeclarationOnly`, { stdio: 'inherit' });
  
  return gulp
    .src('./dist/**/*.d.ts')
    .pipe(through2.obj(async function (file, encoding, next) {
      let str = file.contents.toString()
      const from = path.resolve(cwd(), path.dirname(file.path.slash));
      const to = path.resolve(cwd(), './dist');
      let dir = path.relative(from, to).slash;
      dir = dir === '' ? '.' : dir;
      const RE = /from (["'])(?:@)(\/[^\1\n]+)?\1;/mg;
      str = str.replace(RE, (_, p, q) => { return `from "${dir}${q}";` });
      file.contents = Buffer.from(str);
      this.push(file);
      next();
    }))
    .pipe(gulp.dest('./dist'))
}

const test = async () => {
  execSync(`npm run build -- --skip-types`, { stdio: 'inherit' });
  execSync(`npm run jest -- --runTestsByPath ./test/services/auth.test.ts`, { stdio: 'inherit' });
  execSync(`npm run jest -- --testPathIgnorePatterns ./test/services/auth.test.ts`, { stdio: 'inherit' });
}

const CLI_build = () => {
  const params = yargs(hideBin(process.argv)).argv;
  const skipTypes = params['skip-types'] ?? false;

  return gulp.series(...[clean, build, !skipTypes && emitTypes].filter(Boolean));
}

const CLI_develop = async () => {
  return gulp.watch(
    './src/**/*.*',
    { ignoreInitial: false, },
    gulp.series(clean, build),
  )
}

const CLI_test = () => {
  return gulp.series(test);
}

exports['build'] = CLI_build();
exports['develop'] = CLI_develop;
exports['test'] = CLI_test();
