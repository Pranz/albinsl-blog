var gulp = require('gulp');
var plugins = require('gulp-load-plugins')()

gulp.task('build-sass', function() {
    return gulp.src('source/sass/custom/*.scss')
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.concat('style.css'))
        .pipe(gulp.dest('public/css'))
    }
)

    
