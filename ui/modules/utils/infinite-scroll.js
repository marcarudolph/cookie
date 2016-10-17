(function() {
    'use strict';


    angular.module('cookie-utils')
        .directive('infiniteScroll', infiniteScroll);


    infiniteScroll.$inject = ['$parse'];
    function infiniteScroll($parse) {
        return {
            restrict: 'A',
            compile: function (element, attr, linker) { 
                return function($scope, $element, $attr) {
                    var templateHtml = $element[0].innerHTML;
                    $element[0].innerHTML = '';
                    
                    _.templateSettings = {
                      evaluate: /\[\[(.+?)\]\]/g,
                      interpolate: /\[\[:(.+?)\]\]/g
                    };
                    var compiled = _.template(templateHtml);
                    infiniteScroller($parse, $scope, $element, $attr, compiled);
                }
            }
        };
    }

    function infiniteScroller ($parse, $scope, $element, $attr, template) {
        var iScroll,
            sourceName,
            itemName;


        var expression = $attr.infiniteScroll;
        var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*?$/);
        itemName = match[1];
        sourceName = match[2];

        setupScrollElements();
        setupHandlers();
        initScroller();

        $scope.$watch(sourceName, initScroller);

        function setupScrollElements() {

            $element[0].className += ' is-wrapper';

            var scroller = document.createElement('div');
            scroller.className = 'is-scroller';
            var list = document.createElement('ul');
            scroller.appendChild(list);
            var row = document.createElement('li')
            row.className = 'is-row';

            for (var i = 0; i < 50; i++) {
                list.appendChild(row.cloneNode());
            }
            $element[0].appendChild(scroller);
        }

        function setupHandlers() {
            $element[0].addEventListener('click', function(ev) {
                var actionAttr = ev.target.attributes['ng-click'];
                if (actionAttr) {
                    var exp = $parse(actionAttr.value);
                    $scope.$apply(function() {
                        exp($scope);                        
                    });
                }
            });

            $element[0].addEventListener('touchmove', function(ev) {
                ev.preventDefault();
            });

        }

        function initScroller () {
            if (iScroll) {
                iScroll.resetPosition();
                iScroll.destroy();
            }

            iScroll = new IScroll($element[0], {
                mouseWheel: true,
                infiniteElements: '.is-scroller .is-row',
                dataset: requestData,
                dataFiller: renderTemplate,
                preventDefault: false,
                cacheSize: 250
            });
        }

        function requestData (start, count) {
            var source = $scope[sourceName];
            if (!source) {
                return;
            }

            source(start, count)
            .then(function(data) {
                var length = data ? data.length : 0;
                if (length < count) {
                    iScroll.options.infiniteLimit = start + length;
                    iScroll.refresh();
                }
                iScroll.updateCache(start, data);       
            });
        }


        function renderTemplate (parent, data) {
            if (data) {
                var ctx = {};
                ctx[itemName] = data;
                var html = template(ctx);
                parent.innerHTML = html;        
            }
            else {
                parent.innerHTML = '';
            }            
        }

    }

})();


