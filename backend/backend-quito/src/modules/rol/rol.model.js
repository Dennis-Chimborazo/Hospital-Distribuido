import mongoose from 'mongoose';

const rolSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    }
}, { timestamps: true });

export default mongoose.model('Rol', rolSchema);
