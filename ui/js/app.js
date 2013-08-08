'use strict';

/* App Module */

var app = angular.module('cookie', []).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/', {
        templateUrl: 'partials/recipes.html',
        controller: RecipesCtrl
    }).
    when('/auth', {
        templateUrl: 'partials/auth.html',
        controller: AuthCtrl
    }).
    when('/recipes/:recipeId', {
        templateUrl: 'partials/recipe.html',
        controller: RecipeCtrl
    }).
    otherwise({
        redirectTo: '/'
    });
}]);



app.factory('Page', function() {
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
            localStorage.authType = user.authType;
        }

    };
});

function PageCtrl($scope, Page) {
    
    $.getJSON('/api/init').done(function (appData) {
        if (!appData.user) {
            window.location.href="/#/auth";
        }
        else
            Page.setAuthUser(appData.user)
    });
    
    
    $scope.Page = Page;
}