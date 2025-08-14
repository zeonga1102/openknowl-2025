import { Router } from 'express';

import { CreateMClassDto, GetMClassListQueryDto, IdParamDto } from '../dtos';
import { validateBody, validateQuery, validateParam } from '../middlewares/validate';
import { verifyJwt } from '../middlewares/authenticate';
import { create, getList, getDetail } from '../controllers/mclassController';

const router = Router();

router.post('/', verifyJwt, validateBody(CreateMClassDto), create);
router.get('/', validateQuery(GetMClassListQueryDto), getList);
router.get('/:id', validateParam(IdParamDto), getDetail);

export const mclassRouter = router;