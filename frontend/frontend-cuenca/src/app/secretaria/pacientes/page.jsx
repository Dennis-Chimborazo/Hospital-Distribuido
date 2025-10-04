'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import PacienteCreateModal from '@/components/modal/PacienteCreateModal';
import PacienteService from '@/services/Paciente.service';
import { useNotify } from '@/components/useNotify';

function calcAge(fechaISO) {
  if (!fechaISO) return null;
  const ms = Date.now() - new Date(fechaISO).getTime();
  return Math.max(0, Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000)));
}

function mapPacienteFromApi(p) {
  const nombres = p?.persona?.nombres ?? '';
  const apellidos = p?.persona?.apellidos ?? '';
  const identificacion = p?.persona?.identificacion ?? '';

  return {
    id: p?._id,
    nombre: `${nombres} ${apellidos}`.trim(),
    edad: p?.persona?.fecha_nacimiento ? calcAge(p.persona.fecha_nacimiento) : null,
    cedula: identificacion,
    grupo_sanguineo: p?.grupo_sanguineo ?? '—',
  };
}

export default function PacientesPage() {
  const notify = useNotify();

  const [filter, setFilter] = useState('');
  const [data, setData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Evitar doble/loop en dev (StrictMode) y deps inestables
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return; // evita segunda ejecución en dev
    didFetch.current = true;

    const ac = new AbortController();
    (async () => {
      setLoadingTable(true);
      try {
        const resp = await PacienteService.listarPacientes({ signal: ac.signal });
        // Tu backend: { pacientes: [...] }
        const arr = resp?.data?.pacientes || resp?.pacientes || [];
        const rows = Array.isArray(arr) ? arr.map(mapPacienteFromApi) : [];
        setData(rows);
      } catch (e) {
        if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
          notify.error(e?.message ?? 'No se pudieron cargar los pacientes');
        }
      } finally {
        setLoadingTable(false);
      }
    })();

    return () => ac.abort();
  }, []); // <- sin notify aquí

  const columns = [
    { name: 'Cédula', selector: row => row.cedula, sortable: true },
    { name: 'Nombre', selector: row => row.nombre, sortable: true },
    { name: 'Grupo S.', selector: row => row.grupo_sanguineo ?? '—', sortable: true, width: '120px' },
    {
      name: 'Opciones',
      cell: row => (
        <div className="flex gap-2">
          <button className="px-2 py-1 text-xs rounded-md border bg-blue-50 text-blue-600 hover:bg-blue-100">
            Editar
          </button>
          <button
            className="px-2 py-1 text-xs rounded-md border bg-red-50 text-red-600 hover:bg-red-100"
            onClick={() => setData(prev => prev.filter(x => x.id !== row.id))}
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return data;
    return data.filter(d =>
      d.nombre?.toLowerCase().includes(q) ||
      d.cedula?.toLowerCase().includes(q)
    );
  }, [data, filter]);

  async function handleSave(payload) {
    setSaving(true);
    try {
      const res = await PacienteService.crearPaciente(payload);
      const ok = res?.success ?? res?.data?.success ?? true;
      const message = res?.message ?? res?.data?.message ?? 'Paciente creado';
      if (ok) notify.success(message);

      const apiPaciente = res?.data?.paciente ?? res?.paciente ?? null;
      if (apiPaciente) {
        setData(prev => [...prev, mapPacienteFromApi(apiPaciente)]);
      } else {
        const { persona, grupo_sanguineo } = payload;
        const edad = persona?.fecha_nacimiento ? calcAge(persona.fecha_nacimiento) : null;
        setData(prev => ([
          ...prev,
          {
            id: crypto.randomUUID(),
            nombre: `${persona?.nombres ?? ''} ${persona?.apellidos ?? ''}`.trim(),
            edad,
            cedula: persona?.identificacion ?? '',
            grupo_sanguineo: grupo_sanguineo ?? '—',
          }
        ]));
      }
      setOpenCreate(false);
    } catch (e) {
      notify.error(e?.message ?? 'No se pudo crear el paciente');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <p className="text-neutral-600">Gestión de pacientes registrados.</p>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="h-10 w-full sm:w-72 rounded-xl border border-neutral-300 px-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
        />
        <button className="h-10 rounded-xl px-4 border bg-white border-neutral-300 hover:bg-neutral-50">
          Buscar
        </button>
        <button
          onClick={() => setOpenCreate(true)}
          className="h-10 rounded-xl px-4 border bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
        >
          + Agregar
        </button>
      </div>

      <div className="rounded-xl border border-neutral-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
          responsive
          noDataComponent="No se encontraron pacientes."
          progressPending={loadingTable}
          progressComponent={<div className="p-4">Cargando pacientes…</div>}
        />
      </div>

      <PacienteCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSave={handleSave}
        loading={saving}
      />
    </section>
  );
}
