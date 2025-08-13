import { Router } from 'express';

import { signup, login } from '../controllers/userController';
import { validateBody } from '../middlewares/validate';
import { CreateUserDto, LoginDto } from '../dtos';

const router = Router();

router.post('/signup', validateBody(CreateUserDto), signup);
router.post('/login', validateBody(LoginDto), login);

export const userRouter = router;