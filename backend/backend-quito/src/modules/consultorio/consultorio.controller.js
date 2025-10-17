import Sede from '../sede/sede.model.js';
import Consultorio from '../consultorio/consultorio.model.js';

export const listarConsultorios = async (req, res) => {
  try {
    const consultorios = await Consultorio.find().select('_id nombre');
    return res.json({ consultorios: consultorios });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor al listar sedes' });
  }
}

export const listarConsultoriosPorSede = async (req, res) => {
  try {
    const sedeId = req.params.id;
    const consultorios = await Consultorio.find({ sede: sedeId }).select('_id codigo nombre');
    if (consultorios.length === 0) {
      return res.status(404).json({ message: 'No se encontraron consultorios para esta sede.' });
    }

    return res.json({ consultorios: consultorios });

  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Formato de ID de sede inválido.' });
    }
    return res.status(500).json({ error: 'Error del servidor al listar consultorios por sede.' });
  }
}

export const crearConsultorio = async (req, res) => {
  try {
    const { sedeId, codigo, nombre, piso, especialidad } = req.body

    const sede = await Sede.findById(sedeId)
    if (!sede) {
      return res.status(404).json({ error: 'La sede no existe' })
    }
    const nuevo = new Consultorio({
      sede: sedeId, // referencia al ObjectId de la sede
      codigo,
      nombre,
      piso,
      especialidad
    })

    const saved = await nuevo.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
