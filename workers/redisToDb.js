import Redis from 'ioredis';
import { db } from '../db/db.js';
import { cryptoAssets, redisConfig } from '../config/config.js';

const redis = new Redis(redisConfig);

// Define the consumer group name and consumer name
const GROUP_NAME = 'asset-workers';
const CONSUMER_NAME = 'worker-1';

// Ensure each stream has the consumer group created
const initGroups = async () => {

	// Loop through each asset in the cryptoAssets array
	for (const asset of cryptoAssets) {

		try {

			// Create a consumer group for each asset stream
			// The MKSTREAM option creates the stream if it doesn't exist
			// The '0' argument indicates that we want to start reading from the beginning of the stream
			// If the stream already exists, it will not be created again and the last delivered ID won't be reset
			await redis.xgroup('CREATE', asset + '_stream', GROUP_NAME, '0', 'MKSTREAM');

			console.log(`[+] Created group for ${asset}`);
		} catch (err) {

			if (!err.message.includes('BUSYGROUP')) {
				console.error(`[!] Error creating group for ${asset}:`, err);
			}
		}
	}
}

// Main function to run the Redis to DB consumer
const runRedisToDb = async () => {

	// Create the consumer group for each stream
	await initGroups();

	console.log('[*] Listening to Redis Streams via Consumer Group...');

	while (true) {

		try {

			// Append '_stream' to each asset in the cryptoAssets array
			const cryptoAssetStreams = cryptoAssets.map(asset => asset + '_stream');

			// Read from the Redis streams in a blocking manner
			// This will block until there are messages to read
			// The COUNT option limits the number of messages read at once
			// The STREAMS option specifies the streams to read from
			// The > symbol indicates that we want to read new messages
			const result = await redis.xreadgroup(
				'GROUP', GROUP_NAME, CONSUMER_NAME,
				'BLOCK', 0,
				'COUNT', 10,
				'STREAMS', ...cryptoAssetStreams,
				...cryptoAssetStreams.map(() => '>')
			);

			// Check if result is null or undefined
			if (!result) continue;

			// Loop through each stream and its entries
			for (const [stream, entries] of result) {

				// Loop through each entry in the stream
				// Destructure the entry to get the ID and JSON data
				for (const [id, [, json]] of entries) {

					try {

						// Parse the JSON data
						const data = JSON.parse(json);

						// Insert or update the asset in the database
						await db.query(
							`INSERT INTO assets (symbol, price, updated_at)
								VALUES ($1, $2, $3)
								ON CONFLICT (symbol)
								DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at;`,
							[data.symbol, data.price, data.timestamp]
						);

						// Acknowledge the message in the stream
						await redis.xack(stream, GROUP_NAME, id);

						console.log(`[✓] Updated ${data.symbol} in DB: $${data.price}`);

					} catch (err) {

						console.error(`[!] Error processing ${stream} [${id}]`, err);
					}
				}
			}
		} catch (err) {
			console.error('[!] Redis stream read error:', err);
		}
	}
}

export default runRedisToDb;

if (import.meta.url === `file://${process.argv[1]}`) {
	runRedisToDb();
}