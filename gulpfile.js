'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var compass = require('gulp-compass');
var imagemin = require('gulp-imagemin');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var notify = require("gulp-notify");
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var clean = require('gulp-rimraf');
var gulpsequence = require('gulp-sequence');
var processhtml = require('gulp-processhtml');
var uncss = require('gulp-uncss');
var header = require('gulp-header');
var pkg = require('./package.json');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var banner = [
        '/*!\n' +
        ' * <%= pkg.title %>\n' +
        ' * <%= pkg.description %>\n' +
        ' * <%= pkg.url %>\n' +
        ' * @author <%= pkg.author %>\n' +
        ' * @version <%= pkg.version %>\n' +
        ' * Copyright ' + new Date().getFullYear() + '. <%= pkg.license %> licensed.\n' +
        ' */',
        '\n'
    ].join('');

gulp.task('clean', function() {
    return gulp.src('build', {
            read: false
        })
        .pipe(clean());
});

gulp.task('lint', function() {
    gulp.src('app/assets/js/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
});


gulp.task('images', function() {
    return gulp.src(['app/assets/img/**/*.*', '!app/assets/img/icons/**/*.*'])
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .on('error', notify.onError(function(error) {
            return "Gulp Error: " + error.message;
        }))

    .pipe(gulp.dest('build/assets/img'))


});


gulp.task('compass', function() {
    return gulp.src('app/assets/sass/*.scss')
        .pipe(compass({
            css: 'app/assets/css',
            sass: 'app/assets/sass',
            image: 'app/assets/img'
        }))

    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .on('error', notify.onError(function(error) {
            return "Gulp Error: " + error.message;
        }))
        .pipe(header(banner, {pkg : pkg}))
        .pipe(gulp.dest('app/assets/css'));

});

gulp.task('html', function() {
    return gulp.src('app/*.html')
        .pipe(processhtml())
        .pipe(gulp.dest('build'));
});



gulp.task('scripts', function() {
    return gulp.src(['app/assets/js/*.js', 'app/assets/js/**/*.js'])
        .pipe(concat('main.js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .on('error', notify.onError(function(error) {
            return "Gulp Error: " + error.message;
        }))
        .pipe(header(banner, {pkg : pkg}))
        .pipe(gulp.dest('build/assets/js'));
});



gulp.task('compass-deploy', function() {
    return gulp.src('app/assets/sass/*.scss')
        .pipe(compass({
            css: 'app/assets/css',
            sass: 'app/assets/sass',
            image: 'app/assets/img'
        }))

    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(rename({
            suffix: '.min'
        }))
        .on('error', notify.onError(function(error) {
            return "Gulp Error: " + error.message;
        }))
        .pipe(header(banner, {pkg : pkg}))
        .pipe(gulp.dest('build/assets/css'));

});


gulp.task('copy', function() {
    return gulp.src([
            'app/**/',
            '!app/*.html',
            '!app/assets/css/**',
            '!app/assets/js/**',
            '!app/{assets/sass,assets/sass/**}',
            '!app/assets/img/**'
        ], {
            dot: true
        }).pipe(gulp.dest('build'))
        .on('error', notify.onError(function(error) {
            return "Gulp Error: " + error.message;
        }));
});

gulp.task('uncss', function() {
    return gulp.src('app/assets/css/*.css')
        .pipe(uncss({
            html: ['app/*.html'] //add all .html files in 'array', here
        }))
        .pipe(minifycss())
        .pipe(rename({
            suffix: '.min'
        }))
        .on('error', notify.onError(function(error) {
            return "Gulp Error: " + error.message;
        }))
        .pipe(header(banner, {pkg : pkg}))
        .pipe(gulp.dest('build/assets/css'));
});


gulp.task('serve', ['compass'], function () {
  browserSync({
    notify: false,
    port:9002,
    browser: ["chrome","firefox"],
    ui: {
        port: 9003
    },

    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['app']
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/assets/sass/**/*.scss'], ['compass', reload]);
  gulp.watch(['app/assets/js/**/*.js'], ['lint',reload]);
  gulp.watch(['app/assets/img/**/*.*'], reload);
});


gulp.task('default', ['clean','compass', 'lint','serve']);

gulp.task('build', function(cb) {
    gulpsequence(['clean', 'images', 'scripts', 'compass-deploy', 'html', 'uncss', 'copy'])(cb);
});
