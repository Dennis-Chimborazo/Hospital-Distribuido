'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import DataTable from 'react-data-table-component';
import CitaService from '../../../services/Citas.service';
import { useNotify } from '@/components/useNotify';
import Select from 'react-select';
import { FiEye } from 'react-icons/fi';

const ESTADO_OPTIONS = [
    { value: 'FINALIZADO', label: 'Finalizado' },
    { value: 'AUSENTE', label: 'Ausente' },
    { value: 'CANCELADO', label: 'Cancelado' },
];

export default function HistorialCitasMedico() {
    const notify = useNotify();
    const [q, setQ] = useState('');
    const [estadoOpt, setEstadoOpt] = useState(ESTADO_OPTIONS[0]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Evita doble fetch en StrictMode
    const didMountOnce = useRef(false);

    // (Opcional) Filtro en cliente si tu backend no soporta ?q=
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
            let  res = await CitaService.listarDesdeMedico(estado);
            const base = Array.isArray(res?.citas) ? res.citas : (Array.isArray(res) ? res : []);
            // Filtrado en cliente (descomenta si tu backend NO soporta q)
            const nextData = filterClient(base, q);
            setData(nextData);
        } catch (err) {
            console.error(err);
            setErrorMsg('No se pudieron cargar las citas. Reintenta.');
            setData([]);
            notify.error('No se pudieron cargar las citas. Reintenta.');
        } finally {
            setLoading(false);
        }
    }, [notify]);

    // Carga inicial
    useEffect(() => {
        if (didMountOnce.current) return;
        didMountOnce.current = true;
        fetchCitas({ q: '', estado: estadoOpt?.value ?? null });
    }, [fetchCitas, estadoOpt]);

    // Buscar al click
    function handleBuscar() {
        fetchCitas({ q: q.trim(), estado: estadoOpt?.value ?? null });
    }

    // Cambiar estado y cargar de una
    async function handleEstadoChange(opt) {
        setEstadoOpt(opt);
        // dispara el fetch con el filtro actual de búsqueda
        fetchCitas({ q: q.trim(), estado: opt?.value ?? null });
    }

    const columns = useMemo(
        () => [
            {
                name: 'Especialidad',
                selector: (row) => row?.medico?.especialidad?.nombre ?? '—',
                sortable: true,
                maxWidth: '180px',
            },
            {
                name: 'Consultorio',
                selector: (row) => {
                    const per = row?.medico?.consultorio;
                    const ap = per?.codigo ?? '';
                    const no = per?.nombre ?? '';
                    const full = [ap, no].filter(Boolean).join(' ');
                    return full || '—';
                },
                sortable: true,
                grow: 2,
            },
            {
                name: 'Cédula',
                selector: (row) => row?.paciente?.persona?.identificacion ?? '—',
                sortable: true,
                maxWidth: '150px',
            },
            {
                name: 'Paciente',
                selector: (row) => {
                    const per = row?.paciente?.persona;
                    const ap = per?.apellidos ?? '';
                    const no = per?.nombres ?? '';
                    const full = [ap, no].filter(Boolean).join(' ');
                    return full || '—';
                },
                sortable: true,
                grow: 2,
            },
            {
                name: 'Fecha',
                selector: (row) => row?.fecha ?? '',
                sortable: true,
                format: (row) => {
                    if (!row?.fecha) return '—';
                    try {
                        const iso = String(row.fecha);
                        if (iso.includes('T')) return new Date(iso).toLocaleDateString('es-EC');
                        return iso;
                    } catch {
                        return '—';
                    }
                },
                maxWidth: '160px',
            },
            {
                name: 'Hora',
                selector: (row) => row?.hora ?? '—',
                sortable: true,
                maxWidth: '120px',
            },
            {
                name: 'Estado',
                selector: (row) => row?.estado ?? '—',
                sortable: true,
                maxWidth: '160px',
                cell: (row) => <EstadoBadge estado={row?.estado} />,
            },
            {
                name: 'Acciones',
                button: true,
                ignoreRowClick: true,
                allowOverflow: true,
                maxWidth: '100px',
                cell: (row) => (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); verDetalles(row); }}
                        className="p-2 rounded-md border hover:bg-neutral-50 border-neutral-200"
                        aria-label="Ver detalles"
                        title="Ver detalles"
                    >
                        <FiEye className="text-neutral-700" />
                    </button>
                ),
            },
        ],
        []
    );

    const customStyles = useMemo(
        () => ({
            rows: { style: { minHeight: '56px' } },
            headCells: {
                style: { fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' },
            },
            cells: { style: { fontSize: '0.95rem' } },
        }),
        []
    );

    function verDetalles(row) {
        notify.info(`Detalle de la cita de ${row?.paciente?.persona?.apellidos ?? ''} ${row?.paciente?.persona?.nombres ?? ''}`);
    }

    return (
        <section className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold">Citas</h1>
                <p className="text-neutral-600">Resumen de tu día de trabajo.</p>
            </header>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Búsqueda + Botón Buscar */}
                <div className="flex-1 flex items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar por paciente, motivo, CI..."
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={handleBuscar}
                        className="h-10 rounded-xl px-4 border bg-blue-600 text-white border-blue-600 hover:brightness-105"
                    >
                        Buscar
                    </button>
                </div>

                {/* Select de estado */}
                <Select
                    classNamePrefix="rs"
                    options={ESTADO_OPTIONS}
                    value={estadoOpt}
                    onChange={handleEstadoChange}
                    placeholder="Buscar por estados"
                    isClearable={false}
                />
                {/* ← recarga al cambiar */}

            </div>

            {/* Estado de carga / error */}
            {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {errorMsg}
                </div>
            )}

            {/* Tabla */}
            <div className="rounded-2xl border border-neutral-200 overflow-hidden">
                <DataTable
                    title={
                        <div className="text-base font-semibold">
                            {estadoOpt?.label ?? 'Citas'}
                            <span className="ml-2 text-sm font-normal text-neutral-500">
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
                    noDataComponent={
                        <div className="py-8 text-neutral-500">No hay citas para mostrar</div>
                    }
                />
            </div>
        </section>
    );
}

/* ---------- Subcomponentes ---------- */

function EstadoBadge({ estado }) {
    const map = {
        PENDIENTE: 'bg-amber-100 text-amber-700 border-amber-200',
        AUSENTE: 'bg-amber-100 text-amber-700 border-amber-200',
        CANCELADO: 'bg-rose-100 text-rose-700 border-rose-200',
        FINALIZADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    const cls = map[estado] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200';

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
            {estado ?? '—'}
        </span>
    );
}
