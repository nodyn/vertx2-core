
if ( typeof __nodyn == 'undefined' ) {
  throw new Error( "This module only works with Nodyn" );
}

module.exports.eventbus = require('./eventbus.js')
