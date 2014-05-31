'use strict';

angular.module('sandflake', [
  'ngRoute',
  'sandflake.factories',
  'sandflake.controllers',
  'sandflake.directives'
]).
run(['$rootScope', '$http', '$location', function ($rootScope, $http, $location) {
  $rootScope.state = 'loading';
  $rootScope.included = 'loading';
  var host = window.location.hostname;
  var port = window.location.port;
  if (port === 80)
     $rootScope.socket = new WebSocket('ws://' + host);
  else
     $rootScope.socket = new WebSocket('ws://' + host+':'+port);
}]).
config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      controller: 'app',
      templateUrl: 'partials/app.html'
    })
    .when('/signup', {
      controller: 'signup',
      templateUrl: 'partials/signup.html'
    })
    .when('/login', {
      controller: 'login',
      templateUrl: 'partials/login.html'
    })
    .when('/profile', {
      controller: 'profile',
      templateUrl: 'partials/profile.html'
    })
    .when('/meat/:id', {
      controller: 'meat',
      templateUrl: 'partials/meat.html'
    })
    .when('/app/:appNamed', {
      controller: 'app',
      templateUrl: 'partials/app.html'
    })
    .otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
}]);