'use strict';
module.exports = function(_, express, nconf, sessionStore) {
  
var Thread = require('./thread'),
    thread = new Thread(sessionStore, _),
    mail = require('./mail'),
    fs = require('fs'),
    wss = require('ws').Server,
    roomsNS = [],
    roomsWS = [],
    roomUS = [];

var cookieParser = express.cookieParser(nconf.get('session_secret'));
//Session initial check
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
         console.log('new connection');
         //roomsWS['main'].push(ws);
    });
    ws.on('close', function() {
        _.map(roomsNS, function(key, value){
          roomsWS[key] = _.reject(roomsWS[key], function(client){
              return (client === ws)
              });
        });
        cookieParser(ws.upgradeReq, null, function(err) {
          var sessionID = ws.upgradeReq.cookies['s'];
          sessionStore.db.get('\xff'+'session:'+sessionID+'\xff'+'uname', function(err, sess) {
            if (!err) {
              var uname = JSON.parse(sess);
              roomUS['main'] = _.reject(roomUS['main'], function(item){
              return (item.umail === uname)
              });
                _.each(roomsWS['main'], function(client){
                  try {
                   client.send(JSON.stringify({type: 'room:main', response: roomUS['main']}));
                   }
                  catch(err) {
                    console.log(err);
                  }
                });
            }
          });
        });
    });
    ws.on('message', function(data){
        data = JSON.parse(data);
        switch (data.type) {
        case 'app:start':
          cookieParser(ws.upgradeReq, null, function(err) {
            var sessionID = ws.upgradeReq.cookies['s'];
            sessionStore.db.get('\xff'+'session:'+sessionID+'\xff'+'uname', function(err, sess) {
            var uname = JSON.parse(sess);
            if (uname!=='alien')
               thread.getProfile(uname, function(err, res){
                  if (!err)
                     ws.send(JSON.stringify({
                       type: 'app:start',
                       menu: [
                        {
                          name:'Profile',
                          icon: 'user',
                          url:'/profile'
                        }
                       ],
                       uname: res.umail,
                       sid: sessionID,
                       pic: res.pic,
                       mail: res.mail
                       }));
                  });
            else
              ws.send(JSON.stringify({
                type: 'app:start',
                menu: [
                        {
                          name: 'Login',
                          icon: 'user',
                          url:'/login'
                        }
                       ],
                uname: uname,
                sid: sessionID
                }));
            });
          });
        break;
        case 'profile:upload':
          var binaryData = false;
          switch(data.imageType){
            case 'png':
               binaryData  =   new Buffer(data.image.replace(/^data:image\/png;base64,/,""), 'base64').toString('binary');
            break;
            case 'gif':
               binaryData  =   new Buffer(data.image.replace(/^data:image\/gif;base64,/,""), 'base64').toString('binary');
            break;
            case 'jpg':
               binaryData  =   new Buffer(data.image.replace(/^data:image\/jpg;base64,/,""), 'base64').toString('binary');
            break;
            case 'jpeg':
               binaryData  =   new Buffer(data.image.replace(/^data:image\/jpeg;base64,/,""), 'base64').toString('binary');
            break;
          }
          if (binaryData)
             fs.writeFile('public/images/profiles/'+data.uname+'.'+data.imageType, binaryData, 'binary', function (err) {
               thread.upProfile(data, function(err, res){
                 if (err) {
                    ws.send(JSON.stringify({
                    type: 'profile:fail',
                    response: err
                    }));
                    }
                    else
                       {
                       ws.send(JSON.stringify({
                       type: 'profile:pic',
                       response: res
                       }));
                       roomUS['main'] = _.reject(roomUS['main'], function(item){
                         return(item.umail === data.uname);
                       });
                       roomUS['main'].push(res);
                       _.each(roomsWS['main'], function(client){
                         try {
                          client.send(JSON.stringify({type: 'room:main', response: roomUS['main']}));
                          }
                         catch(err) {
                           console.log(err);
                         }
                       });
                       }
               });
             });
        break;
        case 'profile:get':
          thread.getProfile(data.uname, function(err, res){
            if (err) {
               ws.send(JSON.stringify({
               type: 'profile:fail',
               response: res
               }));
               }
               else
                  {
                  ws.send(JSON.stringify({
                  type: 'profile:data',
                  response: res
                  }));
                  }
          });
        break;
        case 'profile:set':
          thread.setProfile(data, function(err, res){
            if (err)
               ws.send(JSON.stringify({
               type: 'profile:fail',
               response: err
               }));
               else
                  {
                  roomUS['main'] = _.reject(roomUS['main'], function(item){
                    return(item.umail === data.us);
                  });
                  roomUS['main'].push({
                    umail: data.us,
                    profile: res
                  });
                  ws.send(JSON.stringify({
                    type: 'profile:data',
                    response: res
                  }));
                  _.each(roomsWS['main'], function(client){
                    try {
                     client.send(JSON.stringify({type: 'room:main', response: roomUS['main']}));
                     }
                    catch(err) {
                      console.log(err);
                    }
                  });
                  }
          });
        break;
        case 'room:meat':
           console.log(data.msg+':'+data.user+'@'+data.room);
           thread.setMsg(data, function(err, profile){
             if (!err) {
                _.each(roomsWS[data.room], function(client){
                    client.send(JSON.stringify({
                      type: 'room:meat',
                      profile: profile,
                      msg:data
                    }));
                });
             }
           });
        break;
        case 'room:join':
            console.log('joining @'+data.room);
            cookieParser(ws.upgradeReq, null, function(err) {
              var sessionID = ws.upgradeReq.cookies['s'];
              sessionStore.db.get('\xff'+'session:'+sessionID+'\xff'+'uname', function(err, sess) {
                if (!err) {
                    var uname = JSON.parse(sess.toString('utf8'));
                    if (!roomUS[data.room])
                       roomUS[data.room] = [];
                    if (!(_.find(roomsNS, function(roomn){return roomn === data.room}))) {
                       roomsNS.push(data.room);
                       roomsWS[data.room] = [];
                       }
                    roomsWS[data.room].push(ws);
                    console.log(data.room+':'+JSON.stringify(roomUS[data.room]));
                    if (!(_.find(roomUS[data.room], function(us){return us.umail === uname})))
                       thread.getProfile(uname, function(err, profile){
                         if (!err) {
                              roomUS[data.room].push(profile);
                            if (data.room === 'main')
                               _.each(roomsWS['main'], function(client){
                                  client.send(JSON.stringify({type: 'room:main', response: roomUS['main']}));
                               });
                            else {
                              thread.getMsg(data, function(err, res){
                                if (!err)
                                   ws.send(JSON.stringify({type: 'room:read', response: res}));
                                });
                              }
                            }
                         });
                       else
                         if (data.room === 'main')
                            ws.send(JSON.stringify({type: 'room:main', response: roomUS['main']}));
                         else
                           thread.getMsg(data, function(err, res){
                             if (!err)
                             ws.send(JSON.stringify({type: 'room:read', response: res}));
                           });
                    }
              });
            });
        break;
        case 'room:leave':
          console.log('leaving @'+data.room);
            roomsWS[data.room] = _.without(roomsWS[data.room], ws);
            if (roomsWS[data.room].length === 0)
               roomsNS = _.without(roomsNS, data.room);
            cookieParser(ws.upgradeReq, null, function(err) {
              var sessionID = ws.upgradeReq.cookies['s'];
              sessionStore.db.get('\xff'+'session:'+sessionID+'\xff'+'uname', function(err, sess) {
              var uname = JSON.parse(sess.toString('utf8'));
              roomUS[data.room] = _.reject(roomUS[data.room], function(item){
                return(item.umail === uname);
              });
              roomsWS[data.room] = _.reject(roomsWS[data.room], function(client){
                return (client === ws)
              });
              if (data.room === 'main')
                _.each(roomsWS['main'], function(client){
                   client.send(JSON.stringify({type: 'room:main', response: roomUS['main']}));
                });
              });
            });
        break;
        case 'mail:send':
          mail.send(data.client, data.msg);
        break;
        case 'signup':
          thread.signUp(data, function(err, res){
             if (err)
                ws.send(JSON.stringify({
                     type: 'signup:fail',
                     response: 'There is a user using this mail'
                    }));
             else
                cookieParser(ws.upgradeReq, null, function(err) {
                  var sessionID = ws.upgradeReq.cookies['s'];
                  var buffer = JSON.stringify(data.us);
                  sessionStore.db.put('\xff'+'session:'+sessionID+'\xff'+'uname', buffer, function(err) {
                    if (!err) {
                       ws.send(JSON.stringify({
                         type: 'signup:data',
                         response: data.us,
                         sid: sessionID
                        }));
                       mail.send(data.us, data.pw);
                       }
                    });
                  });
              });
        break;
        case 'signin':
          thread.signIn(data, function(err, user){
          if (err)
             ws.send(JSON.stringify({
                type: 'signin:fail',
                response: user.response
                }));
          else
             cookieParser(ws.upgradeReq, null, function(err) {
                 var sessionID = ws.upgradeReq.cookies['s'];
                 var buffer = JSON.stringify(user.uname);
                 sessionStore.db.put('\xff'+'session:'+sessionID+'\xff'+'uname', buffer, function(err) {
                 if (!err)
                    ws.send(JSON.stringify({
                       type: 'signin:data',
                       response: user.uname,
                       sid: sessionID
                       }));
                 });
             });
            });
        break;
        case 'signout':
          cookieParser(ws.upgradeReq, null, function(err) {
             var sessionID = ws.upgradeReq.cookies['s'];
              sessionStore.db.get('\xff'+'session:'+sessionID+'\xff'+'uname', function(err, sess) {
                 var uname = JSON.parse(sess.toString('utf8'));
                 roomUS['main'] = _.reject(roomUS['main'], function(item){
                   return(item.umail === uname);
                 });
                 roomsWS['main'] = _.reject(roomsWS['main'], function(client){
                   return (client === ws)
                 });
                 _.each(roomsWS['main'], function(client){
                    client.send(JSON.stringify({type: 'room:main', response: roomUS['main']}));
                 });
                 sessionStore.db.put('\xff'+'session:'+sessionID+'\xff'+'uname', JSON.stringify('alien'), function(err) {
                  if (!err)
                     ws.send(JSON.stringify({
                       type: 'signout',
                       uname: data.uname
                       }));
                 });
              });
          });
        break;
        case 'ping':
          ws.send(JSON.stringify({
            app: data.app,
            type: 'pong'
            }));
        break;
        }
       });
  });
callback();
};

return exports;
};