import {Router} from 'express';
import {login,logout,register} from './auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/res', register);

export default router;
