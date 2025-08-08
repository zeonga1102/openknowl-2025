import { MikroORM, EntityManager } from '@mikro-orm/postgresql';
import http from 'http';

import config from './mikro-orm.config';
import app from './app';

export const DI = {} as {
  server: http.Server;
  orm: MikroORM;
  em: EntityManager;
};

const start = async () => {
  const orm = await MikroORM.init(config);
  DI.orm = orm;
  DI.em = DI.orm.em;

  app.listen(3000, () => console.log('Server running'));
};

start();