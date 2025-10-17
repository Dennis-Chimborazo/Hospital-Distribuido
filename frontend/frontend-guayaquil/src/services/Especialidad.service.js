import ApiService from "./ApiService";
const ruta = "especialidad"
export default class EspecialidadService {
    static async listarEspecialidades() {
        return await ApiService.get(ruta + "/listar-especialidades");
    }
    }
