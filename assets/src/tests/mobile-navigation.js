import mobileNavigation from '../scripts/mobile-navigation.js';

describe( 'mobileNavigation', () => {
	let menuElement, menuItemElement, triggerElement;

	beforeEach( () => {
		triggerElement = document.createElement( 'a' );
		triggerElement.classList.add( 'toggle-menu' );

		menuItemElement = document.createElement( 'a' );

		menuElement = document.createElement( 'div' );
		menuElement.appendChild( menuItemElement );
		menuElement.appendChild( triggerElement );

		document.body.appendChild( menuElement );

		mobileNavigation( menuElement );
	} );

	afterEach( () => {
		document.body.removeChild( menuElement );
	} );

	it( 'should toggle `menu-active` class after clicking on `.toggle-menu` icon', () => {
		triggerElement.click();

		expect( menuElement.classList.contains( 'menu-active' ) ).to.true;

		triggerElement.click();

		expect( menuElement.classList.contains( 'menu-active' ) ).to.false;
	} );

	it( 'should remove `menu-active` class after clicking on menu item', () => {
		menuElement.classList.add( 'menu-active' );

		menuItemElement.click();

		expect( menuElement.classList.contains( 'menu-active' ) ).to.false;
	} );
} );
