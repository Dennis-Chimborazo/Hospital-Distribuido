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
export const crearEspecialidad = async (req, res) => {
  try {

    const { nombre, descripcion } = req.body;
    const existe = await Especialidad.findOne({ nombre });
    if (existe) {
      return res.status(409).json({ message: 'Ya existe una especialidad con ese nombre' });
    }
    const especialidad = await Especialidad.create({ nombre, descripcion });
    return res.status(201).json({
      ok: true,
      message: 'Especialidad creada',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: 'Error del servidor',
    });
  }
};

export const editarEspecialidad = async (req, res) => {
const { nombre, descripcion } = req.body

  try {
    const existe = await Especialidad.findOne({ nombre });
    if (existe) {
      return res.status(409).json({ message: 'Ya existe una especialidad con ese nombre' });
    }
    const especialidad = await Especialidad.findByIdAndUpdate(req.params.id, {
      nombre,descripcion
    });

    return res.json({ mesagge: "Especialidad editada" });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error del servidor');
  }
}

export const softDelete = async (req, res) => {
  const { estado } = req.body;
  const id = req.params.id;
  try {

    if (!id) {
      return res.status(400).json({ message: 'Revisa la especificación que deseas eliminar.' });
    }

    const especialidad = await Especialidad.findByIdAndUpdate(
      req.params.id,
      { activa: estado }
    );
    if (!especialidad) {
      return res.status(404).json({
        ok: false,
        message: 'Especialidad no encontrada',
      });
    }
    return res.status(200).json({
      ok: true,
      message: 'Especialidad desactivada correctamente',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: 'Error del servidor',
    });
  }
};
