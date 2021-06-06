const { execSync, exec } = require('child_process');
const jetpack = require('fs-jetpack');
const path = require('path');
const gulp = require('gulp');
const minimatch = require("minimatch");
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const cpy = require('cpy');
const { promisify } = require('util');

const execAsync = promisify(exec);

let _globalMapping = null;

const getContext = (params) => {
  if (!_globalMapping) {
    _globalMapping = {};
    const pkgDirs = jetpack.list('./packages');
    for (const dirName of pkgDirs) {
      const pkgJson = jetpack.read(path.join('./packages', dirName, './package.json'), 'json');
      const { name } = pkgJson;
      _globalMapping[name] = {
        name,
        pkgJson,
        inputDir: path.posix.join('./packages', dirName),
        outputDir: path.posix.join('./dist', dirName),
        get outputPkgJson() {
          return jetpack.read(path.join(this.outputDir, './package.json'), 'json');
        }
      };
    }
  }

  const ctx = {};
  ctx.scope = params.scope;
  ctx.skipPrepare = !!params['skip-prepare'];
  ctx.list = Object
    .keys(_globalMapping)
    .filter(key => ctx.scope ? minimatch(key, ctx.scope) : true)
    .map(key => _globalMapping[key])
  return ctx;
}

const getContextFromCMD = () => {
  const params = yargs(hideBin(process.argv)).argv;
  const ctx = getContext(params);
  return ctx;
}


const bootstrap = async (ctx) => {
  execSync('lerna bootstrap', { stdio: 'inherit' });
}

const clean = async (ctx) => {
  const { list } = ctx;
  for (const { inputDir, outputDir } of list) {
    execSync(`rimraf ${path.join(inputDir, './dist')}`, { stdio: 'inherit' });
    execSync(`rimraf ${outputDir}`, { stdio: 'inherit' });
  }
}

const build = async (ctx) => {
  const { scope } = ctx;
  execSync(`lerna run ${scope ? `--scope="${scope}"` : ''} build`, { stdio: 'inherit' });
}

const prepare = async (ctx) => {
  const constructBuildPromise = async (inputDir, outputDir) => {
    console.log(`ready to copy ${inputDir} to ${outputDir}`);
    await cpy(
      [
        './dist/**/*.*',
        'gatsby-@(ssr|browser|node).js',
        'index.js',
        'package.json',
        'tsconfig.json',
        'readme.md',
        'README.md',
      ],
      path.posix.join(process.cwd(), outputDir),
      {
        cwd: path.posix.join(process.cwd(), inputDir),
        parents: true,
      }
    );
  };

  const { list } = ctx;
  const tasks = list.map(({ inputDir, outputDir }) => constructBuildPromise(inputDir, outputDir));
  await Promise.all(tasks);
}

const publish = async (ctx) => {
  const { list } = ctx;
  for (const { name, outputDir, outputPkgJson } of list) {
    if (outputPkgJson.private) {
      console.log(`"${name}" is private. skip publish.`);
      continue;
    }

    const { stdout } = await execAsync('npm v --json', { cwd: outputDir });
    const publishedVersion = JSON.parse(stdout).version;
    const currentVersion = outputPkgJson.version;
    if (publishedVersion === currentVersion) {
      console.log(`"${name}" version equal, skip publish.`);
    } else {
      execSync('npm publish', { cwd: outputDir, stdio: 'inherit' })
    }
  }
}

const CLI_build = () => {
  const ctx = getContextFromCMD();
  const list = [
    clean,
    bootstrap,
    build,
  ].map(f => f.bind(null, ctx));

  return gulp.series(...list);
}

const CLI_prepare = (_ctx) => {
  const ctx = _ctx || getContextFromCMD();
  const list = [
    clean,
    bootstrap,
    build,
    prepare,
  ].map(f => f.bind(null, ctx));

  return gulp.series(...list);
}

const CLI_publish = () => {
  const ctx = getContextFromCMD();
  const list = [
    publish
  ].map(f => f.bind(null, ctx));

  if (!ctx.skipPrepare) {
    list.splice(0, 0, CLI_prepare(ctx));
  }

  return gulp.series(...list);
}

exports['build'] = CLI_build();
exports['prepare'] = CLI_prepare();
exports['publish'] = CLI_publish();
