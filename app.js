/*jid = 'aguamala.ca@gmail.com';
password = 'benalemonte666';
var xmpp = require('node-xmpp');
    function message_dispatcher(stanza) {
      console.log(stanza);
      console.log(stanza.children[0].children);
    }
// Establish a connection
var conn = new xmpp.Client({
    jid         : jid,
    password    : password,
    host        : 'talk.google.com',
    port        : 5222
});
conn.on('online', function(){
    console.log("ONLINE");
    var roster_elem = new xmpp.Element('iq', { from: conn.jid, type: 'get', id: 'google-roster-1'})
                        .c('query', { xmlns: 'jabber:iq:roster', 'xmlns:gr': 'google:roster', 'gr:ext': '2' });
        conn.send(roster_elem);
});
conn.addListener('stanza', message_dispatcher);
conn.on('error', function(e) {
     console.log(e);
});*/
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
