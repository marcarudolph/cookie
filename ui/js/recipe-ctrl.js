'use strict';

function RecipeCtrl($scope, $routeParams, Page, $upload, $http, $q) {

    var id = $routeParams.recipeId;
    $scope.recipe = {};

    $scope.ingredientValues = {};

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
                            
            $scope.recipe = recipe;

            $scope.displayCopy = JSON.parse(JSON.stringify(recipe));
            $scope.$apply(function () {
                updateCalculatedProperties();
                $scope.original_title = recipe.title;
                $scope.edit = false;
            });
        }).fail(function() {
            Page.setTitle('Ooops...');
        });        
    }

    function updateCalculatedProperties() {
        $scope.displayCopy.ingredients.map(function (ing) {
            ing.done = false;
            ing.quantity_calc = ing.quantity;
            ing.padded_comment = ing.comment;

            var startsWithWhitespaceOrPunctuation = /^\W/;
            if (!startsWithWhitespaceOrPunctuation.test(ing.comment))
                ing.padded_comment = " " + ing.padded_comment;
        });
        $scope.recalculateServings();
    }

    function refreshDisplayCopy(){
        var backupServings = $scope.displayCopy.servings;
        $scope.displayCopy = JSON.parse(JSON.stringify($scope.recipe));
        $scope.displayCopy.servings = backupServings;
        $scope.displayCopy.ingredients.forEach(function(ing) {
            ing.done = false;
        });
        updateCalculatedProperties();
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
              "unit": null,
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

    $scope.$watch('displayCopy.servings', function (newValue) {
        if (!newValue || !$scope.displayCopy.servings)
            return;

        $scope.displayCopy.servings = newValue;
        $scope.recalculateServings();        
    });

    $scope.recalculateServings = function () {
        $scope.displayCopy.ingredients.map(function (ing) {
            ing.quantity_calc = Math.round(ing.quantity / $scope.recipe.servings * $scope.displayCopy.servings * 100) / 100;
        });
    }
    
    $scope.beginEdit = function () {
        $scope.recipeBackup = JSON.parse(JSON.stringify($scope.recipe));
        $scope.edit = true;
        $scope.tagFetcher = $scope.tagFetcher || $http.get("/api/tags");

        fetchIngredientValues('name');
        fetchIngredientValues('unit');
        fetchIngredientValues('comment');

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
        $.ajax({
            type: "POST",
            url: './api/recipes/?action=new',
            dataType: "json",
            contentType : 'application/json',
            data: angular.toJson($scope.recipe)
        }).done(function(response){
            window.location.href = "/#/recipes/" +  response._id;
        });        
    };

    $scope.tagFetcher = null;
    $scope.getTags = function(query) {
        query = query.toLowerCase();
        return $q(function(resolve, reject) {
            $scope.tagFetcher
            .success(function(tags) {
                var matchingTags = tags.filter(function(t) { 
                    return t.tag.toLowerCase().indexOf(query) === 0;}
                );
                var tagsForControl = matchingTags.map(function(t) {
                    var tag = t.tag;
                    return tag.charAt(0).toUpperCase() + tag.slice(1); 
                });
                return resolve(tagsForControl);
            })
            .catch(reject);
        });
    }  

    function fetchIngredientValues(field) {

        var plural = field + "s",
            uri = "/api/recipes/values/ingredients." + field;

        if($scope.ingredientValues[plural]) {
            return;
        }

        $scope.ingredientValues[plural] = [];
        $http.get(uri)
        .success(function(values) {
            $scope.ingredientValues[plural] = values;
        });
    }
    
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
                recipe._id = response._id; 
                saveRecipeToServer(recipe);
                window.location.href = "/#/recipes/" +  recipe._id;
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
            $scope.$apply(function(){
                refreshDisplayCopy();    
            });            
        });
    }  

    $scope.onFileSelect = function($files) {
        $scope.upload = $upload.upload({
            url: "/api/recipes/" + $scope.recipe._id + "/pictures/",
            method: "POST",
            file: $files
        }).progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(updatedRecipe) {
            $scope.displayCopy.pictures = updatedRecipe.pictures;
        });
    };
    
    if (id !== "_new")
        loadRecipe(id);
    else
        createNewRecipe();
    
}



//RecipeCtrl.$inject = ['$scope', $routeParams, Page, $upload];