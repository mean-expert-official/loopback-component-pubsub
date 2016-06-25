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
    auth  : true,
    debug : false 
  }, options);
  /**
   * Set Listener waiting for Http Server
   **/
  app.on('started', start);
  /**
   * Setup Real Time Communications
   **/
  function start(server) {
    console.info('RTC server listening at %s', app.get('url').replace('http', 'ws'));
    // Lets create an instance of IO and reference it in app
    var socket = io(server);
    // Add a pubsub instanceable module
    app.pubsub = new Pubsub(socket, options);
    // Configure ioAuth
    if (options.auth) {
      console.info('RTC authentication mechanism enabled');
      ioAuth(socket, {
        authenticate: (ctx, token, next) => {
          var AccessToken = app.models.AccessToken;
          //verify credentials sent by the client
          var token = AccessToken.find({
            where: { id: token.id || 0, userId: token.userId || 0 }
          }, (err, tokenInstance) => next(err, tokenInstance.length > 0 ? true : false));
        },
        postAuthenticate: () => {
          socket.on('authentication', value => {
            console.info('A user (%s) has been authenticated over web sockets', value.userId);
          });
        }
      });
    }
    // Handle Connection and Disconnection Events
    socket.on('connection', socket => console.info('A client has been connected'));
  }
}