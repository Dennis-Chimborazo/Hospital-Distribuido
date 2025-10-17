import Medico from '../medico/medico.model.js'
import { getIdSede } from '../sede/sede.service.js';

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
export const listarMedicosPorEspecialidad = async (req, res) => {
  const sede = await getIdSede();
  try {
    const medicos = await Medico.find({ estado: true, especialidad: req.params.id, sede: sede._id.toString() })
      .select('_id persona')
      .populate('persona', 'nombres apellidos')
      .lean();
    return res.json({ medicos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor al listar medicos' });
  }
};