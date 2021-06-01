const gulp = require('gulp');
const { execSync } = require('child_process');
const babel = require('@babel/core');
const path = require('path');
const through2 = require('through2');

const clean = async () => {
  execSync('npm run clean', { stdio: 'inherit' });
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
      const { code } = await babel.transformAsync(
        file.contents.toString(),
        {
          filename: path.resolve(process.cwd(), file.path),
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
}

const CLI_build = () => {
  return gulp.series(clean, build, emitTypes);
}

const CLI_develop = async () => {
  return gulp.watch(
    './src/**/*.*',
    gulp.series(clean, build),
  )
}

exports['build'] = CLI_build();
exports['develop'] = CLI_develop;
