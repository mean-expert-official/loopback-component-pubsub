
/**
 * Dependencies
 **/
var io = require('socket.io'),
  ioAuth = require('socketio-auth'),
  Pubsub = require('./pubsub'),
  async = require('async')


module.exports = function (app, options) {
  'use strict';
  /**
   * Set Default Options
   */
  options = Object.assign({
    interval: { step: 0, times: 10 }
  }, options)
  /**
   * Set Listener waiting for Http Server
   **/
  var intervalId = setInterval(function () {
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
    /*ioAuth(socket, {
      authenticate: function (ctx, value, callback) {
        var AccessToken = app.models.OauthAccessToken;
        //get credentials sent by the client
        var token = AccessToken.find({
          where: {
            and: [{
              token: value.id
            }]
          }
        }, function (err, tokenDetail) {
          if (err) throw err;
          return (tokenDetail.length) ? callback(null, true) : callback(null, false);
        });
      }
    });*/
    // Handle Connection and Disconnection Events
    socket.on('connection', function (socket) {
      /*socket.on('authentication', function (value) {
        console.info('A user (%s) has been authenticated over web sockets', value.userId);
      });*/
    });
  }
}