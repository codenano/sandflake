
var nconf = require('nconf');
nconf.argv().env().file({ file: 'local.json' });
var _ = require('underscore');
var level = require('level');
var Sublevel = require('level-sublevel');
//var leveldown = require('leveldown');

var dbPath = ''+nconf.get('dbpath');

/*leveldown.repair(dbPath, function(err){
  if (!err)
     console.log('done');
});*/


var dblvl = Sublevel(level(dbPath, {
    createIfMissing: true,
    valueEncoding: 'json'
  }));

var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var levelSession = require('level-session');

var settings = require('./settings')(app, configurations, express, levelSession, dblvl);
var socket = require('./lib/socket')(_, express, nconf, dblvl);
var appPort = nconf.get('port');


socket.start(server, function(){
    require('./routes')(app, socket);
    server.listen(appPort);
  });
