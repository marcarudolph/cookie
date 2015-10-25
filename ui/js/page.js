'use strict';

angular.module('cookie')
    .controller('PageCtrl', PageCtrl)
    .factory('Page', Page);

function Page() {
    var title = '';
    var authUser = null;
    return {
        title: function() {
            return title;
        },
        setTitle: function(newTitle) {
            title = newTitle;
        },

        authUser: function() {
            return authUser;
        },
        setAuthUser: function(user) {
            authUser = user;
        },

        authenticateUser: function() {
            this.setAuthUser(null);
            window.localStorage.locationBeforeAuth = window.location.href;
            window.location.href = '/#/auth';
        },
        onUserAuthenticated: function(user) {
            this.setAuthUser(user);
            var locationBeforeAuth = window.localStorage.locationBeforeAuth;
            if (locationBeforeAuth) {
                window.localStorage.locationBeforeAuth = '';
                window.location.href = locationBeforeAuth;
            }
        } 
    };
};


PageCtrl.$inject = ['$scope', '$http', 'Page'];
function PageCtrl($scope, $http, Page) {
    $http.get('/api/init')
    .success(function (appData) {
        if (appData.errors && appData.errors.length > 0) {
            app.errors = appData.errors;
            window.location.href="/#/error";
        }
        else if (!appData.user) {
            window.location.href="/#/auth";
        }
        else {
            Page.onUserAuthenticated(appData.user);
        }
    })
    .error(function(data, status, headers, config) {
        if (status === 401) {
            window.location.href="/#/auth";        
        }
        else {
            window.location.href="/#/error";            
        }
    });
    
    
    $scope.Page = Page;
}
