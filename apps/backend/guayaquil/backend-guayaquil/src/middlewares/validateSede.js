import { User } from '../models/usuario.model.js';

export async function requireSede(req, res, next) {
  try {

    const userId = req.userId || req.user?._id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    const codigoEsperado = process.env.SECRET_SEDE_KEY;
    if (!codigoEsperado) {
      return res.status(500).json({ message: 'Config: SECRET_SEDE_KEY no definido' });
    }

    const ok = await User.perteneceASede(userId, codigoEsperado);
    if (!ok) return res.status(403).json({ message: 'No autorizado para esta sede' });

    return next();
  } catch (err) {
    console.error('requireSede error:', err);
    return res.status(500).json({ message: 'Error validando sede' });
  }
}
