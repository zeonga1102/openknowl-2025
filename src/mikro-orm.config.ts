import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import dotenv from 'dotenv';
import path from 'path';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

const config: Options = {
    entities: [],
    dbName: process.env.dbName,
    driver: PostgreSqlDriver,
    user: process.env.user,
    password: process.env.password,
    host: process.env.host,
    port: Number(process.env.port),
    debug: true,
    metadataProvider: TsMorphMetadataProvider
};

export default config;