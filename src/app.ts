import express from 'express';
import { RequestContext } from '@mikro-orm/postgresql';

import { DI } from './index';
import { userRouter, mclassRouter } from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(DI.orm.em, next);
});

app.use('/api/users', userRouter);
app.use('/api/mclasses', mclassRouter);

app.use(errorHandler);

export default app;