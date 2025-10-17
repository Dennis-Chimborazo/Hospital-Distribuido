import Secretaria from './secretaria.model.js';
import Rol from '../rol/rol.model.js';
import { crearPersona } from '../persona/persona.controller.js';
import { crearUsuario } from '../user/user.service.js';

export const listarSecretarias = async (req, res) => {
    try {
        const secretarias = await Secretaria.find({ estado: true })
            .select('_id persona oficina rol_secretaria horario')
            .populate('persona', 'nombres apellidos identificacion')
            .populate('oficina', 'nombre')
            .lean();
        return res.json({ secretarias: secretarias });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error del servidor al listar secretarias' });
    }
};

export const crearSecretaria = async (req, res) => {
    try {
        const resultado = await crearPersona(req.body);
        if (!resultado.success) {
            return res.status(409).json({ message: resultado.message });
        }

        const persona = resultado.persona;
        const { oficina, rol_secretaria, horario, sede } = req.body;

        if (!oficina) {
            return res.status(400).json({ message: 'oficina es obligatoria.' });
        }
        if (!rol_secretaria) {
            return res.status(400).json({ message: 'rol_secretaria es obligatoria.' });
        }
        const secretaria = new Secretaria({
            persona: persona._id,
            oficina,
            sede,
            rol_secretaria,
            horario
        });

        await secretaria.save();

        const nombreRol = process.env.SECRET_USER_SECRETARIA_KEY;
        const rol = await Rol.findOne({ nombre: nombreRol });

        await crearUsuario({
            email: req.body.email,
            sede: req.body.sede,
            rol: rol._id.toString(),
            persona: persona._id
        });

        const creado = await Secretaria.findById(secretaria._id)
            .populate('persona').populate('oficina');

        return res.status(201).json(creado);

    } catch (error) {
        if (error?.code === 11000) {
            const campo = Object.keys(error.keyPattern || {})[0] || 'campo único';
            return res.status(409).json({ message: `Duplicado en ${campo}.` });
        }
        console.error('Error creando secretaria:', error);
        return res.status(500).json({ error: 'Error del servidor al crear secretaria.' });
    }
};

export const editarSecretaria = async (req, res) => {
    try {
        const { id, persona, oficina, rol_secretaria, horario } = req.body;
        const secretaria = await Secretaria.findByIdAndUpdate(id, {
            persona,
            oficina,
            rol_secretaria,
            horario
        });

        return res.json({ secretaria });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error del servidor al editar secretaria' });
    }
};

export const softDeleteSecretaria = async (req, res) => {

    const id = req.params.id;
    const eliminadoLogico = false;
    try {

        if (!id) {
            return res.status(400).json({ message: 'Revisa la especificación que deseas eliminar.' });
        }

        const secretaria = await Secretaria.findByIdAndUpdate(
            req.params.id,
            { estado: eliminadoLogico }
        );

        if (!secretaria) {
            return res.status(404).json({
                ok: false,
                message: 'Secretaria no encontrada',
            });
        }
        return res.status(200).json({
            ok: true,
            message: 'Secretaria desactivada correctamente',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            message: 'Error del servidor',
        });
    }
};

export const buscarSecretaria = async (req, res) => {
    const id = req.params.id;
    try {

        const secretarias = await Secretaria.find({ _id: id }).select('_id  ')
            .populate('persona')
            .lean();
        return res.json({ secretarias });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error del servidor al listar secretarias' });
    }
};  