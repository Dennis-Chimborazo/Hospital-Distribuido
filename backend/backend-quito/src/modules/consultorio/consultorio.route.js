import {Router} from 'express';
import {listarConsultoriosPorSede,listarConsultorios} from './consultorio.controller.js';
const router = Router();

router.get('/listar-consultorios', listarConsultorios);
router.get('/listar-consultorios/:id', listarConsultoriosPorSede);

export default router;
