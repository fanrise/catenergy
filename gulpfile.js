var gulp = require('gulp');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
// var svgstore = require('gulp-svgstore');
var runSequence = require('run-sequence');
var del = require('del');
// var posthtml = require('gulp-posthtml');
// var include = require('posthtml-include');
var webpHTML = require('gulp-webp-html');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var pump = require('pump');

var browserSync = require('browser-sync').create();

gulp.task('style', function () {
  return gulp.src('source/less/style.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('imagemin', function () {
  return gulp.src('source/img/*.{jpg,png,svg}')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('webp', function () {
  return gulp.src('build/img/*.{jpg,png}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img'));
});

// gulp.task('svgstore', function () {
//   return gulp.src('build/img/*.svg')
//     .pipe(svgstore())
//     .pipe(rename('sprite.svg'))
//     .pipe(gulp.dest('build/img'));
// });

// gulp.task('posthtml', function () {
//   return gulp.src('source/*.html')
//     .pipe(posthtml([
//       include()
//     ]))
//     .pipe(gulp.dest('build'));
// });

gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}'
    // 'source/js/**'
  ], {
    base: 'source/'
  })
    .pipe(gulp.dest('build'));
});

gulp.task('del', function () {
  return del('build/');
});

gulp.task('normalize', function () {
  return gulp.src('node_modules/normalize.css/normalize.css')
    .pipe(gulp.dest('build/css'));
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(webpHTML())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build/'));
});

gulp.task('jsmin', function (cb) {
  pump([
    gulp.src('source/js/*.js'),
    uglify(),
    gulp.dest('build/js/')
  ],
  cb
  );
});

gulp.task('build', function (done) {
  runSequence(
    'del',
    'copy',
    'normalize',
    'style',
    'imagemin',
    'webp',
    // 'svgstore',
    // 'posthtml',
    'html',
    'jsmin',
    done
  );
});

gulp.task('serve', function () {
  browserSync.init({
    server: 'build/'
  });
  gulp.watch('source/less/**/*.less', ['style']).on('change', browserSync.reload);
  gulp.watch('source/*.html', ['html']).on('change', browserSync.reload);
  gulp.watch('source/js/*.js', ['jsmin']).on('change', browserSync.reload);
});
