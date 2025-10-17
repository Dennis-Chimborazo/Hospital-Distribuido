import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; 
export default class ApiService {
  static api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, 
    headers: { "Content-Type": "application/json" },
  });

  static async get(resource, config = {}) {
    try {
      const res = await this.api.get(resource, config);
      return res.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || error.message || "Error GET"
      );
    }
  }
  static async getById(resource, id, config = {}) {
    try {
        const res = await this.api.get(`${resource}/${id}`, config);
        return res.data;
    } catch (error) {
        throw new Error(
            error?.response?.data?.message || error.message || `Error GET by ID para ${resource}`
        );
    }
}

  static async post(resource, data, config = {}) {
    try {
      const res = await this.api.post(resource, data, config); 
      return res.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || error.message || "Error POST"
      );
    }
  }
  static async patch(resource, data, config = {}) {
    try {
        const res = await this.api.patch(resource, data, config);
        return res.data;
    } catch (error) {
        throw new Error(
            error?.response?.data?.message || error.message || "Error PATCH"
        );
    }
}

  static async login(form) {
    try {
      const res = await this.api.post("auth/login", form);
      return res.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "No se pudo conectar con el servidor"
      );
    }
  }
}
