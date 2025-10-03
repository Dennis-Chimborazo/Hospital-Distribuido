import ApiService from './ApiService.js'
const ruta = "secretaria"
export default class SecretariaService {
    static async listarSecretarias() {
        return await ApiService.get(ruta + "/listar")
    }
    static async crearSecretaria(payload) {
        return await ApiService.post(ruta + "/crear", payload)
    }
    static async editarSecretaria(id, payload) {
        return await ApiService.put(ruta + "/edit/" + id, payload)
    }
    static async eliminarSecretaria(id) {
        return await ApiService.delete(ruta + "/delete/" + id)
    }
    static async buscarSecretaria(id) {
        return await ApiService.getById(ruta + "/buscar", id)
    }
}