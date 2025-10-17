// models/Consultorio.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ConsultorioSchema = new Schema({
  sede:   { type: Schema.Types.ObjectId, ref: 'Sede', required: true },
  codigo: { type: String, required: true, trim: true },
  nombre: { type: String, required: true, trim: true },
  piso:   { type: String, trim: true },
  especialidad: { type: String, trim: true }
}, { timestamps: true });

ConsultorioSchema.index({ sede: 1, codigo: 1 }, { unique: true });

export default mongoose.model('Consultorio', ConsultorioSchema);
