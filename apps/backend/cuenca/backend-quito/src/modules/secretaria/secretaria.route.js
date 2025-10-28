import { Router } from 'express';
import { listarSecretarias, crearSecretaria, editarSecretaria, softDeleteSecretaria } from './secretaria.controller.js';
const router = Router();

router.get('/listar', listarSecretarias);
router.post('/crear', crearSecretaria);
router.patch('/delete/:id', softDeleteSecretaria);
router.put('/edit/:id', editarSecretaria);

export default router;