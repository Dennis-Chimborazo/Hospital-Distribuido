import mongoose from "mongoose";

//const uri = "mongodb://localhost:27017/hospital?directConnection=true";


export const mongoDB = async () => {
  let connected = false;

  while (!connected) {
    try {
      // Conexión a MongoDB replica set
      await mongoose.connect("mongodb://localhost:27017/hospital");
      console.log("✅ MongoDB Connected to Replica Set");
      connected = true;
    } catch (err) {
      console.error("❌ MongoDB failed to connect, retrying in 5s...", err.message);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};
