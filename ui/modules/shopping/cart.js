(function (){
    'use strict';
    angular.module('cookie-shopping')
        .factory('ShoppingCart', ShoppingCart)
        .controller('ShoppingCartCtrl', ShoppingCartCtrl);
    
    ShoppingCart.$inject = [];
    function ShoppingCart() {
    
        var items = [];
        
        return {
            addItem: addItem,
            clearItems: clearItems,
            getItems: getItems
        };
        
        function addItem(ingredient, quantity, forRecipe){
            items.push({
                ingredient: ingredient,
                quantity: quantity,
                forRecipe : forRecipe,
                done: false
            });
        }
        
        function clearItems(){
            items.length = 0;
        }
        
        function getItems(){
            return items;
        }
        
    }
    
    ShoppingCartCtrl.$inject = ['$scope', 'ShoppingCart'];
    function ShoppingCartCtrl($scope, ShoppingCart){
        $scope.items = ShoppingCart.getItems();
        $scope.clearItems = ShoppingCart.clearItems;
        
    }
})();