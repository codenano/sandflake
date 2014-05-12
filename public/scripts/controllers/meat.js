'use strict';
angular.module('sandflake.meat', []).
  controller('meat', function ($rootScope, $scope, $location, $http, $routeParams){
     $scope.id = $routeParams.id;
     $scope.init = function(){
        console.log('load start:'+$scope.section);
        $rootScope.start = false;
        $rootScope.loading();
        $('.panel').css({ transform: 'rotate(0deg)'});
				};
      $scope.sendMeat = function(e){
        $rootScope.socket.send(JSON.stringify({type: 'meat', room: 'main', msg: $('#meatmsg').val(), user: $rootScope.uname}));
        $('#meatmsg').val('');
        };
     $scope.intervalLoad = setInterval(function(){
       if ($rootScope.state === 'start') {
          clearInterval($scope.intervalLoad);
          if ($rootScope.uname !== 'alien')
             $scope.init();
          else
             $scope.$apply(function(){
               $location.path("/");
             });
          }
       },100);
  });