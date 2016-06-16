'use strict';
module.exports = function Pubsub(socket) {
    Pubsub.prototype.publish = function publish(options, next) {
        if (options && options.method && options.endpoint && options.data) {
            if (options.endpoint.match(/\?/))
            options.endpoint = options.endpoint.split('?').shift();
            let event = `[${options.method}]${options.endpoint}`;
            console.info('Sending message to', event);
            socket.emit(event, options.data);
            next();
        } else {
            throw 'Error: Option must be an instance of type { method: string, data: object }';
        }
    };
};
