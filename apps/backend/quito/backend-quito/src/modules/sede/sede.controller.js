import Sede from '../sede/sede.model.js';

export const listarSedes = async (req, res) => {
    try {
        const sedes = await Sede.find().select('_id nombre');
        return res.json({sedes: sedes});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error del servidor al listar sedes' });
    }
}

// export const crearSede = async (req, res) => {
//     try {
//         const sede = await Sede.create({
//             codigo: req.body.codigo,
//             nombre: req.body.nombre,
//             ciudad: req.body.ciudad,
//             direccion: req.body.direccion,
//             estado: req.body.estado
//         });
//         return res.json({ mesagge: "Sede creada" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send('Error del servidor');
//     }
// }

// export const editarSede = async (req, res) => {
//     try {
//         const sede = await Sede.findByIdAndUpdate(req.params.id, {
//             codigo: req.body.codigo,
//             nombre: req.body.nombre,
//             ciudad: req.body.ciudad,
//             direccion: req.body.direccion,
//             estado: req.body.estado
//         });
//         return res.json({ mesagge: "Sede editada" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send('Error del servidor');
//     }
// }

// export const eliminarSede = async(req, res) => {
//     try {
//         const sede = await Sede.findByIdAndDelete(req.params.id);
//         return res.json({ mesagge: "Sede eliminada" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send('Error del servidor');
//     }
// }