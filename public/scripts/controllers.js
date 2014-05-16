'use strict';

angular.module('sandflake.controllers', [
   'sandflake.root',
   'sandflake.meat',
   'sandflake.profile'
   ]).
  controller('sandflake', function($rootScope, $scope, $http, $location, auth){
    $scope.homeLink = document.getElementById('logoapp');
    $rootScope.menuList = document.getElementById('menu_list');
    $scope.load = document.getElementById('load');
    $scope.loadCont = document.getElementById('loadCont');
    $rootScope.heartbeats = 0;
    $scope.currentLink = $scope.homeLink;
    $scope.$rota = $('#load');
    $scope.degree = 0;
    $scope.timer;
    $scope.redraw = function()
       {
       $('#meatList').css({ height: window.innerHeight+'px'});
       $('#meatMsgs').css({ height: window.innerHeight-355+'px'});
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
    $scope.rotate = function() {
        $scope.$rota.css({ transform: 'rotate(' + $scope.degree + 'deg)'});
        // timeout increase degrees:
        $scope.timer = setTimeout(function() {
            ++$scope.degree;
            $scope.rotate(); // loop it
        },30);
      };
    $rootScope.loading = function(){
      if ($rootScope.start) {
         $rootScope.start = false;
         $('.container-app').hide();
         //$rootScope.menuList.style.display = 'none';
         //$scope.homeLink.style.display = 'none';
         $scope.loadCont.style.display = 'block';
         $scope.rotate();    // run it!
         }
      else {
         clearTimeout($scope.timer);
         $('.container-app').show();
         $rootScope.start = true;
         //$rootScope.menuList.style.display = 'block';
         //$scope.homeLink.style.display = 'block';
         $scope.loadCont.style.display = 'none';
         }
    };
    $scope.homeLink.addEventListener('click', function(){
      $scope.currentLink.className = '';
      });
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
                 //$('body').addClass('hiddenOverflow');
                 $('#subnav').addClass('in');
                 $('#meatList').addClass('animated bounceInRight');
                 }
              else {
                   $('#meatList').removeClass('animated bounceInRight');
                   $('#subnav').removeClass('in');
/*                   $rootScope.socket.send(JSON.stringify({
                     room: 'main',
                     type: 'leave'
                   }));*/
                   //$('body').removeClass('hiddenOverflow');
                   }
       });
    $('#meatlist').on('shown.bs.dropdown', function () {
      $('#meatList').css({ height: window.innerHeight});
    });
    $('#meatlist').on('hide.bs.dropdown', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    });
    $('#logoapp').on('click', function(){
        $scope.$apply(function(){
          $location.path("/");
        });
      });
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
      var log = {
        app: $rootScope.app,
        type: 'start'
        };
    $rootScope.socket.send(JSON.stringify(log));
      setInterval(function(){
      var log = {
        app: $rootScope.app,
        type: 'ping'
        };
      $rootScope.socket.send(JSON.stringify(log));
      },3000);
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
               case 'start':
                      $rootScope.uname = data.uname;
                      console.log(data.uname);
                      $rootScope.menuItems = data.menu;
                      $rootScope.sid = data.sid;
                      var loginfo = document.getElementById('loginfo');
                      var logoapp = document.getElementById('logoapp');
                      var menuList = document.getElementById('menu_list');
                      var loggedInfo = document.getElementById('loggedInfo');
                      var loggedBar = document.getElementById('loggedBar');
                      var ml = document.getElementById('meatlaunch');
                      if ($rootScope.uname !== 'alien') {
                          $rootScope.socket.send(JSON.stringify({
                            room: 'main',
                            type: 'join'
                          }));
                          //$(loggedInfo).empty();
                          $(ml).show();
                          $(loggedBar).empty();
                           $(loggedBar).append('<i class="fa fa-power-off"></i>');
                          $(loggedInfo).append('<li role="presentation"><a role="menuitem"><i class="fa fa-sign-out"></i> Exit</a><li>');
                          $(loggedInfo).on('click', function(){
                            auth.logout();
                            });
                          $(loginfo).on('shown.bs.dropdown', function () {
                            $(logoapp).addClass('hidden');
                            $(menuList).addClass('hidden');                            
                          });  
                          $(loginfo).on('hidden.bs.dropdown', function () {
                            $(logoapp).removeClass('hidden');
                            $(menuList).removeClass('hidden');                           
                          });  
                         }
                      else {
                          $(ml).hide();
                          $(loggedBar).empty().hide();
                         }
                      $rootScope.loadMenu();
                      $rootScope.state = 'start';
               break;
               case 'pong':
                    $rootScope.heartbeats++;
               break;
               case 'sign_in_fail':
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
                     //$scope.singin_pssw.parentNode.childNodes[1].innerHTML = 'Contraseña';
                     $scope.singin_pssw.parentNode.className = 'form-group';
                     $scope.user_signin.disabled = true;
                     $rootScope.loading();
               break;
               case 'sign_in_ok':
                     if (data.sid === $rootScope.sid)
                        auth.login(data.response);
               break;
               case 'twt_up':
                     console.log(data);
               break;
               case 'room:reject':
                     var log = data.response;
                     $('#meatList').empty();
                     $('#meatList').append('<p style="color:red;">You have a client conected</p>');
               break;
               case 'room:read':
                     console.log(data.response);
                     $('#meatList').empty();
                     _.each(data.response, function(item){
                      if (item!=$rootScope.uname) {
                       $('#meatList').append('<li class="meatItem" role="presentation"><a role="menuitem"><img src="images/icons/icon-16.png" />'+item+'</a></li>');
                       $('.meatItem').last().on('click', function(e){
                        $scope.$apply(function(){
                           var monoid = [$rootScope.uname, item].sort();
                           var log = encodeURI(btoa(monoid[0]+':'+monoid[1]));
                           if (window.innerWidth<768) {
                              $('#subnav').removeClass('in');
                              $rootScope.meatLaunch.turnOff();
                            }
                           $location.path('/meat/'+log);
                           //$('#myTabContent').find('#home').html('pupiloo');
                        });
                       });
                       }
                     });
               break;
               case 'meat':
                     console.log($location.path());
                     $('#meatMsgs').append('<li class="list-group-item">'+data.user+':'+data.msg+'</li>');
                     $('#meatMsgs').scrollTop($('#meatMsgs').prop('scrollHeight'));
               break;
               case 'sign_out':
                     if (data.uname === $rootScope.uname)
                        auth.logout();
               break;
               case 'sign_up_fail':
                     var panel = document.getElementById('signupPanelBody');
                     var div = document.createElement('div');
                     var btn = document.createElement('button');
                     var msg = document.createElement('p');
                     div.className = 'alert alert-danger alert-dismissable';
                     btn.type = 'button';
                     btn.className = 'close';
                     btn.dataset.dismiss = 'alert';
                     btn.innerHTML = '&times;';
                     msg.innerHTML = data.response.detail;
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
               case 'sign_up_ok':
                  if (data.sid === $rootScope.sid)
                    auth.login(data.response);
               break;
               case 'join':
                 if (data.sid === $rootScope.sid)
                      window.location.href = "/meat/"+data.room;
               break;
               case 'profile_fail':
                  console.log(data.response);
               break;
               case 'profile_data':
                  console.log(data.response);
                  $scope.pemail = document.getElementById('pemail');
                  $scope.pname = document.getElementById('pname');
                  $scope.lname = document.getElementById('plastname');
                  $scope.uname = document.getElementById('puname');
                  $scope.dbirth = document.getElementById('dbirth');
                  $scope.pic = document.getElementById('pic');
                  if ($scope.pemail.value === '')
                     $scope.pemail.value = data.response.mail;
                  $scope.pname.value = data.response.pname;
                  $scope.lname.value = data.response.lname;
                  $scope.uname.value = data.response.uname;
                  $scope.dbirth.value = data.response.dbirth;
                  if ($scope.pic.src === '')
                     $scope.pic.src = data.response.pic;
                  console.log($scope.uname.value);
               break;
               }
              }
          };
    });