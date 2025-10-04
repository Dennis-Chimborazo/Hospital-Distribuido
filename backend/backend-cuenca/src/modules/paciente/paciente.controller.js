import Paciente from './paciente.model.js';
import { crearPersona } from '../persona/persona.controller.js';

export async function crearPaciente(req, res) {

  try {
    const resultado = await crearPersona(req.body);
    if (!resultado.success) {
      return res.status(409).json({ message: resultado.message });
    }

    const persona = resultado.persona;

    const paciente = new Paciente({
      persona: persona._id,
      grupo_sanguineo: req.body.grupo_sanguineo,
      alergias: req.body.alergias,
      antecedente_familiar: req.body.antecedente_familiar,
    });

    await paciente.save();

    return  res.json({ success: true, paciente:paciente });

  } catch (error) {
    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern || {})[0] || 'campo único';
      return { success: false, message: `Duplicado en ${campo}` };
    }

    console.error('Error al crear paciente:', error);
    return { success: false, message: 'Error del servidor al crear paciente' };
  }
}

export async function listarPacientes(req, res) {
  try {
    const pacientes = await Paciente.find().select('_id grupo_sanguineo persona')
      .populate('persona', 'nombres apellidos identificacion')
      .lean();
    return res.json({ pacientes: pacientes });
  } catch (error) {
    console.error('Error al listar pacientes:', error);
    return res.status(500).json({ error: 'Error del servidor al listar pacientes' });
  }
}

export async function buscarPaciente(req, res) {
  const idParam = req.params.id;

  try {
    const paciente = await Paciente.findOne({ _id: idParam })
    return res.json({ paciente: paciente });
  } catch (error) {
    console.error("Error al buscar paciente por ID:", error);
    return null;
  }
}

export async function actualizarPaciente(req, res) {

  try {
    if (req.body.identificacion) {
      const existeIdent = await Paciente.findOne({ identificacion: req.body.identificacion });
      if (existeIdent) {
        return { success: false, message: 'Ya existe un paciente con esa identificación' };
      }
    }

    console.log(req.body);
    const paciente = await Paciente.findByIdAndUpdate(req.params.id, {
      grupo_sanguineo: req.body.grupo_sanguineo,
      alergias: req.body.alergias,
      antecedente_familiar: req.body.antecedente_familiar,
    });

    return res.json({ paciente });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor al editar paciente' });
  }
}