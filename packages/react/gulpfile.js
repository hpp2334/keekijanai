const gulp = require('gulp');
const path = require('path');
const jetpack = require('fs-jetpack');
const { execSync } = require('child_process');
const esbuild = require('esbuild');
const glob = require('glob-promise');
const through2 = require('through2');
const GulpMem = require('gulp-mem');
const fsDisk = require('fs/promises');
const diskCache = require('./tools/disk-cache');
const { existsSync } = require('fs');
const { transformLess } = require('./tools/transform-less');

diskCache.ensureCacheJsonLoaded();

const getContext = (params) => {
  const ctx = {
    format: 'esm',
    moduleType: 'es2020',
    outDir: './dist/esm',
    gulpMemFs: new GulpMem(),
  };
  params = params || {};
  ctx.format = params.format || ctx.format;
  ctx.moduleType = params.moduleType
    || (ctx.format && ctx.format === 'esm' ? 'es2020' : 'commonjs')
    || ctx.moduleType;
  ctx.outDir = params.outDir || './dist/' + ctx.format;
  ctx.gulpMemFs.enableLog = false;
  return ctx;
}

// clean output dir
const clean = (ctx) => async function clean() {
  const { outDir } = ctx;
  await jetpack.removeAsync(outDir);
}

const processScript = (ctx) => async function processScript() {
  const { outDir, format, gulpMemFs } = ctx;
  const fslist = await glob('./src/**/*.@(tsx|ts|jsx|js|json)');
  const { outputFiles } = await esbuild.build({
    entryPoints: fslist,
    outdir: outDir,
    format: format,
    plugins: [],
    inject: ['./react-shim.js'],
    write: false,
  });
  outputFiles.forEach(file => {
    const fs = gulpMemFs.fs;
    const p = '/' + path.relative(process.cwd(), file.path).replace(/\\/g, '/');
    const dir = path.dirname(p);
    fs.mkdirpSync(dir);
    let contents = file.contents;
    // post process
    if (/\.js$/.test(file.path)) {
      contents = Buffer.from(contents).toString()
        .replace(/\.less(['"])/g, (_, p) => '.css' + p)
        .replace(/\.json(['"])/g, (_, p) => '.js' + p);
    }
    gulpMemFs.fs.writeFileSync(p, contents)
  });
}

const emitToDisk = (ctx) => async function emitToDisk() {
  const { format, outDir, gulpMemFs } = ctx;

  let prefix = '.';
  const prList = [];
  const f = async (o) => {
    for (const key in o) {
      const item = o[key];
      const subpath = '/' + key;
      prefix += subpath;
      if (key && key !== '.' && key !== '..') {
        if (typeof item === 'object' && ('' in item)) {
          // is Dir
          if (!existsSync(prefix)) {
            await fsDisk.mkdir(prefix, { recursive: true });
          }
          await f(item);
        } else {
          prList.push(fsDisk.writeFile(prefix, item, 'utf-8'))
        }
      }
      prefix = prefix.slice(0, -subpath.length);

    }
  }
  await f(gulpMemFs.fs.data);

  await Promise.all(prList);
}

const emitTypes = (ctx) => async function emitTypes() {
  const { outDir, moduleType } = ctx;
  execSync(`tsc -p tsconfig.json -m ${moduleType} --outDir ${outDir} --emitDeclarationOnly`, { stdio: 'inherit' });
}

const processStyle = (ctx) => function processStyle() {
  const { format, outDir, gulpMemFs } = ctx;
  return gulp
    .src(['./src/**/*.@(css|less)'])
    .pipe(through2.obj(async function (file, encoding, next) {
      if (/\.less$/.test(file.path)) {
        const cacheItem = diskCache.getCacheItem(file.path, file.contents);
        if (!cacheItem.match) {
          const css = await transformLess(file.path);
          file.contents = Buffer.from(css);
          diskCache.saveCacheItem(file.path, css);
        } else {
          file.contents = Buffer.from(cacheItem.data);
        }
        file.path = file.path.replace(/\.less$/, '.css');
      }
      this.push(file);
      next();
    }))
    .pipe(gulpMemFs.dest(outDir))
}

// ===

const buildFactory = (ctxParams) => {
  const { emitType } = ctxParams;
  const ctx = getContext(ctxParams);
  
  const list = [
    clean,
    processScript,
    processStyle,
    emitToDisk,
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