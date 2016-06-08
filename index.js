'use strict';
/**
 * Dependencies
 **/
var io = require('socket.io'),
ioAuth = require('socketio-auth'),
Pubsub = require('./pubsub'),
async  = require('async')
/**
 * @module LoopBack Component PubSub
 * @author Jonathan Casarrubias <http://twitter.com/johncasarrubias>
 * @description
 * This module integrates LoopBack with Socket IO in order to provide
 * PubSub functionallity.
 * 
 * TODO:
 * 
 * Clusterize with socket.io adapter
 */
module.exports = (app, options) => {
  /**
   * Set Default Options
   */
  options = Object.assign({
    auth     : false, // TODO: Change defaults for true when a tutorial for this module is created
    interval : { step: 0, times: 10 }
  }, options);
  /**
   * Set Listener waiting for Http Server
   **/
  var intervalId = setInterval(() => {
    if (options.interval.step === options.interval.times)
    throw new Error('Unable to connect an HTTP Server');
    options.interval.step += 1;
    if (app.server) start();
  }, 1000);
  /**
   * Setup Real Time Communications
   **/
  function start() {
    clearInterval(intervalId);
    console.info('RTC server listening at %s', app.get('url').replace('http', 'ws'));
    // Lets create an instance of IO and reference it in app
    var socket = io(app.server);
    // Add a pubsub instanceable module
    app.pubsub = new Pubsub(socket);
    // Configure ioAuth
    if (options.auth) {
      console.info('RTC authentication mechanism enabled');
      ioAuth(socket, {
        authenticate: (ctx, token, next) => {
          var AccessToken = app.models.AccessToken;
          //verify credentials sent by the client
          var token = AccessToken.find({
            where: { id: token.id || 0, userId: token.userId || 0 }
          }, (err, tokenInstance) => next(err, tokenInstance ? true : false));
        }
      });
    }
    // Handle Connection and Disconnection Events
    socket.on('connection', socket => {
      console.info('A client is trying to connect');
      if (options.auth)
      socket.on('authentication', value => {
        console.info('A user (%s) has been authenticated over web sockets', value.userId);
      });
    });
  }
}