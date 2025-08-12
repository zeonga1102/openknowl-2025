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
    SECRET_KEY: process.env.jwtSecretKey as string
  }
};