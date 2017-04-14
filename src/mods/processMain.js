const path = require('path');
const execFile = require('child_process').execFile;
const fs = require('fs-extra');
const ora = require('ora');

function execFilePromise(exec, params) {
  return new Promise((resolve, reject) => {
    execFile(exec, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = async function (dir) {
  let spinner = ora('正在编译主程序并拷贝其余文件...').start();
  await execFilePromise('npm', ['run', 'dist'])
  fs.copySync(path.resolve(dir, 'index.html'), path.resolve(dir, 'dist/index.html'));
  fs.copySync(path.resolve(dir, 'manifest.json'), path.resolve(dir, 'dist/manifest.json'));
  fs.copySync(path.resolve(dir, 'copyright.txt'), path.resolve(dir, 'dist/copyright.txt'));
  fs.copySync(path.resolve(dir, 'libs'), path.resolve(dir, 'dist/libs'));
  spinner.succeed('编译主程序并拷贝其余文件');
}
