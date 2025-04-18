import { rabbitConfig } from './config.js';

export default {
    vhosts: {
        '/': {
            connection: {
                url: rabbitConfig.url,
            },
            queues: {
                [rabbitConfig.queueName]: {
                    options: {
                        durable: true,
                        arguments: {
                            'x-queue-type': 'quorum',
                        },
                    },
                },
            },
            publications: {
                stock_pub: {
                    queue: rabbitConfig.queueName,
                    options: {
                        persistent: true,
                    },
                },
            },
            subscriptions: {
                stock_sub: {
                    queue: rabbitConfig.queueName,
                    prefetch: 1,
                    options: {
                        ack: true,
                    },
                },
            },
        },
    },
};
