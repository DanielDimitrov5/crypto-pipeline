import Redis from 'ioredis';
import { db } from '../db/db.js';
import { cryptoAssets, redisConfig } from '../config/config.js';

const redis = new Redis(redisConfig);

// BLPOPs the Redis lists for the given symbols and updates the database
export default async function runRedisToDb(symbols) {

  console.log('[*] Waiting for updates from Redis...');

  while (true) {

    try {

      // Block until a value appears in one of the symbol lists
      const [, json] = await redis.blpop(symbols, 0);
      const data = JSON.parse(json);

      // Insert or update the asset in the database
      await db.query(`
        INSERT INTO assets (symbol, price, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (symbol)
        DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at;
      `, [data.symbol, data.price, data.timestamp]);

      console.log(`[✓] Updated ${data.symbol} in DB: $${data.price}`);
    } 
    catch (err) {

      console.error('[!] Error in BLPOP worker:', err);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runRedisToDb(cryptoAssets); // watch these symbols
}
