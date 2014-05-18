'use strict';
angular.module('sandflake.app', []).
  controller('app', function ($rootScope, $scope, $location, $http, $routeParams){
     $rootScope.start = true;
     $rootScope.loading();
     $scope.appNamed = $routeParams.appNamed;
     $scope.init = function(){
        $rootScope.start = false;
        $rootScope.loading();
        $('.panel').addClass('animated bounceInDown');
				};
		
     $scope.intervalLoad = setInterval(function(){
       if ($rootScope.state === 'start') {
          clearInterval($scope.intervalLoad);
          $scope.init();
          }
       },100);
  });