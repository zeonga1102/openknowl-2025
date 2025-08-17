import dotenv from 'dotenv';
import path from 'path';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(__dirname, '..', '..', envFile) });

export const ENV = {
  DB: {
    NAME: process.env.dbName,
    USER: process.env.dbUser,
    PASSWORD: process.env.dbPassword,
    HOST: process.env.dbHost,
    PORT: Number(process.env.dbPort),
  },
  JWT: {
    SECRET_KEY: process.env.jwtSecretKey as string,
    EXPIRES_IN: process.env.jwtExpiresIn,
    REFRESH_SECRET_KEY: process.env.jwtRefreshSecretKey as string,
    REFRESH_EXPIRES_IN: process.env.jwtRefreshtExpiresIn
  },
  COOKIE: {
    MAX_AGE: Number(process.env.cookieMaxAge)  * 24 * 60 * 60 * 1000
  }
};