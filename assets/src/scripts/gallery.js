import PhotoSwipe from '../../../node_modules/photoswipe/dist/photoswipe.js';
import PhotoSwipeUI_Default from '../../../node_modules/photoswipe/dist/photoswipe-ui-default.js';
import template from './gallery-template.js';

/**
 * Pagination for realization thumbnails.
 * Initialize Photo Swipe Gallery after clicking on thumb.
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

	// Loop through each thumb in HTML, get data from every single photo and set data-index to every el.
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
 * @param {Object[]} photos List of every photo from gallery.
 */
function handleGalleryClick( e, photoSwipeEl, photos ) {
	if ( e.target.nodeName.toLowerCase() != 'a' ) {
		return;
	}

	e.preventDefault();

	openGallery( parseInt( e.target.dataset.index ), photoSwipeEl, photos );
}

/**
 * Open photo swipe gallery with specified photo.
 *
 * @param {Number} index Photo index.
 * @param {HTMLElement} photoSwipeEl Photo swipe gallery container.
 * @param {Object[]} photos List of every photo from gallery.
 */
function openGallery( index, photoSwipeEl, photos ) {
	const gallery = new PhotoSwipe( photoSwipeEl, PhotoSwipeUI_Default, photos, {
		index: index,
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
 * @param {NodeList} pages Gallery pages.
 * @param {NodeList} paginationItems Pagination items.
 */
function handlePageNumberClick( e, pages, paginationItems ) {
	if ( e.target.tagName.toLowerCase() != 'a' ) {
		return;
	}

	e.preventDefault();

	if ( e.target.classList.contains( 'active' ) ) {
		return;
	}

	showPageByIndex( parseInt( e.target.dataset.index ), pages, paginationItems );
}

/**
 * Show gallery page by index.
 *
 * @param {Number} index Page index.
 * @param {NodeList} pages Gallery pages.
 * @param {NodeList} paginationItems Pagination items.
 */
function showPageByIndex( index, pages, paginationItems ) {
	// Clear each page.
	for ( let i = 0; i < pages.length; i++ ) {
		pages[ i ].classList.remove( 'active' );
		paginationItems[ i ].classList.remove( 'active' );
	}

	// Set new page as active.
	paginationItems[ index ].classList.add( 'active' );
	pages[ index ].classList.add( 'active' );
}
