import ApiService from "./ApiService";
const ruta = "medico"


export default class MedicoService {
    static async listarMedicos() {
        return await ApiService.get(ruta + "/listar");
    }
    static async crearMedico(data) {
        return await ApiService.post(ruta + "/crear", data);
    }
    static async eliminarMedico(id) {
        return await ApiService.softDeleteById(ruta + "/delete", id);
    }
     static async informacionMedico() {
        return await ApiService.get(ruta + "/listar");
    }

}