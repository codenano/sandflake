'use strict';
angular.module('sandflake.root', []).
  controller('root', ['$rootScope', '$scope', '$location', '$http', '$routeParams', function ($rootScope, $scope, $location, $http, $routeParams){
     $rootScope.start = true;
     $rootScope.loading();
     $scope.appNamed = $routeParams.appNamed;
     $scope.init = function(){
        var dayMap = new CalHeatMap();
        var dt = new Date();
        $(".tabPanel").each(function(){
             $(this).mousewheel(function(event, delta) {
             this.scrollLeft -= (delta * 30);
             event.preventDefault();
          });
        });
        //dt.setDate(dt.getDate()-6);
        dayMap.init({
           itemSelector: "#dayMap",
           domain: "day",
           subDomain: "hour",
           rowLimit: 1,
           domainGutter: 0,
           start: Date.now(),
           cellSize: 30,
           cellPadding: 5,
           range: 1,
           verticalOrientation: true,
           displayLegend: false,
           label: {
            position: "left",
            offset: {
              x: 20,
              y: 12
            },
            width: 70
           },
           legend: [1, 2, 3, 4],
           legendColors: ["#ecf5e2", "#232181"],
           onClick: function(date, nb) {
             console.log(date);
             /*$("#onClick-placeholder").html("You just clicked <br/>on <b>" +
                date + "</b> <br/>with <b>" +
                (nb === null ? "unknown" : nb) + "</b> items"
             );*/
           }
        });
        var monthMap = new CalHeatMap();
        monthMap.init({
           itemSelector: "#monthMap",
           domain: "month",
           subDomain: "x_day",
           subDomainTextFormat: "%d",
           highlight: ["now", Date.now()],
           domainGutter: 10,
           cellSize: 30,
           cellPadding: 8,
           range: 12,
           displayLegend: false,
           onClick: function(date, nb) {
             console.log(date);
             /*$("#onClick-placeholder").html("You just clicked <br/>on <b>" +
                date + "</b> <br/>with <b>" +
                (nb === null ? "unknown" : nb) + "</b> items"
             );*/
             monthMap.highlight(date);
             dayMap.destroy(function(){
                dayMap = new CalHeatMap();
                dayMap.init({
                   itemSelector: "#dayMap",
                   domain: "day",
                   subDomain: "hour",
                   rowLimit: 1,
                   domainGutter: 0,
                   start: new Date(date),
                   cellSize: 30,
                   cellPadding: 5,
                   range: 1,
                   verticalOrientation: true,
                   displayLegend: false,
                   label: {
                    position: "left",
                    offset: {
                      x: 20,
                      y: 12
                    },
                    width: 60
                   },
                   legend: [1, 2, 3, 4],
                   legendColors: ["#ecf5e2", "#232181"],
                   onClick: function(date, nb) {
                     console.log(date);
                     /*$("#onClick-placeholder").html("You just clicked <br/>on <b>" +
                        date + "</b> <br/>with <b>" +
                        (nb === null ? "unknown" : nb) + "</b> items"
                     );*/
                   }
                });
             });
           }
        });
        var yearMap = new CalHeatMap();
        yearMap.init({
        itemSelector: "#yearMap",
        domain: "year",
        subDomain: "month",
        subDomainTextFormat: "%m",
        range: 12,
        cellSize: 30,
        tooltip: true,
           legendVerticalPosition: "top",
        legendCellSize: 5
        });
        $rootScope.loading();
        $('.panel').addClass('animated bounceInDown');
				};
     $scope.intervalLoad = setInterval(function(){
       if ($rootScope.state === 'start') {
          clearInterval($scope.intervalLoad);
          $scope.init();
          }
       },100);
  }]);