import express from 'express';
import { RequestContext } from '@mikro-orm/postgresql';

import { DI } from './index';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(DI.orm.em, next);
});

export default app;