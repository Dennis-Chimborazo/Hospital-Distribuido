// src/modules/persona/persona.service.js
import Persona from './persona.model.js';

export async function crearPersona(data) {
  try {
    // 1) Validar duplicados manualmente
    if (data.identificacion) {
      const existeIdent = await Persona.findOne({ identificacion: data.identificacion });
      if (existeIdent) {
        return { success: false, message: 'Ya existe una persona con esa identificación' };
      }
    }
    if (data.email) {
      const existeEmail = await Persona.findOne({ email: data.email });
      if (existeEmail) {
        return { success: false, message: 'Ya existe una persona con ese email' };
      }
    }

    // 2) Crear y guardar
    const persona = new Persona({
      nombres: data.nombres,
      apellidos: data.apellidos,
      identificacion: data.identificacion,
      fecha_nacimiento: data.fecha_nacimiento,
      sexo: data.sexo,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion,
    });

    await persona.save();

    return { success: true, persona };

  } catch (error) {
    // 3) Controlar error de índice único
    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern || {})[0] || 'campo único';
      return { success: false, message: `Duplicado en ${campo}` };
    }

    console.error('Error al crear persona:', error);
    return { success: false, message: 'Error del servidor al crear persona' };
  }
}
export async function buscarPersona(req, res) {
const idParam = req.params.id;

  try {
    const persona = await Persona.findOne({ _id: idParam })
        return res.json({ persona: persona });

    
  } catch (error) {
      console.error("Error al buscar persona por ID:", error);
    // Podrías relanzar el error o retornar null, dependiendo de cómo quieras manejarlo.
    // Retornar null es una opción simple aquí, indicando que la búsqueda falló.
    return null; 
  }
}

export async function actualizarPersona(req, res) {
  
  try {
    if (req.body.identificacion) {
      const existeIdent = await Persona.findOne({ identificacion: req.body.identificacion });
      if (existeIdent) {
        return { success: false, message: 'Ya existe una persona con esa identificación' };
      }
    }
    if (data.email) {
      const existeEmail = await Persona.findOne({ email: req.body.email });
      if (existeEmail) {
        return { success: false, message: 'Ya existe una persona con ese email' };
      }
    }
    const persona = await Persona.findByIdAndUpdate(req.params.id, {
      nombres: req.body.nombres,
      apellidos: req.body.apellidos,
      identificacion: req.body.identificacion,
      fecha_nacimiento: req.body.fecha_nacimiento,
      sexo: req.body.sexo,
      telefono: req.body.telefono,
      email: req.body.email,
      direccion: req.body.direccion,
    });

    return res.json({ persona });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error del servidor al editar persona' });
  }
}