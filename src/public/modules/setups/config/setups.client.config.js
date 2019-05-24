'use strict';

// Configuring the Articles module
angular.module('setups').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Setup', 'setups', 'dropdown', '/setups(/create)?');
		Menus.addSubMenuItem('topbar', 'setups', 'List Setups', 'setups');
		Menus.addSubMenuItem('topbar', 'setups', 'New Setup', 'setups/create');
	}
]);