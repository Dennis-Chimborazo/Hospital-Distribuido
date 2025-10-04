import User from '../user/user.model.js';
import Sede from '../sede/sede.model.js';
import Rol from '../rol/rol.model.js';
import { generateToken } from '../../libs/jwt.js';
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
    try {
        const user = await User.findOne({ user: req.body.user }).select('+password');

        if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

        if (!user.estado) return res.status(403).json({ error: "Usuario inactivo o bloqueado" });

        const comprobacionSede = await Sede.findById(user.sede);

        if (comprobacionSede.codigo != process.env.SECRET_SEDE_KEY) {
            return res.status(403).json({ error: "Sede incorrecta" });
        }
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }
        const rol = await Rol.findById(user.rol);
        const token = await generateToken({ id: user._id });
        res.cookie('token', token);
        return res.json({ mesagge: rol.nombre });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error del servidor');
    }
}

export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ mesagge: "Sesión cerrada" });
}

export const register = async (req, res) => {

    try {
        const user = await User.create({
            user: req.body.user,
            password: await bcrypt.hash(req.body.password, 10),
            estado: true,
            sede: req.body.sede,
            rol: req.body.rol
        });
        return res.json({ mesagge: "Usuario creado" });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error del servidor');
    }
}

