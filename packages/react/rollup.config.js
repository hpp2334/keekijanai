import esbuild from 'rollup-plugin-esbuild';
import css from 'rollup-plugin-import-css';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts',
  output: {
    file: `./dist/esm/index.js`,
    format: 'es'
  },
  plugins: [
    json(),
    css(),
    esbuild({
      include: /\.[jt]sx?$/,
      exclude: /node_modules/,
      sourceMap: true, // default
      minify: process.env.NODE_ENV === 'production',
      target: 'es2017', // default, or 'es20XX', 'esnext'
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      loaders: {
        // Add .json files support
        // require @rollup/plugin-commonjs
        // '.json': 'json',
        // Enable JSX in .js files too
        '.js': 'jsx',
      },
    })
  ]
};