'use strict';
angular.module('sandflake.login', []).
  controller('login', ['$rootScope', '$scope', '$location', function ($rootScope, $scope, $location){
     $rootScope.start = true;
     $rootScope.loading();
     $scope.validateEmail = function(email, callback) {
       var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
       callback(re.test(email));
       };
     $scope.validatePssw = function(pssw, callback) {
       callback((pssw.length >= 8));
       };
     $scope.validateUname = function(pssw, callback) {
       callback((pssw.length >= 3));
       };
     $scope.signIn = function() {
        $rootScope.loading();
        $rootScope.socket.send(JSON.stringify({
          type: 'signin',
          us: $scope.singin_email.value,
          pw: $scope.singin_pssw.value
          }));
        };
     $scope.keyMail = function() {
         $scope.singin_email_v = false;
         $scope.singin_email = document.getElementById('singin_email');
         $scope.user_signin = document.getElementById('user_signin');
         $scope.validateUname($scope.singin_email.value.toString(), function(res){
           if (res)
              {
              //$scope.singin_email.parentNode.childNodes[1].innerHTML = '';
              $scope.singin_email.parentNode.className = 'form-group has-success';
              $scope.singin_email_v = true;
              }
              else
                 {
                 //$scope.singin_email.parentNode.childNodes[1].innerHTML = '';
                 $scope.singin_email.parentNode.className = 'form-group has-error';
                 }
           if ($scope.singin_pssw_v && $scope.singin_email_v)
              {
              $scope.user_signin.disabled = false;
              }
              else
                 {
                 $scope.user_signin.disabled = true;
                 }
           });
        };
     $scope.keyPssw = function() {
         $scope.singin_pssw_v = false;
         $scope.singin_pssw = document.getElementById('singin_pssw');
         $scope.user_signin = document.getElementById('user_signin');
         $scope.validatePssw($scope.singin_pssw.value.toString(), function(res){
           if (res)
              {
              //$scope.singin_pssw.parentNode.childNodes[1].innerHTML = '';
              $scope.singin_pssw.parentNode.className = 'form-group has-success';
              $scope.singin_pssw_v = true;
              }
              else
                 {
                 //$scope.singin_pssw.parentNode.childNodes[1].innerHTML = '';
                 $scope.singin_pssw.parentNode.className = 'form-group has-error';
                 }
           if ($scope.singin_pssw_v && $scope.singin_email_v)
              {
              $scope.user_signin.disabled = false;
              }
              else
                 {
                 $scope.user_signin.disabled = true;
                 }
           });
        };
     $scope.newUser = function(){
           $location.path("/signup");
        };
     $scope.init = function(){
        //document.getElementById('singin_email').focus();
        $scope.singin_email_v = false;
        $scope.singin_pssw_v = false;
        $rootScope.loading();
        $('.panel').addClass('animated bounceInDown');
				};
     $scope.intervalLoad = setInterval(function(){
       if ($rootScope.state === 'start') {
          clearInterval($scope.intervalLoad);
          if ($rootScope.uname === 'alien')
             $scope.init();
          else
             $scope.$apply(function(){
               $location.path("/");
             });
          }
       },100);
    }]);