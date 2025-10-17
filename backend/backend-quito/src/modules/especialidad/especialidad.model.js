import mongoose from 'mongoose';
const { Schema } = mongoose;

const EspecialidadSchema = new Schema({
    nombre: {type: String,required: true, unique: true, trim: true},
    descripcion: {type: String,trim: true, default: null },
    activa: {type: Boolean, default: true
    }
}, { 
    timestamps: true 
});

export default mongoose.model('Especialidad', EspecialidadSchema);