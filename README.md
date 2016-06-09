[![NPM](https://nodei.co/npm/loopback-component-pubsub.png?stars&downloads)](https://nodei.co/npm/loopback-component-pubsub/) [![NPM](https://nodei.co/npm-dl/loopback-component-pubsub.png)](https://nodei.co/npm/loopback-component-pubsub/)

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
    "auth": true
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

Update the start method within the `server/server.js` file as follows:

```js
app.start = function() {
  return server = app.listen(function() {
    app.emit('started', server);
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
```

# How to subscribe to events

##### Un-Authenticated Vanilla JavaScript Example

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

##### Authenticated Vanilla JavaScript Example

You can subscribe to any valid remote method within your model as follows:

```html
<html>
<head>
  <title>Event Source Test</title>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    var client;
    // Ajax Request logic to login and to get a token [/POST]/api/users/login
    // Use whatever method works best for you when doing AJAX Requests
    userLogin(function onLogged(token) {
      client = io('http://localhost:3000');
      client.on('connect', function onConnect() {
        client.emit('authentication', token);
        client.on('unauthorized', function onUnauthorized(res) {
          console.error('Unauthenticated', res);
        });
      });
      // subscribe for newly created rooms 
      client.on('[POST]/api/rooms', function (room) {
        console.info('Room ', room);
      });
      // subscribe for new messages in the room with Id 1
      client.on('[POST]/api/rooms/1/messages', function (message) {
        console.info('Message ', message);
      });
    }); 
  </script>
</head>
<body></body>
</html>
````

##### NativeScript2 SDK Example Un-Authenticated

When using the [loopback-sdk-builder](https://www.npmjs.com/package/loopback-sdk-builder)

```js
import { Component } from "@angular/core";
import { HTTP_PROVIDERS } from '@angular/http';
import { RoomApi } from './sdk';

@Component({
    selector: "my-app",
    templateUrl: 'path/to/view.html'
    providers: [RoomApi, HTTP_PROVIDERS]
})

export class AppComponent {
    constructor(private room: RoomApi) {
        room.setBaseURL('http://127.0.0.1:3000'); // or local network IP or public IP/DNS
        room.setApiVersion('api');
        room.createIO().subscribe((res: { id: number | string }) => {
            alert(res.id);
        });
        room.__create__messagesIO(1).subscribe((res: { text: string }) => {
            alert(res.text);
        });
    }
}

```

##### NativeScript2 SDK Example Authenticated

When using the [loopback-sdk-builder](https://www.npmjs.com/package/loopback-sdk-builder)

```js
import { Component } from "@angular/core";
import { HTTP_PROVIDERS } from '@angular/http';
import { LoopBackConfig, UserApi, RoomApi } from './sdk';

@Component({
    selector: "my-app",
    templateUrl: 'path/to/view.html'
    providers: [HTTP_PROVIDERS, UserApi, RoomApi]
})

export class AppComponent {
    constructor(private room: RoomApi, private user: UserApi) {
        // or local network IP or public IP/DNS
        LoopBackConfig.setBaseURL('http://192.168.1.11:3000');
        LoopBackConfig.setApiVersion('api');
        user.login({ email: 'test@test.com', password: 'test' }).subscribe(res => {
            console.info('User has been authenticated over HTTP', res);
            room.createIO().subscribe((res: { id: number | string }) => {
                alert(res.id);
            });
            room.__create__messagesIO(1).subscribe((res: { text: string }) => {
                alert(res.text);
            });
        });
}

```

# TODO


- Implement Clustering Functionality