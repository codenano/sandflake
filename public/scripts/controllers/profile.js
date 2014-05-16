'use strict';
angular.module('sandflake.profile', []).
  controller('profile', function ($rootScope, $scope, $location, $http, $routeParams){
     $scope.module = $routeParams.module;
     $scope.section = $routeParams.section;
     $rootScope.start = true;
     $rootScope.loading();
     $scope.updateProfile = function(e){
        //$rootScope.start = false;
        $rootScope.start = false;
        $rootScope.loading();
        $('.panel').addClass('animated bounceInDown');
        $rootScope.socket.send(JSON.stringify({
          type: 'profile:set',
          us: document.getElementById('pemail').value,
          uname: document.getElementById('puname').value,
          pname: document.getElementById('pname').value,
          lname: document.getElementById('plastname').value,
          dbirth: document.getElementById('dbirth').value
          }));
     }
     $scope.init = function(){
        /*console.log('load profile:'+$rootScope.uname);
        $rootScope.start = false;
        $rootScope.loading();
        $('.panel').css({ transform: 'rotate(0deg)'});*/
        //$scope.appPanel = document.getElementById('appPanelBody');
        $('#editProfilePic').on('show.bs.modal', function (e) {
          $("body").css('overflow', 'hidden');
        });
        $('#editProfilePic').on('hidden.bs.modal', function (e) {
         $("body").css('overflow', 'auto');
        });
        //$('.container-app').show();
        $rootScope.start = false;
        $rootScope.loading();
        $('.panel').addClass('animated bounceInDown');        
				};
     $scope.intervalLoad = setInterval(function(){
       if ($rootScope.state === 'start') {
          console.log($rootScope.uname);
          clearInterval($scope.intervalLoad);
          if ($rootScope.uname !== 'alien') {
             $rootScope.socket.send(JSON.stringify({
               type: 'profile:get',
               uname: $rootScope.uname
               }));            
             $scope.init();
             }
          else
             $scope.$apply(function(){
               $location.path("/");
             });
          }
       },100);
  });