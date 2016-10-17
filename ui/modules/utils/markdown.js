'use strict';

angular.module('cookie-utils')
.factory('markdowner', markdowner)
.directive('markdown', markdownDirective);

function markdowner() {
    var service = {
        makeHtml: makeHtml
    };
    var renderer = new marked.Renderer();
    renderer.paragraph = function paragraphWithoutPTag(text) { 
        return text;
    }

    var markedOptions = {
        gfm: true,
        sanitize: true,
        breaks: true,
        renderer: renderer  
    };


    function makeHtml(md) {
        return marked(md, markedOptions);
    }

    return service; 
}

markdownDirective.$inject = ['markdowner'];
function markdownDirective(markdowner) {
    return {
        link: function (scope, element, attrs) {
            var markdown = scope[attrs.markdown];
            function updateContent() {
                
                if (!markdown) {
                    element.html('');
                    return;
                }
                
                var htmlText = markdowner.makeHtml(markdown);                
                element.html(htmlText);            
            }

            scope.$watch(attrs.markdown, function(value) {
                markdown = value;
                updateContent();
            });
            
            updateContent();
        }
    };

}