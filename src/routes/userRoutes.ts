import { Router } from 'express';

import { signup, login } from '../controllers/userController';
import { validateDto } from '../middlewares/validate';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { LoginDto } from '../dtos/LoginDto';

const router = Router();

router.post('/signup', validateDto(CreateUserDto), signup);
router.post('/login', validateDto(LoginDto), login);

export const userRouter = router;