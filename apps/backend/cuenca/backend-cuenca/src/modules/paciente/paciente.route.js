import {Router} from 'express';
import {buscarPaciente,crearPaciente,actualizarPaciente,listarPacientes} from './paciente.controller.js';
const router = Router();

router.get('/listar',listarPacientes);
router.get('/buscar/:id',buscarPaciente);
router.post('/crear', crearPaciente);
router.patch('/edit/:id', actualizarPaciente);

export default router;