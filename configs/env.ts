const env = {
  APP: {
    NODE_ENV: (process.env.JWT_SECRET as string) || "development",
    JWT_SECRET: process.env.JWT_SECRET as string,
    REDIS_URL: process.env.REDIS_URL as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
  },
};

export default env;
