'use strict';

function RecipeCtrl($scope, $routeParams, Page) {

    var url = './api/recipes/' + $routeParams.recipeId;
    
    Page.setTitle('Lade Rezept...');
    
    $.getJSON(url).done(function (recipe) {
        Page.setTitle(recipe.title);
        $scope.$apply(function () {
            recipe.ingredients.map(function (ing) {
                ing.done = false;
                ing.quantity_calc = ing.quantity;
            });
            recipe.original_servings = recipe.servings;
            
            $scope.recipe = recipe;
            $scope.original_id = recipe._id;
            $scope.edit = false;
        });
    }).fail(function(a, b, c) {
        Page.setTitle('Ooops...');
        console.error(a);
    });

    $scope.recipe = {};

    $scope.addToShoppingList = function (ingredient) {
        console.log(ingredient.name);
    };

    $scope.$watch('recipe.servings', function (newValue, oldValue) {
        if (!newValue || !$scope.recipe.servings)
            return;

        $scope.recipe.ingredients.map(function (ing) {
            ing.quantity_calc = Math.round(ing.quantity / $scope.recipe.original_servings * newValue * 100) / 100;
        });
    });
    
    $scope.beginEdit = function () {
        $scope.edit = true;    
    };

    
    $scope.saveRecipe = function () {
        
        if($scope.original_id !== $scope.recipe._id)
        {
            renameAndSaveRecipe($scope.recipe);
        }
        else
        {
            saveRecipeToServer($scope.recipe);
        }
            
        $scope.edit = false;
    };
    
    function renameAndSaveRecipe(recipe){
        $.ajax({
              type: "POST",
              url: "/api/recipes/?action=rename",
              dataType: "json",
              contentType : 'application/json',
              data: angular.toJson({
                  oldId: recipe._id, 
                  title: recipe.title })
            }).done(function( response ){
                recipe._id = response.id; 
                saveRecipeToServer(recipe);
            });
    }
    
    function saveRecipeToServer(recipe){
        $.ajax({
            type: "PUT",
            url: './api/recipes/' + recipe._id,
            dataType: "json",
            contentType : 'application/json',
            data: angular.toJson(recipe)
        }).done(function(){
            window.location.href = "/#/recipes/" +  recipe._id;
        });
    }
}

//RecipeCtrl.$inject = ['$scope', $routeParams, Page];