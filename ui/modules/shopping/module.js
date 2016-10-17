(function (){
    'use strict';

    angular.module('cookie-shopping', [])
        .config(routes);

    routes.$inject = ['$routeProvider'];
    function routes($routeProvider) {
        $routeProvider
        .when('/shopping-cart', {
            templateUrl: 'modules/shopping/cart.html',
            controller: 'ShoppingCartCtrl'
        });
    }
})();
