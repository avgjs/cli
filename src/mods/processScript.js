const path = require('path');
const fs = require('fs-extra');
const ora = require('ora');
const getFileListByExtension = require('../utils/getFileListByExtension.js');


function getBasenameList(filelist) {
  const items = [];

  for (const file of filelist) {
    items.push(path.basename(file, path.extname(file)));
  }

  return items;
}

function changeExtension(filename) {
  const basename = filename.substr(0, filename.lastIndexOf('.'));
  return basename + '.bkc';
}
// function changeExtension2(filename) {
//   const basename = filename.substr(0, filename.lastIndexOf('.'));
//   return basename + '.webp';
// }

module.exports = async function (dir, options, onProgress) {

  let spinner = ora('正在处理脚本...').start();

  const imageFileList = await getFileListByExtension(path.resolve(dir, 'assets'), ['png', 'jpg', 'jpeg', 'bmp']);
  const imageBaseFileList = getBasenameList(imageFileList);
  const scriptFileList = await getFileListByExtension(path.resolve(dir, 'assets'), ['bks']);

  for (const scriptFile of scriptFileList) {

    spinner.text = `正在处理脚本...${scriptFile}`;

    const scriptData = fs.readFileSync(path.resolve(dir, 'assets', scriptFile), 'utf8');
    const outputList = [];

    for (let i = 0; i < imageBaseFileList.length; i++) {
      const basename = imageBaseFileList[i];
      if (scriptData.includes(basename)) {
        outputList.push(imageFileList[i]);
      }
    }

    const outputData = {
      resources: outputList
    };

    const outputPath = path.resolve(dir, 'dist/assets', changeExtension(scriptFile));

    fs.ensureDirSync(path.dirname(outputPath));
    fs.writeJSONSync(outputPath, outputData);

    // copy bks file to dist
    fs.copySync(path.resolve(dir, 'assets', scriptFile), path.resolve(dir, 'dist/assets', scriptFile))

  }

  spinner.succeed('处理脚本');

}
