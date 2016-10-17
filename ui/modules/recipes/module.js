(function (){
    'use strict';

    angular.module('cookie-recipes', [])
        .config(routes);

    routes.$inject = ['$routeProvider'];
    function routes($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'modules/recipes/list.html',
            controller: RecipeListCtrl
        })
        .when('/recipes/:recipeId', {
            templateUrl: 'modules/recipes/details.html',
            controller: RecipeDetailsCtrl
        });
    }
})();