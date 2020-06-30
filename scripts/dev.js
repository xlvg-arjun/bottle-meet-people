const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const chokidar = require('chokidar');
const reload = require('reload');
const coffescript = require('coffeescript');
const babel = require("@babel/core");
const less = require('less');
const webpack = require('webpack');

const webpackConfig = require('./webpack.config');
const babelOptions = require('../.babelrc.json');

// const appendFile = promisify(fs.appendFile);
const copyFile = promisify(fs.copyFile);
const writeFile = promisify(fs.writeFile);

const { app, server } = require('./server');

const pathToEntry = path.join(__dirname, '..', 'src', 'index.coffee');
const pathToLessEntry = path.join(__dirname, '..', 'src', 'styles', 'index.less');

const webpackCompiler = webpack(webpackConfig);

async function compileAndWriteCoffee() {
  return new Promise((resolve, reject) => {
    webpackCompiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats.hasErrors()) {
        return reject(stats.toString());
      }
      resolve(stats);
    });  
  });
  // return new Promise((resolve, reject) => {
  //   webpack(webpackConfig, (err, stats) => {
  //     if (err) {
  //       return reject(err);
  //     }
  //     if (stats.hasErrors()) {
  //       return reject(stats.toString());
  //     }
  //     resolve(stats);
  //   });
  // });
  // const webpackCompiler = webpack(webpackConfig);
  // const pathToBundle = path.join(__dirname, '..', 'dist', 'bundle.js');
  // const pathToBundleMap = path.join(__dirname, '..', 'dist', 'bundle.js.map');
  // const coffeeCodeContent = fs.readFileSync(pathToEntry, 'utf8');
  // const transpilationResult = coffescript.compile(coffeeCodeContent, { transpile: babelOptions });
  // const { code: finalCode, map } = await babel.transformAsync(transpilationResult, { babelrcRoots: [path.join(__dirname, '..', '.babelrc.json')] });
  // return await writeFile(pathToBundle, transpilationResult);

  // return await Promise.all([writeFile(pathToBundle, finalCode), writeFile(pathToBundleMap, map)]);
}

async function compileAndWriteLess() {
  const pathToStyleOutput = path.join(__dirname, '..', 'dist', 'style.css');
  const pathToStyleSourceMap = path.join(__dirname, '..', 'dist', 'style.css.map');
  const lessCodeContent = fs.readFileSync(pathToLessEntry, 'utf8');
  const { css: cssResult, map: sourceMapResult } = await less.render(lessCodeContent, { sourceMap: { outputSourceFiles: true } });

  await writeFile(pathToStyleOutput, cssResult);
  await writeFile(pathToStyleSourceMap, sourceMapResult);
  return true;
}

async function copyIndexHtml() {
  return await Promise.all([
    copyFile(path.join(__dirname, '..', 'src', 'index.html'), path.join(__dirname, '..', 'dist', 'index.html')),
    // copyFile(path.join(__dirname, '..', 'src', 'require.js'), path.join(__dirname, '..', 'dist', 'require.js')),
  ]);
}

async function cleanDistDir() {
  const distDir = path.join(__dirname, '..', 'dist');
  const files = fs.readdirSync(path.join(__dirname, '..', 'dist'));
  files.forEach((file) => { fs.unlinkSync(path.join(distDir, file)) });
}

async function run() {
  try {
    // cleanDistDir();
    // await copyIndexHtml();
    // await compileAndWriteCoffee();
    // await compileAndWriteLess();
    cleanDistDir();
    webpackCompiler.watch({}, (err, stats) => {
      if (err) console.error(err);
      // console.log(stats);
    });
    const reloadReturned = await reload(app);
    server.listen(app.get('port'), function () {
      console.log('Web server listening on port ' + app.get('port'))
    });
    chokidar.watch([pathToEntry, pathToLessEntry]).on('all', async (event, path) => {
      console.table({ event, path });
      await copyIndexHtml();
      // const coffeeResult = await compileAndWriteCoffee();
      // console.log(coffeeResult);

      await compileAndWriteLess();
      reloadReturned.reload();
    });
  } catch (err) {
    console.error(err);
  }
}

run();