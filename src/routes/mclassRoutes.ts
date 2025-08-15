import { Router } from 'express';

import { CreateMClassDto, GetListQueryDto, IdParamDto } from '../dtos';
import { validateBody, validateQuery, validateParam } from '../middlewares/validate';
import { verifyJwt } from '../middlewares/authenticate';
import { create, getList, getDetail, deleteMclass, apply } from '../controllers/mclassController';

const router = Router();

router.post('/', verifyJwt, validateBody(CreateMClassDto), create);
router.get('/', validateQuery(GetListQueryDto), getList);
router.get('/:id', validateParam(IdParamDto), getDetail);
router.delete('/:id', verifyJwt, validateParam(IdParamDto), deleteMclass);
router.post('/:id/apply', verifyJwt, validateParam(IdParamDto), apply);

export const mclassRouter = router;