import Redis from "ioredis";

let redis;

export const connectRedis = async () => {
  redis = new Redis(process.env.REDIS_URL);
  redis.on("error", err => {
    console.error("Redis error:", err);
  });
};

export const getRedis = () => redis;