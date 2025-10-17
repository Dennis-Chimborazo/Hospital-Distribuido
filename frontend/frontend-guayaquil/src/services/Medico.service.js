import ApiService from "./ApiService";
const ruta = "medico"
export default class MedicoService {
    static async listarMedicoPorEspecialidades(id) {
        return await ApiService.getById(ruta + "/listar-especialidad", id);
    }
    }
