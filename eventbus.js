/*
 * Copyright 2014 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var util = require('util');

var Handle = process.binding('handle_wrap').Handle;

function HandlerRegistration(address, handler) {
  // This _handle controls the eventLoop ref-counting.
  // A registered handler counts as an active task for
  // the event-loop, keeping it alive until unref()'d
  // or fully unregistered.

  this._handle = new io.nodyn.handle.HandleWrap( process._process, true );
  Handle.call( this, this._handle );

  this._address = address;
  this._handler = deliverMessage.bind(handler);
  this.register();
}

util.inherits( HandlerRegistration, Handle );

HandlerRegistration.prototype.register = function() {
  this.ref();
  __vertx.eventBus().registerHandler( this._address, this._handler );
};

HandlerRegistration.prototype.unregister = function() {
  __vertx.eventBus().unregisterHandler( this._address, this.handler );
  this.unref();
};

function deliverMessage(m) {
  var message = new Message(m);
  this( message );
}

// ----------------------------------------
// Message
// ----------------------------------------

function Message(message) {
  this._message = message;
  this.address = message.address();
}

Message.prototype.reply = function(body) {
  this._message.reply( convertOutbound( body ) );
}

Object.defineProperty( Message.prototype, 'body', {
  get: function() {
    return convertInbound(this._message.body());
  },
  enumerable: true,
});


// ----------------------------------------
// inbound conversions
// ----------------------------------------

function convertInbound(body) {
  if (typeof body == 'number' || typeof body == 'string' || typeof body == 'boolean') {
    return body;
  }

  if (body instanceof org.vertx.java.core.json.JsonObject ) {
    return convertInboundJson(body);
  }

  if (body instanceof org.vertx.java.core.json.JsonArray ) {
    return convertInboundJson(body);
  }

  return {};
}

function convertInboundJson(obj) {
  return JSON.parse( obj.encode() );
}

// ----------------------------------------
// outbound conversions
// ----------------------------------------

function convertOutbound(body) {
  if (typeof body == 'number' || typeof body == 'string' || typeof body == 'boolean') {
    return body;
  }

  if (typeof body == 'object' ) {
    return convertOutboundJsonObject(body);
  }

  if (typeof body == 'function') {
    return convertOutbound( body() );
  }

  throw new Error( "Cannot send on eventbus: " + body );
}

function convertOutboundJsonObject(body) {
  var str = JSON.stringify(body);
  if ( str[0] == '[' ) {
    return new org.vertx.java.core.json.JsonArray( str );
  } else {
    return new org.vertx.java.core.json.JsonObject( str );
  }
}


// ----------------------------------------
// vertx.eventBus()
// ----------------------------------------

var eventbus = { };

eventbus.publish = function(address, message) {
  __vertx.eventBus().publish( address, message );
};

eventbus.send = function(address, message, replyHandler) {
  if ( replyHandler ) {
    __vertx.eventBus().send( address, convertOutbound( message ), deliverMessage.bind(replyHandler) );
  } else {
    __vertx.eventBus().send( address, convertOutbound( message ) );
  }
};

eventbus.register = function(address, handler) {
  return new HandlerRegistration( address, handler );
};

module.exports = eventbus;
