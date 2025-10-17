import Sede from './sede.model.js';
export async function getIdSede() {
    return Sede.findOne({ codigo: process.env.SECRET_SEDE_KEY }).select('_id').lean();
}
