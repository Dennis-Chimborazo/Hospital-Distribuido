export function generarClave() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let clave = '';

    for (let i = 0; i < 7; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        clave += caracteres.charAt(indiceAleatorio);
    }

    return clave;
}