import Paciente from './paciente.model.js';
import { crearPersona } from '../persona/persona.controller.js';
import Persona from '../persona/persona.model.js';

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

    return res.json({ success: true, paciente: paciente });

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
  const cedula = String((req.params.id ?? req.query.cedula ?? '')).trim();

  try {
    // 1) Buscar la Persona por cédula
    const persona = await Persona.findOne({ identificacion: cedula })
      .select('nombres apellidos identificacion')
      .lean();

    if (!persona) {
      return res.status(404).json({ message: 'No existe una persona con esa cédula.' });
    }

    // 2) Buscar el Paciente que referencia a esa Persona
    const paciente = await Paciente.findOne({ persona: persona._id })
      .select('-__v -updatedAt -createdAt') // opcional
      .lean();

    if (!paciente) {
      return res.status(404).json({ message: 'Persona encontrada, pero no tiene registro de paciente.' });
    }

    // Responder unificado (paciente + persona poblada manualmente)
    console.log(paciente);
    return res.json({ paciente: { ...paciente, persona } });
  } catch (error) {
    console.error('Error al buscar paciente por cédula:', error);
    return res.status(500).json({ error: 'Error del servidor al buscar paciente.' });
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