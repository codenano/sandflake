'use strict';
module.exports = function(_, express, nconf, sessionStore) {
  
var Thread = require('./thread');
var thread = new Thread(sessionStore);
var mail = require('./mail');
var wss = require('ws').Server;
var clientsWS = [];
var roomsNS = [];
var roomsWS = [];
var roomUS = [];

var cookieParser = express.cookieParser(nconf.get('session_secret'));

exports.isLoggedIn = function(req, res, next){
 req.session.get('uname', function(err, data){
   if (!data)
      req.session.set('uname', 'alien', function(err){
        if (err)
           console.log(err);
      });
 });
 next();
};
exports.start = function(server, callback){
  exports.room = new wss({server: server});
  exports.thread = thread;
  exports.server = server;
  exports.room.on('connection', function(ws) {
    ws.on('open', function(){
         console.log('incoming');
    });
    ws.on('close', function() {
        _.map(roomsNS, function(key, value){
          roomsWS[key] = _.reject(roomsWS, function(client){
              return (client == ws)
              });
        });
        clientsWS = _.reject(clientsWS, function(client){
              return (client == ws)
              });
        });
    ws.on('message', function(data){
        data = JSON.parse(data);
        var log = {};
        var menu = [];
        switch (data.type) {
        case 'start':
          thread.listUsers(data, function(err, res){
            //console.log(JSON.stringify(res));
          });
          cookieParser(ws.upgradeReq, null, function(err) {
            var sessionID = ws.upgradeReq.cookies['s'];
            console.log(sessionID);
            sessionStore.db.get('\xff'+'session:'+sessionID+'\xff'+'uname', function(err, sess) {
            var uname = JSON.parse(sess.toString('utf8'));
             switch(uname) {
               case 'alien':
                 menu =
                       [
                        {
                          name: 'Login',
                          icon: 'comments-o',
                          url:'/login'
                        },
                        {
                          name: 'Join',
                          icon: 'comments-o',
                          url:'/signup'
                        }
                       ];
               break;
               default:
                 menu =
                       [
                        {
                          name:'Messages',
                          icon: 'comments-o',
                          url:'/meat/room'
                        },
                        {
                          name:'Profile',
                          icon: 'user',
                          url:'/profile'
                        }
                       ];
               break;
               }
              log = {
                type: 'start',
                app: data.app,
                menu: menu,
                uname: uname,
                sid: sessionID
                };
              ws.send(JSON.stringify(log));
            });
          });
        break;
        case 'profile:get':
          console.log('getting profile from: '+data.uname);
          thread.getProfile(data.uname, function(err, res){
            if (err) {
               log = {
               type: 'profile_fail',
               response: err
               };
               ws.send(JSON.stringify(log));
               }
               else
                  {
                  log = {
                  type: 'profile_data',
                  response: res
                  };
                  ws.send(JSON.stringify(log));
                  }
          });
          /*_.each(roomsWS[data.room], function(client){
               client.send(JSON.stringify(data));
             });*/
        break;
        case 'profile:set':
          console.log('set profile from: '+data.us);
          thread.setProfile(data, function(err, res){
            if (err) {
               log = {
               type: 'profile_fail',
               response: err
               };
               ws.send(JSON.stringify(log));
               }
               else
                  {
                  log = {
                  type: 'profile_data',
                  response: data
                  };
                  ws.send(JSON.stringify(log));
                  }
          });
          /*_.each(roomsWS[data.room], function(client){
               client.send(JSON.stringify(data));
             });*/
        break;
        case 'meat':
           console.log(data.msg+':'+data.user+'@'+data.room);
           //if (thread.db)
           //thread.setMsg(data);
           console.log(roomsWS);
           _.each(roomsWS[data.room], function(client){
                client.send(JSON.stringify(data));
              });
        break;
        case 'join':
            console.log('joining @'+data.room);
            cookieParser(ws.upgradeReq, null, function(err) {
              var sessionID = ws.upgradeReq.cookies['s'];
              sessionStore.db.get('\xff'+'session:'+sessionID+'\xff'+'uname', function(err, sess) {
                var uname = JSON.parse(sess.toString('utf8'));
                if (!roomUS[data.room])
                   roomUS[data.room] = [];
                if (!(_.find(roomUS[data.room], function(us){return us === uname})))
                   roomUS[data.room].push(uname);
                if (!(_.find(roomsNS, function(roomn){return roomn === data.room}))) {
                   roomsNS.push(data.room);
                   roomsWS[data.room] = [];
                   }
                roomsWS[data.room].push(ws);
                _.each(roomsWS[data.room], function(client){
                   client.send(JSON.stringify({type: 'room:read', response: roomUS[data.room]}));
                });
              });
            });
        break;
        case 'leave':
          console.log('leaving @'+data.room);
            roomsWS[data.room] = _.without(roomsWS[data.room], ws);
            if (roomsWS[data.room].length === 0)
               roomsNS = _.without(roomsNS, data.room);
            cookieParser(ws.upgradeReq, null, function(err) {
              var sessionID = ws.upgradeReq.cookies['s'];
              console.log(sessionID);
              sessionStore.db.get('\xff'+'session:'+sessionID+'\xff'+'uname', function(err, sess) {
              var uname = JSON.parse(sess.toString('utf8'));
              roomUS[data.room] = _.without(roomUS[data.room], uname);
                _.each(roomsWS[data.room], function(client){
                   client.send(JSON.stringify({type: 'room:read', response: roomUS[data.room]}));
                });
              });
            });
        break;
        case 'sendMail':
          mail.send(data.client, data.msg);
        break;
        case 'signOut':
          cookieParser(ws.upgradeReq, null, function(err) {
             var sessionID = ws.upgradeReq.cookies['s'];
             var buffer = JSON.stringify('alien');
             sessionStore.db.put('\xff'+'session:'+sessionID+'\xff'+'uname', buffer, function(err) {
             var log = {
                type: 'sign_out',
                uname: data.uname
                };
             _.each(clientsWS, function(client){
                 client.send(JSON.stringify(log));
                 });
             });
          });
        break;
        case 'signUp':
          thread.signUp(data, function(err, res){
          if (err) {
             var log = {
             type: 'sign_up_fail',
             response: err
             };
             ws.send(JSON.stringify(log));
             }
             else
                {
                cookieParser(ws.upgradeReq, null, function(err) {
                    var sessionID = ws.upgradeReq.cookies['s'];
                    var buffer = JSON.stringify(data.us);
                    sessionStore.db.put('\xff'+'session:'+sessionID+'\xff'+'uname', buffer, function(err) {
                      var log = {
                          type: 'sign_up_ok',
                          response: data.us,
                          sid: sessionID
                          };
                      if (!err)
                      _.each(clientsWS, function(client){
                          client.send(JSON.stringify(log));
                          });
                    });
                });
                }
              });
        break;
        case 'ping':
          log = {
            app: data.app,
            type: 'pong'
            };
          ws.send(JSON.stringify(log));
        break;
        case 'signIn':
          thread.signIn(data, function(err, user){
          if (err)
             {
             log = {
                 type: 'sign_in_fail',
                 response: 'error'
                 };
             ws.send(JSON.stringify(log));
             //console.log(err);
             }
             else
                {
                if (user) {
                    cookieParser(ws.upgradeReq, null, function(err) {
                        var sessionID = ws.upgradeReq.cookies['s'];
                        var buffer = JSON.stringify(user.uname);
                        sessionStore.db.put('\xff'+'session:'+sessionID+'\xff'+'uname', buffer, function(err) {
                          var log = {
                              type: 'sign_in_ok',
                              response: user.uname,
                              sid: sessionID
                              };
                          if (!err)
                          _.each(clientsWS, function(client){
                              client.send(JSON.stringify(log));
                              });
                        });
                    });
                    }
                    else
                       {
                       log = {
                           type: 'sign_in_fail',
                           response: 'Datos incorrectos'
                           };
                       ws.send(JSON.stringify(log));
                       }
                }
            });
        break;
        }
       });
  clientsWS.push(ws);
  });
callback();
};

return exports;
};