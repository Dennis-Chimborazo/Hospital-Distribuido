import ApiService from './ApiService.js'
const ruta = "oficina"
export default class OficinaService {
    static async listarOficinas() {
        return await ApiService.get(ruta + "/listar-oficinas")
    }
    static async listarOficinasPorSede(id) {
        return await ApiService.getById(ruta + "/listar-oficinas", id)
    }
}