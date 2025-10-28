import mongoose from 'mongoose';
import Rol from './src/modules/rol/rol.model.js';
import Sede from './src/modules/sede/sede.model.js';
import Persona from './src/modules/persona/persona.model.js';
import User from './src/modules/user/user.model.js'; // Ajusta la ruta si tu estructura cambia
import bcrypt from 'bcryptjs';


// === 1) Conexión ===
const MONGO_URI = 'mongodb://admin:admin123@localhost:27017/hospital?authSource=admin';

// === 2) Usuario a insertar ===
// ⚠️ Reemplaza los ObjectId por los reales de tus colecciones
const userSeed = {
    user: 'admin',
    password: await bcrypt.hash('admin', 10),
    sede: '68f1c710a04c1a9751f809ff', // ID real de Sede
    rol: '68f1c710a04c1a9751f809fc', // ID real de Rol
    persona: '68f1c710a04c1a9751f80a02', // ID real de Persona
    estado: true,
    ultimo_acceso: new Date(),
};

// === 3) Función upsert (insertar si no existe) ===
async function upsertOne(model, filter, doc) {
    return model.updateOne(filter, { $setOnInsert: doc }, { upsert: true });
}

// === 4) Script principal ===
(async() => {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Inicializa índices
        await User.init();

        console.log('\n👤 Insertando usuario...');
        await upsertOne(User, { user: userSeed.user }, userSeed);
        console.log('✅ Usuario insertado correctamente');

        // Mostrar resumen
        const user = await User.findOne({ user: userSeed.user })
            .populate(['sede', 'rol', 'persona'])
            .lean();

        console.log('\n=== 📋 USUARIO CREADO ===');
        console.log(`Usuario: ${user.user}`);
        console.log(`Rol: ${user.rol?.nombre}`);
        console.log(`Sede: ${user.sede?.codigo} - ${user.sede?.nombre}`);
        console.log(`Persona: ${user.persona?.nombres} ${user.persona?.apellidos}`);
        console.log(`Estado: ${user.estado ? 'Activo' : 'Inactivo'}`);
    } catch (err) {
        // console.error('\n❌ Error al crear usuario:', err ? err.message || err);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔒 Conexión cerrada.');
    }
})();