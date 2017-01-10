'use strict';

const config = {
	ROOT_PATH: __dirname
};

const path = require( 'path' );
const gulp = require( 'gulp' );
const runSequence = require( 'run-sequence' );

const utils = require( 'static-layout-starter-dev-tools/lib/utils.js' );
const testTasks = require( 'static-layout-starter-dev-tools/lib/tasks/test.js' )( config );
const lintTasks = require( 'static-layout-starter-dev-tools/lib/tasks/lint.js' )( config );
const compileTasks = require( 'static-layout-starter-dev-tools/lib/tasks/compile.js' )( config );

const options = utils.parseArgs( process.argv.slice( 3 ) );

/**
 * Paths definitions.
 */
const src = './assets/src';
const dest = './assets/dist';

// Remove dist directory.
gulp.task( 'clean', () => utils.del( dest ) );

gulp.task( 'styles', () => {
	return compileTasks.compileStyles( path.join( src, 'styles', '*.scss' ), path.join( dest, 'styles' ), options );
} );

gulp.task( 'scripts', () => {
	return compileTasks.compileScripts( path.join( src, 'scripts', 'main.js' ), path.join( dest, 'scripts', 'main.js' ), options );
} );

gulp.task( 'images', () => {
	return compileTasks.compileStaticFiles( path.join( src, 'images' ), path.join( dest, 'images' ), options );
} );

// Build entire application.
gulp.task( 'build', ( done ) => {
	runSequence( 'clean', [ 'styles', 'scripts', 'images' ], done );
} );

// JS code sniffer.
gulp.task( 'lint', () => lintTasks.lint( path.join( config.ROOT_PATH, '**', '*.js' ) ) );
gulp.task( 'pre-commit', () => lintTasks.lintStaged( path.join( config.ROOT_PATH, '**', '*.js' ) ) );

// JS unit tests.
gulp.task( 'test', () => testTasks.test( options ) );
