import {Router} from 'express';
import {listarMedicos,listarMedicosPorEspecialidad} from './medico.controller.js';
const router = Router();

router.get('/listar', listarMedicos);
router.get('/listar-especialidad/:id', listarMedicosPorEspecialidad);

export default router;
