'use strict';


AuthCtrl.$inject = ['$scope', 'Page'];
function AuthCtrl($scope, Page) {    
    Page.setTitle('Sign in');
    
    var currentUser = Page.authUser();
    
    $scope.isSignedIn = (currentUser !== null);

    $scope.signOut = function() {        
        window.location.href='/logout';        
    };
}

