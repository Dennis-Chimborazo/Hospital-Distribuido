// models/Medico.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const MedicoSchema = new Schema({
    persona: { type: Schema.Types.ObjectId, ref: 'Persona', required: true },
    consultorio: { type: Schema.Types.ObjectId, ref: 'Consultorio', required: true },
    especialidad: { type: Schema.Types.ObjectId, ref: 'Especialidad', required: true },
    sede: { type: Schema.Types.ObjectId, ref: 'Sede', required: true },
    horario: { type: String, trim: true },
    estado: { type: Boolean, default: true }
}, { timestamps: true });

MedicoSchema.index({ persona: 1 }, { unique: true });

export default mongoose.model('Medico', MedicoSchema);