(function() {

    'use strict';

    angular.module('cookie')
        .directive('speechRecognition', speechRecognition);

    function speechRecognition() {
        return {
            restrict: 'A',
            scope: {
                recognitionActive: '='
            },
            link: link
        };  


        function link($scope, $element) {

            var toggle;
            var originalValue;
            var engine;

            $scope.toggleSpeechRecognition = toggleSpeechRecognition;
            $scope.$watch('recognitionActive', onActiveChange);

            if (!window.webkitSpeechRecognition) {
                return;
            }

            addToggle($element);

            function addToggle($element) {
                var wrapper = angular.element('<div class="speech-recognition-wrapper"></div>');
                $element.wrap(wrapper);

                toggle = angular.element('<button tabIndex="-1" class="speech-recognition-toggle" title="Text diktieren"><span class="glyphicon glyphicon-bullhorn"></span></button>');
                toggle.bind('click', toggleSpeechRecognition);
                toggle.bind('focus', moveFocusBackToElement);
                $element.after(toggle);
            }

            function toggleSpeechRecognition() {
                $scope.$apply(function() {
                    $scope.recognitionActive = !$scope.recognitionActive;
                });
            }

            function moveFocusBackToElement() {
                $element[0].focus();
            }

            function onActiveChange() {
                if ($scope.recognitionActive) {
                    toggle.addClass('active');

                    originalValue = $element.val();

                    engine = createWebkitRecognitionEngine();
                    engine.init('de', onRecogResult);
                    engine.start();
                }
                else if (engine) {
                    toggle.removeClass('active');
                    engine.stop();
                    engine = null;
                }                
            }
            
            function onRecogResult(interim, final) {
                var completeValue = originalValue;
                if (final) {
                    completeValue += final;
                }
                if (interim) {
                    completeValue += interim;
                }
                $element.val(completeValue);
                $element.triggerHandler('change');
            }            
        }
    }

    function createWebkitRecognitionEngine() {
        var recognition;

        return {
            init: init,
            start: start,
            stop: stop
        };

        function init(language, onResult) {
            recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = language;
            recognition.onresult = processResult;

            var finalTranscript;
            function processResult(event) {
                var interimTranscript = '';

                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript = finalTranscript || '';
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                if (onResult) {
                    onResult(interimTranscript, finalTranscript);                    
                }
            }
        }

        function start() {
            recognition.start();
        }

        function stop() {
            recognition.stop();
        }
    } 

})();