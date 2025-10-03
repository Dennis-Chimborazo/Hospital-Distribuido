import Oficina from '../oficina/oficina.model.js';

export const listarOficinas = async (req, res) => {
    try {
        const oficinas = await Oficina.find().select('_id nombre');
        return res.json({ oficinas: oficinas });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error del servidor al listar sedes' });
    }
}

export const listarOficinasPorSede = async (req, res) => {
    try {
        const sedeId = req.params.id;
        const oficinas = await Oficina.find({ sede: sedeId }).select('_id nombre');
        if (oficinas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron oficinas para esta sede.' });
        }

        return res.json({ oficinas: oficinas });

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Formato de ID de sede inválido.' });
        }
        return res.status(500).json({ error: 'Error del servidor al listar oficinas por sede.' });
    }
}