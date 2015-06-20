'use strict';

angular.module('cookie')
.directive('markdown', function () {
    var showdown = new Showdown.converter();
    return {
        link: function (scope, element, attrs) {
            var markdown = scope[attrs.markdown];

            function safeTags(str) {
                if (!str)
                    return str;

                return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
            }

            function stripWrappingPTag(html) {
                if (html.indexOf('<p>') === 0)
                    html = html.substr(3);
                if (html.substr(html.length - 4) === "</p>")
                    html = html.substring(0, html.length - 4);
                    
                return html;
            }

            function updateContent() {
                
                if (!markdown) {
                    element.html("");
                    return;
                }
                
                var safeMarkdown = safeTags(markdown);
                
                var htmlText = showdown.makeHtml(safeMarkdown);
                
                htmlText = stripWrappingPTag(htmlText);
                
                element.html(htmlText);            
            }

            scope.$watch(attrs.markdown, function(value) {
                markdown = value;
                updateContent();
            });
            
            updateContent();
        }
    };

});