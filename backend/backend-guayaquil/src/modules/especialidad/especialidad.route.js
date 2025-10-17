import {Router} from 'express';
import {listarEspecialidades} from './especialidad.controller.js';
const router = Router();

router.get('/listar-especialidades', listarEspecialidades);
export default router;
