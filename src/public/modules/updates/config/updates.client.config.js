'use strict';

// Configuring the Articles module
angular.module('updates').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Run Updates', 'updates', 'dropdown', '/updates(/create)?');
		Menus.addSubMenuItem('topbar', 'updates', 'Archives', 'updates/archives');
		Menus.addSubMenuItem('topbar', 'updates', 'Day Bets', 'updates/bets');		
		Menus.addSubMenuItem('topbar', 'updates', 'Bet List', 'updates/lists');			
	}
]);