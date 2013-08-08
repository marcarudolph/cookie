'use strict';

function AuthCtrl($scope, Page) {    
    Page.setTitle('Sign in');
    
    var currentUser = Page.authUser();
    
    $scope.isSignedIn = (currentUser !== null);
    
    if (!$scope.isSignedIn) {
        var storedAuthType = localStorage.authType;
        if (storedAuthType) {
            window.location.href='/auth/' + storedAuthType;
        }
    }
    
    $scope.signOut = function() {        
        localStorage.removeItem('authType');
            window.location.href='/logout';        
    };
}

//SigninCtrl.$inject = ['$scope', Page];