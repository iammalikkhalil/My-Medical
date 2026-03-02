Object.assign(process.env, {
  NODE_ENV: process.env.NODE_ENV || "test",
  SESSION_SECRET: process.env.SESSION_SECRET || "12345678901234567890123456789012",
  APP_USERNAME: process.env.APP_USERNAME || "admin",
  APP_PASSWORD: process.env.APP_PASSWORD || "password",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medkit-test",
});

