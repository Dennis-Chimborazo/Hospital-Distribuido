'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import DataTable from 'react-data-table-component';
import CitaService from '../../../services/Citas.service';
import { useNotify } from '@/components/useNotify';
import Select from 'react-select';
import { FiEye } from 'react-icons/fi';
import './HistorialCitasMedico.css'; // ⬅️ importa la hoja de estilos

const ESTADO_OPTIONS = [
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'AUSENTE', label: 'Ausente' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

// Para que react-select respete el tema (no se estiliza bien solo con CSS)
const selectStyles = {
  control: (base, state) => ({
    ...base,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: state.isFocused ? '#21b7a5' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(13,148,136,.22)' : 'none',
    ':hover': { borderColor: state.isFocused ? '#21b7a5' : '#cbd9df' },
  }),
  menu: (base) => ({ ...base, borderRadius: 12, overflow: 'hidden' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#21b7a5' : state.isFocused ? '#e6fffb' : 'transparent',
    color: state.isSelected ? '#fff' : '#0b2430',
  }),
  singleValue: (b) => ({ ...b, color: '#0b2430' }),
};

export default function HistorialCitasMedico() {
  const notify = useNotify();
  const [q, setQ] = useState('');
  const [estadoOpt, setEstadoOpt] = useState(ESTADO_OPTIONS[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const didMountOnce = useRef(false);

  const filterClient = (rows, term) => {
    const t = term.trim().toLowerCase();
    if (!t) return rows;
    return (rows ?? []).filter(row => {
      const per = row?.paciente?.persona;
      const nombre = [per?.apellidos, per?.nombres].filter(Boolean).join(' ').toLowerCase();
      const ci = per?.identificacion?.toLowerCase() ?? '';
      const motivo = row?.motivo?.toLowerCase?.() ?? '';
      return nombre.includes(t) || ci.includes(t) || motivo.includes(t);
    });
  };

  const fetchCitas = useCallback(async ({ q = '', estado = null } = {}) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await CitaService.listarDesdeMedico(estado);
      const base = Array.isArray(res?.citas) ? res.citas : (Array.isArray(res) ? res : []);
      setData(filterClient(base, q));
    } catch (err) {
      console.error(err);
      const msg = 'No se pudieron cargar las citas. Reintenta.';
      setErrorMsg(msg);
      setData([]);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (didMountOnce.current) return;
    didMountOnce.current = true;
    fetchCitas({ q: '', estado: estadoOpt?.value ?? null });
  }, [fetchCitas, estadoOpt]);

  function handleBuscar() {
    fetchCitas({ q: q.trim(), estado: estadoOpt?.value ?? null });
  }

  async function handleEstadoChange(opt) {
    setEstadoOpt(opt);
    fetchCitas({ q: q.trim(), estado: opt?.value ?? null });
  }

  const columns = useMemo(() => [
    { name: 'Especialidad', selector: (r) => r?.medico?.especialidad?.nombre ?? '—', sortable: true, maxWidth: '180px' },
    { name: 'Consultorio', selector: (r) => {
        const c = r?.medico?.consultorio; const ap = c?.codigo ?? ''; const no = c?.nombre ?? '';
        return [ap, no].filter(Boolean).join(' ') || '—';
      }, sortable: true, grow: 2 },
    { name: 'Cédula', selector: (r) => r?.paciente?.persona?.identificacion ?? '—', sortable: true, maxWidth: '150px' },
    { name: 'Paciente', selector: (r) => {
        const p = r?.paciente?.persona; return [p?.apellidos ?? '', p?.nombres ?? ''].filter(Boolean).join(' ') || '—';
      }, sortable: true, grow: 2 },
    { name: 'Fecha', selector: (r) => r?.fecha ?? '', sortable: true, format: (r) => {
        if (!r?.fecha) return '—';
        try { const iso = String(r.fecha); return iso.includes('T') ? new Date(iso).toLocaleDateString('es-EC') : iso; }
        catch { return '—'; }
      }, maxWidth: '160px' },
    { name: 'Hora', selector: (r) => r?.hora ?? '—', sortable: true, maxWidth: '120px' },
    { name: 'Estado', selector: (r) => r?.estado ?? '—', sortable: true, maxWidth: '160px', cell: (r) => <EstadoBadge estado={r?.estado} /> },
    { name: 'Acciones', button: true, ignoreRowClick: true, allowOverflow: true, maxWidth: '100px',
      cell: (row) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); verDetalles(row); }}
          className="icon-btn icon-blue"
          title="Ver detalles"
          aria-label="Ver detalles"
        >
          <FiEye />
        </button>
      ),
    },
  ], []);

  // DataTable necesita estilos por prop (no toma CSS interno)
  const customStyles = useMemo(() => ({
    rows: { style: { minHeight: '56px', backgroundColor: '#ffffff', color: '#0b2430' } },
    headCells: { style: { fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', backgroundColor: '#f8fafc', color: '#0b2430' } },
    cells: { style: { fontSize: '0.95rem', borderBottom: '1px solid #eef2f7' } },
  }), []);

  function verDetalles(row) {
    const p = row?.paciente?.persona;
    notify.info(`Detalle de la cita de ${p?.apellidos ?? ''} ${p?.nombres ?? ''}`);
  }

  return (
    <section className="citas-shell">
      <div className="citas-card">
        <header>
          <h1 className="citas-title">Citas</h1>
          <p className="citas-sub">Resumen de tu día de trabajo.</p>
        </header>

        {/* Toolbar */}
        <div className="citas-toolbar">
          <div className="citas-search">
            <label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por paciente, motivo, CI..."
                className="citas-input"
              />
              <svg className="citas-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </label>

            <button type="button" onClick={handleBuscar} className="modulo-btn btn-primary">
              Buscar
            </button>
          </div>

          <div style={{ minWidth: 220 }}>
            <Select
              classNamePrefix="rs"
              options={ESTADO_OPTIONS}
              value={estadoOpt}
              onChange={handleEstadoChange}
              placeholder="Finalizado"
              isClearable={false}
              styles={selectStyles}
            />
          </div>
        </div>

        {/* Alert */}
        {errorMsg && <div className="citas-alert">{errorMsg}</div>}

        {/* Tabla */}
        <div className="citas-table">
          <DataTable
            title={
              <div style={{ fontWeight: 600 }}>
                {estadoOpt?.label ?? 'Citas'}
                <span style={{ marginLeft: 8, fontWeight: 400, color: '#64748b' }}>
                  {data?.length ?? 0} resultado(s)
                </span>
              </div>
            }
            columns={columns}
            data={data}
            progressPending={loading}
            pagination
            highlightOnHover
            pointerOnHover
            striped
            customStyles={customStyles}
            persistTableHead
            responsive
            noDataComponent={<div style={{ padding: 24, color: '#6b7b8a' }}>No hay citas para mostrar</div>}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- Subcomponentes ---------- */
function EstadoBadge({ estado }) {
  let cls = 'badge badge-neutral';
  if (estado === 'FINALIZADO') cls = 'badge badge-finalizado';
  else if (estado === 'CANCELADO') cls = 'badge badge-cancelado';
  else if (estado === 'PENDIENTE' || estado === 'AUSENTE') cls = 'badge badge-pendiente';

  return (
    <span className={cls}>
      <span className="badge-dot" />
      {estado ?? '—'}
    </span>
  );
}
