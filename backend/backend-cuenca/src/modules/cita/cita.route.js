import { Router } from 'express';
import {
    listarPorMedico, listarPorEstadoParaMedico,
    listarPorEspecialidad, crearCitaMedico, crearCitaSecretaria,editarCitaMedico,
    cancelarCita, editarCitaSecretaria,listarPorEstado, finalizarCita
} from './cita.controller.js';
import { authRequired } from '../../middlewares/ValidateToken.js';
const router = Router();
// Listar por diferentes tipos de citas
router.get('/listar-por-medico/:id', authRequired, listarPorMedico);
router.get('/listar-desde-medico/:id', authRequired, listarPorEstadoParaMedico);
router.get('/listar-por-especialidad/:id', listarPorEspecialidad);
router.get('/listar-por-estado/:id', listarPorEstado);
// Crea citas desde 2 tipos de roles
router.post('/crear-cita-medico', authRequired, crearCitaMedico);
router.post('/crear-cita-secretaria', authRequired, crearCitaSecretaria);

// Edita cistas desde 2 tipos de roles
router.patch('/editar-cita-secretaria', authRequired, editarCitaSecretaria);
router.patch('/editar-cita-medico', authRequired, editarCitaSecretaria);

// Finalizar
router.post('/finalizar-cita', authRequired, finalizarCita);



router.patch('/cancelar', authRequired, cancelarCita);


export default router;