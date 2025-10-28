import mongoose from 'mongoose';
const { Schema } = mongoose;

const PacienteSchema = new Schema({
  persona:          { type: Schema.Types.ObjectId, ref: 'Persona', required: true },
  grupo_sanguineo:  { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  alergias:         [{ type: String, trim: true }],
  antecedente_familiar: { type: String, trim: true }
}, { timestamps: true });

PacienteSchema.index({ persona: 1 }, { unique: true });

export default mongoose.model('Paciente', PacienteSchema);
