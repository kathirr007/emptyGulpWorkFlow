 // Include gulp and plugins
 var
	gulp = require('gulp'),
	chokidar = require('chokidar'),
	del = require('del'),
	// pkg = require('./package.json'),
	$ = require('gulp-load-plugins')({ lazy: true }),
	htmlInjector = require('bs-html-injector'),
	vf = require('vinyl-file'),
	vss = require('vinyl-source-stream'),
	vb = require('vinyl-buffer'),
	webpack = require('webpack'),
	webpackstream = require('webpack-stream'),
	browserSync = require('browser-sync').create(),
	reload = browserSync.reload;

// file locations
var
	devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production'),

	source = './',
	dest = devBuild ? './' : './',

	images = {
		in: source + 'theme/lbd/img/**/*',
		out: dest + 'theme/lbd/img/'
	},

	css = {
		in: [source + 'theme/lbd/sass/light-bootstrap-dashboard.scss'],
		watch: ['theme/lbd/sass/**/*.scss'],
		out: dest + 'theme/lbd/css/',
		pluginCSS: {
			in: [source + 'theme/lbd/css/**/*'],
			liveIn: [source + 'theme/lbd/css/bootstrap.min.css', source + 'theme/lbd/css/font-awesome.min.css',
								source + 'theme/lbd/css/jquery.ui.min.css',source + 'theme/lbd/css/jquery.mCustomScrollbar.min.css',
								source + 'theme/lbd/css/material-icons.css', source + 'theme/lbd/css/jquery-ui-1.8.20.custom.css', source + 'theme/lbd/css/*images/**/*'],
			watch: ['theme/lbd/css/**/*.css'],
			liveWatch: ['theme/lbd/css-live/**/*.css'],
			out: dest + 'theme/lbd/css/'
		},
		sassOpts: {
			outputStyle: devBuild ? 'compressed' : 'compressed',
			imagePath: '../img',
			precision: 3,
			errLogToConsole: true
		}
	},

	fonts = {
		in: source + 'theme/lbd/fonts/*.*',
		out: dest + 'theme/lbd/fonts/'
	},

	js = {
		in: source + 'theme/lbd/js/**/*.js',
		liveIn: [source + 'theme/lbd/js/jquery.min.js',
					// source + 'theme/lbd/js/jquery-1.12.4.min.js',
					// source + 'theme/lbd/js/jquery-ui.min.js',
					source + 'theme/lbd/js/jquery-ui-1.10.0.custom.min.js',
					source + 'theme/lbd/js/jquery-ui-slider.min.js',
					source + 'theme/lbd/js/jquery.validate.min.js',
					source + 'theme/lbd/js/underscore-min.js',
					source + 'theme/lbd/js/moment.min.js',
					source + 'theme/lbd/js/bootstrap.min.js',
					source + 'theme/lbd/js/bootstrap-datetimepicker.js',
					source + 'theme/lbd/js/bootstrap-selectpicker.js',
					source + 'theme/lbd/js/bootstrap-checkbox-radio-switch-tags.js',
					source + 'theme/lbd/js/chartist.min.js',
					source + 'theme/lbd/js/bootstrap-notify.js',
					// source + 'theme/lbd/js/sweetalert2.js',
					source + 'theme/lbd/js/jquery.bootstrap.wizard.min.js',
					source + 'theme/lbd/js/bootstrap-table.js',
					source + 'theme/lbd/js/fullcalendar.min.js',
					source + 'theme/lbd/js/light-bootstrap-dashboard.js',
					source + 'theme/lbd/js/jquery.mCustomScrollbar.concat.min.js',
					source + 'theme/lbd/js/jquery-ns-autogrow.min.js',
					// source + 'theme/lbd/js/bootstrap-select.js',
					source + 'theme/lbd/js/countdown.js',
					source + 'theme/lbd/js/ggdrive.js',
					source + 'theme/lbd/js/jquery.MultiFileQuote.js',
					source + 'theme/lbd/js/bootstrap-show-password.min.js'],
		out: dest + 'theme/lbd/js/'
		// filename: 'main.js'
	},

	jsLibs = {
		in: source + 'theme/lbd/lib/**/*',
		liveIn: source + 'theme/lbd/lib-live/**/*',
		out: dest + 'theme/lbd/lib/',
		liveOut: dest + 'theme/lbd/lib/lib-live/'
		// filename: 'main.js'
	},

	filesFilters = {
		htmlFilter : $.filter(['**/*.html', '**/*.md'], {restore: true}),
		cssFilter : $.filter(['**/*.css'], {restore: true}),
		jsFilter : $.filter(['**/*.js'], {restore: true}),
		jsonFilter : $.filter(['**/*.json'], {restore: true}),
		imageFilter : $.filter(['**/*.+(jpg|png|gif|svg)'], {restore: true})
	};


// Clean tasks

gulp.task('clean-images', function() {
	del([
		dest + 'theme/lbd/img/**/*'
	]);
});

gulp.task('clean-css', function() {
	del([
		dest + 'theme/lbd/css/**/*'
	]);
});

gulp.task('clean-js', function() {
	del([
		dest + 'theme/lbd/js/**/*'
	]);
});

gulp.task('clean-jslib', function() {
	del([
		dest + 'theme/lbd/lib/**/*'
	]);
});

gulp.task('clean-bundle', function(){
	del([dest + 'theme/lbd/css/lbd-bundle.css', dest + 'theme/lbd/js/lbd-bundle.js', dest + 'theme/lbd/lib/plugins-bundle.js', dest + 'theme/lbd/lib/plugins-bundle.css']);
});

// manage images
gulp.task('images', function() {
	var imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {restore: true});
	return gulp.src(images.in)
		.pipe($.size({title: 'images in '}))
		// .pipe($.newer(images.out))
		.pipe($.imagemin())
		.pipe($.size({title: 'images out '}))
		.pipe(gulp.dest(images.out));
});

// copy fonts
gulp.task('fonts', function() {
	return gulp.src(fonts.in)
		// .pipe($.newer(dest+ 'theme/lbd/fonts/'))
		.pipe(gulp.dest(fonts.out));
});

// copy plugin css
gulp.task('css', ['fonts'], function() {
	var cssFilter = $.filter(['**/*.css'], {restore: true}),
			imageFilter = $.filter(['**/*.+(jpg|png|gif|svg)'], {restore: true}),
			imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {restore: true});
	return gulp.src(css.pluginCSS.liveIn)
		// .pipe($.sourcemaps.init())
		// .pipe($.sass(css.sassOpts))
		.pipe($.size({title: 'CSS in '}))
		// .pipe($.pleeease(css.pleeeaseOpts))
		// .pipe($.sourcemaps.write('./maps'))
		// .pipe($.newer(dest + 'theme/lbd/css/'))
		.pipe(cssFilter)
		.pipe($.order([
				'bootstrap.min.css',
				'jquery-ui.min.css',
				'font-awesome.min.css',
				'material-icons.css',
				'jquery.mCustomScrollbar.min.css',
				'jquery-ui-1.8.20.custom.css'
			]))
		.pipe($.concatCss('lbd-bundle.css', {rebaseUrls: false}))
		.pipe($.cleanCss({rebase:false}))
		.pipe(cssFilter.restore)
		.pipe(imageFilter)
		.pipe($.imagemin())
		.pipe(imageFilter.restore)
		/*.pipe(imageFilter2)
		.pipe($.webp())
		.pipe(imageFilter2.restore)*/
		.pipe($.size({title: 'CSS out '}))
		.pipe(gulp.dest('theme/lbd/css/'))
		.pipe(browserSync.stream({match: '**/*.css'}));
		// .pipe(reload({stream: true}));
});

// compile Sass
gulp.task('sass', ['fonts'], function() {
	return gulp.src(css.in)
		// .pipe($.sourcemaps.init())
		.pipe($.plumber())
		.pipe($.sass(css.sassOpts))
		.pipe($.size({title: 'SCSS in '}))
		// .pipe($.sourcemaps.write('./maps'))
		.pipe($.size({title: 'SCSS out '}))
		.pipe(gulp.dest('theme/lbd/css/'))
		.pipe(browserSync.stream({match: '**/*.css'}));
});

// js tasks
gulp.task('js', function() {
	var jsFilter = $.filter(['**/*.js', '!**/*custom.js'], {restore: true});
	if (devBuild) {
		return gulp.src(js.liveIn)

			// .pipe($.concat(js.filename))
			.pipe($.size({ title: 'JS in '}))
			// .pipe($.newer(dest + 'theme/lbd/js/'))
			// .pipe($.deporder())
			// .pipe($.stripDebug())
			.pipe(jsFilter)
			// .pipe($.deporder())
			// .pipe($.webpack({
			//   output: {
			//     filename: 'bundle.js',
			//   }
			// }))
			.pipe($.order([
					"jquery.min.js",
					// "jquery-1.12.4.min.js",
					"jquery-ui-1.10.0.custom.min.js",
					// "jquery-ui.min.js",
					'jquery-ui-slider.min.js',
					"jquery.validate.min.js",
					"underscore-min.js",
					"moment.min.js",
					"bootstrap.min.js",
					"bootstrap-datetimepicker.js",
					"bootstrap-selectpicker.js",
					"bootstrap-checkbox-radio-switch-tags.js",
					"chartist.min.js",
					"bootstrap-notify.js",
					// "sweetalert2.js",
					"jquery.bootstrap.wizard.min.js",
					"bootstrap-table.js",
					"fullcalendar.min.js",
					"light-bootstrap-dashboard.js",
					"jquery.mCustomScrollbar.concat.min.js",
					"jquery-ns-autogrow.min.js",
					"ggdrive.js",
					"jquery.MultiFileQuote.js",
					// "bootstrap-select.js",
					"bootstrap-show-password.min.js",
					"countdown.js"
					// "lbd/js/custom.js"
					]))
			.pipe($.concat('lbd-bundle.js', {rebaseUrls: false}))
			.pipe($.uglify())
			// .pipe($.gzip({append: false}))
			.pipe(jsFilter.restore)
			.pipe($.size({ title: 'JS out '}))
			.pipe(gulp.dest('theme/lbd/js/'));
	}
	else {
		del([
			dest + 'theme/lbd/js/*'
		]);
		return gulp.src(js.in)
			.pipe($.newer(js.out))
			// .pipe($.jshint())
			// .pipe($.jshint.reporter('default'))
			// .pipe($.jshint.reporter('fail'))
			.pipe(gulp.dest(js.out));
	}
});

gulp.task('tinymce', function(){
	var htmlFilter = $.filter(['**/*.html', '**/*.md'], {restore: true}),
			cssFilter = $.filter(['**/*.css'], {restore: true}),
			imageFilter = $.filter(['**/*.+(jpg|png|gif|svg)'], {restore: true}),
			jsonFilter = $.filter(['**/*.json'], {restore: true}),
			jsFilter = $.filter(['**/*.js'], {restore: true}),
			tinyTheme = $.filter(['**/*theme.min.js'], {restore: true});

		return gulp.src([source + 'theme/lbd/lib/tinymce_4.2.5/js/tinymce/**/*', '!**/*tinymce.min.js'])
			.pipe($.size({title: 'tinyMCE in '}))
			.pipe(jsFilter)
			.pipe($.uglify())
			.pipe(jsFilter.restore)
			.pipe(tinyTheme)
			.pipe($.rename('themes/modern/theme.js'))
			.pipe(tinyTheme.restore)
			.pipe(jsonFilter)
			.pipe($.jsonMinify())
			.pipe(jsonFilter.restore)
			.pipe(cssFilter)
			.pipe($.cleanCss({rebase:false}))
			.pipe(cssFilter.restore)
			.pipe(htmlFilter)
			.pipe($.htmlclean())
			.pipe(htmlFilter.restore)
			.pipe(imageFilter)
			.pipe($.imagemin())
			.pipe(imageFilter.restore)
			.pipe($.size({title: 'tinyMCE out '}))
			.pipe(gulp.dest('theme/lbd/lib/'));
});
gulp.task('slick-fonts', function(){
	return gulp.src([source + 'theme/lbd/lib/slick-1.6.0/slick/fonts/**/*'])
						 .pipe(gulp.dest('theme/lbd/lib/fonts/'));
});

// copy js libraries
gulp.task('jslib', ['tinymce','slick-fonts'], function() {
	var toExclude = ['theme/lbd/lib/tinymce_4.2.5/**/*'],
			htmlFilter = $.filter(['**/*.html', '**/*.md'], {restore: true}),
			includeIgnoredJs = $.filter([toExclude[0] + '.js'], {restore: true}),
			includeIgnoredCss = $.filter(toExclude[0] + '.css', {restore: true}),
			cssFilter = $.filter(['**/*.css'], {restore: true}),
			imageFilter = $.filter(['**/*.+(jpg|png|gif|svg)'], {restore: true}),
			imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {restore: true}),
			jsonFilter = $.filter(['**/*.json'], {restore: true}),
			jsFilter = $.filter(['**/*.js'], {restore: true});

	if (devBuild) {
		return gulp.src([source + 'theme/lbd/lib/chosen/chosen.jquery.js',
											source + 'theme/lbd/lib/chosen/*.png',
											source + 'theme/lbd/lib/chosen/chosen.css',
											source + 'theme/lbd/lib/chosen/ImageSelect.jquery.js',
											source + 'theme/lbd/lib/chosen/ImageSelect.css',
											source + 'theme/lbd/lib/progressbarjs/progressbar.js',
											source + 'theme/lbd/lib/tag_editmaster/js/jquery.tagedit.js',
											source + 'theme/lbd/lib/tag_editmaster/js/jquery.autoGrowInput.js',
											source + 'theme/lbd/lib/tag_editmaster/css/jquery.tagedit.css',
											source + 'theme/lbd/lib/progressbarjs/progressbar.js',
											source + 'theme/lbd/lib/rateyo/jquery.rateyo.min.js',
											source + 'theme/lbd/lib/rateyo/jquery.rateyo.min.css',
											source + 'theme/lbd/lib/bootstrap-tokenfield/bootstrap-tokenfield.min.js',
											source + 'theme/lbd/lib/bootstrap-tokenfield/css/bootstrap-tokenfield.min.css',
											source + 'theme/lbd/lib/bootstrap-tokenfield/css/tokenfield-typeahead.min.css',
											source + 'theme/lbd/lib/bootstrap-select/js/bootstrap-select.js',
											source + 'theme/lbd/lib/slick-1.6.0/slick/slick.js',
											source + 'theme/lbd/lib/slick-1.6.0/slick/slick.css',
											source + 'theme/lbd/lib/slick-1.6.0/slick/ajax-loader.gif',
											source + 'theme/lbd/lib/slick-1.6.0/slick/slick-theme.css',
											source + 'theme/lbd/lib/jquery-slider-pipe/jquery-ui-slider-pips.js',
											source + 'theme/lbd/lib/jquery-slider-pipe/jquery-ui-slider-pips.css',
											source + 'theme/lbd/lib/read-more/readmore.js',
											//source + 'theme/lbd/lib/matchmedia/matchMedia.js',
											source + 'theme/lbd/lib/sweetalert2/dist/sweetalert2.min.css',
											source + 'theme/lbd/lib/sweetalert2/dist/sweetalert2.min.js',
											source + 'theme/lbd/lib/validation-engine/jquery.validationEngine-fr.js',
											source + 'theme/lbd/lib/validation-engine/jquery.validationEngine.js',
											source + 'theme/lbd/lib/validation-engine/validationEngine.jquery.css',
											source + 'theme/lbd/lib/tinymce_4.2.5/js/tinymce/tinymce.min.js'])
			.pipe($.size({title: 'jsLibs in '}))
			// .pipe($.newer(jsLibs.liveOut))
			.pipe(jsFilter)
			// .pipe($.babel())
			// .pipe($.regenerator())
			.pipe($.order([
					"chosen.jquery.js",
					"ImageSelect.jquery.js",
					"tinymce.min.js",
					"progressbar.js",
					"jquery.tagedit.js",
					"jquery.autoGrowInput.js",
					"slick.min.js",
					"jquery.rateyo.min.js",
					"bootstrap-tokenfield.min.js",
					"bootstrap-select.js",
					"jquery-ui-slider-pips.js",
					"sweetalert2.min.js",
					"jquery.validationEngine-fr.js",
					"jquery.validationEngine.js",
					//"matchMedia.js",
					"readmore.js"
					]))
			.pipe($.concat('plugins-bundle.js'))
			.pipe($.uglify())
			.on('error', function (err) { $.util.log($.util.colors.red('[Error]'), err.toString()); })
			// .pipe(webpack())
			.pipe(jsFilter.restore)
			.pipe(includeIgnoredJs)
			.pipe($.uglify())
			.pipe(includeIgnoredJs.restore)
			.pipe(jsonFilter)
			.pipe($.jsonMinify())
			.pipe(jsonFilter.restore)
			.pipe(cssFilter)
			.pipe($.order([
					"chosen.css",
					"ImageSelect.css",
					"jquery.tagedit.css",
					"slick.css",
					"slick-theme.css",
					"jquery.rateyo.min.css",
					"bootstrap-tokenfield.min.css",
					"jquery-ui-slider-pips.css",
					"sweetalert2.min.css",
					"validationEngine.jquery.css",
					"tokenfield-typeahead.min.css"
				]))
			.pipe($.concatCss('plugins-bundle.css', {rebaseUrls: false}))
			.pipe($.cleanCss({rebase:false}))
			.pipe(cssFilter.restore)
			.pipe(includeIgnoredCss)
			.pipe($.cleanCss({rebase:false}))
			.pipe(includeIgnoredCss.restore)
			.pipe(htmlFilter)
			.pipe($.htmlclean())
			.pipe(htmlFilter.restore)
			.pipe(imageFilter)
			.pipe($.imagemin())
			.pipe(imageFilter.restore)
			// /*.pipe(imageFilter2)
			// .pipe($.webp())
			// .pipe(imageFilter2.restore)*/

			// // .pipe($.jshint())
			// // .pipe($.jshint.reporter('default'))
			// // .pipe($.jshint.reporter('fail'))
			.pipe($.size({title: 'jsLibs out '}))
			.pipe(gulp.dest('theme/lbd/lib/'));

	}
	else {
		del([
			dest + 'theme/lbd/lib/*'
		]);
		return gulp.src(jsLibs.in)
			.pipe($.deporder())
			// .pipe($.concat(jsLibs.filename))
			.pipe($.size({ title: 'JS libraries in '}))
			// .pipe($.stripDebug())
			// .pipe($.uglify())
			.pipe($.size({ title: 'JS libraries out '}))
			.pipe(gulp.dest(jsLibs.out));
	}
});

gulp.task('watch', function() {

	// image changes
	gulp.watch(images.in, ['images']);

	// font changes
	gulp.watch(fonts.in, ['fonts']);

	// sass changes
	gulp.watch([css.watch], ['sass']);

	// pluginCSS changes
	gulp.watch([css.pluginCSS.watch], ['css']);
	gulp.watch([css.pluginCSS.liveWatch], ['css']);

	// javascript changes
	gulp.watch(js.in, ['js', reload]);

	// javascript libraries changes
	gulp.watch(jsLibs.in, ['jslib', reload]);
	gulp.watch(jsLibs.liveIn, ['jslib', reload]);
});

// default task
gulp.task('default', ['html', 'images', 'fonts', 'css', 'sass', 'jslib', 'jslib', 'js', 'watch', 'serve']);

gulp.task('bundle', ['css','js','jslib']);
