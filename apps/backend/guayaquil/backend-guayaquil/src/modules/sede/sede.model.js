import mongoose from 'mongoose';

const sedeSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  ciudad: {
    type: String,
    trim: true,
    maxlength: 120
  },
  direccion: {
    type: String,
    trim: true,
    maxlength: 255
  },
  estado: {
    type: Boolean,
    default: true
  }
},  { timestamps: true });

export default mongoose.model('Sede', sedeSchema);
