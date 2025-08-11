import { Router } from 'express';

import { signup } from '../controllers/userController';
import { validateDto } from '../middlewares/validate';
import { CreateUserDto } from '../dtos/CreateUserDto';

const router = Router();

router.post('/signup', validateDto(CreateUserDto), signup);

export const userRouter = router;