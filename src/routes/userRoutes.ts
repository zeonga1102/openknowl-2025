import { Router } from 'express';

import { signup } from '../controllers/userController';

const router = Router();

router.post('/signup', signup);

export const userRouter = router;