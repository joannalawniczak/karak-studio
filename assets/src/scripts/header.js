import smoothScroll from '../../../node_modules/smooth-scroll/dist/js/smooth-scroll.js';

/**
 * Mobile navigation toggle.
 * Attach Smooth scroll to page sections.
 */
export default function header() {
	const headerEl = document.querySelector( '.page-header' );

	// Toggle mobile header.
	headerEl.querySelector( '.toggle-menu' ).addEventListener( 'click', ( e ) => {
		e.preventDefault();
		headerEl.classList.toggle( 'menu-active' );
	} );

	// Attach smooth scroll to menu items.
	[].forEach.call( headerEl.querySelectorAll( 'a:not(.toggle-menu)' ), ( el ) => {
		el.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			// Scroll to anchor.
			smoothScroll.animateScroll( e.currentTarget.hash );

			// Close mobile navigation.
			headerEl.classList.remove( 'menu-active' );
		} );
	} );

	// Attach smooth scroll to each element with [data-scroll] attribute.
	smoothScroll.init( { speed: 700 } );
}
