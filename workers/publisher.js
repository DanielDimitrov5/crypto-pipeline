import rascal from 'rascal';
import rascalConfig from '../config/rascalConfig.js';
import { cryptoAssets } from '../config/config.js';


// Publishes messages to the RabbitMQ's 'stock_pub' publication
const runPublisher = async () => {

    // Create a Rascal broker
    rascal.Broker.create(rascalConfig, (err, broker) => {

        // Check for errors
        if (err) throw err;

        // Log errors from the broker
        broker.on('error', console.error);

        // Publish messages to the 'stock_pub' publication
        setInterval(() => {

            // Generate a random asset and price
            const randomIndex = Math.floor(Math.random() * cryptoAssets.length);
            const randomAsset = cryptoAssets[randomIndex];
            const randomPrice = (Math.random() * 100000).toFixed(2);

            // Create a random message
            const message = {
                symbol: randomAsset,
                price: randomPrice,
                timestamp: new Date().toISOString(),
            };

            // Publish the message
            broker.publish('stock_pub', message, (err) => {

                if (err) console.error('[!] Publish error:', err);

                else console.log('[x] Sent:', message);
            });

        }, 1000); // Publish every 1 second
    });
}

export default runPublisher;

if (import.meta.url === `file://${process.argv[1]}`) {
    runPublisher();
}