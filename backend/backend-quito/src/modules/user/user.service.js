import User from './user.model.js';
import { generarClave } from '../../utils/generadorClaves.js';
import bcrypt from 'bcryptjs';
import { EmailService } from '../../service/email.service.js';

export async function crearUsuario(data) {
  try {
    const password = generarClave();

    const usuario = new User({
      user: data.email,
      password: await bcrypt.hash(password, 10),
      sede: data.sede,
      rol: data.rol,
      persona: data.persona,
    });

    await usuario.save();
    const emailService = new EmailService();
    await emailService.enviarCorreoBienvenida('ddcdalex@gmail.com', password);

    return { success: true, usuario };

  } catch (error) {
    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern || {})[0] || 'campo único';
      return { success: false, message: `Duplicado en ${campo}` };
    }

    console.error('Error al crear usuario:', error);
    return { success: false, message: 'Error del servidor al crear usuario' };
  }
}


