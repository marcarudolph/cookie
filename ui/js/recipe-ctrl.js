'use strict';

function RecipeCtrl($scope, $routeParams, Page, $upload) {

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
            url: "/api/recipes/" + $scope.recipe._id + "/pictures/", //upload.php script, node.js route, or servlet url
            method: "POST", //or PUT,
            // headers: {'headerKey': 'headerValue'},
            // withCredentials: true,
            //data: {myObj: $scope.myModelObj},
            //file: file,
            file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
            /* set file formData name for 'Content-Desposition' header. Default: 'file' */
            //fileFormDataName: myFile, //OR for HTML5 multiple upload only a list: ['name1', 'name2', ...]
            /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
            //formDataAppender: function(formData, key, val){} //#40#issuecomment-28612000
        }).progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(picturesToInsert) {
           //$scope.displayCopy.pictures = $scope.displayCopy.pictures.concat(picturesToInsert);
            for (var index = 0; index < picturesToInsert.length; ++index) {
                $scope.displayCopy.pictures.push(picturesToInsert[index]);
            };
        });
    };
    
    if (id)
        loadRecipe(id);
    else
        createNewRecipe();
    
}

//RecipeCtrl.$inject = ['$scope', $routeParams, Page, $upload];