'use strict';
module.exports = function (app, socket) {
  app.get('/', socket.isLoggedIn, function (req, res) {
    //
    /*
    Get ip
    console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress);
    Access the session with:
    req.session.get('uname', function(err, res){
     console.log(res);
    });
    */
    res.render('app');
  });
  app.get('/signup', socket.isLoggedIn, function (req, res) {
    req.session.get('uname', function(err, sess){
        if (sess === 'alien')
           res.render('app');
        else
           res.redirect('/');
    });
  });
  app.get('/signout', socket.isLoggedIn, function (req, res) {
    req.session.set('uname', 'alien',function(err, sess){
        res.redirect('/');
    });
  });
  app.get('/login', socket.isLoggedIn, function (req, res) {
    req.session.get('uname', function(err, sess){
        if (sess === 'alien')
           res.render('app');
        else
           res.redirect('/');
    });
  });
  app.get('/profile', socket.isLoggedIn, function (req, res) {
    req.session.get('uname', function(err, sess){
        if (sess !== 'alien')
           res.render('app');
        else
           res.redirect('/');
    });
  });
  app.get('/meat/:id', socket.isLoggedIn, function (req, res) {
    req.session.get('uname', function(err, sess){
        if (sess !== 'alien')
           res.render('app');
        else
           res.redirect('/');
    });
  });
  app.get('/app/:appNamed', socket.isLoggedIn, function (req, res) {
    res.render('app');
  });
};
