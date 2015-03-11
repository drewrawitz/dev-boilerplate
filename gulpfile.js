/****************************
 * Variables
 ****************************/

  // Include gulp
  var gulp = require('gulp');

  // Include our plugins
  var autoprefixer = require('gulp-autoprefixer'),
      sass         = require('gulp-sass'),
      sourcemaps   = require('gulp-sourcemaps'),
      browserSync  = require("browser-sync"),
      reload       = browserSync.reload,
      minifycss    = require('gulp-minify-css'),
      uglify       = require('gulp-uglify'),
      concat       = require('gulp-concat'),
      imagemin     = require('gulp-imagemin'),
      header       = require('gulp-header'),
      plumber      = require('gulp-plumber'),
      newer        = require('gulp-newer'),
      clean        = require('gulp-clean'),
      runSequence  = require('run-sequence'),
      revHash      = require('gulp-rev-hash'),
      replace      = require('gulp-replace'),
      package      = require('./package.json'),
      bower        = require('./bower.json');

  // Define some project variables
  var destApp    = 'public',
      srcApp     = 'src',
      destCSS    = destApp + '/assets/css',
      destJS     = destApp + '/assets/js',
      destImages = destApp + '/assets/img',
      srcSASS    = srcApp + '/assets/scss',
      srcJS      = srcApp + '/assets/js',
      srcImages  = srcApp + '/assets/img';

  // Banner that gets injected at the top of my assets
  var banner = [
    '/*!\n' +
    ' * <%= package.title %>\n' +
    ' * <%= package.url %>\n' +
    ' * @author <%= package.author %> <<%= package.email %>>\n' +
    ' * @version <%= package.version %>\n' +
    ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
    ' */',
    '\n'
  ].join('');


/****************************
 * Styles Task
 ****************************/

  gulp.task('styles:dev', function() {
    return gulp.src(srcSASS+'/style.scss')
      .pipe(plumber())
      .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer('last 2 version'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(destCSS))
  });

  gulp.task('styles:prod', function() {
    return gulp.src(srcSASS+'/style.scss')
      .pipe(plumber())
      .pipe(sass())
      .pipe(autoprefixer('last 2 version'))
      .pipe(minifycss())
      .pipe(header(banner, { package : package }))
      .pipe(gulp.dest(destCSS))
  });


/****************************
 * Scripts Task
 ****************************/

  gulp.task('scripts', function() {
    return gulp.src([
        '!'+srcJS+'/vendors/jquery/*.js',
        ''+srcJS+'/vendors/**/*.js',
        ''+srcJS+'/main.js'
      ])
      .pipe(concat('scripts.js'))
      .pipe(uglify())
      .pipe(header(banner, { package : package }))
      .pipe(gulp.dest(destJS))
  });


/****************************
 * Images Task
 ****************************/

  gulp.task('images', function() {
    return gulp.src(srcImages+'/**/*')
      .pipe(newer(destImages))
      .pipe(imagemin({
          progressive: true,
          svgoPlugins: [{removeViewBox: false}]
        }))
      .pipe(gulp.dest(destImages));
  });


/****************************
 * Clean / Copy Files
 ****************************/

  gulp.task('clean', function () {
    return gulp.src(destApp, {read: false})
      .pipe(clean());
  });

  // Copy Files
  gulp.task('copy', [
      'copy:html',
      'copy:jquery'
  ]);

  gulp.task('copy:html', function() {
    return gulp.src(srcApp+'/*.html')
      .pipe(replace(/{{JQUERY_VERSION}}/g, bower.dependencies.jquery))
      .pipe(revHash({assetsDir: destApp}))
      .pipe(gulp.dest(destApp));
  });

  gulp.task('copy:jquery', function() {
    return gulp.src(srcJS+'/vendors/jquery/*.js')
      .pipe(gulp.dest(destJS+'/vendors/jquery/'));
  });


/****************************
 * Live Reload Server
 ****************************/

  // Start Live Reload Server
  gulp.task('browser', function() {
    browserSync({
      proxy: '192.168.33.10'
    });
  });


/****************************
 * Build/Dev Tasks
 ****************************/

  gulp.task('dev', function(cb) {
    runSequence('clean', ['styles:dev', 'scripts', 'images'], 'copy',cb);
  });

  gulp.task('build', function(cb) {
    runSequence('clean', ['styles:prod', 'scripts', 'images'], 'copy',cb);
  });


/****************************
 * Watcher
 ****************************/

  // Watch Task
  gulp.task('watch', ['dev', 'browser'], function() {

    // Watch .scss files
    gulp.watch(srcSASS+'/**/*.scss', ['styles:dev', reload]);

    // Watch .js files
    gulp.watch(srcJS+'/**/*.js', ['scripts', reload]);

    // Watch .html files
    gulp.watch(srcApp+'/*.html', ['copy:html', reload]);

    // Watch image files
    gulp.watch(srcImages+'/**/*', ['images']);

  });
