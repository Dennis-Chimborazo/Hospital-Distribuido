import {Router} from 'express';
import {buscarPersona} from './persona.controller.js';

const router = Router();
router.get('/buscar/:id',buscarPersona);

export default router;