'use strict';

angular.module('sandflake', [
  'ngRoute',
  'sandflake.factories',
  'sandflake.controllers',
  'sandflake.directives'
]).
run(function ($rootScope, $http, $location) {
  $rootScope.state = 'loading';
  $rootScope.included = 'loading';
  var host = window.location.hostname;
  var port = window.location.port;
  console.log(host);
  if (port === 80)
     $rootScope.socket = new WebSocket('ws://' + host);
  else
     $rootScope.socket = new WebSocket('ws://' + host+ ':'+ port);
}).
config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      controller: 'root',
      templateUrl: 'partials/root.html'
    })
    .when('/signup', {
      controller: 'root',
      templateUrl: 'partials/signup.html'
    })
    .when('/login', {
      controller: 'root',
      templateUrl: 'partials/signin.html'
    })
    .when('/profile', {
      controller: 'profile',
      templateUrl: 'partials/profile.html'
    })
    .when('/meat/:id', {
      controller: 'meat',
      templateUrl: 'partials/meat.html'
    })
    .when('/signout', {
      controller: 'root',
      templateUrl: 'partials/root.html'
    })
    .otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
});