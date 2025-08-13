import { Router } from 'express';

import { CreateMClassDto } from '../dtos';
import { validateDto } from '../middlewares/validate';
import { verifyJwt } from '../middlewares/authenticate';
import { create } from '../controllers/mclassController';

const router = Router();

router.post('/', verifyJwt, validateDto(CreateMClassDto), create);

export const mclassRouter = router;