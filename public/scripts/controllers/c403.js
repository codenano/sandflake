'use strict';
angular.module('sandflake.403', []).
  controller('403', ['$rootScope', '$scope', '$location', '$http', '$routeParams', function ($rootScope, $scope, $location, $http, $routeParams){
  $rootScope.start = false;
  $rootScope.loading();
  console.log('controlling');
  }]);