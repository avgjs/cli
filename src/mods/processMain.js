const path = require('path');
const execa = require('execa');
const fs = require('fs-extra');
const ora = require('ora');

module.exports = async function (dir) {
  let spinner = ora('正在编译主程序并拷贝其余文件...').start();
  await execa('npm', ['run', 'dist']);
  fs.copySync(path.resolve(dir, 'index.html'), path.resolve(dir, 'dist/index.html'));
  fs.copySync(path.resolve(dir, 'manifest.json'), path.resolve(dir, 'dist/manifest.json'));
  fs.copySync(path.resolve(dir, 'copyright.txt'), path.resolve(dir, 'dist/copyright.txt'));
  fs.copySync(path.resolve(dir, 'icon64.png'), path.resolve(dir, 'dist/icon64.png'));
  fs.copySync(path.resolve(dir, 'icon128.png'), path.resolve(dir, 'dist/icon128.png'));
  fs.copySync(path.resolve(dir, 'icon192.png'), path.resolve(dir, 'dist/icon192.png'));
  if (fs.existsSync(path.resolve(dir, 'libs'))) {
    fs.copySync(path.resolve(dir, 'libs'), path.resolve(dir, 'dist/libs'));
  }
  spinner.succeed('编译主程序并拷贝其余文件');
}
