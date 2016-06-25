"use strict";
var async = require('async');
/**
 * @module LoopBack Component PubSub - Mixin -
 * @author Jonathan Casarrubias <@johncasarrubias>
 * @description
 * 
 * The following algorithm will send messages to subscribed clients
 * for specific endpoints.
 * 
 * If the request is in order to create a relationship between 2
 * entities, then the messages will be sent forwards and backwards
 * 
 * Which means, that if you link an Account <-> Room 2 messages will
 * be sent:
 * 
 *  1.- account.onRoomLink(account.id).subscribe(newRooms => {})
 *  2.- room.onAccountLink(room.id).subscribe(newAccount => {})
 * 
 * Otherwise will send a direct message.
 * 
 * Also it accepts filters defined within the model config, so you can
 * include data to messages sent, example:
 * 
 *  When sending a message, we may want to include the owner account.
 */
module.exports = function (Model, options) {

  options = Object.assign({ filters: {} }, options);

  Model.afterRemote('**', (ctx, remoteMethodOutput, next) => {
    if (ctx.req.method === 'GET' || ctx.req.method === 'HEAD' ||
      ctx.req.originalUrl.match(/resetPassword/g) ||
      ctx.req.originalUrl.match(/log(in|out)/g)) return next();
    // If the message event is due link relationships
    if (ctx.methodString.match(/__(link|unlink)__/g)) {
      let segments   = ctx.methodString.replace(/__[a-zA-Z]+__/g, '').split('.');
      let original   = ctx.req.originalUrl.split('/'); original.pop();
          original   = original.join('/');
      let current    = segments.shift();
      let related    = segments.pop().split('');
          related[0] = related[0].toUpperCase(); related.pop();
          related    = related.join('');
      let inverse    = ctx.req.originalUrl.split('/'); inverse.shift();
      // Send Forward and Backward Messages in Parallel
      async.parallel([
        // Send Forward Message
        next => Model.app.models[related].findOne(
            Object.assign({ 
              where: {[ Model.app.models[related].getIdName() ]: ctx.req.params.fk }
            },
            (options.filters[ctx.method.name] && options.filters[ctx.method.name].forFK) ? 
            options.filters[ctx.method.name].forFK : {}
        ), (err, res) => {
          if (err) return next(err);
          Model.app.pubsub.publish({
            method   : ctx.req.method,
            endpoint : original,
            data     : res
          }, next);
        }),
        // Send Backward Message
        next => Model.app.models[current].findOne(
            Object.assign({ 
              where: {[ Model.app.models[current].getIdName() ]: ctx.req.params[[ Model.app.models[current].getIdName() ]] }
            },
            (options.filters[ctx.method.name] && options.filters[ctx.method.name].forPK) ? 
            options.filters[ctx.method.name].forPK : {}
        ), (err, res) => {
          if (err) return next(err);
          Model.app.pubsub.publish({
            method   : ctx.req.method,
            endpoint : '/' + [inverse[0], inverse[3], ctx.req.params.fk, inverse[1], inverse[4]].join('/'),
            data     : res
          }, next);
        })
      ], next);
    // Send Direct Message on Create Relation (not linking)
    } else if (ctx.methodString.match(/__(create)__/g)) {
      let segments   = ctx.methodString.replace(/__[a-zA-Z]+__/g, '').split('.');
      let current    = segments.shift();
      if (options.filters[ctx.method.name]) {
        let method     = Array.isArray(remoteMethodOutput) ? 'find' : 'findOne';
        let related    = segments.pop().split('');
            related[0] = related[0].toUpperCase(); related.pop();
            related    = related.join('');
        let query      = Object.assign({ 
            where: {
              [ Model.app.models[related].getIdName() ]: remoteMethodOutput[ Model.app.models[related].getIdName() ]
            }
          },
          options.filters[ctx.method.name]
        );
        Model.app.models[related][method](query, (err, instance) => {
            if (err) return next(err);
            if (!instance) {
              next();
              return console.error('PUBSUB ERROR: Invalid Model Filters', options.filters[ctx.method.name]);
            }
            Model.app.pubsub.publish({
              method   : ctx.req.method,
              endpoint : ctx.req.originalUrl,
              data     : instance
            }, next);
          }
        );
      } else {
       // Send Direct Message without filters
        Model.app.pubsub.publish({
          method: ctx.req.method,
          endpoint: ctx.req.originalUrl,
          data: remoteMethodOutput
        }, next);      
      }
    // Send Direct Message no Relation
    } else {
      if (options.filters[ctx.method.name]) {
        // Send Direct Message with filters
        let method = Array.isArray(remoteMethodOutput) ? 'find' : 'findOne';
        Model[method](Object.assign(
          { where: remoteMethodOutput },
          options.filters[ctx.method.name]),
          (err, instance) => {
            if (err) return next(err);
            if (!instance) {
              next();
              return console.error('PUBSUB ERROR: Invalid Model Filters', options.filters[ctx.method.name]);
            }
            Model.app.pubsub.publish({
              method   : ctx.req.method,
              endpoint : ctx.req.originalUrl,
              data     : instance
            }, next);
          }
        );
      } else {
        // Send Direct Message without filters
        Model.app.pubsub.publish({
          method: ctx.req.method,
          endpoint: ctx.req.originalUrl,
          data: remoteMethodOutput
        }, next);
      }
    }
  });
};
