import mongoose from 'mongoose';
import Rol from './src/modules/rol/rol.model.js';
import Sede from './src/modules/sede/sede.model.js';
import Persona from './src/modules/persona/persona.model.js';

// === 1) Conexión ===
// Usa tu usuario admin de Docker: admin / admin123
// authSource=admin porque el usuario vive en la base admin
const MONGO_URI = 'mongodb://admin:admin123@localhost:27017/hospital?authSource=admin';

// === 2) Datos a insertar ===
const rolesSeed = [
  { nombre: 'ADMIN' },
  { nombre: 'MEDICO' },
  { nombre: 'SECRETARIA' },
];

const sedesSeed = [
  {
    codigo: 'QTO001',
    nombre: 'Hospital Vida Sana - Matriz',
    ciudad: 'Quito',
    direccion: 'Av. Amazonas N34-140 y República',
  },
  {
    codigo: 'GYE001',
    nombre: 'Hospital Vida Sana - Sur',
    ciudad: 'Guayaquil',
    direccion: 'Av. 25 de Julio y Pio Jaramillo',
  },
  {
    codigo: 'CUE001',
    nombre: 'Hospital Vida Sana - Centro',
    ciudad: 'Cuenca',
    direccion: 'Gran Colombia y Borrero',
  },
];

const personaSeed = {
  nombres: 'Michelle',
  apellidos: 'Tunja',
  identificacion: '0102030405',
  fecha_nacimiento: new Date('1995-06-15'),
  sexo: 'F',
  telefono: '0999999999',
  email: 'juan.perez@example.com',
  direccion: 'Calle 1 y Av. Siempre Viva',
};

// === 3) Helpers de inserción (upsert) ===
async function upsertMany(model, docs, uniqueKey) {
  const ops = docs.map((d) => ({
    updateOne: {
      filter: { [uniqueKey]: d[uniqueKey] },
      update: { $setOnInsert: d },
      upsert: true,
    },
  }));
  return model.bulkWrite(ops, { ordered: false });
}

async function upsertOne(model, filter, doc) {
  return model.updateOne(filter, { $setOnInsert: doc }, { upsert: true });
}

// === 4) Script principal ===
(async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Garantiza índices únicos (útil la primera vez)
    await Promise.all([Rol.init(), Sede.init(), Persona.init()]);

    // === Sembrar datos ===
    console.log('\n🌱 Sembrando roles...');
    await upsertMany(Rol, rolesSeed, 'nombre');
    console.log('✅ Roles listos');

    console.log('\n🏥 Sembrando sedes...');
    await upsertMany(Sede, sedesSeed, 'codigo');
    console.log('✅ Sedes listas');

    console.log('\n👩‍⚕️ Sembrando persona...');
    await upsertOne(Persona, { email: personaSeed.email }, personaSeed);
    console.log('✅ Persona lista');

    // === Mostrar resumen ===
    const [roles, sedes, personas] = await Promise.all([
      Rol.find().lean(),
      Sede.find().lean(),
      Persona.find().lean(),
    ]);

    console.log('\n=== 📋 RESUMEN DE INSERCIÓN ===');
    console.log('Roles:', roles.map((r) => r.nombre).join(', '));
    console.log('Sedes:', sedes.map((s) => `${s.codigo} - ${s.nombre}`).join(' | '));
    console.log('Personas:', personas.map((p) => `${p.nombres} ${p.apellidos} <${p.email}>`).join(' | '));
  } catch (err) {
    console.error('\n❌ Error al sembrar datos:', err?.message || err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔒 Conexión cerrada.');
  }
})();
