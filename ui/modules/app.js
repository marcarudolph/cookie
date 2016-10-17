(function (){
    'use strict';

    var app = angular.module('cookie', 
        [
            'angularFileUpload',
            'ngRoute',
            'ngDialog',
            'cookie-utils',
            'cookie-recipes',
            'cookie-shopping'
        ]
    )
    .config(routes)
    .config(httpInterceptors);

    routes.$inject = ['$routeProvider'];
    function routes($routeProvider) {
        $routeProvider
        .when('/auth', {
            template: '',
            controller: AuthCtrl
        })
        .when('/error', {
            templateUrl: 'modules/error.html',
            controller: ErrorCtrl
        })
        .otherwise({
            redirectTo: '/'
        });
    }


    httpInterceptors.$inject = ['$httpProvider'];
    function httpInterceptors($httpProvider) {
        $httpProvider.interceptors.push(['$q', 'Page',
            function($q, Page) {
                return {
                    'responseError': function(err) {
                        if (err.status === 401) {
                            Page.authenticateUser();
                        }
                        return $q.reject(err);
                    }
                };
            }
        ]);
    }
})();