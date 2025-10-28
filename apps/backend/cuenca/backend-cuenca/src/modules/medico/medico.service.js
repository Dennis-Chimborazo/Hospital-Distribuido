import Medico from './medico.model.js';
export async function getMedicoByPersona(personaId) {
    return Medico.findOne({ persona: personaId }).lean();
}
