'use strict';
module.exports = function Pubsub(socket, rootOptions) {
    Pubsub.prototype.publish = function publish(options, next) {
        if (options && options.method && options.endpoint && options.data) {
            if (options.endpoint.match(/\?/))
            options.endpoint = options.endpoint.split('?').shift();
            let event = `[${options.method}]${options.endpoint}`;
            // TODO Add DEBUG Config to enable the following from the component config
            if (rootOptions.debug) {
                console.info('Sending message to', event);
                console.info('message', options.data);
            }
            socket.emit(event, options.data);
            next();
        } else {
            console.info(options);
            console.error('Error: Option must be an instance of type { method: string, data: object }');
            next();
        }
    };
};
