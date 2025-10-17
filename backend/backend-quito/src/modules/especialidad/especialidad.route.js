import {Router} from 'express';
import {listarEspecialidades,crearEspecialidad, editarEspecialidad, softDelete} from './especialidad.controller.js';
const router = Router();

router.get('/listar-especialidades', listarEspecialidades);
router.post('/crear', crearEspecialidad);
router.patch('/delete/:id', softDelete);
router.put('/edit/:id', editarEspecialidad);


export default router;
