import Especialidad from '../especialidad/especialidad.model.js';

export const listarEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.find({ activa: true }).select('_id nombre descripcion');
    return res.json({ especialidades: especialidades });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor al listar sedes' });
  }

}

