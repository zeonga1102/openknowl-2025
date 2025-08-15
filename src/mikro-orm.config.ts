import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

import { User, MClass, Application } from './entities';
import { ENV } from './config';

const config: Options = {
  entities: [User, MClass, Application],
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