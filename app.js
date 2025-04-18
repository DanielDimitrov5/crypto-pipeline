import runPublisher from './workers/publisher.js';
import runConsumer from './workers/consumer.js';
import runRedisToDb from './workers/redisToDb.js';
import { cryptoAssets } from './config/config.js';

runPublisher();
runConsumer();
runRedisToDb(cryptoAssets);