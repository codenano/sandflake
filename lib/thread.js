'use strict';
var concat = require('concat-stream');

var thread = function (dblvl, _) {
  var self = this;
  self.users = dblvl.sublevel('users');
  self.messages = dblvl.sublevel('messages');
  var setTime = function () {
    return Date.now();
  };
  this.getMsg = function (data, callback) {
    var ms = self.messages.createReadStream();
    ms.pipe(concat(function (ms) {
      var  i = _.filter(ms, function(item){
         return (item.value.room === data.room);
      });
      if (i) {
        var j = [];
        _.map(i, function(msg, key){
          self.getProfile(msg.key.split('!')[1], function(err, profile){
            j.push({
              profile: profile,
              msg: msg
            });
          if (i.length===key+1)
             callback(null, {
               messages: j
             });
          });
        });
        }
    }));
    ms.on('error', function (err) {
      callback(err);
    });
   };
  this.setMsg = function (data, callback) {
    var senderKey = setTime() + '!' + data.user;
        self.messages.put(senderKey, {
              room: data.room,
              msg: data.msg
        }, true, function (err) {
          if (err) {
            callback(err);
          } else {
              self.getProfile(data.user, function(err, profile){
                if (!err)
                   callback(null, profile);
                else
                   callback(err);
              });
              
          }
        });
   };
  this.signIn = function (data, callback) {
    self.users.get(data.us+'!', function (err, u) {
      if (!err  &&  u)
         if (u.pw === data.pw)
            callback(null, {
              uname: data.us
            });
         else
           callback(true, {response: 'Wrong password for user <b>'+data.us+'</b>'});
      else
         self.checkUname(data, callback);
    });
   };
  this.checkUname = function(data, callback){
    var rs = self.users.createReadStream();
    rs.pipe(concat(function (us) {
      var i = false;
      i = _.find(us, function(item){
        return ((item.value.uname === data.us)&&(item.value.pw === data.pw));
      });
      if (i)
          callback(null, {
            uname: i.value.mail
          });
      else {
        i = _.find(us, function(item){
          return (item.value.uname === data.us);
        });
        if (i)
           callback(true, {response: 'Wrong password for <b>'+data.us+'</b>'});
        else
           callback(true, {response: 'Can\'t find user registry for <b>'+data.us+'</b>, check your login and password'});
        }
    }));
    rs.on('error', function (err) {
      callback(err);
    });
   };
  this.listUsers = function(data, callback){
    var rs = self.users.createReadStream();
    rs.pipe(concat(function (us) {
      _.each(us, function(item){
         console.log(item.value);
      });
      callback(null, {
        users: us || []
      });
    }));
    rs.on('error', function (err) {
      callback(err);
    });
   };
  this.signUp = function (data, callback) {
    self.users.get(data.us+'!', true, function (err, u) {
      if (!u) {
        self.users.put(data.us+'!',{
              pw: data.pw,
              mail: data.us,
              uname: data.us,
              pname: '',
              lname: '',
              dbirth: 0,
              pic: 'images/icons/icon-300.png'
        }, true, function (err) {
          if (err) {
            callback(err);
          } else {
              callback(null, {
                us: data.us,
                pw: data.pw
              });
          }
        });
      } else {
              callback(true, {
                us: data.us,
                response: 'user already registered'
              });
      }
    });
   };
  this.getProfile = function (uname, callback) {
    self.users.get(uname+'!', function (err, u) {
      if (u) {
          if (err) {
            callback(err);
          } else {
            callback(null, {
              umail: u.mail,
              uname: u.uname,
              pname: u.pname,
              lname: u.lname,
              dbirth: u.dbirth,
              pic: u.pic
            });
          }
      } else {
        callback(true, {response: 'no profile data for '+uname});
      }
    });
   };
  this.setProfile = function (data, callback) {
    self.users.get(data.us+'!', true, function (err, u) {
      if (u) {
        self.users.put(data.us+'!',{
              pw: u.pw,
              mail: data.us,
              uname: data.uname,
              pname: data.pname,
              lname: data.lname,
              dbirth: data.dbirth,
              pic: u.pic
            }, true, function (err) {
          if (err) {
            callback(err);
          } else {
              callback(null, {
              umail: data.us,
              uname: data.uname,
              pname: data.pname,
              lname: data.lname,
              dbirth: data.dbirth,
              pic: u.pic
            });
          }
        });
      } else {
              callback(true, {
                us: data.us,
                response: 'no profile data for this user'
              });
      }
    });
  };
  this.upProfile = function (data, callback) {
    self.users.get(data.uname+'!', true, function (err, u) {
      if (!err && u) {
        self.users.put(data.uname+'!',{
              pw: u.pw,
              mail: u.mail,
              uname: u.uname,
              pname: u.pname,
              lname: u.lname,
              dbirth: u.dbirth,
              pic: 'images/profiles/'+data.uname+'.'+data.imageType
            }, true, function (err) {
          if (err) {
            callback(err);
          } else {
              callback(null, {
                umail: u.mail,
                uname: u.uname,
                pname: u.pname,
                lname: u.lname,
                dbirth: u.dbirth,
                pic: 'images/profiles/'+data.uname+'.'+data.imageType
              });
          }
        });
      } else {
              callback(true, {
                us: data.us,
                response: 'no profile data for this user'
              });
      }
    });
  };
};
module.exports = thread;