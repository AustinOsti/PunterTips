'use strict';

// Configuring the Articles module
angular.module('bet-lists').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Bet Lists', 'bet-lists', 'dropdown', '/bet-lists(/create)?');
		Menus.addSubMenuItem('topbar', 'bet-lists', 'List Bet lists', 'bet-lists');
		Menus.addSubMenuItem('topbar', 'bet-lists', 'New Bet list', 'bet-lists/create');
	}
]);