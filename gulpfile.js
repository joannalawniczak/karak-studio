'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const del = require( 'del' );
const runSequence = require( 'run-sequence' );
const gulp = require( 'gulp' );
const gulpFilter = require( 'gulp-filter' );
const gulpIf = require( 'gulp-if' );
const gulpSym = require( 'gulp-sym' );
const gulpSass = require( 'gulp-sass' );
const gulpCssnano = require( 'gulp-cssnano' );
const gulpAutoprefixer = require( 'gulp-autoprefixer' );
const gulpEslint = require( 'gulp-eslint' );
const rollup = require( 'rollup' ).rollup;
const rollupNodeResolve = require( 'rollup-plugin-node-resolve' );
const rollupCommonjs = require( 'rollup-plugin-commonjs' );
const rollupBabel = require( 'rollup-plugin-babel' );
const rollupUglify = require( 'rollup-plugin-uglify' );
const KarmaServer = require( 'karma' ).Server;

/**
 * Paths definitions.
 */
const src = './assets/src';
const dest = './assets/dist';
const jsFiles = [ '**/*.js' ].concat( getGitIgnore() );

const config = {
	styles: {
		packages: path.join( src, 'styles', '*.scss' ),
		src: path.join( src, 'styles', '**', '*.scss' ),
		dest: path.join( dest, 'styles' )
	},

	images: {
		src: path.join( src, 'images' ),
		dest: path.join( dest, 'images' ),
	},

	uploads: {
		src: path.join( src, 'uploads' ),
		dest: path.join( dest, 'uploads' ),
	},

	scripts: {
		entry: path.join( src, 'scripts', 'main.js' ),
		src: path.join( src, 'scripts', '**', '*.js' ),
		dest: path.join( dest, 'scripts', 'main.js' )
	}
};

/**
 * Utils definitions.
 */
const utils = {
	/**
	 * Creates a symlink.
	 *
	 * @param {String} from Source directory.
	 * @param {String} to Destination.
	 * @returns {Stream}
	 */
	symlink( from, to ) {
		return gulp.src( from )
			.pipe( gulpSym( to, { force: true } ) );
	},

	/**
	 * Copy file or directory.
	 *
	 * @param {String} from Source directory.
	 * @param {String} to Destination.
	 * @returns {Stream}
	 */
	copy( from, to ) {
		return gulp.src( from )
			.pipe( gulp.dest( to ) );
	},

	/**
	 * Remove file or directory.
	 *
	 * @param {String} path Directory which will be removed.
	 * @returns {Stream}
	 */
	clean( path ) {
		return del( path );
	}
};

/**
 * Tasks definitions.
 */
const tasks = {
	/**
	 * Compiles Sass to CSS.
	 *
	 * @param {Object} [options={}] Additional options.
	 * @param {Boolean} [options.debug] When `true` then output code will not be minified.
	 * @returns {Stream}
	 */
	styles( options = {} ) {
		return gulp.src( config.styles.packages )
			.pipe( gulpSass().on( 'error', gulpSass.logError ) )
			.pipe( gulpAutoprefixer( { browsers: [ 'last 2 versions' ] } ) )
			.pipe( gulpIf( !options.debug, gulpCssnano() ) )
			.pipe( gulp.dest( config.styles.dest ) );
	},

	/**
	 * Bundles JS files into on file and transforms ES6 syntax to ES5.
	 *
	 * @param {Object} [options={}] Additional options.
	 * @param {Boolean} [options.debug] When `true` then output code will not be minified.
	 * @returns {Stream}
	 */
	scripts( options = {} ) {
		if ( !isFileExist( config.scripts.entry ) ) {
			return Promise.resolve();
		}

		const rollupPlugins = [
			rollupBabel( {
				exclude: 'node_modules/**',
				presets: [ 'es2015-rollup' ]
			} ),
			rollupCommonjs(),
			rollupNodeResolve( {
				jsnext: true
			} )
		];

		if ( !options.debug ) {
			rollupPlugins.push( rollupUglify() );
		}

		return rollup( {
			entry: config.scripts.entry,
			plugins: rollupPlugins
		} ).then( ( bundle ) => bundle.write( {
			dest: config.scripts.dest,
			moduleName: 'start',
			format: 'iife'
		} ) ).catch( ( err ) => console.log( err.stack ) ); // eslint-disable-line no-console
	},

	/**
	 * Copies static from src to dist.
	 *
	 * @param {String} src Source path.
	 * @param {String} dest Destination path.
	 * @param {Object} [options={}] Additional options.
	 * @param {Boolean} [options.debug] When `true` then `dist` will be a symlink to `src`.
	 * @returns {Stream}
	 */
	statics( src, dest, options = {} ) {
		if ( !isFileExist( src ) ) {
			return Promise.resolve();
		}

		if ( !options.debug ) {
			const from = path.join( src, '**', '*.*' );
			const to = path.join( dest );

			return utils.copy( from, to );
		}

		return utils.symlink( src, dest );
	},

	/**
	 * Watches source files and run development build on change.
	 */
	watch() {
		gulp.watch( config.styles.src, () => tasks.styles( { debug: true } ) );
		gulp.watch( config.scripts.src, () => tasks.scripts( { debug: true } ) );
	},

	/**
	 * Analyze quality and code style of JS files.
	 *
	 * @returns {Stream}
	 */
	lint() {
		return gulp.src( jsFiles )
			.pipe( gulpEslint() )
			.pipe( gulpEslint.format() )
			.pipe( gulpEslint.failAfterError() );
	},

	/**
	 * Lints staged files - pre commit hook.
	 *
	 * @returns {Stream}
	 */
	lintStaged() {
		const guppy = require( 'git-guppy' )( gulp );

		return guppy.stream( 'pre-commit', { base: './' } )
			.pipe( gulpFilter( jsFiles ) )
			.pipe( gulpEslint() )
			.pipe( gulpEslint.format() )
			.pipe( gulpEslint.failAfterError() );
	},

	/**
	 * Runs JS unit tests.
	 *
	 * @param {Function} done Finish callback.
	 */
	test( done ) {
		new KarmaServer( {
			configFile: __dirname + '/karma.conf.js'
		}, done ).start();
	}
};

/**
 * Gets the list of ignores from `.gitignore`.
 *
 * @returns {Array<String>} The list of ignores.
 */
function getGitIgnore() {
	let gitIgnoredFiles = fs.readFileSync( '.gitignore', 'utf8' );

	return gitIgnoredFiles
		// Remove comment lines.
		.replace( /^#.*$/gm, '' )
		// Transform into array.
		.split( /\n+/ )
		// Remove empty entries.
		.filter( ( path ) => !!path )
		// Add `!` for ignore glob.
		.map( i => '!' + i );
}

/**
 * Checks if file in specified locarion exist.
 *
 * @param {String} path File path
 * @returns {Boolean}
 */
function isFileExist( path ) {
	try {
		fs.accessSync( path );
	} catch ( e ) {
		return false;
	}

	return true;
}

// Remove dist directory.
gulp.task( 'clean', () => utils.clean( dest ) );

// Development build.
gulp.task( 'styles:debug', () => tasks.styles( { debug: true } ) );
gulp.task( 'scripts:debug', () => tasks.scripts( { debug: true } ) );
gulp.task( 'images:debug', () => tasks.statics( config.images.src, config.images.dest, { debug: true } ) );
gulp.task( 'uploads:debug', () => tasks.statics( config.uploads.src, config.uploads.dest, { debug: true } ) );
gulp.task( 'watch:debug', tasks.watch );
gulp.task( 'build:debug', () => runSequence( 'clean', [ 'styles:debug', 'scripts:debug', 'images:debug', 'uploads:debug' ], 'watch:debug' ) );

// Production build.
gulp.task( 'styles', tasks.styles );
gulp.task( 'scripts', tasks.scripts );
gulp.task( 'images', () => tasks.statics( config.images.src, config.images.dest ) );
gulp.task( 'uploads', () => tasks.statics( config.uploads.src, config.uploads.dest ) );
gulp.task( 'build', ( done ) => runSequence( 'clean', [ 'styles', 'scripts', 'images', 'uploads' ], done ) );

// JS code sniffer.
gulp.task( 'lint', tasks.lint );
gulp.task( 'pre-commit', tasks.lintStaged );

// JS unit tests.
gulp.task( 'test', tasks.test );
