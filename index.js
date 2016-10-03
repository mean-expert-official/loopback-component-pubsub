'use strict';
/**
 * Dependencies
 **/
var io = require('socket.io'),
ioAuth = require('socketio-auth'),
Pubsub = require('./pubsub')
/**
 * @module LoopBack Component PubSub
 * @author Jonathan Casarrubias <http://twitter.com/johncasarrubias>
 * @description
 * This module integrates LoopBack with Socket IO in order to provide
 * PubSub functionallity.
 */
module.exports = (app, options) => {
  console.log('DEPRECATED: Use @mean-expert/loopback-component-realtime instead')
}