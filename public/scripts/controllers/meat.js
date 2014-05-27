'use strict';
angular.module('sandflake.meat', []).
  controller('meat', ['$rootScope', '$scope', '$location', '$http', '$routeParams', '$timeout', function ($rootScope, $scope, $location, $http, $routeParams, $timeout){
     $rootScope.start = true;
     $rootScope.loading();
     $scope.roomId = $routeParams.id;
     $scope.idArray  = atob(decodeURI($scope.roomId)).split(':');
     if ($scope.idArray[0]===$rootScope.umail)
        $scope.room = $scope.idArray[1];
     else
        $scope.room = $scope.idArray[0];
     $scope.$on('$routeChangeStart', function(event, current, previous, rejection) {
      $('body, html').css({overflowY:'auto'});
        var log = {
        room: $scope.roomId,
        type: 'leave'
        };
      $rootScope.socket.send(JSON.stringify(log));
     });
     $scope.init = function(){
        $rootScope.socket.send(JSON.stringify({
                room: $scope.roomId,
                type: 'join'
        }));
        $('body, html').css({overflowY:'hidden'});
        $('#meatMsgs').css({height: (window.innerHeight-420).toString()+'px', overflowY: 'scroll'});
/*        $('#meatmsg').focus(function(){
          $(this).css({height: '80px'});
        });*/
        /*$('#meatmsg').on('keydown', function(e){
            var that = $(this);
            if (that.scrollTop()) {
                $(this).height(function(i,h){
                    return h + 10;
                });
            }
        });*/
/*        $('#meatmsg').blur(function(){
          $(this).css({height: '50px'});
        });*/
        $('#meatmsg').keypress(function(e){
          if ((e.charCode === 13)||(e.keyCode === 13)) {
             $scope.sendMeat();
             return false;
           }
        });
        $rootScope.loading();
        $('.panel').addClass('animated bounceInRight');
        $timeout(function(){
          $('#meatmsg').focus();
        },1000);
				};
      $scope.sendMeat = function(e){
        if ($('#meatmsg').text()!=='')
          $rootScope.socket.send(JSON.stringify({type: 'meat', room: $scope.roomId, msg: $('#meatmsg').text(), user: $rootScope.umail}));
        $('#meatmsg').text('');
        };
     $scope.intervalLoad = setInterval(function(){
       if ($rootScope.state === 'start') {
          clearInterval($scope.intervalLoad);
          if ($rootScope.uname !== 'alien') {
             $scope.init();
             }
          else
             $scope.$apply(function(){
               $location.path("/");
             });
          }
       },100);
  }]);