'use strict';

// Configuring the Articles module
angular.module('updates').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Updates', 'updates', 'dropdown', '/updates(/create)?');
		Menus.addSubMenuItem('topbar', 'updates', 'List Updates', 'updates');
		Menus.addSubMenuItem('topbar', 'updates', 'New Update', 'updates/create');
	}
]);