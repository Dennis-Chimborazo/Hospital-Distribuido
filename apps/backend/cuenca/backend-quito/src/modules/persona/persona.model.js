import mongoose from 'mongoose';

const PersonaSchema = new mongoose.Schema({

  nombres: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  apellidos: {
    type: String,
    required: true, 
    trim: true,
    maxlength: 80
  },
  identificacion: {
    type: String,
    unique: true,
    trim: true,
    maxlength: 20
  },
  fecha_nacimiento: {
    type: Date, 
    required: true
  },
  sexo: {
    type: String,
    enum: ['M', 'F'],
    uppercase: true,
    trim: true,
    required: false
  },
  telefono: {
    type: String,
    trim: true,
    maxlength: 30
  },
  email: {
    type: String,
    trim: true,
    maxlength: 150,
    required: true,
    unique: true,
  },
  direccion: {
    type: String,
    trim: true,
    required: true,
    maxlength: 255
  }
}, { 
    timestamps: true 
});

export default mongoose.model('Persona', PersonaSchema);