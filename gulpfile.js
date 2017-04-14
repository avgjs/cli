require('colors');
var gulp = require("gulp");
var babel = require("gulp-babel");
var wrap  = require('gulp-wrap');
var del = require('del');

gulp.task("build", function () {
  return gulp.src("src/**/*.js")
    .pipe(babel())
    .on('error', function(e) {
      console.log('');
      console.log(e.name.magenta);
      console.log(e.message.yellow);
      console.log(e.codeFrame);
      console.log('from ' + e.plugin);
      console.log('');
      console.log('');
      this.emit('end');
    })
    // .pipe(wrap("#!/usr/bin/env node\n\n<%= contents %>"))
    .pipe(gulp.dest("dist"))
});

gulp.task('clean', function() {
  return del.sync(['dist/*']);
});

gulp.task('default', ['clean', 'build']);

gulp.task('watch', function(){
  gulp.watch('src/**/*.js',['default']);
});
