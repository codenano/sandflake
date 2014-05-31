'use strict';
angular.module('sandflake.profile', []).
  controller('profile', ['$rootScope', '$scope', '$location', '$http', '$routeParams', function ($rootScope, $scope, $location, $http, $routeParams){
     $scope.module = $routeParams.module;
     $scope.section = $routeParams.section;
     $rootScope.start = true;
     $rootScope.loading();
     $scope.updateProfile = function(e){
       if ((parseInt(document.getElementById('dayBirthday').value)!==0)&&(parseInt(document.getElementById('monthBirthday').value)!==0)&&(parseInt(document.getElementById('yearBirthday').value)!==0)) {
        $rootScope.loading();
        $('#dayBirthday').parent().removeClass('has-error').find('.control-label').text('Day');
        $('#monthBirthday').parent().removeClass('has-error').find('.control-label').text('Month');
        $('#yearBirthday').parent().removeClass('has-error').find('.control-label').text('Year');
        document.getElementById('dbirth').value = $('#dayBirthday').val()+'/'+$('#monthBirthday').val()+'/'+$('#yearBirthday').val();
        $rootScope.socket.send(JSON.stringify({
          type: 'profile:set',
          us: document.getElementById('pemail').value,
          uname: document.getElementById('puname').value,
          pname: document.getElementById('pname').value,
          lname: document.getElementById('plastname').value,
          dbirth: document.getElementById('dbirth').value
          }));
       }
       else
          {
          if (parseInt(document.getElementById('dayBirthday').value)===0)
             $('#dayBirthday').parent().addClass('has-error').find('.control-label').text('Select a day');
          else
             $('#dayBirthday').parent().removeClass('has-error').find('.control-label').text('Day');
          if (parseInt(document.getElementById('monthBirthday').value)===0)
             $('#monthBirthday').parent().addClass('has-error').find('.control-label').text('Select a month');
          else
             $('#monthBirthday').parent().removeClass('has-error').find('.control-label').text('Month');
          if (parseInt(document.getElementById('yearBirthday').value)===0)
             $('#yearBirthday').parent().addClass('has-error').find('.control-label').text('Select a year');
          else
             $('#yearBirthday').parent().removeClass('has-error').find('.control-label').text('Year');
          }
     }
     $scope.init = function(){
        $rootScope.socket.send(JSON.stringify({
          type: 'profile:get',
          uname: $rootScope.uname
          }));
        $('#editProfilePic').on('show.bs.modal', function (e) {
          $("body").css('overflow', 'hidden');
        });
        $('#editProfilePic').on('hidden.bs.modal', function (e) {
         $("body").css('overflow', 'auto');
        });
        $('#launchProfileEdit').on('click', function(e) {
         $('#profileUpload').click();
        })
        $('#profileUpload').on('change', function(e){
            var file = e.originalEvent.target.files[0],
                reader = new FileReader();
            reader.onload = function(evt){
              var typeResult = evt.target.result.split(';')[0].split(':')[1].split('/');
              if (typeResult[0]==='image') {
                $rootScope.loading();
                $rootScope.socket.send(JSON.stringify({
                  type: 'profile:upload',
                  uname: $rootScope.umail,
                  image: evt.target.result,
                  imageType: typeResult[1]
                  }));
                 }
              else
                console.log('err');
            };
            reader.readAsDataURL(file);
        });
        $('.panel').addClass('animated bounceInDown');
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