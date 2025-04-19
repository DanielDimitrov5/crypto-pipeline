import rascal from 'rascal';
import Redis from 'ioredis';
import rascalConfig from '../config/rascalConfig.js';
import { redisConfig } from '../config/config.js';

const redis = new Redis(redisConfig);

// Main function to run the consumer
const runConsumer = async () => {

    // Create a Rascal broker
    rascal.Broker.create(rascalConfig, (err, broker) => {

        // Check for errors
        if (err) throw err;

        // Log errors from the broker
        broker.on('error', console.error);

        // Subscribe to the 'stock_sub' subscription
        broker.subscribe('stock_sub', (err, subscription) => {

            // Check for errors
            if (err) throw err;

            // Log when the subscription is ready
            subscription.on('message', async (message, content, ackOrNack) => {

                try {

                    const key = content.symbol + '_list';

                    redis.rpush(key, JSON.stringify(content));

                    console.log('[✓] Stored in Redis:', key, content);
                    ackOrNack();
                }

                catch (err) {

                    console.error('[!] Redis error:', err);
                    ackOrNack(err);
                }
            });

            subscription.on('error', console.error);
        });
    });
}

export default runConsumer;

if (import.meta.url === `file://${process.argv[1]}`) {
    runConsumer();
}
