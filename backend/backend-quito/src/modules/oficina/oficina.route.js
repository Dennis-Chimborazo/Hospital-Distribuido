import {Router} from 'express';
import {listarOficinas, listarOficinasPorSede} from './oficina.controller.js';
const router = Router();

router.get('/listar-oficinas', listarOficinas);
router.get('/listar-oficinas/:id', listarOficinasPorSede);

export default router;