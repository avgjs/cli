const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static').path;
const path = require('path');
const execFile = require('child_process').execFile;
const fs = require('fs-extra');
const ora = require('ora');
const getFileListByExtension = require('../utils/getFileListByExtension.js');

ffmpeg.setFfmpegPath(ffmpegPath);

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

function changeExtension(filename) {
  const basename = filename.substr(0, filename.lastIndexOf('.'));
  return basename + '.mp3';
}

/**
 * Convert all images in ./assets to webp format,
 * and output to ./dist/assets
 * 
 * @param {string} dir project path
 */
module.exports = async function (dir, options, onProgress) {

  let spinner = ora('正在优化音频...').start();

  options = {
    sourceExtensions: ['wav', 'mp3', 'ogg'],
    // 目标扩展名设置目前是无效的，强制为webp
    targetExtension: 'mp3',
    ...options
  };

  let compressOptions;

  // if (options.lossless) {
  //   compressOptions = ['-lossless', '-z', '6'];
  // } else {
  //   compressOptions = ['-af', '-q', options.quality];
  // }


  const fileList = await getFileListByExtension(path.resolve(dir, 'assets'), [...options.sourceExtensions, ...options.targetExtension]);

  for (const file of fileList) {
    const originFilename = path.resolve(dir, 'assets', file);
    const webpFilename = changeExtension(path.resolve(dir, 'dist/assets', file));

    spinner.text = `正在优化音频...${file}`;

    fs.ensureDirSync(path.dirname(webpFilename));

    // 判断是否为 targetExtension 格式，若为是，直接拷贝，否则进行格式转换
    if (path.extname(file) === `.${options.targetExtension}`) {
      fs.copySync(originFilename, webpFilename);
    } else {

      await new Promise((resolve, reject) => {
        ffmpeg(originFilename).save(webpFilename)
        .on('error', reject)
        .on('end', resolve);
      });

      // await execFilePromise(cwebp, [...compressOptions, , '-o', ]);
    }
  }

  spinner.succeed('优化音频');
  
}


