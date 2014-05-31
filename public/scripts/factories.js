'use strict';

angular.module('sandflake.factories', []).
  factory('auth', ['$rootScope', '$http', '$location', '$window',function($rootScope, $http, $location, $window) {
    var login = function (uname) {
          $rootScope.isAuthenticated = true;
          $rootScope.uname = uname;
          //console.log($rootScope.heartbeats+':'+$rootScope.state+'@'+uname);
          window.location.href = '/';
       };
    var logout = function() {
       $rootScope.socket.send(JSON.stringify({
         type: 'signout',
         uname: $rootScope.uname
         }));
       $rootScope.isAuthenticated = false;
       $rootScope.uname = 'alien';
       window.location.href = '/';
       };
       return {
         login: login,
         logout: logout
       };
  }]);