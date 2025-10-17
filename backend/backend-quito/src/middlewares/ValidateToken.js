import { verifyToken } from '../libs/jwt.js';

export const authRequired = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        res.status(401).send('No token');
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
        res.status(401).send('Token invalido');
    }
    req.user = decoded;
    next();
}
