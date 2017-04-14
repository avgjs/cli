const klaw = require('klaw');
const through2 = require('through2');
const path = require('path');

module.exports = function (dir, extensions) {
  const items = [];

  extensions = toString.call(extensions) === '[object Array]' ? extensions : [extensions];

  var excludeDirFilter = through2.obj(function (item, enc, next) {
    if (item.stats.isFile() && extensions.includes(path.extname(item.path).substr(1))) {
      this.push(item);
    }
    next();
  });

  return new Promise((resolve, reject) => {
    klaw(dir)
    .pipe(excludeDirFilter)
    .on('data', function (item) {
      items.push(path.relative(dir, item.path));
    })
    .on('end', function () {
      resolve(items);
    })
    .on('error', reject);
  })

}
