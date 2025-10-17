import mongoose from 'mongoose';
const { Schema } = mongoose;

const CitaSchema = new Schema({
    sede: { type: Schema.Types.ObjectId, ref: 'Sede', required: true },
    medico: { type: Schema.Types.ObjectId, ref: 'Medico', required: true },
    paciente: { type: Schema.Types.ObjectId, ref: 'Paciente', required: true },
        estado: {
            type: String,
            enum: ['PENDIENTE', 'CANCELADO', 'FINALIZADO','AUSENTE'],
            default: 'PENDIENTE',
            required: true,
            trim: true
        },
    motivo: { type: String, trim: true, required: true },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true, match: /^([0-1]\d|2[0-3]):([0-5]\d)$/ }, // formato HH:mm
    observaciones: { type: String, trim: true, default: 's/n', },
    actualizadoPor: { type: Schema.Types.ObjectId, ref: 'Persona' },
    creadoPor: { type: Schema.Types.ObjectId, ref: 'Persona' }

}, { timestamps: true });

export default mongoose.model('Cita', CitaSchema);
