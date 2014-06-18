/* jslint node: true */
'use strict';
var fs        = require('fs'),
    errors    = require('./lib/errors'),
    success    = require('./lib/success'),
    warnings  = require('./lib/warnings'),
    __        = require('underscore')._,
    schemas   = {},
    basePath  = __dirname + '/../mongoose_models';

fs.readdirSync( basePath ).forEach(
  function ( file ) {
    var path = basePath + '/' + file;
    schemas[file.slice(0,-3)] = require( path );
  }
);

module.exports = function ( server ) {
  server.get( '/all/:schema/data', basicValidations, function ( req, res ) {
    var condition       = {},
        schema          = req.params.schema,
        fields          = '',
        keys            = [],
        warning         = {};

    for ( var key in schemas[schema].schema.paths ) {
      keys.push( key );
    }

    condition = req.body.condition !== undefined ? req.body.condition: {};

    keys = __.difference( req.body.fields, keys);
    if ( keys.length > 0 ) {
      if ( keys.length === req.body.fields.length ) {
        res.json( errors.noKeysFound( keys ) );
      }
      warning.keysNotFound = warnings.keysNotFound( keys );
    }

    if ( req.body.fields !== undefined ) {
      if ( req.body.fields.indexOf('_id') < 0 ) {
        req.body.fields.push('-_id');
      }
      fields = req.body.fields.join(' ');
    } else {
      fields = '-_id';
    }

    schemas[schema].find( condition ).select( fields ).exec(
      function ( err, docs ) {
        if ( err ) { throw err; }

        var toSend = { data:docs };
        if ( isEmpty( warning ) ) { toSend.warnings = warning; }

        res.json( toSend );
      }
    );
  });

  server.post( '/all/:schema/data', basicValidations, function ( req, res ) {
    var condition       = {},
        schema          = req.params.schema,
        fields          = '',
        keys            = [],
        allFields       = [],
        warning         = {};

    for ( var key in schemas[schema].schema.paths ) {
      keys.push( key );
      allFields.push( key );
    }

    condition = req.body.condition !== undefined ? req.body.condition: {};

    keys = __.difference( req.body.fields, keys);
    if ( keys.length > 0 ) {
      if ( keys.length === req.body.fields.length ) {
        res.json( errors.noKeysFound( keys ) );
      }
      warning.keysNotFound = warnings.keysNotFound( keys );
    }

    if ( req.body.fields !== undefined ) {
      if ( req.body.fields.length === 1 && req.body.fields[0] === '_id') {
        fields = allFields.join(' ');
      } else {
        if ( req.body.fields.indexOf('_id') < 0 ) {
          req.body.fields.push('-_id');
        }
        fields = req.body.fields.join(' ');
      }
    } else {
      fields = '-_id';
    }

    schemas[schema].find( condition ).select( fields ).exec(
      function ( err, docs ) {
        if ( err ) { throw err; }

        var toSend = { data:docs };
        if ( isEmpty( warning ) ) { toSend.warnings = warning; }

        res.json( toSend );
      }
    );
  });

  server.del( '/:schema/delete', basicValidations, function ( req, res ) {
    var schema    = req.params.schema,
        condition = {};

    condition = req.body.condition !== undefined ? req.body.condition : {};

    schemas[schema].remove( condition ).exec( function ( err ) {
        if ( err ) { throw err; }
        res.send( { status: true, message: success.deletedCorrectly() });
    });
  });

  server.post( '/:schema/new', basicValidations, function ( req, res ) {
    var schema    = req.params.schema,
        reference = req.body.reference;
    var newDocument = new schemas[schema]( reference );

    newDocument.save( function ( err ) {
      if ( err ) { throw err; }
      res.send( { status: true, message: success.savedCorrectly( schema )});
    });
  });

  server.put( '/:schema/update', basicValidations, function ( req, res ) {
    var schema      = req.params.schema,
        update      = req.body.reference,
        condition   = req.body.condition;

    schemas[schema].update( condition, update, function ( err, number, raw ) {
      if ( err ) { throw err; }
      res.send( { status: true, message: success.updatedCorrectly()});
    });
  });
};

function basicValidations ( req, res, next ) {
  var schema    = req.params.schema,
      flag = true;

  if ( schemas[schema] === undefined ) {
    res.send( errors.schemaNotFound( schema ));
    flag = false;
  }

  switch ( req.method ) {
    case 'GET':
      break;
    case 'DELETE':
      break;
    case 'POST':
      break;
    case 'PUT':
      break;
  }

  if ( flag ) { next(); }
}

function isEmpty( object ) {
  for( var i in object ) { return true; }
  return false;
}
