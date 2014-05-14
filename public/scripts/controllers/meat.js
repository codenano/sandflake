'use strict';
angular.module('sandflake.meat', []).
  controller('meat', function ($rootScope, $scope, $location, $http, $routeParams){
     $scope.id = $routeParams.id;
     $scope.room = atob($scope.id);
     $rootScope.loading();
     $scope.init = function(){
        console.log('load start:'+atob($scope.id));
        $('#meatMsgs').css({height: (window.innerHeight-370).toString()+'px', overflowY: 'scroll'});
        $('#meatmsg').focus(function(){
          $(this).css({height: '80px'});
        });
        $('#meatmsg').blur(function(){
          $(this).css({height: '50px'});
        });
        $('#meatmsg').keypress(function(e){
          console.log(e);
          if ((e.charCode === 13)||(e.keyCode === 13)) {
             $scope.sendMeat();
             return false;
           }
        });
        $rootScope.start = false;
        $rootScope.loading();                        
        $('.panel').addClass('animated bounceInRight');
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