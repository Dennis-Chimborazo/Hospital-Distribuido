// models/Secretaria.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const SecretariaSchema = new Schema({
  persona: { type: Schema.Types.ObjectId, ref: 'Persona', required: true },
  oficina: { type: Schema.Types.ObjectId, ref: 'Oficina', required: true },
  sede: { type: Schema.Types.ObjectId, ref: 'Sede', required: true },
  rol_secretaria: { type: String, enum: ['RECEPCION', 'ADMISION'], required: true },
  horario: { type: String, trim: true },
  estado: { type: Boolean, default: true }

}, { timestamps: true });

SecretariaSchema.index({ persona: 1 }, { unique: true });

export default mongoose.model('Secretaria', SecretariaSchema);
