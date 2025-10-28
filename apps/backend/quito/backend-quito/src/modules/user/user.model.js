// ✅ User corregido
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  user: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true, trim: true, select: false },
  estado: { type: Boolean, default: true },
  sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
  rol: { type: mongoose.Schema.Types.ObjectId, ref: 'Rol', required: true },
  persona: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona', required: true },
  ultimo_acceso: { type: Date }
}, { timestamps: true });

userSchema.index({ persona: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
