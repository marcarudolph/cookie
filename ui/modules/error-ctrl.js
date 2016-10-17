'use strict';

ErrorCtrl.$inject = ['$scope', 'Page'];
function ErrorCtrl($scope, Page) {    
    Page.setTitle('Error');
    
    $scope.errors = app.errors;
    
}