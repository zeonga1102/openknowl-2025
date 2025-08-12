import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

import { User } from './entities/User';
import { ENV } from './config/env';

const config: Options = {
  entities: [User],
  dbName: ENV.DB.NAME,
  driver: PostgreSqlDriver,
  user: ENV.DB.USER,
  password: ENV.DB.PASSWORD,
  host: ENV.DB.HOST,
  port: Number(ENV.DB.PORT),
  debug: true,
  metadataProvider: TsMorphMetadataProvider
};

export default config;