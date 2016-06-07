# LoopBack Component PubSub

A [LoopBack Framework](http://loopback.io) Component that provides publish/subscribe over WebSockets. This module will provide a publish/subscribe functionallity for [LoopBack Framework](http://loopback.io) Models.

# Publish Subscribe

The publish subscribe pattern allow clientst to subscribe to specific events, listening for data streams a server publish everytime there are changes.

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
  "./components/loopback-component-pubsub": true
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
        "./components/loopback-component-pubsub/mixins"
    ]
}
```

# Configure Models

You are able to define in which Models you want to make available the PubSub functionallity by explicitaly defining it in the model json file.

```json
{
  "mixins": {
    "PubSub": true
  }
}
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
        // subscribe to new messages in the room with Id 1
        client.on('[POST]/api/rooms/1/messages', function (message) {
           console.info('Message ', message);
        });
  </script>
</head>
<body></body>
</html>
````