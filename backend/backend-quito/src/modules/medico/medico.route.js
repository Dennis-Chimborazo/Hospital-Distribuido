import {Router} from 'express';
import {listarMedicos, crearMedico, editarMedico, softDeleteMedico} from './medico.controller.js';
const router = Router();

router.get('/listar', listarMedicos);
router.post('/crear', crearMedico);
router.patch('/delete/:id', softDeleteMedico);
router.put('/edit/:id', editarMedico);


export default router;
