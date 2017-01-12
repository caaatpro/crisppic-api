
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    del = require('del'),
    runSequence = require('run-sequence'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    fileinclude = require('gulp-file-include');


gulp.task('sass', function () {
  'use strict';
  return gulp.src('app/styles/*.scss')
    // for some reason it doesn't work. investigate later
    //.pipe(changed(destFolder), {extension:'.css'})
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers:['> 1%', 'last 2 versions']
    }))
    .pipe(gulp.dest('public/css/'));
});

gulp.task('js', function () {
  'use strict';
  return gulp.src('app/scripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulp.dest('public/scripts/'));
});

gulp.task('fileinclude', function () {
  'use strict';
  return gulp.src(['app/*.html', '!app/include/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: 'app/include/'
    }))
    .pipe(gulp.dest('public/'));
});

gulp.task('watch', function () {
  'use strict';
  gulp.watch('app/styles/*.scss', ['sass']);
  gulp.watch('app/**/*.html', ['fileinclude']);
  gulp.watch('app/scripts/*.js', ['js']);
  gulp.watch('app/images/**/*.*', ['images']);
});

gulp.task('serve', function(callback) {
  'use strict';
  runSequence(['clean', 'fileinclude', 'sass', 'images', 'fonts', 'watch'],
    callback
  );
});

gulp.task('clean', function (callback) {
  'use strict';
  del(['public/**/*'], callback);
});

gulp.task('fonts', function () {
  'use strict';
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('public/fonts/'));
});

gulp.task('images', function () {
  'use strict';
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('public/images/'));
});
