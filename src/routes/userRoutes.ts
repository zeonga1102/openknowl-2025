import { Router } from 'express';

import { signup, login } from '../controllers/userController';
import { getList } from '../controllers/applicationController';
import { validateBody, validateQuery } from '../middlewares/validate';
import { verifyJwt } from '../middlewares/authenticate';
import { CreateUserDto, LoginDto, GetListQueryDto } from '../dtos';

const router = Router();

router.post('/signup', validateBody(CreateUserDto), signup);
router.post('/login', validateBody(LoginDto), login);
router.get('/applications', verifyJwt, validateQuery(GetListQueryDto), getList);

export const userRouter = router;