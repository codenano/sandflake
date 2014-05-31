'use strict';
angular.module('sandflake.signup', []).
  controller('signup', ['$rootScope', '$scope', '$location', '$http', function ($rootScope, $scope, $location, $http){
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
     $scope.signUp = function() {
        $rootScope.loading();
        $rootScope.socket.send(JSON.stringify({
            us: $scope.singup_email.value,
            pw: $scope.singup_pssw.value,
            type: 'signup'
            }));
        };
     $scope.keyMail = function() {
         $scope.singup_email_v = false;
         $scope.singup_email = document.getElementById('singup_email');
         $scope.user_signup = document.getElementById('user_signup');
         $scope.validateEmail($scope.singup_email.value.toString(), function(res){
           if (res)
              {
              //$scope.singup_email.parentNode.childNodes[1].innerHTML = '';
              $scope.singup_email.parentNode.className = 'form-group has-success';
              $scope.singup_email_v = true;
              }
              else
                 {
                 //$scope.singup_email.parentNode.childNodes[1].innerHTML = '';
                 $scope.singup_email.parentNode.className = 'form-group has-error';
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
     $scope.keyPssw = function() {
         $scope.singup_pssw_v = false;
         $scope.singup_pssw = document.getElementById('singup_pssw');
         $scope.user_signup = document.getElementById('user_signup');
         $scope.validatePssw($scope.singup_pssw.value.toString(), function(res){
           if (res)
              {
              //$scope.singup_pssw.parentNode.childNodes[1].innerHTML = '';
              $scope.singup_pssw.parentNode.className = 'form-group has-success';
              $scope.singup_pssw_v = true;
              }
              else
                 {
                 //$scope.singup_pssw.parentNode.childNodes[1].innerHTML = '';
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
        //document.getElementById('singup_email').focus();
        $scope.singup_email_v = false;
        $scope.singup_pssw_v = false;
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