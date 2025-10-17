    // models/RecetaMedica.js
    import mongoose from 'mongoose';
    const { Schema } = mongoose;

    const RecetaMedicaSchema = new Schema({
        // --- Referencias clave (Optimizadas) ---
        cita: { type: Schema.Types.ObjectId, ref: 'Cita', required: true, },
        paciente: { type: Schema.Types.ObjectId, ref: 'Paciente', required: true, },
        medico: { type: Schema.Types.ObjectId, ref: 'Medico', required: true, },
        // --- Información de Control ---
        fecha: { type: Date, default: Date.now },
        tipo_receta: { type: String, enum: ['NORMAL', 'CONTROLADA', 'REPETIBLE'], default: 'NORMAL', },
        vigencia: { type: Date, required: false, },
        // --- Detalle de Medicamentos (Mismo Subdocumento) ---
        medicamentos: [{
            nombre: { type: String, required: true, trim: true },
            dosis: { type: String, required: true, trim: true },
            frecuencia: { type: String, required: true, trim: true },
            duracion: { type: String, required: true, trim: true },
            indicaciones: { type: String, trim: true }
        }],
        indicaciones_generales: { type: String, trim: true, maxlength: 2000 },
        // --- Auditoría del Sistema ---

    }, { timestamps: true });

    // --- Índices Mejorados ---
    RecetaMedicaSchema.index({ paciente: 1, fecha: -1 });
    RecetaMedicaSchema.index({ medico: 1, fecha: -1 }); // Usamos 'medico' en lugar de 'profesional_id'
    RecetaMedicaSchema.index({ identificador_unico: 1 }); // Índice para búsquedas rápidas por código

    export default mongoose.model('RecetaMedica', RecetaMedicaSchema);