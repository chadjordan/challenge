'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require ('gulp-uglify');
var compass = require('gulp-compass');
var imagemin = require('gulp-imagemin');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var notify = require("gulp-notify");
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var clean = require('gulp-clean');



gulp.task('clean', function () {
    return gulp.src('./build', {read: false})
        .pipe(clean());
});

gulp.task('lint', function () {
    gulp.src('./app/assets/js/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});




gulp.task('images', function() {
    return gulp.src(['./app/assets/img/**/*.*','!./app/assets/img/icons/**/*.*'])
        .pipe(imagemin({
        	optimizationLevel :4,
        	progressive: true,
        	interlaced: true
        }))
         .on('error',notify.onError(function(error){
        	return "Gulp Error: " + error.message;
        }))

        .pipe(gulp.dest('./build/assets/img'))

});


gulp.task('compass', function () {
    return gulp.src('./app/assets/sass/*.scss')
        .pipe(compass({
            css: 'app/assets/css',
            sass: 'app/assets/sass',
            image: 'app/assets/img'
        }))

        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
         .on('error',notify.onError(function(error){
        	return "Gulp Error: " + error.message;
        }))
        .pipe(gulp.dest('app/assets/css'));

});




gulp.task('scripts-deploy', function() {
    return gulp.src('app/js/*.js')
        .pipe(concat('main.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
         .on('error',notify.onError(function(error){
        	return "Gulp Error: " + error.message;
        }))
        .pipe(gulp.dest('build/js'));
});


gulp.task('compass-deploy', function () {
    return gulp.src('./app/assets/sass/*.scss')
        .pipe(compass({
            css: 'app/assets/css',
            sass: 'app/assets/sass',
            image: 'app/assets/img'
        }))

        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(rename({suffix: '.min'}))
         .on('error',notify.onError(function(error){
        	return "Gulp Error: " + error.message;
        }))
        .pipe(gulp.dest('build/assets/css'));

});



gulp.task('watch', function() {
	   // Watch .js files
	  gulp.watch('app/assets/js/**/*.js', ['lint']);
	   // Watch .scss files
	  gulp.watch(['app/assets/sass/*.scss','app/assets/img/icons/**/*.*'], ['compass']);


 });

gulp.task('default',['compass','lint','watch']);
gulp.task('build',['clean','images','scripts-deploy','compass-deploy']);
