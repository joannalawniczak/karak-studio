/* global google */

/**
 * Initialize google maps.
 */
function initMap () {
	// Inject google map to specified container.
	const map = new google.maps.Map( document.getElementById( 'map' ), {
		center: { lat: 54.489566, lng: 18.531477 },
		scrollwheel: false,
		zoom: 15,
		styles: [ {
			featureType: 'all',
			elementType: 'all',
			stylers: [
				{ saturation: -100 },
				{ gamma: 0.5 }
			]
		} ]
	} );

	// Put marker on the map.
	new google.maps.Marker( {
		position: { lat: 54.489566, lng:18.531477 },
		map: map,
		animation: google.maps.Animation.DROP,
		title: 'Karak Studio',
		icon: 'assets/dist/images/marker.png'
	} );
}

// Register as global function (needed by a google maps script).
window.initMap = initMap;
