import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

// 2. Opcional, pero recomendado: Configura Axios con la URL base
//    Esto simplifica todas tus llamadas posteriores.
if (baseUrl) {
    axios.defaults.baseURL = baseUrl;
} else {
    console.error("VITE_API_URL no está definido. Revisa tu archivo .env.");
}

class ApiService {
    /**
     * @param {Object} form 
     */
    static async login(form) {
        try {
            const response = await axios.post(
                "auth/login",
                form,
                { headers: { "Content-Type": "application/json", }, }
            );
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error("No se pudo conectar con el servidor o error inesperado.");
        }
    }

    static async get(url) {
        try {
            const res = await axios.get(url)
            return res.data
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error("No se pudo conectar con el servidor o error inesperado.");
        }
    }

    static async getById(resource, id) {
        try {
            const response = await axios.get(`${resource}/${id}`, {
                headers: { "Content-Type": "application/json" },
            })
            return response.data
        } catch (error) {
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error)
            }
            throw new Error("No se pudo conectar con el servidor o error inesperado.")
        }
    }

    static async post(resource, data) {
        try {
            const response = await axios.post(resource, data, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;

        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error(error.message);
        }
    }
    // Patch para un eliminado suave o eliminado logico 
    static async softDeleteById(resource, id) {
        try {
            const body = { estado: false };
            const { data } = await axios.patch(`${resource}/${id}`, body, {
                headers: { 'Content-Type': 'application/json' }
            });
            return data;
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('No se pudo conectar con el servidor o error inesperado.');
        }
    }
    // PUT para actualizacion de datos
    static async put(resource, data) {
        try {
            const response = await axios.put(resource, data, { 
                headers: { "Content-Type": "application/json" },
            });
            return response.data;

        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error("No se pudo conectar con el servidor o error inesperado.");
        }
    }
    static async logout(form) {
        try {
            const response = await axios.post(
                "auth/logout",
                form,
                { headers: { "Content-Type": "application/json", }, }
            );
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error("No se pudo conectar con el servidor o error inesperado.");
        }
    }
}

export default ApiService;