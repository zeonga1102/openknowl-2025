import { Router } from 'express';

import { CreateMClassDto, GetMClassListQueryDto } from '../dtos';
import { validateBody, validateQuery } from '../middlewares/validate';
import { verifyJwt } from '../middlewares/authenticate';
import { create, getList } from '../controllers/mclassController';

const router = Router();

router.post('/', verifyJwt, validateBody(CreateMClassDto), create);
router.get('/', validateQuery(GetMClassListQueryDto), getList);

export const mclassRouter = router;