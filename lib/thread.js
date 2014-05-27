'use strict';
var _ = require('underscore');
var concat = require('concat-stream');

var thread = function (dblvl) {
  var self = this;
  self.users = dblvl.sublevel('users');
  self.messages = dblvl.sublevel('messages');
  var setTime = function () {
    return Date.now();
  };
  this.getMsg = function (data, callback) {
    var rs = self.messages.createReadStream();
    rs.pipe(concat(function (ms) {
      var  i = _.filter(ms, function(item){
         return (item.value.room === data.room);
      });
      if (i)
        callback(null, {
          messages: i
        });
    }));
    rs.on('error', function (err) {
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
              callback(null, data);
          }
        });
   };
  this.signIn = function (data, callback) {
    self.users.get(data.us+'!', function (err, u) {
      if (u) {
          if (err) {
            callback(err);
          } else {
            if (u.pw === data.pw)
               callback(null, {
                 uname: data.us
               });
            else
              callback(true, {response: 'Password error'});
          }
      } else {
        self.checkUname(data, callback);
        //callback(true, {response: 'Cant find user registry'});
      }
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
      else
          callback(true, {response: 'Cant find user registry'});
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
              mail: uname,
              uname: u.uname,
              pname: u.pname,
              lname: u.lname,
              dbirth: u.dbirth,
              pic: u.pic
            });
          }
      } else {
        callback(true, {response: 'no profile data for this user'});
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
                us: data
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
      if (u) {
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
/*'use strict';
module.exports = function(dblvl) {
  var app = dblvl.sublevel('app');
  var users = dblvl.sublevel('users');
  var threads = dblvl.sublevel('threads');
  var concat = require('concat-stream');
   exports.signIn = function (data, callback) {
    users.get(data.us+'!', function (err, u) {
      console.log(u);
      if (u) {
          if (err) {
            callback(err);
          } else {
            if (u.pw === data.pw)
            callback(null, {
              uname: data.us
            });
            else
              callback(true, {response: 'Usuario no registrado'});
          }
      } else {
        callback(true, {response: 'Usuario no registrado'});
      }
    });
   };
   exports.listUsers = function(data, callback){
    var rs = users.createReadStream();
    rs.pipe(concat(function (us) {
      callback(null, {
        users: us || []
      });
    }));
    rs.on('error', function (err) {
      callback(err);
    });
   };
   exports.signUp = function (data, callback) {
    users.get(data.us+'!', true, function (err, u) {
      console.log(u);
      if (!u) {
        users.put(data.us+'!',{
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
   exports.getProfile = function (uname, callback) {
    users.get(uname+'!', function (err, u) {
      console.log(u);
      if (u) {
          if (err) {
            callback(err);
          } else {
            callback(null, {
              mail: uname,
              uname: u.uname,
              pname: u.pname,
              lname: u.lname,
              dbirth: u.dbirth,
              pic: u.pic
            });
          }
      } else {
        callback(true, {response: 'Usuario no registrado'});
      }
    });
   };
   exports.setProfile = function (data, callback) {
    users.get(data.us+'!', true, function (err, u) {
      console.log(u);
      if (u) {
        users.put(data.us+'!',{
              pw: u.pw,
              mail: data.us,
              uname: data.uname,
              pname: data.pname,
              lname: data.lname,
              dbirth: data.dbirth,
              pic: 'images/icons/icon-300.png'
            }, true, function (err) {
          if (err) {
            callback(err);
          } else {
              callback(null, {
                us: data
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
   exports.setMsg = function (msg) {

   };
   exports.getThread = function (req, callback) {
     
   };
return exports;
};*/