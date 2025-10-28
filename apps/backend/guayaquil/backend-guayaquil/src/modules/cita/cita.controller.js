import Cita from './cita.model.js';
import { getMedicoByPersona } from '../medico/medico.service.js';
import { getIdSede } from '../sede/sede.service.js';
import Consultorio from '../consultorio/consultorio.model.js';
import RecetaMedica from '../receta-medica/recetaMedica.model.js';

export const listarPorMedico = async (req, res) => {

    const medico = await getMedicoByPersona(req.user.id);
    if (!medico) {
        return res.status(404).json({ message: 'Medico no encontrado.' });
    }

    const citas = await Cita.find({ medico: medico._id.toString(), estado: 'PENDIENTE' })

    if (citas.length === 0) {
        return res.status(404).json({ message: 'No se encontraron citas pendientes.' });
    }
    return res.json({ message: "listar por medico" });
}

export const listarPorEspecialidad = async (req, res) => {
}

export const crearCitaMedico = async (req, res) => {
    const sede = await getIdSede();
    const medico = await getMedicoByPersona(req.user.id);

    if (!medico) {
        return res.status(404).json({ message: 'Medico no encontrado.' });
    }

    try {
        const cita = await Cita.create({
            sede: sede._id.toString(),
            medico: medico._id.toString(),
            paciente: req.body.paciente,
            motivo: req.body.motivo,
            fecha: req.body.fecha,
            hora: req.body.hora,
            creadoPor: req.user.id
        });
        return res.json({ mesagge: "Cita creada" });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error del servidor');
    }
}

export const crearCitaSecretaria = async (req, res) => {
    const sede = await getIdSede();
    try {
        const cita = await Cita.create({
            sede: sede._id.toString(),
            medico: req.body.medico,
            paciente: req.body.paciente,
            motivo: req.body.motivo,
            fecha: req.body.fecha,
            hora: req.body.hora,
            creadoPor: req.user.id
        });
        return res.json({ mesagge: "Cita creada" });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error del servidor');
    }

}

export const editarCitaSecretaria = async (req, res) => {
    try {
        const cita = await Cita.findByIdAndUpdate(req.body._id, {
            medico: req.body.medico,
            motivo: req.body.motivo,
            fecha: req.body.fecha,
            hora: req.body.hora,
            modificadoPor: req.user.id
        });
        return res.json({ mesagge: "Cita editada exitosamente." });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error del servidor');
    }
}

export const editarCitaMedico = async (req, res) => {
    try {
        const cita = await Cita.findByIdAndUpdate(req.params.id, {
            motivo: req.body.motivo,
            fecha: req.body.fecha,
            hora: req.body.hora,
            modificadoPor: req.user.id
        });
        return res.json({ mesagge: "Cita editada exitosamente." });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error del servidor');
    }
}

export const cancelarCita = async (req, res) => {
    try {

        const cita = await Cita.findByIdAndUpdate(req.body.id, {
            estado: 'CANCELADO',
            modificadoPor: req.user.id
        });
        return res.json({ mesagge: "Cita cancelada exitosamente.", });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({ message: "ID de cita inválido." });
        }
        console.error(error);
        return res.status(500).send({ message: 'Error del servidor al cancelar la cita.' });
    }
}

export const finalizarCita = async (req, res) => {
    try {
        const { id, observaciones, receta } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'ID de cita requerido.' });
        }

        // 1) Finalizar cita
        await Cita.findByIdAndUpdate(id, {
            estado: 'FINALIZADO',
            observaciones: observaciones ?? '',
            modificadoPor: req.user.id,
        });

        // 2) Crear receta médica (opcional, según tu schema real)
        let recetaDoc = null;

        if (receta?.agregar === true) {
            // El médico que finaliza la cita (desde el usuario autenticado)
            const medico = await getMedicoByPersona(req.user.id);
            if (!medico?._id) {
                return res.status(400).json({ message: 'No fue posible resolver el médico del usuario.' });
            }

            // Sanitiza medicamentos
            const meds = Array.isArray(receta.medicamentos)
                ? receta.medicamentos.map(m => ({
                    nombre: (m?.nombre ?? '').trim(),
                    dosis: (m?.dosis ?? '').trim(),
                    frecuencia: (m?.frecuencia ?? '').trim(),
                    duracion: (m?.duracion ?? '').trim(),
                    indicaciones: (m?.indicaciones ?? '').trim(),
                }))
                : [];

            // Debe haber al menos 1 medicamento con campos obligatorios
            const medsValidos = meds.filter(m => m.nombre && m.dosis && m.frecuencia && m.duracion);
            if (!medsValidos.length) {
                return res.status(400).json({ message: 'La receta debe incluir al menos un medicamento válido.' });
            }

            // Paciente desde el payload de receta o, si prefieres, cargar desde la cita
            // (recomendado: leer la cita para tomar paciente real y evitar manipulación)
            let pacienteId = receta.paciente.id;
            if (!pacienteId) {
                const citaDB = await Cita.findById(id).select('paciente');
                pacienteId = citaDB?.paciente;
            }
            if (!pacienteId) {
                return res.status(400).json({ message: 'No se pudo determinar el paciente para la receta.' });
            }

            // Fecha emisión de receta (por defecto: hoy)
            const fechaReceta = new Date();
            // Vigencia opcional
            const vigencia = receta.vigencia ? new Date(receta.vigencia) : undefined;

            recetaDoc = await RecetaMedica.create({
                // Referencias requeridas por tu schema
                cita: id,
                paciente: pacienteId,
                medico: medico._id,

                // Control
                fecha: fechaReceta,
                tipo_receta: receta.tipo_receta ?? 'NORMAL',
                vigencia,

                // Detalle
                medicamentos: medsValidos,
                indicaciones_generales: receta.indicaciones_generales ?? '',
            });
        }

        return res.json({
            message: 'Cita finalizada correctamente.',
            receta: recetaDoc ? { _id: recetaDoc._id } : null,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Error del servidor al finalizar la cita.' });
    }
};

export const buscarCita = async (req, res) => {
    try {
        const sede = await getIdSede(); // Asumo que esta función es válida

        // Convertimos a string por seguridad, aunque Mongoose maneja ObjectIds
        const sedeId = sede._id.toString();

        const citas = await Cita.find({ sede: sedeId, estado: 'PENDIENTE' })
            // 1. POPULATE PACIENTE (Anidado: Paciente -> Persona)
            .populate({
                path: 'paciente',
                populate: {
                    path: 'persona',
                    select: 'nombres apellidos identificacion'
                }
            })
            // 2. POPULATE MÉDICO (Múltiple populación dentro de Médico)
            .populate({
                path: 'medico',
                select: 'persona especialidad consultorio', // Asegúrate de seleccionar los campos de referencia
                populate: [ // Usamos un ARRAY para poblar múltiples campos del Médico
                    {
                        path: 'persona',
                        select: 'nombres apellidos' // Datos de la Persona del Médico
                    },
                    {
                        path: 'especialidad',
                        select: 'nombre' // Nombre de la Especialidad
                    },
                    {
                        path: 'consultorio',
                        select: 'nombre codigo' // Datos del Consultorio
                    }
                ]
            })
            .lean();

        if (citas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron citas pendientes.' });
        }

        return res.json({ citas: citas });
    } catch (error) {
        console.error("Error al listar citas por sede:", error);
        return res.status(500).json({ error: 'Error del servidor al listar citas' });
    }
}

export const listarPorEstado = async (req, res) => {
    try {
        const sede = await getIdSede();
        const sedeId = String(sede._id);
        const estado = req.params.id ?? null;

        // 1) Proyecta SOLO campos base necesarios en Cita
        const citas = await Cita.find({ sede: sedeId, estado })
            .select('fecha hora estado paciente medico') // <- limita documento base
            .populate({
                path: 'paciente',
                select: 'persona', // solo la ref
                populate: {
                    path: 'persona',
                    select: 'nombres apellidos identificacion', // lo que pinta la tabla
                },
            })
            .populate({
                path: 'medico',
                select: 'persona especialidad consultorio', // solo refs necesarias
                populate: [
                    { path: 'persona', select: 'nombres apellidos' },     // (no se usa en tabla ahora, pero ligero)
                    { path: 'especialidad', select: 'nombre' },           // nombre de esp.
                    { path: 'consultorio', select: 'codigo nombre' },     // consultorio
                ],
            })
            .lean();

        // 2) Reduce la forma de salida a lo que usa el front
        const slim = (citas ?? []).map(c => ({
            _id: c._id,
            fecha: c.fecha ?? null,
            hora: c.hora ?? null,
            estado: c.estado ?? null,
            paciente: {
                persona: c?.paciente?.persona
                    ? {
                        identificacion: c.paciente.persona.identificacion ?? null,
                        apellidos: c.paciente.persona.apellidos ?? null,
                        nombres: c.paciente.persona.nombres ?? null,
                    }
                    : null,
            },
            medico: {
                especialidad: c?.medico?.especialidad
                    ? { nombre: c.medico.especialidad.nombre ?? null }
                    : null,
                consultorio: c?.medico?.consultorio
                    ? {
                        codigo: c.medico.consultorio.codigo ?? null,
                        nombre: c.medico.consultorio.nombre ?? null,
                    }
                    : null,
            },
        }));

        // Sugerencia: en lugar de 404, devolver 200 con arreglo vacío para no romper la tabla
        return res.json({ citas: slim });
    } catch (error) {
        console.error('Error al listar citas por sede:', error);
        return res.status(500).json({ error: 'Error del servidor al listar citas' });
    }
};

export const listarPorEstadoParaMedico = async (req, res) => {
    try {
        const estado = req.params.id ?? null;
        const medico = await getMedicoByPersona(req.user.id);
        if (!medico) {
            return res.status(404).json({ message: 'Medico no encontrado.' });
        }
        // 1) Proyecta SOLO campos base necesarios en Cita
        const citas = await Cita.find({ medico: medico._id.toString(), estado })
            .select('fecha hora motivo estado paciente medico') // <- limita documento base
            .populate({
                path: 'paciente',
                select: '_id persona', // solo la ref
                populate: {
                    path: 'persona',
                    select: 'nombres apellidos identificacion', // lo que pinta la tabla
                },
            })
            .populate({
                path: 'medico',
                select: ' especialidad consultorio', // solo refs necesarias
                populate: [
                    { path: 'especialidad', select: 'nombre' },           // nombre de esp.
                    { path: 'consultorio', select: 'codigo nombre' },     // consultorio
                ],
            })
            .lean();

        // 2) Reduce la forma de salida a lo que usa el front
        const slim = (citas ?? []).map(c => ({
            _id: c._id,
            fecha: c.fecha ?? null,
            motivo: c.motivo ?? null,
            hora: c.hora ?? null,
            estado: c.estado ?? null,
            paciente: {
                id: c?.paciente?._id ?? null,
                persona: c?.paciente?.persona
                    ? {
                        identificacion: c.paciente.persona.identificacion ?? null,
                        apellidos: c.paciente.persona.apellidos ?? null,
                        nombres: c.paciente.persona.nombres ?? null,
                    }
                    : null,
            },
            medico: {
                especialidad: c?.medico?.especialidad
                    ? { nombre: c.medico.especialidad.nombre ?? null }
                    : null,
                consultorio: c?.medico?.consultorio
                    ? {
                        codigo: c.medico.consultorio.codigo ?? null,
                        nombre: c.medico.consultorio.nombre ?? null,
                    }
                    : null,
            },
        }));

        // Sugerencia: en lugar de 404, devolver 200 con arreglo vacío para no romper la tabla
        return res.json({ citas: slim });
    } catch (error) {
        console.error('Error al listar citas por sede:', error);
        return res.status(500).json({ error: 'Error del servidor al listar citas' });
    }
};