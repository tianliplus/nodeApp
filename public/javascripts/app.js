angular.module('nodeWeb', ['ngRoute','voteServices']).config([
	'$routeProvider', function($routeProvider){
		$routeProvider.when('/vote', {
			templateUrl: 'public/partials/list.html',
			controller: VoteListControl
		})
		.when('/vote/:voteId', {
			templateUrl: 'public/partials/item.html',
			controller: VoteItemControl
		})
		.when('/new', {
			templateUrl: 'public/partials/new.html',
			controller: VoteNewControl
		})
		.otherwise({
			redirectTo: '/vote'
		});
	}
]);
