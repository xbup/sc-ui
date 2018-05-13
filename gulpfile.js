const gulp = require('gulp');
const del = require('del');
const path = require('path');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const jsonminify = require('gulp-jsonminify2');
const gutil = require('gulp-util');
const combiner = require('stream-combiner2');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const minifycss = require('gulp-minify-css');
const runSequence = require('run-sequence');
const jsonlint = require("gulp-jsonlint");

var colors = gutil.colors;
const handleError = function(err) {
    console.log('\n');
    gutil.log(colors.red('Error!'));
    gutil.log('fileName: ' + colors.red(err.fileName));
    gutil.log('lineNumber: ' + colors.red(err.lineNumber));
    gutil.log('message: ' + err.message);
    gutil.log('plugin: ' + colors.yellow(err.plugin));
};

gulp.task('clean', () => {
    return del(['./dist/**'])
});

gulp.task('watch', () => {
    gulp.watch('./src/**/*.json', ['json']);
    gulp.watch('./src/assets/**', ['assets']);
    gulp.watch('./src/**/*.wxml', ['templates']);
    gulp.watch('./src/**/*.wxss', ['wxss']);
    gulp.watch('./src/**/*.sass', ['wxss']);
    gulp.watch('./src/**/*.js', ['scripts']);
});

gulp.task('jsonLint', () => {
    var combined = combiner.obj([
        gulp.src(['./src/**/*.json']),
        jsonlint(),
        jsonlint.reporter(),
        jsonlint.failAfterError()
    ]);

    combined.on('error', handleError);
});

gulp.task('jsonPro', ['jsonLint'], () => {
    return gulp.src('./src/**/*.json')
        .pipe(jsonminify())
        .pipe(gulp.dest('./dist'))
});

gulp.task('assets', () => {
    return gulp.src('./src/assets/**')
        .pipe(gulp.dest('./dist/assets'))
});

gulp.task('templatesPro', () => {
    return gulp.src('./src/**/*.wxml')
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            keepClosingSlash: true
        }))
        .pipe(gulp.dest('./dist'))
});

gulp.task('wxssPro', () => {
    var combined = combiner.obj([
        gulp.src(['./src/**/*.{wxss,sass}', '!./src/styles/**']),
        sass().on('error', sass.logError),
        autoprefixer([
            'iOS >= 8',
            'Android >= 4.1'
        ]),
        minifycss(),
        rename((path) => path.extname = '.wxss'),
        gulp.dest('./dist')
    ]);

    combined.on('error', handleError);
});

gulp.task('scriptsPro', () => {
    return gulp.src('./src/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify({
            compress: true,
        }))
        .pipe(gulp.dest('./dist'))
});

gulp.task('pro', [
    'jsonPro',
    'assets',
    'templatesPro',
    'wxssPro',
    'scriptsPro'
]);

gulp.task('build', ['clean'], () => {
    runSequence('pro');
});