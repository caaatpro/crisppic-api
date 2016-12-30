
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    del = require('del'),
    runSequence = require('run-sequence'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    fileinclude = require('gulp-file-include');


gulp.task('sass', function () {
  'use strict';
  var destFolder = 'app/css';
  return gulp.src('app/styles/*.scss')
    // for some reason it doesn't work. investigate later
    //.pipe(changed(destFolder), {extension:'.css'})
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers:['> 1%', 'last 2 versions']
    }))
    .pipe(gulp.dest(destFolder));
});

gulp.task('js', function () {
  'use strict';
  return gulp.src('app/scripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('fileinclude', function () {
  'use strict';
  return gulp.src(['app/html/*.html', '!app/include/*.html', '!app/index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: 'app/html/include/'
    }))
    .pipe(gulp.dest('app/'));
});

gulp.task('watch', function () {
  'use strict';
  gulp.watch('app/styles/*.scss', ['sass']);
  gulp.watch('app/html/**/*.html', ['fileinclude']);
  gulp.watch('app/scripts/*.js', ['js']);
  gulp.watch('app/images/**/*.*', ['images']);
});

gulp.task('serve', function(callback) {
  'use strict';
  runSequence(['fileinclude', 'sass', 'images', 'fonts', 'watch'],
    callback
  );
});

gulp.task('clean', function (callback) {
  'use strict';
  del(['dist/**/*'], callback);
});

gulp.task('fonts', function () {
  'use strict';
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('images', function () {
  'use strict';
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('dist/images'));
});
