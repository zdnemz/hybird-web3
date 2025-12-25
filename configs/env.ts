const env = {
  APP: {
    REDIS_URL: process.env.REDIS_URL as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
  },
};

export default env;
