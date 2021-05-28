const gulp = require('gulp');
const jetpack = require('fs-jetpack');
const { execSync } = require('child_process');
const esbuild = require('esbuild');
const glob = require('glob-promise');
const through2 = require('through2');
const { transformLess } = require('./tools/transform-less');

const getContext = (params) => {
  const ctx = {
    format: 'esm',
    moduleType: 'es2020',
    outDir: './dist/esm',
  };
  params = params || {};
  ctx.format = params.format || ctx.format;
  ctx.moduleType = params.moduleType
    || (ctx.format && ctx.format === 'esm' ? 'es2020' : 'commonjs')
    || ctx.moduleType;
  ctx.outDir = params.outDir || './dist/' + ctx.format;
  return ctx;
}

// clean output dir
const clean = (ctx) => async function clean() {
  const { outDir } = ctx;
  await jetpack.removeAsync(outDir);
}

const processScript = (ctx) => async function processScript() {
  const { outDir, format } = ctx;
  const fslist = await glob('./src/**/*.@(tsx|ts|jsx|js|json)');
  await esbuild.build({
    entryPoints: fslist,
    outdir: outDir,
    format: format,
    plugins: [],
    inject: ['./react-shim.js']
  });
}

const postProcessScript = (ctx) => function postProcessScript() {
  const { outDir } = ctx;
  return gulp
    .src(`${outDir}/**/*.js`)
    .pipe(through2.obj(async function (file, encoding, next) {
      const contents = file.contents.toString().replace(/\.less(['"])/g, (_, p) => '.css' + p);
      file.contents = Buffer.from(contents);
      this.push(file);
      next();
    }))
    .pipe(gulp.dest(outDir))
}

const emitTypes = (ctx) => async function emitTypes() {
  const { outDir, moduleType } = ctx;
  execSync(`tsc -p tsconfig.json -m ${moduleType} --outDir ${outDir} --emitDeclarationOnly`, { stdio: 'inherit' });
}

const processStyle = (ctx) => async function processStyle() {
  const { format, outDir } = ctx;
  return gulp
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
    .pipe(gulp.dest(outDir))
}

// ===

const buildFactory = (ctxParams) => {
  const { emitType, cleanBeforeProcess = true } = ctxParams;
  const ctx = getContext(ctxParams);
  
  const list = [
    cleanBeforeProcess && clean,
    processScript,
    postProcessScript,
    processStyle,
    emitType && emitTypes
  ]
    .filter(Boolean)
    .map(f => f(ctx));
  return gulp.series(...list);
}

const develop = async () => {
  gulp.watch('./src/**/*.@(tsx|ts|jsx|js|json|css|less)', { ignoreInitial: false }, gulp.parallel(
    buildFactory({ format: 'cjs' }),
    buildFactory({ format: 'esm' }),
  ))
};

const buildESM = buildFactory({ format: 'esm', emitType: true });
const buildCJS = buildFactory({ format: 'cjs', emitType: true });
const build = gulp.parallel(buildESM, buildCJS);

exports['build:esm'] = buildESM;
exports['build:cjs'] = buildCJS;
exports['build'] = build;
exports['develop'] = develop;