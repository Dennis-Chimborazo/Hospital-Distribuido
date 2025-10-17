import ApiService from "./ApiService";
export default class ConsultorioService {

    static async getByIdConsultorios(id) {
        return await ApiService.getById("consultorio/listar-consultorios",id);
    }}