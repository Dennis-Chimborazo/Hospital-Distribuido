import axios from "axios"
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
class ApiService {
  static async get(resource) {
    console.log(`${baseUrl}${resource}`)
  try {
    const res = await axios.get(`${baseUrl}${resource}`);
    return res.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      // Si el servidor devuelve un mensaje de error específico, lo lanzamos.
      throw new Error(error.response.data.message);
    }
    // Si no hay un mensaje específico, lanzamos el mensaje de error general.
    throw new Error(error.message);
  }
}

  static async post(resource, data) {
    try {
      const response = await axios.post(`${baseUrl}${resource}`, data, {
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

  static async login(form) {
    try {
      const response = await axios.post(
        baseUrl + "auth/login",
        form,
        {
          headers: { "Content-Type": "application/json", },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error("No se pudo conectar con el servidor");
    }
  }
}
export default ApiService