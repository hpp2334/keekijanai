const jetpack = require('fs-jetpack');
const { execSync } = require('child_process');
const { build } = require('esbuild');
const glob = require('glob-promise');
const gulp = require('gulp');
const through2 = require('through2');
const { transformLess } = require('./transformLess');

async function main() {
  const { FORMAT = 'esm' } = process.env;
  const BUILD_OUT_DIR = './dist/' + FORMAT;

  // clean output dir
  await jetpack.removeAsync(BUILD_OUT_DIR);

  // build tsx
  const fslist = await glob('./src/**/*.@(tsx|ts|jsx|js|json)');
  await build({
    entryPoints: fslist,
    outdir: BUILD_OUT_DIR,
    format: FORMAT,
    plugins: [],
    inject: ['./react-shim.js']
  });

  // build less, css
  await new Promise(resolve => {
    gulp
      .src(['./src/**/*.@(css|less)'])
      .pipe(through2.obj(async function (file, encoding, next) {
        if (/\.less$/.test(file.path)) {
          const css = await transformLess(file.path);
          file.contents = Buffer.from(css);
          file.path = file.path.replace(/\.less$/, '.css');
        }
        
        this.push(file);
        next();
      }))
      .pipe(gulp.dest(BUILD_OUT_DIR))
      .on('end', resolve);
  });

  const doneList = await glob(`${BUILD_OUT_DIR}/*.js`);
  for (const p of doneList) {
    let file = await jetpack.readAsync(p);
    file = file.replace(/\.less(['"])/g, (_, p) => '.css' + p);
    await jetpack.writeAsync(p, file);
  }

  // emit types
  execSync(`tsc -p tsconfig.prod.json -m ${FORMAT === 'esm' ? 'es2020' : 'commonjs'} --outDir ${BUILD_OUT_DIR} --emitDeclarationOnly`, { stdio: 'inherit' });

  console.log(`Build ${FORMAT} module in "${BUILD_OUT_DIR}" successfully.`);
}
main();