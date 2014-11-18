var vertx = require( './index' ),
    assert = require('assert'),
    result = false;

var handle = vertx.eventbus.register( 'test.app', function(message) {
  result = (message._message.body() === 'ok');
});

process.on('exit', function() {
  assert.ok(result);
  console.log('ok');
});

vertx.eventbus.publish('test.app', 'ok');
handle.unregister();
process.exit();
