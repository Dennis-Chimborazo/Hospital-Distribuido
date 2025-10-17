import {Router} from 'express';
import {listarSedes} from './sede.controller.js';
const router = Router();

router.get('/listar-sedes', listarSedes);

export default router;
