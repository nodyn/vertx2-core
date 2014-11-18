# vertx2-core

This module exposes the vert.x 2.x eventbus to node.js clients.
To use this module you need to be using [nodyn](http://nodyn.io).

# A Sample

    var vertx = require( 'vertx2-core' );

    vertx.eventbus.register( "sample.app", function(message) {
      console.log( "got a message!" );
      message.reply( "Howdy!" );
    });

    console.log( "registered handler" );
