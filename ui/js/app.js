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

app.directive('markdown', function () {
    var showdown = new Showdown.converter();
    return {
        link: function (scope, element, attrs) {
            var markdown = scope[attrs.markdown];

            function safeTags(str) {
                return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
            }

            function stripWrappingPTag(html) {
                if (html.indexOf('<p>') === 0)
                    html = html.substr(3);
                if (html.substr(html.length - 4) === "</p>")
                    html = html.substring(0, html.length - 4);
                    
                return html;
            }

            function updateContent() {
                
                if (!markdown) {
                    element.html("");
                    return;
                }
                
                var safeMarkdown = safeTags(markdown);
                
                var htmlText = showdown.makeHtml(safeMarkdown);
                
                htmlText = stripWrappingPTag(htmlText);
                
                element.html(htmlText);            
            }

            scope.$watch(attrs.markdown, function(value) {
                markdown = value;
                updateContent();
            });
            
            updateContent();
        }
    };

});


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