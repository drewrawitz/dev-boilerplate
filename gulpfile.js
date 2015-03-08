// Include gulp
var gulp = require('gulp');

// Include our plugins
var autoprefixer = require('gulp-autoprefixer'),
    sass         = require('gulp-ruby-sass'),
    sassdoc      = require('sassdoc'),
    sourcemaps   = require('gulp-sourcemaps'),
    browserSync  = require("browser-sync"),
    minifycss    = require('gulp-minify-css'),
    csscomb      = require('gulp-csscomb'),
    uglify       = require('gulp-uglify'),
    concat       = require('gulp-concat'),
    imagemin     = require('gulp-imagemin'),
    notify       = require('gulp-notify'),
    header       = require('gulp-header'),
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

// Sass task
gulp.task('sass', function() {
  return sass(srcSASS+'/style.scss', { sourcemap: true })

    .on('error', function(err) {
      console.error('Error', err.message);
    })

    .pipe(sourcemaps.init())
      .pipe(autoprefixer('last 2 version'))
    .pipe(sourcemaps.write())

    .pipe(gulp.dest(destCSS))
    .pipe(notify({ message: 'Sass task complete' }));
});

gulp.task('sassdoc', function() {
  var options = {
    dest: destApp+'/docs',
    package: 'package.json',
    groups: {
      'undefined': 'Bourbon / Neat'
    },
    verbose: true
  };

  return gulp.src(srcSASS+'/**/*.scss')
    .pipe(sassdoc(options))
    .pipe(gulp.dest(destCSS));
});

// Scripts task
gulp.task('scripts', function() {
  return gulp.src([
      ''+srcJS+'/main.js'
    ])
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest(destJS))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Images task
gulp.task('images', function() {
  return gulp.src(srcImages+'/**/*')
    .pipe(newer(destImages))
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}]
      }))
    .pipe(gulp.dest(destImages));
});

// Clean Build Folder
gulp.task('clean', function () {
  return gulp.src(destApp, {read: false})
    .pipe(clean());
});

// Copy Files
gulp.task('copy', [
    'copy:index.html'
]);

gulp.task('copy:index.html', function() {
  return gulp.src(srcApp+'/index.html')
    .pipe(replace(/{{JQUERY_VERSION}}/g, bower.devDependencies.jquery))
    .pipe(revHash({assetsDir: destApp}))
    .pipe(gulp.dest(destApp));
});

// Minify our CSS
gulp.task('minify', function() {
  return gulp.src(destCSS+'/style.css')
    .pipe(minifycss())
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest(destCSS))
    .pipe(notify({ message: 'Minification task complete' }));
});

// Browser Sync
gulp.task('browser-sync', function() {
  browserSync({
    proxy: '192.168.33.10'
  });
});

// Default task
gulp.task('build', function(cb) {
  runSequence('clean', ['sass', 'scripts', 'images'], 'copy', 'minify',cb);
});

// Watch
gulp.task('watch', ['browser-sync'], function() {
  // Watch .scss files
  gulp.watch(srcSASS+'/**/*.scss', ['sass', browserSync.reload]);

  // Watch .js files
  gulp.watch(srcJS+'/**/*.js', ['scripts', browserSync.reload]);

  // Watch image files
  gulp.watch(srcImages+'/**/*', ['images']);

});
