// scripts/seed.mjs
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ⚠️ AJUSTA ESTAS RUTAS a tu estructura real
import Rol from '../src/modules/rol/rol.model.js';
import Sede from '../src/modules/sede/sede.model.js';
import Oficina from '../src/modules/oficina/oficina.model.js';
import Consultorio from '../src/modules/consultorio/consultorio.model.js';
import Persona from '../src/modules/persona/persona.model.js';
import Medico from '../src/modules/medico/medico.model.js';
import Secretaria from '../src/modules/secretaria/secretaria.model.js';
import Paciente from '../src/modules/paciente/paciente.model.js';
import User from '../src/modules/user/user.model.js';
import Especialidad from '../src/modules/especialidad/especialidad.model.js'; // tu modelo con nombre UPPERCASE

// -------------------- Config --------------------
const MONGO_URI = "mongodb://localhost:27017/hospital?directConnection=true";
const DEFAULT_PASSWORD =  '123456';
const ADMIN_PASSWORD =  '123';

// -------------------- Helpers --------------------
async function upsertOne(model, where, create) {
  const found = await model.findOne(where);
  if (found) return found;
  return model.create(create);
}

async function upsertMany(model, items, matchKeys) {
  const out = [];
  for (const item of items) {
    const where = {};
    for (const k of matchKeys) where[k] = item[k];
    out.push(await upsertOne(model, where, item));
  }
  return out;
}

function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function fakePhone() { return `09${Math.floor(10000000 + Math.random() * 89999999)}`; }
function fakeDate(minY = 1970, maxY = 2002) {
  const y = Math.floor(minY + Math.random() * (maxY - minY + 1));
  const m = Math.floor(Math.random() * 12);
  const d = Math.floor(1 + Math.random() * 28);
  return new Date(Date.UTC(y, m, d));
}
function slug(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function createUserForPersona({ persona, sede, rol, password }) {
  const hashed = await bcrypt.hash(password, 10);
  return upsertOne(
    User,
    { persona: persona._id },
    {
      user: persona.email, // correo = user
      password: hashed,
      estado: true,
      sede: sede._id,
      rol: rol._id,
      persona: persona._id,
      ultimo_acceso: null
    }
  );
}

// -------------------- Datos base --------------------
const ROLES = ['ADMIN', 'MEDICO', 'SECRETARIA'];

const SEDES = [
  { nombre: 'QUITO', codigo: 'QTO001' },
  { nombre: 'CUENCA', codigo: 'CUE001' },
  { nombre: 'GUAYAQUIL', codigo: 'GYQ001' },
];

// Tus especialidades (nombres en MAYÚSCULAS)
const ESPECIALIDADES = [
  {
    nombre: 'CARDIOLOGIA',
    descripcion: 'Diagnóstico y tratamiento de las enfermedades del corazón y el sistema circulatorio.',
    activa: true
  },
  {
    nombre: 'PEDIATRIA',
    descripcion: 'Atención médica integral a bebés, niños y adolescentes.',
    activa: true
  },
  {
    nombre: 'NEUROLOGIA',
    descripcion: 'Especialidad que trata los trastornos del sistema nervioso (cerebro, médula espinal y nervios).',
    activa: true
  },
  {
    nombre: 'ODONTOLOGIA',
    descripcion: 'Diagnóstico, tratamiento y prevención de las enfermedades de la cavidad oral.',
    activa: true
  },
  {
    nombre: 'OFTALMOLOGIA',
    descripcion: 'Estudio y tratamiento de las enfermedades de los ojos y la visión.',
    activa: true
  },
  {
    nombre: 'DERMATOLOGIA',
    descripcion: 'Se ocupa del cuidado y tratamiento de la piel, cabello y uñas.',
    activa: true
  },
  {
    nombre: 'FISIOTERAPIA',
    descripcion: 'Tratamiento de lesiones y enfermedades mediante el ejercicio físico y agentes físicos.',
    activa: true
  },
  {
    nombre: 'GINECOLOGIA',
    descripcion: null,
    activa: true
  },
];

// Oficinas: Quito 3 administrativas; Cuenca/GYE 5 ligadas a secretaría/medicina
function oficinasPorSede(sedeNombre) {
  if (sedeNombre === 'QUITO') {
    return [
      { codigo: 'ADM-001', nombre: 'Oficina Dirección', planta: 'Administrativa', piso: '1' },
      { codigo: 'ADM-002', nombre: 'Talento Humano', planta: 'Administrativa', piso: '2' },
      { codigo: 'ADM-003', nombre: 'Finanzas', planta: 'Administrativa', piso: '3' },
    ];
  }
  // Para CUENCA y GUAYAQUIL
  return [
    { codigo: 'SEC-001', nombre: 'Recepción Principal', planta: 'Secretaría', piso: 'PB' },
    { codigo: 'SEC-002', nombre: 'Admisión Pacientes', planta: 'Secretaría', piso: '1' },
    { codigo: 'MED-001', nombre: 'Oficina Médica 1', planta: 'Medicina', piso: '2' },
    { codigo: 'MED-002', nombre: 'Oficina Médica 2', planta: 'Medicina', piso: '3' },
    { codigo: 'MED-003', nombre: 'Coordinación Médica', planta: 'Medicina', piso: '3' },
  ];
}

// Consultorios (string especialidad en MAYÚSCULAS) — solo para Cuenca y Guayaquil
const CONSULTORIOS_BASE = [
  { codigo: 'CONS-101', nombre: 'Consultorio de Cardiología',  piso: '1', especialidad: 'CARDIOLOGIA'  },
  { codigo: 'CONS-102', nombre: 'Consultorio de Pediatría',    piso: '2', especialidad: 'PEDIATRIA'    },
  { codigo: 'CONS-103', nombre: 'Consultorio de Neurología',   piso: '3', especialidad: 'NEUROLOGIA'   },
  { codigo: 'CONS-104', nombre: 'Consultorio de Oftalmología', piso: '2', especialidad: 'OFTALMOLOGIA' },
  { codigo: 'CONS-105', nombre: 'Consultorio de Dermatología', piso: '3', especialidad: 'DERMATOLOGIA' },
];

// -------------------- Seed principal --------------------
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a MongoDB');

  // 1) Roles
  const rolesDocs = await Promise.all(
    ROLES.map(nombre => upsertOne(Rol, { nombre }, { nombre }))
  );
  const rolMap = Object.fromEntries(rolesDocs.map(r => [r.nombre, r]));

  // 2) Sedes
  const sedesDocs = await Promise.all(
    SEDES.map(s => upsertOne(Sede, { codigo: s.codigo }, { nombre: s.nombre, codigo: s.codigo }))
  );
  const sedeByName = Object.fromEntries(sedesDocs.map(s => [s.nombre, s]));

  // 3) Especialidades (respeta MAYÚSCULAS)
  // Si tu schema tiene { uppercase: true } en nombre, igual funcionará idempotente.
  const espDocs = await upsertMany(Especialidad, ESPECIALIDADES, ['nombre']);
  const especialidadByName = Object.fromEntries(espDocs.map(e => [e.nombre, e]));

  // 4) Oficinas por sede
  for (const s of sedesDocs) {
    const oficinas = oficinasPorSede(s.nombre).map(o => ({ ...o, sede: s._id }));
    await upsertMany(Oficina, oficinas, ['sede', 'codigo']);
  }

  // 5) Consultorios solo CUENCA y GUAYAQUIL
  for (const sedeNombre of ['CUENCA', 'GUAYAQUIL']) {
    const sedeDoc = sedeByName[sedeNombre];
    const consults = CONSULTORIOS_BASE.map(c => ({
      sede: sedeDoc._id,
      codigo: c.codigo,
      nombre: c.nombre,
      piso: c.piso,
      especialidad: c.especialidad // <-- string MAYÚSCULAS que coincide con Especialidad.nombre
    }));
    await upsertMany(Consultorio, consults, ['sede', 'codigo']);
  }

  // 6) Personas + Médicos + Secretarias (Cuenca y Guayaquil)
  const nombres = ['Ana','Luis','María','Carlos','Elena','Diego','Sofía','Jorge','Valeria','Pedro','Lucía','Andrés','Paola','Mateo','Camila','Daniela','Hugo','Noelia','Esteban','Fátima','Kevin','Adriana','Marco','Nathaly','Iván','Carolina','Bruno','Wendy','Ariel','Sandra','Pablo','Rita','Sara','Diana'];
  const apellidos = ['Pérez','Gómez','Zamora','López','Chávez','Torres','Ramírez','Mora','Vaca','Díaz','Salazar','Guamán','Cevallos','Vásquez','Yánez','Cabrera','Sánchez','Flores','Rivera','Vega','Soria','Rivas'];

  function buildPersona(baseIdx, sedeNombre) {
    const n = nombres[(baseIdx) % nombres.length];
    const a = apellidos[(baseIdx * 2 + 3) % apellidos.length];
    const email = `${slug(n)}.${slug(a)}.${sedeNombre.toLowerCase()}@ejemplo.com`;
    return {
      nombres: n,
      apellidos: a,
      identificacion: String(1000000000 + Math.floor(Math.random() * 8999999999)),
      fecha_nacimiento: fakeDate(1975, 2001),
      sexo: Math.random() > 0.5 ? 'M' : 'F',
      telefono: fakePhone(),
      email,
      direccion: `Av. ${a} y Calle ${n}, ${sedeNombre}`
    };
  }

  // por sede: 5 Médicos + 5 Secretarias
  const posiblesEsp = ['CARDIOLOGIA','PEDIATRIA','NEUROLOGIA','OFTALMOLOGIA','DERMATOLOGIA'];

  for (const sedeNombre of ['CUENCA', 'GUAYAQUIL']) {
    const sede = sedeByName[sedeNombre];

    const consultorios = await Consultorio.find({ sede: sede._id }).sort('codigo');
    const oficinas = await Oficina.find({ sede: sede._id }).sort('codigo');

    // 5 Médicos
    for (let i = 0; i < 5; i++) {
      const personaData = buildPersona(i + (sedeNombre === 'CUENCA' ? 0 : 100), sedeNombre);
      const persona = await upsertOne(Persona, { email: personaData.email }, personaData);

      // especialidad ObjectId
      const espNombre = posiblesEsp[i % posiblesEsp.length];
      const espDoc = especialidadByName[espNombre];
      const consultorio = consultorios[i % consultorios.length];

      await upsertOne(
        Medico,
        { persona: persona._id },
        {
          persona: persona._id,
          consultorio: consultorio._id,
          especialidad: espDoc._id, // <-- ObjectId correcto
          sede: sede._id,
          horario: 'Lun-Vie 08:00-16:00',
          estado: true
        }
      );

      await createUserForPersona({
        persona, sede, rol: rolMap['MEDICO'], password: DEFAULT_PASSWORD
      });
    }

    // 5 Secretarias
    const secretRoles = ['RECEPCION','ADMISION'];
    for (let i = 0; i < 5; i++) {
      const personaData = buildPersona(50 + i + (sedeNombre === 'CUENCA' ? 0 : 100), sedeNombre);
      const persona = await upsertOne(Persona, { email: personaData.email }, personaData);

      const oficina = oficinas[i % oficinas.length];
      await upsertOne(
        Secretaria,
        { persona: persona._id },
        {
          persona: persona._id,
          oficina: oficina._id,
          sede: sede._id,
          rol_secretaria: secretRoles[i % secretRoles.length],
          horario: 'Lun-Vie 08:00-16:00',
          estado: true
        }
      );

      await createUserForPersona({
        persona, sede, rol: rolMap['SECRETARIA'], password: DEFAULT_PASSWORD
      });
    }
  }

  // 7) Pacientes (10 total: 5 Cuenca, 5 Guayaquil) — sin User (no hay rol PACIENTE)
  const grupos = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
  for (const sedeNombre of ['CUENCA','GUAYAQUIL']) {
    const sede = sedeByName[sedeNombre];
    for (let i = 0; i < 5; i++) {
      const personaData = buildPersona(200 + i + (sedeNombre === 'CUENCA' ? 0 : 100), sedeNombre);
      const persona = await upsertOne(Persona, { email: personaData.email }, personaData);

      await upsertOne(
        Paciente,
        { persona: persona._id },
        {
          persona: persona._id,
          grupo_sanguineo: randFrom(grupos),
          alergias: Math.random() > 0.6 ? ['Penicilina'] : [],
          antecedente_familiar: Math.random() > 0.5 ? 'Hipertensión' : ''
        }
      );
    }
  }

  // 8) Admin en QUITO (único de Quito)
  const sedeQuito = sedeByName['QUITO'];
  const adminPersona = await upsertOne(
    Persona,
    { email: 'adminq@hospital.ec' },
    {
      nombres: 'Admin',
      apellidos: 'Quito',
      identificacion: '9999999999',
      fecha_nacimiento: new Date(Date.UTC(1990, 0, 1)),
      sexo: 'M',
      telefono: fakePhone(),
      email: 'adminq@hospital.ec',
      direccion: 'Av. Principal y 10 de Agosto, QUITO'
    }
  );
  await createUserForPersona({
    persona: adminPersona,
    sede: sedeQuito,
    rol: rolMap['ADMIN'],
    password: ADMIN_PASSWORD // '123' por defecto, como pediste
  });

  console.log('✅ Seed completado: roles, sedes, oficinas, consultorios, especialidades, personas (médicos, secretarias, pacientes) y admin de Quito.');
  await mongoose.disconnect();
}

// -------------------- Run --------------------
main().catch(async (err) => {
  console.error('❌ Error en seed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
