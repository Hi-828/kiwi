'use strict'

angular
  .module('app.directives', [])
  .directive('ngEnter', function() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if(event.which === 13) {
          scope.$apply(function(){
            scope.$eval(attrs.ngEnter, {'event': event});
          });

          event.preventDefault();
        }
      });
    };
  })
  .directive('uploader', function () {
    return {
      restrict: 'E',
      link: function (scope, element) {
        element.find("div").bind("click", function () {
          element.find("input")[0].click();
        });
      }
    }
  })
  .directive('compareTo', function () {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=compareTo"
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
          var ret=  (modelValue == scope.otherModelValue);
          ngModel.$setValidity('compare-to', ret);
          return ret;
        };

        scope.$watch("otherModelValue", function() {
          ngModel.$validate();
        });
      }
    };
  })
  .directive('ngPlaceholder', function($document) {
    return {
      restrict: 'A',
      scope: {
        placeholder: '=ngPlaceholder'
      },
      link: function(scope, elem, attr) {
        scope.$watch('placeholder',function() {
          elem[0].placeholder = scope.placeholder;
        });
      }
    }
  })
  .directive('dragAndDrop', function () {
    return {
      restrict: 'A',
      scope: {
        method:'&dropHandler',
        dragoverevent: '&dragOverHandler',
        dragleaveevent: '&dragLeaveEvent',
        divClass: '&'
      },
      link: function ($scope, elem, attr) {

        elem.bind('dragover', function (e) {
          e.stopPropagation();
          e.preventDefault();

          var event = e.originalEvent;
          if (event && event.dataTransfer) {
            $scope.$apply(function () {
              $scope.dragoverevent({
                files: event.dataTransfer.items
              });
            });
          }
        });

        elem.bind('dragenter', function (e) {
          e.stopPropagation();
          e.preventDefault();
          $scope.$apply(function () {
            elem.addClass('active');
          });
        });

        elem.bind('dragleave', function (e) {
          e.stopPropagation();
          e.preventDefault();
          $scope.$apply(function () {
            elem.removeClass('active');
          });

          var event = e.originalEvent;
          if (event && event.dataTransfer) {
            $scope.$apply(function () {
              $scope.dragoverevent();
            });
          }
        });

        elem.bind('drop', function (e) {
          $scope.$apply(function () {
            elem.removeClass('active');
          });

          e.stopPropagation();
          e.preventDefault();

          var event = e.originalEvent;
          if (event && event.dataTransfer) {
            $scope.$apply(function () {
              $scope.method({
                files: event.dataTransfer.files
              });
            });
          }
        });
      }
    };
  })
  .filter('nanoToDate',function(){
    return function(ts) {
      return moment.unix(ts/1000000000).format("MM/DD/YYYY");
    }
  });

