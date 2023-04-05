const redis = require("redis");
const client = redis.createClient();

client
  .connect()
  .then(() => console.log("connect to redis server successfully"))
  .catch(console.error);

module.exports = client;
