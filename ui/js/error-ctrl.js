'use strict';

function ErrorCtrl($scope, Page) {    
    Page.setTitle('Error');
    
    $scope.errors = app.errors;
    
}

//SigninCtrl.$inject = ['$scope', Page];