import rascal from 'rascal';
import Redis from 'ioredis';
import rascalConfig from '../config/rascalConfig.js';
import { redisConfig } from '../config/config.js';

const redis = new Redis(redisConfig);

// Main function to run the consumer
const runConsumer = async () => {

    // Create a Rascal broker
    rascal.Broker.create(rascalConfig, (err, broker) => {

        if (err) throw err;

        broker.on('error', console.error);

        // Subscribe to the 'stock_sub' topic
        broker.subscribe('stock_sub', (err, subscription) => {

            if (err) throw err;

            // Listen for messages on the subscription
            subscription.on('message', async (message, content, ackOrNack) => {

                try {

                    // Get key
                    const key = content.symbol + '_stream';

                    // Add the message to the Redis stream
                    await redis.xadd(key, '*', 'data', JSON.stringify(content));

                    console.log('[✓] Written to Redis Stream:', key, content);
                    ackOrNack();

                } catch (err) {

                    console.error('[!] Redis stream write error:', err);
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