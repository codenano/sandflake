'use strict';
angular.module('sandflake.meat', []).
  controller('meat', ['$rootScope', '$scope', '$location', '$http', '$routeParams', '$timeout', function ($rootScope, $scope, $location, $http, $routeParams, $timeout){
     $rootScope.start = true;
     $rootScope.loading();
     $scope.roomId = $routeParams.id;
     $scope.idArray  = atob(decodeURI($scope.roomId)).split(':');
     if ($scope.idArray[0]===$rootScope.uname)
        $scope.room = $scope.idArray[1];
     else
        $scope.room = $scope.idArray[0];
        $scope.$on('$routeChangeStart', function(event, current, previous, rejection) {
        $('.meatItem').each(function(){
          $(this).removeClass('active');
        });
        $rootScope.socket.send(JSON.stringify({
          type: 'room:leave',
          room: $scope.roomId
          }));
     });
     $scope.init = function(){
        $rootScope.socket.send(JSON.stringify({
                type: 'room:join',
                room: $scope.roomId
        }));
        $('#meatMsgs').css({height: window.innerHeight-170+'px', overflowY: 'scroll'});
        if ($('#subnav').hasClass('in'))
           $('.panel').css({marginRight: '11.3em'});
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

        $rootScope.loading();
        $('.panel').addClass('animated bounceInRight');
        $timeout(function(){
          $('#meatmsg').focus();
        },1000);
				};
      $scope.meatPress = function(e){
        if ((e.charCode === 13)||(e.keyCode === 13)) {
           e.preventDefault();
           e.stopImmediatePropagation();
           $scope.sendMeat();
           return false;
           }
        };
      $scope.sendMeat = function(e){
        if ($('#meatmsg').text()!=='') {
           var meatMsg = $('#meatmsg').text();
           $('#meatmsg').text('');
           $rootScope.socket.send(JSON.stringify({type: 'room:meat', room: $scope.roomId, msg: meatMsg, user: $rootScope.uname}));
           
           
        }
        
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