import mongoose from "mongoose";

export const mongoDB = async () => {
  // ----------------------------------------------------------------------
  // 🎯 CONEXIÓN SIMPLE DENTRO DE DOCKER
  // Usamos 'mongodb' (el nombre del servicio en el docker-compose.yml)
  // en lugar de 'localhost' o IPs.
  // ----------------------------------------------------------------------
  
  // Asume que el servicio en docker-compose se llama 'mongodb'
  // y la base de datos que quieres usar dentro de Mongo se llama 'hospital'.
  const uri = "mongodb://mongodb:27017/hospital";

  for (;;) {
    try {
      await mongoose.connect(uri);
      // Cambiamos el mensaje para reflejar que es una conexión simple
      console.log("✅ MongoDB Connected (simple container)"); 
      break;
    } catch (err) {
      console.error(`❌ MongoDB failed to connect at ${uri}, retrying in 5s...`, err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
};