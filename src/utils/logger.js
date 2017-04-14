require('colors');

// reload console.log to display warning.
// const _log = console.log;
// console.log = function (...args) {
//   _log(...args);
//   exports.warnln('It seems that you are using native `console.log`. However, it\'s not elegent enough, please use `logger.textln` instead.');
// }
// const _warn = console.warn;
// console.warn = function (...args) {
//   _warn(...args);
//   exports.warnln('It seems that you are using native `console.warn`. However, it\'s not elegent enough, please use `logger.warnln` instead.');
// }
// const _debug = console.debug;
// console.debug = function (...args) {
//   _debug(...args);
//   exports.warnln('It seems that you are using native `console.debug`. However, it\'s not elegent enough, please use `logger.debugln` instead.');
// }
// const _error = console.error;
// console.error = function (...args) {
//   _error(...args);
//   exports.warnln('It seems that you are using native `console.error`. However, it\'s not elegent enough, please use `logger.errorln` instead.');
// }

function stdoutReturn () {
  process.stdout.write('\n');
}
function stderrReturn () {
  process.stderr.write('\n');
}
function stringify (string) {
  if (string instanceof Array) {
    string = string.join(' ');
  }
  if (typeof string === 'string') {
    return string;
  } else if (string instanceof Buffer){
    return string.toString();
  } else if (string instanceof Error){
    return `${e.stack}`;
  } else {
    return 'Unknown Error';
  }
}


exports.debug = function debug (...string) {
  process.stdout.write('[DEBUG] '.grey);
  process.stdout.write(stringify(string).grey);
}
exports.info = function info (...string) {
  process.stdout.write('[INFO]  ');
  process.stdout.write(stringify(string));
}
exports.success = function success (...string) {
  process.stdout.write('[INFO]  '.green);
  process.stdout.write(stringify(string).green);
}
exports.warn = function warn (...string) {
  process.stdout.write('[WARN]  '.yellow);
  process.stdout.write(stringify(string).yellow);
}
exports.error = function error (...string) {
  process.stdout.write('[ERROR] '.red);
  process.stderr.write(stringify(string).red);
}

exports.debugln = function debugln (...string) {
  exports.debug(...string);
  stdoutReturn();
}
exports.infoln = function infoln (...string) {
  exports.info(...string);
  stdoutReturn();
}
exports.successln = function successln (...string) {
  exports.success(...string);
  stdoutReturn();
}
exports.warnln = function warnln (...string) {
  exports.warn(...string);
  stdoutReturn();
}
exports.errorln = function errorln (...string) {
  exports.error(...string);
  stderrReturn();
}

exports.greyPipe = function greyPipe(stream) {
  stream.on('data', string => process.stdout.write(stringify(string).grey));
}
exports.whitePipe = function greyPipe(stream) {
  stream.on('data', string => process.stdout.write(stringify(string)));
}
exports.greenPipe = function greenPipe(stream) {
  stream.on('data', string => process.stdout.write(stringify(string).green));
}
exports.redPipe = function redPipe(stream) {
  stream.on('data', string => process.stderr.write(stringify(string).red));
}
