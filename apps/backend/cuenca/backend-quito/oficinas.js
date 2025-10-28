import mongoose from 'mongoose';
import Oficina from './src/modules/oficina/oficina.model.js'; // ajusta la ruta
import Consultorio from './src/modules/consultorio/consultorio.model.js'; // ajusta la ruta

// === 1) Conexión ===
const MONGO_URI = 'mongodb://admin:admin123@localhost:27017/hospital?authSource=admin';

// === 2) ID de la sede a la que pertenecen ===
// ⚠️ Reemplaza con el _id real de la colección Sede
const SEDE_ID = '68f1c710a04c1a9751f80a01';

// === 3) Datos de ejemplo ===
const oficinasSeed = [
    { sede: SEDE_ID, codigo: 'OF001', nombre: 'Oficina de Administración', planta: 'A', piso: '1' },
    { sede: SEDE_ID, codigo: 'OF004', nombre: 'Oficina de Tecnología', planta: 'B', piso: '2' },
    { sede: SEDE_ID, codigo: 'OF005', nombre: 'Oficina de Archivo', planta: 'C', piso: '3' },
];

const consultoriosSeed = [
    { sede: SEDE_ID, codigo: 'CON001', nombre: 'Consultorio de Pediatría', piso: '1', especialidad: 'Pediatría' },
    { sede: SEDE_ID, codigo: 'CON005', nombre: 'Consultorio de Medicina General', piso: '3', especialidad: 'Medicina General' },
];

// === 4) Helper genérico de inserción ===
async function upsertMany(model, docs, uniqueKeys) {
    const ops = docs.map((d) => ({
        updateOne: {
            filter: Object.fromEntries(uniqueKeys.map((k) => [k, d[k]])),
            update: { $setOnInsert: d },
            upsert: true,
        },
    }));
    return model.bulkWrite(ops, { ordered: false });
}

// === 5) Script principal ===
(async() => {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        await Promise.all([Oficina.init(), Consultorio.init()]);

        // === Inserción de OFICINAS ===
        console.log('\n🏢 Sembrando oficinas...');
        await upsertMany(Oficina, oficinasSeed, ['sede', 'codigo']);
        console.log('✅ Oficinas insertadas correctamente');

        // === Inserción de CONSULTORIOS ===
        console.log('\n🩺 Sembrando consultorios...');
        await upsertMany(Consultorio, consultoriosSeed, ['sede', 'codigo']);
        console.log('✅ Consultorios insertados correctamente');

        // === Resumen ===
        const [oficinas, consultorios] = await Promise.all([
            Oficina.find({ sede: SEDE_ID }).lean(),
            Consultorio.find({ sede: SEDE_ID }).lean(),
        ]);

        console.log('\n=== 📋 RESUMEN ===');
        console.log(`Oficinas (${oficinas.length}):`);
        oficinas.forEach((o) => console.log(` - ${o.codigo}: ${o.nombre} (Planta ${o.planta}, Piso ${o.piso})`));

        console.log(`\nConsultorios (${consultorios.length}):`);
        consultorios.forEach((c) => console.log(` - ${c.codigo}: ${c.nombre} [${c.especialidad}] Piso ${c.piso}`));
    } catch (err) {
        // console.error('\n❌ Error al insertar oficinas/consultorios:', err ? .message || err);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔒 Conexión cerrada.');
    }
})();