import PhotoSwipe from '../../../node_modules/photoswipe/dist/photoswipe.js';
import PhotoSwipeUI_Default from '../../../node_modules/photoswipe/dist/photoswipe-ui-default.js';
import template from './gallery-template.js';

/**
 * Initialize Photo Swipe Gallery with pagination.
 */
export default function gallery() {
	const galleryEl = document.querySelector( '.gallery' );
	const pagesWrapperEl = galleryEl.querySelector( '.pages' );
	const paginationEl = galleryEl.querySelector( '.pagination' );
	const pages = pagesWrapperEl.querySelectorAll( '.thumbs' );
	const pageNumbers = paginationEl.querySelectorAll( 'a' );
	const templateContainerEl = document.createElement( 'div' );

	// Append photo swipe template and retrieve photo swipe container.
	templateContainerEl.innerHTML = template;
	document.body.appendChild( templateContainerEl );
	const photoSwipeEl = templateContainerEl.querySelector( '.pswp' );

	// Loop through each photo, get data from every single photo and set data-index for each el.
	let i = 0;
	const photos = [].map.call( pagesWrapperEl.querySelectorAll( 'a' ), ( el ) => {
		el.dataset.index = i++;

		return {
			src: el.href,
			w: 930,
			h: 680
		};
	} );

	// Handle click on gallery photos.
	pagesWrapperEl.addEventListener( 'click', ( e ) => handleGalleryClick( e, photoSwipeEl, photos ) );

	// Handle click on pagination.
	paginationEl.addEventListener( 'click', ( e ) => handlePageNumberClick( e, pages, pageNumbers ) );
}

/**
 * Initialize Photo Swipe gallery after click on thumb.
 *
 * @param {Event} e Click event.
 * @param {HTMLElement} photoSwipeEl Photo swipe gallery container.
 * @param {Object[]} photos List of each photo from gallery.
 */
function handleGalleryClick( e, photoSwipeEl, photos ) {
	if ( e.target.nodeName.toLowerCase() != 'a' ) {
		return;
	}

	e.preventDefault();

	const gallery = new PhotoSwipe( photoSwipeEl, PhotoSwipeUI_Default, photos, {
		index: parseInt( e.target.dataset.index ),
		closeOnScroll: false,
		history: false,
		showHideOpacity: true,
		shareEl: false,
		fullscreenEl: false,
		zoomEl: false
	} );

	gallery.init();
}

/**
 * Show page attached do specified pagination item after click on it.
 *
 * @param {Event} e Click event.
 * @param {HTMLCollection} pages List of gallery pages.
 * @param {HTMLCollection} pageNumbers List of pagination items.
 */
function handlePageNumberClick( e, pages, pageNumbers ) {
	if ( e.target.tagName.toLowerCase() != 'a' ) {
		return;
	}

	e.preventDefault();

	if ( e.target.classList.contains( 'active' ) ) {
		return;
	}

	for ( let i = 0; i < pages.length; i++ ) {
		pages[ i ].classList.remove( 'active' );
		pageNumbers[ i ].classList.remove( 'active' );
	}

	e.target.classList.add( 'active' );
	pages[ parseInt( e.target.dataset.index ) ].classList.add( 'active' );
}
