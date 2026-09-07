const Redis = require('ioredis');
const logger = require('../utils/logger');
const constants = require('./constants');

let redisClient = null;
let isConnected = false;

const initRedis = async () => {
    try {
        if (redisClient) {
            return redisClient;
        }

        const config = constants.REDIS;
        
        redisClient = new Redis({
            host: config.HOST,
            port: config.PORT,
            password: config.PASSWORD || undefined,
            db: config.DB,
            keyPrefix: config.KEY_PREFIX,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: false
        });

        // Event handlers
        redisClient.on('connect', () => {
            logger.info('✅ Redis connected successfully');
            isConnected = true;
        });

        redisClient.on('ready', () => {
            logger.info('✅ Redis is ready');
            isConnected = true;
        });

        redisClient.on('error', (error) => {
            logger.error('❌ Redis error:', error);
            isConnected = false;
        });

        redisClient.on('close', () => {
            logger.warn('⚠️ Redis connection closed');
            isConnected = false;
        });

        redisClient.on('reconnecting', () => {
            logger.info('🔄 Redis reconnecting...');
        });

        // Test connection
        await redisClient.ping();
        logger.info('✅ Redis connection verified');

        return redisClient;
    } catch (error) {
        logger.error('❌ Failed to initialize Redis:', error);
        throw error;
    }
};

const getRedis = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call initRedis() first.');
    }
    return redisClient;
};

const isRedisConnected = () => isConnected;

// Redis utility functions
const redisUtils = {
    // Cache helper
    async getCache(key) {
        try {
            const client = getRedis();
            const data = await client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Redis getCache error:', error);
            return null;
        }
    },

    async setCache(key, value, ttl = 3600) {
        try {
            const client = getRedis();
            const data = JSON.stringify(value);
            if (ttl > 0) {
                await client.setex(key, ttl, data);
            } else {
                await client.set(key, data);
            }
            return true;
        } catch (error) {
            logger.error('Redis setCache error:', error);
            return false;
        }
    },

    async deleteCache(key) {
        try {
            const client = getRedis();
            await client.del(key);
            return true;
        } catch (error) {
            logger.error('Redis deleteCache error:', error);
            return false;
        }
    },

    // Queue helper
    async pushToQueue(queueName, data) {
        try {
            const client = getRedis();
            await client.lpush(queueName, JSON.stringify(data));
            return true;
        } catch (error) {
            logger.error('Redis pushToQueue error:', error);
            return false;
        }
    },

    async popFromQueue(queueName) {
        try {
            const client = getRedis();
            const data = await client.rpop(queueName);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Redis popFromQueue error:', error);
            return null;
        }
    },

    // Pub/Sub helper
    async publish(channel, message) {
        try {
            const client = getRedis();
            await client.publish(channel, JSON.stringify(message));
            return true;
        } catch (error) {
            logger.error('Redis publish error:', error);
            return false;
        }
    },

    subscribe(channel, callback) {
        try {
            const client = getRedis();
            client.subscribe(channel);
            client.on('message', (ch, message) => {
                if (ch === channel) {
                    try {
                        const data = JSON.parse(message);
                        callback(data);
                    } catch (error) {
                        logger.error('Redis subscribe parse error:', error);
                    }
                }
            });
            return true;
        } catch (error) {
            logger.error('Redis subscribe error:', error);
            return false;
        }
    },

    // Rate limiter
    async rateLimit(key, limit, window) {
        try {
            const client = getRedis();
            const current = await client.incr(key);
            
            if (current === 1) {
                await client.expire(key, window);
            }
            
            return current <= limit;
        } catch (error) {
            logger.error('Redis rateLimit error:', error);
            return true; // Fail open
        }
    },

    // Lock
    async acquireLock(key, ttl = 10000) {
        try {
            const client = getRedis();
            const result = await client.set(key, 'locked', 'NX', 'PX', ttl);
            return result === 'OK';
        } catch (error) {
            logger.error('Redis acquireLock error:', error);
            return false;
        }
    },

    async releaseLock(key) {
        try {
            const client = getRedis();
            await client.del(key);
            return true;
        } catch (error) {
            logger.error('Redis releaseLock error:', error);
            return false;
        }
    },

    // Health check
    async healthCheck() {
        try {
            const client = getRedis();
            await client.ping();
            return true;
        } catch (error) {
            logger.error('Redis healthCheck error:', error);
            return false;
        }
    }
};

module.exports = {
    initRedis,
    getRedis,
    isRedisConnected,
    redisUtils
};