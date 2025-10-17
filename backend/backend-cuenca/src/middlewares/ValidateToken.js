// middlewares/ValidateToken.js
import { verifyToken } from '../libs/jwt.js';

function extractToken(req) {
    // 1) Authorization: Bearer xxx
    const auth = req.headers?.authorization;
    console.log('auth', auth);
    if (auth?.startsWith('Bearer ')) return auth.slice(7);

    // 2) Cookie "token"
    if (req.cookies?.token) return req.cookies.token;

    // 3) Query ?token=xxx  (útil para pruebas)
    if (req.query?.token) return req.query.token;

    return null;
}

export const authRequired = async (req, res, next) => {

    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: 'Token requerido' });
        }

        const decoded = await verifyToken(token); // puede lanzar JsonWebTokenError
        req.user = decoded;
        return next();
    } catch (err) {
        console.error('JWT error:', err?.name, err?.message);
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
