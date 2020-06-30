const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const chokidar = require('chokidar');
const reload = require('reload');
const coffescript = require('coffeescript');
const less = require('less');

// const appendFile = promisify(fs.appendFile);
const copyFile = promisify(fs.copyFile);
const writeFile = promisify(fs.writeFile);

const { app, server } = require('./server');

const pathToEntry = path.join(__dirname, '..', 'src', 'index.coffee');
const pathToLessEntry = path.join(__dirname, '..', 'src', 'styles', 'index.less');

async function compileAndWriteCoffee() {
  const pathToBundle = path.join(__dirname, '..', 'dist', 'bundle.js');
  const coffeeCodeContent = fs.readFileSync(pathToEntry, 'utf8');
  const transpilationResult = coffescript._compileRawFileContent(coffeeCodeContent, pathToEntry);

  return await writeFile(pathToBundle, transpilationResult);
}

async function compileAndWriteLess() {
  const pathToStyleOutput = path.join(__dirname, '..', 'dist', 'style.css');
  const pathToStyleSourceMap = path.join(__dirname, '..', 'dist', 'style.css.map');
  const lessCodeContent = fs.readFileSync(pathToLessEntry, 'utf8');
  const { css: cssResult, map: sourceMapResult } = await less.render(lessCodeContent, {sourceMap: { outputSourceFiles: true }});

  await writeFile(pathToStyleOutput, cssResult);
  await writeFile(pathToStyleSourceMap, sourceMapResult);
  return true;
}

async function copyIndexHtml() {
  return await copyFile(path.join(__dirname, '..', 'src', 'index.html'), path.join(__dirname, '..', 'dist', 'index.html'));
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
    const reloadReturned = await reload(app);
    server.listen(app.get('port'), function () {
      console.log('Web server listening on port ' + app.get('port'))
    });
    chokidar.watch([pathToEntry, pathToLessEntry]).on('all', async (event, path) => {
      console.table({ event, path });
      await copyIndexHtml();
      await compileAndWriteCoffee();
      await compileAndWriteLess();
      reloadReturned.reload();
    });
  } catch (err) {
    console.error(err);
  }
}

run();