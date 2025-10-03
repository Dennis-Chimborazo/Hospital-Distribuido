import ApiService from "./ApiService";
const ruta ="especialidad"
export default class EspecialidadService {
    static async getEspecialidades() {
        return await ApiService.get(ruta+"/listar-especialidades")
    }
    static async crearEspecialidad(data) {
        return await ApiService.post(ruta+"/crear", data);
    }
    static async eliminarEspecialidad(id) {
        return await ApiService.softDeleteById(ruta+"/delete",id);
    }
    static async actualizarEspecialidad(id, data) {
        return await ApiService.put(`${ruta}/edit/${id}`, data);
    }
}  
