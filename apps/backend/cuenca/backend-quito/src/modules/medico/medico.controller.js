import Medico from '../medico/medico.model.js'
import Rol from '../rol/rol.model.js'
import { crearPersona } from '../persona/persona.controller.js'
import { crearUsuario } from '../user/user.service.js';


export const listarMedicos = async (req, res) => {
  try {
    const medicos = await Medico.find({ estado: true })
      .select('_id persona consultorio especialidad sede horario')
      .populate('persona', 'nombres apellidos identificacion')
      .populate('consultorio', 'nombre')
      .populate('especialidad', 'nombre')
      .populate('sede', 'nombre')
      .lean();
    return res.json({ medicos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor al listar medicos' });
  }
};

export const crearMedico = async (req, res) => {
  try {
    const resultado = await crearPersona(req.body);
    if (!resultado.success) {
      return res.status(409).json({ message: resultado.message });
    }

    const persona = resultado.persona;
    const { consultorio, especialidad, horario, sede } = req.body;

    if (!consultorio) {
      return res.status(400).json({ message: 'consultorio es obligatorio.' });
    }
    if (!especialidad) {
      return res.status(400).json({ message: 'especialidad es obligatoria.' });
    }
    const medico = new Medico({
      persona: persona._id,
      consultorio,
      especialidad: especialidad,
      horario,
      sede
    });

    await medico.save();

    const nombreRol = process.env.SECRET_USER_MEDICO_KEY;
    const rol = await Rol.findOne({ nombre: nombreRol });
    await crearUsuario({
      email: req.body.email,
      sede: req.body.sede,
      rol: rol._id.toString(),
      persona: persona._id
    });

    const creado = await Medico.findById(medico._id)
      .populate('persona').populate('consultorio')
      .populate('especialidad').populate('sede');

    return res.status(201).json(creado);

  } catch (error) {
    if (error?.code === 11000) {
      const campo = Object.keys(error.keyPattern || {})[0] || 'campo único';
      return res.status(409).json({ message: `Duplicado en ${campo}.` });
    }
    console.error('Error creando médico:', error);
    return res.status(500).json({ error: 'Error del servidor al crear médico.' });
  }
};

export const editarMedico = async (req, res) => {
  try {
    const { id, persona, consultorio, especialidades, horario } = req.body;
    const medico = await Medico.findByIdAndUpdate(id, {
      persona,
      consultorio,
      especialidades,
      horario
    });

    return res.json({ medico });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor al editar medico' });
  }
};

export const softDeleteMedico = async (req, res) => {

  const id = req.params.id;
  const eliminadoLogico = false;
  try {

    if (!id) {
      return res.status(400).json({ message: 'Revisa la especificación que deseas eliminar.' });
    }

    const medico = await Medico.findByIdAndUpdate(
      req.params.id,
      { estado: eliminadoLogico }
    );
    
    if (!medico) {
      return res.status(404).json({
        ok: false,
        message: 'Medico no encontrada',
      });
    }
    return res.status(200).json({
      ok: true,
      message: 'Medico desactivada correctamente',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: 'Error del servidor',
    });
  }
};

export const buscarMedico = async (req, res) => {
  const id = req.params.id;
  try {
    
    const medicos = await Medico.find({ _id: id }).select('_id  ')
      .populate('persona')
      .lean();
    return res.json({ medicos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor al listar medicos' });
  }
};
