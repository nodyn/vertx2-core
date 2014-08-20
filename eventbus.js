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

  this.address = address;
  this.handler = handler;
  this.register();
}

util.inherits( HandlerRegistration, Handle );

HandlerRegistration.prototype.register = function() {
  this.ref();
  __vertx.eventBus().registerHandler( this.address, this.handler );
};

HandlerRegistration.prototype.unregister = function() {
  __vertx.eventBus().unregisterHandler( this.address, this.handler );
  this.unref();
};

// ----------------------------------------
// vertx.eventBus()
// ----------------------------------------

var eventbus = { };

eventbus.publish = function(address, message) {
  __vertx.eventBus().publish( address, message );
};

eventbus.send = function(address, message) {
  __vertx.eventBus().send( address, message );
};

eventbus.register = function(address, handler) {
  return new HandlerRegistration( address, handler );
};

module.exports = eventbus;
