import jwt from 'jsonwebtoken';

export function generateToken(playload) {
    return new Promise((resolve, reject) => {
        jwt.sign(playload, process.env.SECRET_AUTH_KEY, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        })
    });
}

export function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_AUTH_KEY, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded);
        })
    });
}


