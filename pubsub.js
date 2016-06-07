'use strict';
module.exports = function Pubsub(socket) {
    Pubsub.prototype.publish = function publish(options, next) {
        if (options && options.method && options.endpoint && options.data) {
            socket.emit(`[${options.method}]${options.endpoint}`, options.data);
            next();
        } else {
            throw 'Error: Option must be an instance of type { method: string, data: object }';
        }
    };
};
