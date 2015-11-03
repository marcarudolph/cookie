'use strict';

var app = angular.module('cookie', ['angularFileUpload', 'ngRoute', 'tagedit', 'ngDialog']);

app.config(['$httpProvider', function($httpProvider) {

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


}]);



