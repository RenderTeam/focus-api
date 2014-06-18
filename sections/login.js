/* jslint node: true */
'use strict';
var errors      = require('./lib/errors'),
    success     = require('./lib/success'),
    warnings    = require('./lib/warnings'),
    User        = require('./../mongoose_models/user');

module.exports = function ( server ) {
  server.post( '/login', function ( req, res ) {
    var username = req.body.username,
        candidatePassword = req.body.password;

    User.findOne( { username: username }, function ( err, user ) {
      if ( err ) { throw err; }

      if ( user === null ) {
        res.send( errors.noUserFound( username ) );
      } else {
        user.comparePassword( candidatePassword , function ( err, isMatch ) {
          if ( isMatch ) {
            res.send( { access: true } );
          }else{
            res.send( errors.wrongPassword() );
          }
        });
      }
    });
  });
};