var gulp = require('gulp');
var slug = require('slug');
var fm = require('front-matter');
var fs = require('fs');
var markdown = require('markdown-it')('commonmark');
var jade = require('jade');
var typeset = require('typeset');
var dateformat = require('dateformat');
var plugins = require('gulp-load-plugins')(
    {
        rename: {
            'gulp-front-matter': 'front_matter',
            'gulp-markdown-it': 'markdown_it'
        }
    }
);

var ignores = ['!_*', '!layout*'];
var jade_opts = {
    pretty: true
};

var paths = {
    sass: './source/sass/custom/*.scss',
    posts:  './source/posts/*.md',
    jade: './source/jade/*.jade'
}

gulp.task('sass', function() {
    return gulp.src([paths.sass])
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.concat('style.css'))
        .pipe(gulp.dest('./public/css'))
    }
)


gulp.task('posts', function() {
    var posts_metadata = [];
    var render_post = jade.compileFile('./source/jade/post_layout.jade', jade_opts);

    var stream = gulp.src([paths.posts].concat(ignores))
        .pipe(plugins.data(function (file) {
            var content = fm(String(file.contents));
            content.attributes.title_slug = slug(content.attributes.title).concat('.html');
            posts_metadata.push(content.attributes);
            content.attributes.body = markdown.render(content.body);
            content.attributes.dateformat = dateformat;
            file.path = file.path.split('/').slice(0,-1).join('/').concat('/').concat(content.attributes.title_slug);

            //render jade and markdown and typeset
            file.contents = new Buffer(typeset(render_post(content.attributes)));

            return content.attributes;
        }))
        .pipe(gulp.dest('./public/posts'));

    stream.on('end', function() {
        fs.writeFileSync('posts_metadata.json', JSON.stringify(posts_metadata));
    });
    return stream;
});

gulp.task('index', ['posts'], function() {
    var posts = JSON.parse(fs.readFileSync("./posts_metadata.json", "utf8"));
    return gulp.src(paths.jade)
        .pipe(plugins.jade({
            locals: {
                posts: posts,
                dateformat: dateformat
            }
        }))
        .pipe(plugins.data(function (file) {
            file.contents = new Buffer(typeset(file.contents));
        }))
        .pipe(gulp.dest('./public'))
    }
)

gulp.task('default', ['sass', 'index']);

gulp.task('watch', function() {
    gulp.watch([paths.jade, paths.posts], ['index']);
    gulp.watch(paths.sass, ['sass']);
});
