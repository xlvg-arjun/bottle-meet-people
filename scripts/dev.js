const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const chokidar = require('chokidar');
const reload = require('reload');
const coffescript = require('coffeescript');
const less = require('less');

const appendFile = promisify(fs.appendFile);

const { app, server } = require('./server');

const pathToEntry = path.join(__dirname, '..', 'src', 'index.coffee');
const pathToLessEntry = path.join(__dirname, '..', 'src', 'styles', 'index.css');

async function compileAndWriteCoffee() {
  const pathToBundle = path.join(__dirname, '..', 'dist', 'bundle.js');
  const coffeeCodeContent = fs.readFileSync(pathToEntry, 'utf8');
  const transpilationResult = coffescript._compileRawFileContent(coffeeCodeContent, pathToEntry);

  return await appendFile(pathToBundle, transpilationResult);
}

async function compileAndWriteLess() {
  const pathToStyleOutput = path.join(__dirname, '..', 'dist', 'style.css');
  const pathToStyleSourceMap = path.join(__dirname, '..', 'dist', 'style.css.map');
  const lessCodeContent = fs.readFileSync(pathToLessEntry, 'utf8');
  const { css: cssResult, map: sourceMapResult } = await less.render(lessCodeContent, {sourceMap: {}});

  await appendFile(pathToStyleOutput, cssResult);
  await appendFile(pathToStyleSourceMap, sourceMapResult);
  return true;
}

async function run() {
  try {
    await compileAndWriteCoffee();
    await compileAndWriteLess();
    const reloadReturned = await reload(app);
    server.listen(app.get('port'), function () {
      console.log('Web server listening on port ' + app.get('port'))
    });
    chokidar.watch([pathToEntry, pathToLessEntry]).on('all', async (event, path) => {
      console.table({ event, path });
      await compileAndWriteCoffee();
      await compileAndWriteLess();
      reloadReturned.reload();
    });
  } catch (err) {
    console.error(err);
  }
}

run();