import ApiService from "./ApiService";
export default class SedeService {
    static async getSedes() {
        return await ApiService.get("sede/listar-sedes");
    }}