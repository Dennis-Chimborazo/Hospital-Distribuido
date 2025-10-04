import ApiService from "./ApiService";
const ruta = "paciente"
export default class PacienteService {
     static async buscarPaciente(id) {
        return await ApiService.getById(ruta + "/buscar",id);
    }
    static async crearPaciente(data) {
        return await ApiService.post(ruta + "/crear", data);
    }
     static async listarPacientes() {
        return await ApiService.get(ruta + "/listar")
    }
}
