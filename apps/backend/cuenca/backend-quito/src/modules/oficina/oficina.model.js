// models/Oficina.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const OficinaSchema = new Schema({
  sede:   { type: Schema.Types.ObjectId, ref: 'Sede', required: true },
  codigo: { type: String, required: true, trim: true },
  nombre: { type: String, required: true, trim: true },
  planta: { type: String, trim: true },
  piso:   { type: String, trim: true }
}, { timestamps: true });

OficinaSchema.index({ sede: 1, codigo: 1 }, { unique: true });

export default mongoose.model('Oficina', OficinaSchema);
