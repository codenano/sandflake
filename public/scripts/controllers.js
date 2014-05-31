'use strict';

angular.module('sandflake.controllers', [
   'sandflake.app',
   'sandflake.signup',
   'sandflake.login',
   'sandflake.meat',
   'sandflake.profile'
   ]).
  controller('sandflake', ['$rootScope', '$scope', '$http', '$location', 'auth' ,function($rootScope, $scope, $http, $location, auth){
    $rootScope.menuList = document.getElementById('menuList');
    $scope.loadCont = document.getElementById('loadCont');
    $rootScope.heartbeats = 0;
    $scope.currentLink = $scope.homeLink;
    $scope.$rota = $('#load');
    $scope.timer;
    $scope.redraw = function()
       {
       $('#meatList').css({ height: window.innerHeight+'px'});
       $('#meatMsgs').css({ height: window.innerHeight-420+'px'});
       $('#upnav').css({width:window.innerWidth+'px'});
       $('#subnav').css({width:window.innerWidth+'px'});
       $('#meatlaunch').css({position:'absolute'});
       };
    $scope.debouncedRedraw = _.debounce($scope.redraw, 100);
    $(window).on('resize', $scope.debouncedRedraw);
       $('#subnavCollapse').css('display', 'none');
       $('#subnavCollapse').on('click', function(e){
       e.preventDefault();
       e.stopImmediatePropagation();
    });
    $scope.escapeHtml = function (text) {
      if (text) {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }
    };
    $scope.playSound = function () {
              if ($scope.drop) {
                  if($scope.drop.paused) $scope.drop.play();
                  else $scope.drop.pause();
              } else {
                  $scope.drop = new Audio('sound/drop.mp3');
                  $scope.drop.play();
              }
    };
    $scope.timeConverter = function(unixtime){
        var newDate = new Date();
        newDate.setTime(unixtime);
        var dateString = newDate.toUTCString().split(' GMT')[0];
        return dateString;
        };
    $scope.rotate = function() {
        // Interval increase degrees:
        $scope.degree = 0;
        $scope.timer = setTimeout(function() {
            $scope.degree++;
            $scope.$rota.css({ transform: 'rotate(' + $scope.degree + 'deg)'});
        },100);
      };
    $rootScope.loading = function(){
      if ($rootScope.start) {
         $rootScope.start = false;
         $('.container-app').hide();
         $scope.loadCont.style.display = 'block';
         $scope.rotate();
         }
      else {
         clearInterval($scope.timer);
         $('.container-app').show();
         $rootScope.start = true;
         $scope.loadCont.style.display = 'none';
         }
    };
    $rootScope.meatLaunch = new Kudos({
         el : '#meatlaunch',
         duration : 800,
         status : {
           alpha : 'fa fa-group',
           beta : 'fa fa-dot-circle-o',
           gamma : 'fa fa-bolt'
         }
       }, function(res){
              $('#meatlist').find('.dropdown-toggle').dropdown('toggle');
              if (res === 'on') {
                 $('#meatList').css({ height: window.innerHeight});
                 $('#subnav').addClass('in');
                 $('#meatList').addClass('animated bounceInRight');
                 }
              else {
                   $('#meatList').removeClass('animated bounceInRight');
                   $('#subnav').removeClass('in');
                   }
       });
    $('#meatlist').on('hide.bs.dropdown', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    });
    $scope.go = function ( path ) {
      $location.path( path );
    };
    $rootScope.loadMenu = function(){
      if ($rootScope.state === 'loading')
        _.each($rootScope.menuItems, function(value){
             var li = document.createElement('li');
             var link = document.createElement('a');
             var ic = document.createElement('i');
             if (value.url === $location.path()) {
                li.className = 'active';
                $scope.currentLink = li;
                }
             link.innerHTML = ' '+value.name;
             li.dataset.url = value.url;
             ic.className = 'fa fa-'+value.icon;
             link.addEventListener('click', function(){
                   var links = this.parentNode.parentNode.childNodes;
                   for(var i=0; i<links.length; i++) {
                      if (links[i] !== this.parentNode)
                         links[i].className = '';
                      else {
                         links[i].className = 'active';
                         $scope.currentLink = this.parentNode;
                         }
                      }
                   $scope.$apply(function(){
                     $location.path(value.url);
                   });
                  }, false);
         link.insertBefore(ic, link.firstChild);
         li.appendChild(link);
         $rootScope.menuList.appendChild(li);
         });
       else {
          var links = $rootScope.menuList.childNodes;
          for(var i=0; i<links.length; i++) {
             if (links[i].dataset.url!==$location.path())
                links[i].className = '';
             else
                links[i].className = 'active';
             }
          }
    };
    $rootScope.socket.onerror = function (wss) {
     console.log('err');
    };
    $rootScope.socket.onclose = function (wss) {
      $scope.loadCont.style.display = 'block';
      setTimeout(function(){
        window.location.href = '/';
      }, 2000);

    };
    $rootScope.socket.onopen = function (wss) {
      $rootScope.socket.send(JSON.stringify({
          app: $rootScope.app,
          type: 'app:start'
          }));
      setInterval(function(){
         $rootScope.socket.send(JSON.stringify({
           app: $rootScope.app,
           type: 'ping'
           }));
         },5000);
      };
    $rootScope.$on('$routeChangeStart', function(event, current, previous, rejection) {
      $rootScope.loadMenu();
      $rootScope.included = 'loading';
      });
    $rootScope.$on('$includeContentLoaded', function(event) {
      $rootScope.included = 'start';
      });
    $rootScope.socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
          if ((data)&&(data.type)){
            switch(data.type) {
               case 'app:start':
                    $rootScope.uname = data.uname;
                    console.log('%c'+$rootScope.uname, 'background: #222; color: #bada55');
                    $rootScope.menuItems = data.menu;
                    $rootScope.sid = data.sid;
                    var authInfo = document.getElementById('authInfo');
                    var authBar = document.getElementById('authBar');
                    var ml = document.getElementById('meatlaunch');
                    if ($rootScope.uname !== 'alien') {
                        $rootScope.umail = data.mail;
                        $rootScope.upic = data.pic;
                        $rootScope.socket.send(JSON.stringify({
                          type: 'room:join',
                          room: 'main'
                        }));
                        $(ml).show();
                        $(authBar).empty();
                        $(authBar).append('<i class="fa fa-power-off"></i>');
                        $(authInfo).append('<li role="presentation"><a id="logout" role="menuitem"><i class="fa fa-sign-out"></i> Exit</a><li>');
                          $('#logout').on('click', function(){
                            auth.logout();
                            });
                         }
                      else {
                          $(ml).hide();
                          $(authBar).empty().hide();
                         }
                      $rootScope.loadMenu();
                      $rootScope.state = 'start';
               break;
               case 'pong':
                     $rootScope.heartbeats++;
               break;
               case 'signout':
                     if (data.uname === $rootScope.uname)
                       auth.logout();
               break;
               case 'signup:data':
                     if (data.sid === $rootScope.sid)
                       auth.login(data.response);
               break;
               case 'signin:data':
                     if (data.sid === $rootScope.sid)
                       auth.login(data.response);
               break;
               case 'signin:fail':
                     var panel = document.getElementById('signinPanelBody');
                     var div = document.createElement('div');
                     var btn = document.createElement('button');
                     var msg = document.createElement('p');
                     div.className = 'alert alert-danger alert-dismissable';
                     btn.type = 'button';
                     btn.className = 'close';
                     btn.dataset.dismiss = 'alert';
                     btn.innerHTML = '&times;';
                     msg.innerHTML = data.response.toString();
                     div.appendChild(btn);
                     div.appendChild(msg);
                     panel.insertBefore(div, panel.firstChild);
                     $scope.singin_pssw = document.getElementById('singin_pssw');
                     $scope.user_signin = document.getElementById('user_signin');
                     $scope.singin_pssw.value = '';
                     $scope.singin_pssw.parentNode.className = 'form-group';
                     $scope.user_signin.disabled = true;
                     $rootScope.loading();
               break;
               case 'signup:fail':
                     var panel = document.getElementById('signupPanelBody');
                     var div = document.createElement('div');
                     var btn = document.createElement('button');
                     var msg = document.createElement('p');
                     div.className = 'alert alert-danger alert-dismissable';
                     btn.type = 'button';
                     btn.className = 'close';
                     btn.dataset.dismiss = 'alert';
                     btn.innerHTML = '&times;';
                     msg.innerHTML = data.response;
                     div.appendChild(btn);
                     div.appendChild(msg);
                     panel.insertBefore(div, panel.firstChild);
                     $scope.singup_email = document.getElementById('singup_email');
                     $scope.singup_email.parentNode.childNodes[1].innerHTML = 'Email no valido';
                     $scope.singup_email.parentNode.className = 'form-group has-error';
                     $scope.singup_pssw = document.getElementById('singup_pssw');
                     $scope.user_signup = document.getElementById('user_signup');
                     $scope.singup_pssw.value = '';
                     $scope.singup_pssw.parentNode.childNodes[1].innerHTML = 'Contraseña';
                     $scope.singup_pssw.parentNode.className = 'form-group';
                     $scope.user_signup.disabled = true;
                     $rootScope.loading();
               break;
               case 'profile:fail':
                  console.log(data.response);
               break;
               case 'profile:pic':
                  $scope.pic.src = data.response.pic+'?'+Date.now().toString();
                  $rootScope.loading();
               break;
               case 'profile:data':
                  $scope.pemail = document.getElementById('pemail');
                  $scope.pname = document.getElementById('pname');
                  $scope.lname = document.getElementById('plastname');
                  $scope.uname = document.getElementById('puname');
                  $scope.dbirth = document.getElementById('dbirth');
                  $scope.dayBirthday = document.getElementById('dayBirthday');
                  $scope.monthBirthday = document.getElementById('monthBirthday');
                  $scope.yearBirthday = document.getElementById('yearBirthday');
                  $scope.pic = document.getElementById('pic');
                  if ($scope.pemail.value === '')
                     $scope.pemail.value = data.response.umail;
                  $scope.pname.value = data.response.pname;
                  $scope.lname.value = data.response.lname;
                  $scope.uname.value = data.response.uname;
                  $scope.dbirth.value = data.response.dbirth;
                  if (data.response.dbirth!==0) {
                     $scope.dateArray = $scope.dbirth.value.split('/');
                     $scope.dayBirthday.value = $scope.dateArray[0];
                     $scope.monthBirthday.value = $scope.dateArray[1];
                     $scope.yearBirthday.value = $scope.dateArray[2];
                     }
                  if ($scope.pic.src === '')
                     $scope.pic.src = data.response.pic;
                  $rootScope.loading();
               break;
               case 'room:main':
                     $('#meatList').empty();
                     _.each(data.response, function(item){
                      if (item.umail!==$rootScope.uname) {
                       $('#meatList').append('<li class="meatItem" role="presentation"><a role="menuitem"><img src="'+
                          item.pic+'?'+Date.now().toString()+'" />'+
                          item.uname+'</a></li>');
                       $('.meatItem').last().on('click', function(e){
                          $(this).addClass('active');
                          $scope.$apply(function(){
                             var monoid = [$rootScope.uname, item.umail].sort();
                             var log = encodeURI(btoa(monoid[0]+':'+monoid[1]));
                             $location.path('/meat/'+log);
                          });
                       });
                       }
                     });
               break;
               case 'room:read':
                     _.each(data.response.messages, function(item){
                       var ust = item.msg.key.split('!');
                       var date = $scope.timeConverter(ust[0]);
                       if (item.msg.value.msg!=='')
                          $('#meatMsgs').append('<li class="list-group-item"><img src="'+
                          item.profile.pic+'" /><p class="text-justify hyphenate">'+
                          transform($scope.escapeHtml(item.msg.value.msg))+'</p><span class="timestamp">'+
                          item.profile.uname+' <i class="fa fa-paper-plane"></i> '+
                          date+'</span></li>');
                     });
                     $('#meatMsgs').scrollTop($('#meatMsgs').prop('scrollHeight'));
               break;
               case 'room:meat':
                     if (data.profile.umail!==$rootScope.uname)
                        $scope.playSound();
                     $('#meatMsgs').append('<li class="list-group-item"><img src="'+
                        data.profile.pic+'" /><p class="text-justify hyphenate">'+
                        transform($scope.escapeHtml(data.msg.msg))+'</p><span class="timestamp">'+
                        data.profile.uname+' <i class="fa fa-paper-plane"></i> '+
                        $scope.timeConverter(Date.now())+'</span></li>');
                     $('#meatMsgs').scrollTop($('#meatMsgs').prop('scrollHeight'));
               break;
               }
              }
          };
    }]);