import { Router } from 'express';

import { validateDto } from '../middlewares/validate';
import { CreateMClassDto } from '../dtos/CreateMClassDto';
import { verifyJwt } from '../middlewares/authenticate';
import { create } from '../controllers/mclassController';

const router = Router();

router.post('/', verifyJwt, validateDto(CreateMClassDto), create);

export const mclassRouter = router;