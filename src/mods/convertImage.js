const path = require('path');
const execFile = require('child_process').execFile;
const cwebp = require('cwebp-bin');
const fs = require('fs-extra');
const ora = require('ora');
const getFileListByExtension = require('../utils/getFileListByExtension.js');

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

function changeExtension(filename, ext) {
  const basename = filename.substr(0, filename.lastIndexOf('.'));
  return `${basename}.${ext}`;
}

/**
 * Convert all images in ./assets to webp format,
 * and output to ./dist/assets
 * 
 * @param {string} dir project path
 */
module.exports = async function (dir, options, onProgress) {

  let spinner = ora('正在优化图片...').start();

  options = {
    lossless: false,
    quality: 90,
    sourceExtensions: ['png', 'jpg', 'jpeg', 'bmp'],
    // 目标扩展名设置目前是无效的，强制为webp+png
    targetExtension: 'webp',
    ...options
  };

  let compressOptions;

  if (options.lossless) {
    compressOptions = ['-lossless', '-z', '6'];
  } else {
    compressOptions = ['-af', '-q', options.quality];
  }

  const fileList = await getFileListByExtension(path.resolve(dir, 'assets'), [...options.sourceExtensions, ...options.targetExtension]);

  for (const file of fileList) {
    const originFilename = path.resolve(dir, 'assets', file);
    const targetFilename = path.resolve(dir, 'dist/assets', file);
    const webpFilename = changeExtension(path.resolve(dir, 'dist/assets', file), 'webp');

    spinner.text = `正在优化图片...${file}`;

    fs.ensureDirSync(path.dirname(webpFilename));

    // 判断是否为 .webp 格式，若为是，直接拷贝，否则进行格式转换
    if (path.extname(file) === `.${options.targetExtension}`) {
      fs.copySync(originFilename, webpFilename);
    } else {
      fs.copySync(originFilename, targetFilename);
      await execFilePromise(cwebp, [...compressOptions, originFilename, '-o', webpFilename]);
    }
  }

  spinner.succeed('优化图片');
  
}




