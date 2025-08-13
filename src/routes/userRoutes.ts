import { Router } from 'express';

import { signup, login } from '../controllers/userController';
import { validateDto } from '../middlewares/validate';
import { CreateUserDto, LoginDto } from '../dtos';

const router = Router();

router.post('/signup', validateDto(CreateUserDto), signup);
router.post('/login', validateDto(LoginDto), login);

export const userRouter = router;