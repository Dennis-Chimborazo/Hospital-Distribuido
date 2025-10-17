import ApiService from "./ApiService";
const ruta = "cita"
export default class CitaService {
    static async listarDesdeMedico(id) {
        return await ApiService.getById(ruta + "/listar-desde-medico",id);
    }
    static async crearCitaDesdeMedico(data) {
        return await ApiService.post(ruta + "/crear-cita-medico", data);
    }
    static async crearCitaDesdeSecretaria(data) {
        return await ApiService.post(ruta + "/crear-cita-secretaria", data);
    }

    static async editarCitaSecretaria(data) {
        return await ApiService.patch(ruta + "/editar-cita-secretaria", data);
    }
    static async cancelarCita(data) {
        return await ApiService.patch(ruta + "/cancelar", data);
    }
    static async listarPorEstado(id) {
        return await ApiService.getById(ruta + "/listar-por-estado", id);
    }

    static async finalizarCita(data) {
        return await ApiService.post(ruta + "/finalizar-cita", data);
    }
}


