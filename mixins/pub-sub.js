module.exports = function (Model, options) {
  Model.afterRemote('**', (ctx, remoteMethodOutput, next) => {
    Model.app.pubsub.publish({
      method: ctx.req.method,
      endpoint: ctx.req.originalUrl,
      data: remoteMethodOutput
    }, next);
  });
};
