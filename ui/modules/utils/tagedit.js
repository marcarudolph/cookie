(function() {
    'use strict';
    angular.module('cookie-utils')
        .directive('tagedit', tagedit);

    tagedit.$inject = ['$http'];
    function tagedit($http) {
        return {
            restrict:'AE',
            scope:{
                selectedTags:'=model',
                placeholder:'=placeholder',
                getSuggestions: '=suggestions'
            },
            templateUrl:'modules/utils/tagedit-template.html',
            link:function(scope,elem,attrs){

                scope.suggestions=[];
                scope.selectedIndex=-1;

                scope.removeTag=function(index){
                    scope.selectedTags.splice(index,1);
                }

                scope.search=function(){
                	if (scope.searchText !== "") {            		
    	            	scope.getSuggestions(scope.searchText)
    	            	.then(function(data){
    	                    if(data.indexOf(scope.searchText)===-1){
    	                        data.unshift(scope.searchText);
    	                    }
    	                    scope.suggestions=data;
    	                    scope.selectedIndex=0;
    	                });
    	            }
    	            else {
    	            	scope.suggestions = [];
    	            }
                }

                scope.addToSelectedTags=function(index){
                	scope.selectedTags = scope.selectedTags || [];
                    if(scope.selectedTags.indexOf(scope.suggestions[index])===-1){
                        scope.selectedTags.push(scope.suggestions[index]);
                        scope.searchText='';
                        scope.suggestions=[];
                    }
                }

                scope.checkKeyDown=function(event){
                    if(event.keyCode===40){
                        event.preventDefault();
                        if(scope.selectedIndex+1 !== scope.suggestions.length){
                            scope.selectedIndex++;
                        }
                    }
                    else if(event.keyCode===38){
                        event.preventDefault();
                        if(scope.selectedIndex-1 !== -1){
                            scope.selectedIndex--;
                        }
                    }
                    else if(event.keyCode===13){
                        scope.addToSelectedTags(scope.selectedIndex);
                    }
                    else if(event.keyCode===27){
                        scope.searchText='';
                        scope.suggestions = [];
                    }
                }

                scope.$watch('selectedIndex',function(val){
                    if(val!==-1) {
                        scope.searchText = scope.suggestions[scope.selectedIndex];
                    }
                });
            }
        }
    }
})();