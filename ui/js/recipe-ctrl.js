'use strict';

function RecipeCtrl($scope, $routeParams, Page) {

    var id = $routeParams.recipeId;
    $scope.recipe = {};

    function createNewRecipe() {
        var recipe = {
            origin: {
                system: 'cookie'
            },
          rating: {
            likes: 0
          },
          instructions: [],
          servings: 2,
          ingredients: [],
          pictures: [],
          tags: []
        };
        $scope.recipe = recipe;
        $scope.original_title = null;
        $scope.beginEdit();
        
        Page.setTitle('Neues Rezept...');
    }

    function loadRecipe(id) {
        var url = './api/recipes/' + id;
        
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
                $scope.original_title = recipe.title;
                $scope.edit = false;
            });
        }).fail(function() {
            Page.setTitle('Ooops...');
        });        
    }
    
    function insertNewElementOnLastElementTabKey(event, element, array, newHandler){
        if (event.which !== 9
            || event.altKey
            || event.shiftKey
            || event.ctrlKey)
            return;
        
        if (array.indexOf(element) === array.length - 1) {
            newHandler();
        }
    }


    $scope.addToShoppingList = function (ingredient) {
        console.log(ingredient.name);
    };

    $scope.addInstructionToRecipe = function (){
        $scope.recipe.instructions.push("");
    };
    
    $scope.deleteInstruction = function (instruction){
        var index = $scope.recipe.instructions.indexOf(instruction);
        if (index > -1) {
            $scope.recipe.instructions.splice(index, 1);
        }        
    };

    $scope.handleInstructionTabKey = function(event, element) {
        insertNewElementOnLastElementTabKey(event, element, $scope.recipe.instructions, $scope.addInstructionToRecipe);
    };

    $scope.addIngredientToRecipe = function (){
       $scope.recipe.ingredients.push(
            {
              "name": "",
              "comment": "",
              "quantity": 1,
              "quantity_calc": 1,
              "unit": null,
              "done": false
            });
    };
    
    $scope.deleteIngredient = function (ingredient) {
        var index = $scope.recipe.ingredients.indexOf(ingredient);
        if (index > -1) {
            $scope.recipe.ingredients.splice(index, 1);
        }
    };

    $scope.handleIngredientTabKey = function(event, element) {
        insertNewElementOnLastElementTabKey(event, element, $scope.recipe.ingredients, $scope.addIngredientToRecipe);
    };
    
    $scope.addLikeToRecipe = function()
    {
        $.ajax({
            type: "POST",
            url: "/api/recipes/" + $scope.recipe._id + "/likes",
            dataType: "json",
            contentType : 'application/json',
            data: angular.toJson({
                  "action": "like" })
        }).done(function(response){
            loadRecipe($scope.recipe._id);
        });
    };

    $scope.removeLikeFromRecipe = function()
    {
        $.ajax({
            type: "POST",
            url: "/api/recipes/" + $scope.recipe._id + "/likes",
            dataType: "json",
            contentType : 'application/json',
            data: angular.toJson({
                  "action": "dislike" })
        }).done(function(response){
            loadRecipe($scope.recipe._id);
        });
    };

    $scope.$watch('recipe.servings', function (newValue) {
        if (!newValue || !$scope.recipe.servings)
            return;

        $scope.recipe.ingredients.map(function (ing) {
            ing.quantity_calc = Math.round(ing.quantity / $scope.recipe.original_servings * newValue * 100) / 100;
        });
    });
    
    $scope.beginEdit = function () {
        $scope.recipeBackup = JSON.parse(JSON.stringify($scope.recipe));
        $scope.edit = true;    
    };
    
    $scope.cancelEdit = function () {
        $scope.recipe = $scope.recipeBackup;
        $scope.edit = false;    
    };

    
    $scope.saveRecipe = function () {
        if (!$scope.recipe._id) {
            $scope.saveNewRecipeToServer();
        }
        else if($scope.original_title !== $scope.recipe.title)
        {
            renameAndSaveRecipeToServer($scope.recipe);
        }
        else
        {
            saveRecipeToServer($scope.recipe);
        }
            
        $scope.edit = false;
    };
    
    $scope.saveNewRecipeToServer = function() {
        recalculateIngredientQuantities();
        
        $.ajax({
            type: "POST",
            url: './api/recipes/?action=new',
            dataType: "json",
            contentType : 'application/json',
            data: angular.toJson($scope.recipe)
        }).done(function(response){
            window.location.href = "/#/recipes/" +  response.id;
        });        
    };
    
    function renameAndSaveRecipeToServer(recipe){
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
        $scope.recipe.servings = $scope.recipe.original_servings;
        recalculateIngredientQuantities();
        
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
    
    function recalculateIngredientQuantities(){
         $scope.recipe.ingredients.map(function (ing) {
            ing.quantity = Math.round(ing.quantity_calc / $scope.recipe.servings * $scope.recipe.original_servings * 100) / 100;
        });
    }

    
    if (id)
        loadRecipe(id);
    else
        createNewRecipe();
    
}

//RecipeCtrl.$inject = ['$scope', $routeParams, Page];