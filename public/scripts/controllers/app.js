'use strict';
angular.module('sandflake.app', []).
  controller('app', function ($rootScope, $scope, $location, $http, $routeParams){
     $scope.module = $routeParams.module;
     $scope.section = $routeParams.section;
     $scope.validatekeyMinLen = function(pssw, callback) {
       callback((pssw.length >= 8));
       };
     $scope.keyMinLen = function() {
         $scope.singup_pssw_v = false;
         $scope.singup_pssw = document.getElementById('singup_pssw');
         $scope.user_signup = document.getElementById('user_signup');
         $scope.validatePssw($scope.singup_pssw.value.toString(), function(res){
           if (res)
              {
              $scope.singup_pssw.parentNode.childNodes[1].innerHTML = 'Contraseña valida';
              $scope.singup_pssw.parentNode.className = 'form-group has-success';
              $scope.singup_pssw_v = true;
              }
              else
                 {
                 $scope.singup_pssw.parentNode.childNodes[1].innerHTML = 'Contraseña no valida';
                 $scope.singup_pssw.parentNode.className = 'form-group has-error';
                 }
           if ($scope.singup_pssw_v && $scope.singup_email_v)
              {
              $scope.user_signup.disabled = false;
              }
              else
                 {
                 $scope.user_signup.disabled = true;
                 }
           });
        };
     $scope.init = function(){
        console.log('load start:'+$scope.section);
        $rootScope.start = false;
        $rootScope.loading();
        $('.panel').css({ transform: 'rotate(0deg)'});
        switch ($scope.module) {
         case 'profile':
           $scope.appPanel = document.getElementById('appPanelBody');
           var log = {
             type: 'getProfile',
             uname: $rootScope.uname
             };
           $rootScope.loading();
           $rootScope.socket.send(JSON.stringify(log));
         break;
         };
				};
		
     $scope.intervalLoad = setInterval(function(){
       if ($rootScope.state === 'start') {
          console.log($rootScope.uname);
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