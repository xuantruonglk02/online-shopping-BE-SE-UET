const redis = require('redis');
const RedisStore = require('connect-redis').default;

// Initialize client
// Note that the redis server ip must be the same localhost ip
const redisClient = redis.createClient();
redisClient
    .connect()
    .then(() => console.log('Redis: Connect to server successfully'))
    .catch(console.error);

// Initialize store.
const redisStore = new RedisStore({
    client: redisClient,
    // prefix: 'myapp:',
});

module.exports = { redisClient, redisStore };
