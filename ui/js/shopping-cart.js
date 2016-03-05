(function (){
  'use strict';
  angular.module('cookie')
    .factory('ShoppingCart', ShoppingCart);
  
  ShoppingCart.$inject = [];
  function ShoppingCart() {
  
    var items = [];
    
    return {
      addItem: addItem
    };
    
    function addItem(ingredient, quantity, forRecipe){
      items.push({
        ingredient: ingredient,
        quantity: quantity,
        forRecipe : forRecipe || 'foobar'
      });
    }
    
  };
})();