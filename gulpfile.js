'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const del = require( 'del' );
const gulp = require( 'gulp' );
const gulpIf = require( 'gulp-if' );
const gulpSass = require( 'gulp-sass' );
const gulpCssnano = require( 'gulp-cssnano' );
const gulpAutoprefixer = require( 'gulp-autoprefixer' );
const gulpEslint = require( 'gulp-eslint' );
const rollup = require( 'rollup' ).rollup;
const rollupNodeResolve = require( 'rollup-plugin-node-resolve' );
const rollupCommonjs = require( 'rollup-plugin-commonjs' );
const rollupBabel = require( 'rollup-plugin-babel' );
const rollupUglify = require( 'rollup-plugin-uglify' );

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
		dest
	},

	scripts: {
		entry: path.join( src, 'scripts', 'main.js' ),
		src: path.join( src, 'scripts', '**', '*.js' ),
		dest: path.join( dest, 'scripts', 'main.js' )
	}
};

const utils = {
	symlink( from, to ) {
		return gulp.src( from )
			.pipe( gulp.symlink( to ) );
	},

	copy( from, to ) {
		return gulp.src( from )
			.pipe( gulp.dest( to ) );
	},

	clean( path ) {
		return del( path );
	}
};

const tasks = {
	styles( options = {} ) {
		return gulp.src( config.styles.packages )
			.pipe( gulpSass().on( 'error', gulpSass.logError ) )
			.pipe( gulpAutoprefixer( { browsers: [ 'last 2 versions' ] } ) )
			.pipe( gulpIf( !options.debug, gulpCssnano() ) )
			.pipe( gulp.dest( config.styles.dest ) );
	},

	scripts( options = {} ) {
		let rollupPlugins = [
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

	images( options = {} ) {
		if ( !options.debug ) {
			const from = path.join( config.images.src, '**', '*.*' );
			const to = path.join( dest, 'images' );

			return utils.copy( from, to );
		}

		return utils.symlink( config.images.src, dest );
	},

	watch() {
		gulp.watch( config.styles.src, gulp.series( 'styles:debug' ) );
		gulp.watch( config.scripts.src, gulp.series( 'scripts:debug' ) );
	},

	lint() {
		return gulp.src( jsFiles )
			.pipe( gulpEslint() )
			.pipe( gulpEslint.format() )
			.pipe( gulpEslint.failAfterError() );
	}
};

/**
 * Gets the list of ignores from `.gitignore`.
 *
 * @returns {String[]} The list of ignores.
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

// Tasks.
gulp.task( 'lint', tasks.lint );

gulp.task( 'clean', () => utils.clean( dest ) );

gulp.task( 'styles:debug', () => tasks.styles( { debug: true } ) );
gulp.task( 'scripts:debug', () => tasks.scripts( { debug: true } ) );
gulp.task( 'images:debug', () => tasks.images( { debug: true } ) );

gulp.task( 'styles', tasks.styles );
gulp.task( 'scripts', tasks.scripts );
gulp.task( 'images', tasks.images );

gulp.task( 'watch', tasks.watch );

gulp.task( 'build', gulp.series( 'clean', gulp.parallel( 'styles', 'scripts', 'images' ) ) );
gulp.task( 'build:debug', gulp.series( 'clean', gulp.parallel( 'styles:debug', 'scripts:debug', 'images:debug' ), 'watch' ) );
