# LoopBack Component PubSub

A [LoopBack Framework](http://loopback.io) Component that provides publish events over WebSockets.

This module will provide publish/subscribe functionality for [LoopBack Framework](http://loopback.io) Models that implements the `PubSub Mixin`.

# Publish Subscribe

The publish/subscribe pattern allow clients to subscribe to specific events, listening for data streams a server publish everytime there are new changes.

![Publish Subscribe Pattern](https://blog.gopheracademy.com/postimages/plumbing-and-semantics/pub-sub.jpg)

# Installation

```sh
$ npm install --save loopback-component-pubsub
```

# Setup Module

Update the  `server/component-config.json` as follows:

```json
{
  "loopback-component-explorer": {
    "mountPath": "/explorer"
  },
  "loopback-component-pubsub": {
    "auth": false
  }
}

```

Update the  `server/model-config.json` as follows:

```json
{
    "mixins": [
        "loopback/common/mixins",
        "loopback/server/mixins",
        "../common/mixins",
        "./mixins",
        "../node_modules/loopback-component-pubsub/mixins"
    ]
}
```

# Configure Models

Thanks to the provided mixin, you are able to define in which Models you want to make available the PubSub functionality by explicitly defining it in the model json file.

```json
{
  "mixins": {
    "PubSub": true
  }
}
```

# Update Server File

Update the `server/server.js` as follows:

```js
var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return server = app.listen(function() {
    app.emit('started', server); // Emit a server instance when loaded
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
```

# How to Subscribe for Events (Example)

You can subscribe to any valid remote method within your model as follows:

```html
<html>
<head>
  <title>Event Source Test</title>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    var client = io('http://localhost:3000');
        // subscribe for newly created rooms 
        client.on('[POST]/api/rooms', function (room) {
           console.info('Room ', room);
        });
        // subscribe for new messages in the room with Id 1
        client.on('[POST]/api/rooms/1/messages', function (message) {
           console.info('Message ', message);
        });
  </script>
</head>
<body></body>
</html>
````

# TODO

- Add Auth Documentation / Tutorial
- Implement Clustering Functionality