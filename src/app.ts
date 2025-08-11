import express from 'express';
import { RequestContext } from '@mikro-orm/postgresql';

import { DI } from './index';
import { userRouter } from './routes/userRoutes';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(DI.orm.em, next);
});

app.use('/api/users', userRouter);

export default app;