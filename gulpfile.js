var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var globbing = require('gulp-css-globbing');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var plumber = require('gulp-plumber');
var shell = require('gulp-shell');
var spritesmith = require('gulp.spritesmith');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var size = require('gulp-size');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var gulpFilter = require('gulp-filter');
var notify = require('gulp-notify');
var mainBowerFiles = require('main-bower-files');
var sourcemaps = require('gulp-sourcemaps');

var DEST = './assets/dist';
var SRC = './assets/src';

var onError = function(err) {
  notify.onError({
    title: "Gulp",
    subtitle: "Failure!",
    message: "Error: <%= error.message %>",
    sound: "Beep"
  })(err);
  this.emit('end');
};

var config = {
  sass: SRC + '/sass/**/*.{scss,sass}',
  js: SRC + '/js',
  images: SRC + '/images',
  sprite: SRC + '/sprite',
  fonts: SRC + '/fonts',
  cssmin: DEST + '/css',
  jsmin: DEST + '/js',
  imagesmin: DEST + '/images',
  fontsmin: DEST + '/fonts',
  cssVendor: DEST + '/css/vendor',
  jsVendor: DEST + '/js/vendor',
  bowerComponents: './bower_components',
  uriSite: 'drupalconsole.dev'
};

gulp.task('styles', function() {
  return gulp.src(config.sass)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(
      gulp.src('./assets/src/sass/screen.scss')
      .pipe(globbing({
        extensions: ['.scss']
      }))
    )
    .pipe(sass({
      style: 'expanded',
      precision: 10
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(csso())
    .pipe(gulp.dest(config.cssmin))
    .pipe(notify('Task "styles" success'));
});

//gulp.task('styles-watch', ['styles']);
gulp.task('styles-watch', ['styles'], browserSync.reload);

gulp.task('scripts', function() {
  return gulp.src(config.js + '/**/*.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.jsmin))
    .pipe(notify('Task "scripts" success'));
});

//gulp.task('scripts-watch', ['scripts']);
gulp.task('scripts-watch', ['scripts'], browserSync.reload);

gulp.task('images', function() {
  return gulp.src(config.images + '/**/*.{png,gif,jpg}')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(imagemin({
      optimizationLevel: 7,
      progressive: true,
      interlaced: true,
    }))
    .pipe(gulp.dest(config.imagesmin))
    .pipe(size({
      title: 'images'
    }))
});

gulp.task('drupal', function () {
  return gulp.src('*.js', {read: false})
    .pipe(shell([
      'drupal --uri=' + config.uriSite + ' cr all'
    ], {
      templateData: {
        f: function (s) {
          return s.replace(/$/, '.bak')
        }
      }
    }))
})

gulp.task('bower', function() {
  var jsFilter = gulpFilter('**/*.js', {
    restore: true
  });
  var cssFilter = gulpFilter('**/*.css', {
    restore: true
  });
  return gulp.src(mainBowerFiles())
    .pipe(jsFilter)
    .pipe(gulp.dest(config.jsVendor))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe(gulp.dest(config.cssVendor))
    .pipe(cssFilter.restore)
});

gulp.task('fonts', function() {
  gulp.src(config.bowerComponents + '/font-awesome/fonts/**.*')
    .pipe(gulp.dest(config.fontsmin));
  gulp.src(config.bowerComponents + '/mdi/fonts/**.*')
    .pipe(gulp.dest(config.fontsmin));
  gulp.src(config.fonts + '/**/*.*')
    .pipe(gulp.dest(config.fontsmin));
});

gulp.task('browser-sync', function() {
  browserSync.init(null, {
    proxy: config.uriSite
  });
});

//gulp.task('watch', function() {
gulp.task('watch', ['browser-sync'], function() {
  watch(config.js + '/**/*.js', batch(function(events, done) {
    gulp.start('scripts-watch', done);
  }));
  watch(config.sass, batch(function(events, done) {
    gulp.start('styles-watch', done);
  }));
  watch(config.fonts + '/**/*.*', batch(function(events, done) {
    gulp.start('fonts', done);
  }));
  watch(config.images + '/**/*.{png,gif,jpg}', batch(function(events, done) {
    gulp.start('images', done);
  }));
  watch('**/*.{theme,yml,twig}', batch(function(events, done) {
    gulp.start('drupal', done);
  }));
});

gulp.task('default', ['scripts', 'styles', 'fonts', 'images', 'bower', 'watch']);
