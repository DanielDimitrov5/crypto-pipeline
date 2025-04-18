import isLocal from './env.js';

export const redisConfig = {
  host: isLocal ? 'localhost' : 'redis', // Docker: 'redis' | Local: 'localhost'
  port: isLocal ? 6666 : 6379, // Docker: 6379 | Local: 6666
};

export const rabbitConfig = {
  url: isLocal ? 'amqp://localhost' : 'amqp://rabbitmq', // Docker: 'amqp://rabitmq' | Local: 'amqp://localhost' 
  queueName: 'stock_prices',
};

export const cryptoAssets = [
  'BTC',
  'ETH',
  'LTC',
  'XRP',
  'BCH',
  'ADA',
  'DOT',
  'LINK',
  'SOL',
  'MATIC',
]
