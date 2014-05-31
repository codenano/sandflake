'use strict';
angular.module('sandflake.app', []).
  controller('app', ['$rootScope', '$scope', '$location', '$http', '$routeParams', function ($rootScope, $scope, $location, $http, $routeParams){
     $rootScope.start = true;
     $rootScope.loading();
     $scope.appNamed = $routeParams.appNamed;
     $scope.init = function(){
        $rootScope.loading();
        $('.panel').addClass('animated bounceInDown');
				};
		
     $scope.intervalLoad = setInterval(function(){
       if ($rootScope.state === 'start') {
          clearInterval($scope.intervalLoad);
          if ($rootScope.uname !== 'alien') {
             $scope.init();
             }
          else
             $scope.$apply(function(){
               $location.path("/login");
             });
          }
       },100);
  }]);