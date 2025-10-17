'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import DataTable from 'react-data-table-component';

import CitaService from '../../../services/Citas.service';
import EspecialidadService from '@/services/Especialidad.service';
import PacienteService from '@/services/Paciente.service';

import AgendarCitasMedico from '@/components/modal/AgendarCitasMedico';
import EditarCitaMedico from '@/components/modal/EditarCitaMedico';
import FinalizarCitaMedico from '@/components/modal/FinalizarCitaMedico';

import Select from 'react-select';
import { FiEdit2, FiX, FiCheckSquare } from 'react-icons/fi';
import { confirm } from '@/components/confirm';
import { useNotify } from '@/components/useNotify';

/* =======================
   Helpers de mapeo
======================= */
function mapEspecialidadesPayload(payload) {
    const arr = payload?.especialidades ?? payload ?? [];
    return (arr || []).map(it => ({
        value: String(it._id),
        label: it.nombre,
    }));
}

/* =======================
   Página
======================= */
export default function CitasSecretaria() {
    // Filtros
    const [q, setQ] = useState('');
    const [especialidadesOpt, setEspecialidadesOpt] = useState([]); // opciones del combo
    const [especialidadOpt, setEspecialidadOpt] = useState(null);   // opción seleccionada

    // Tabla
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Modales
    const [isModalOpen, setIsModalOpen] = useState(false); // crear
    const [openEditar, setOpenEditar] = useState(false);
    const [citaEnEdicion, setCitaEnEdicion] = useState(null);

    const [openFinalizar, setOpenFinalizar] = useState(false);
    const [citaAFinalizar, setCitaAFinalizar] = useState(null);

    // Evitar doble fetch en StrictMode
    const didMountOnce = useRef(false);
    const isMounted = useRef(false);
    const notify = useNotify();

    const loadEspecialidadesOnce = useCallback(async () => {
        try {
            const data = mapEspecialidadesPayload(await EspecialidadService.listarEspecialidades());
            setEspecialidadesOpt(data);
        } catch (e) {
            console.error('Error cargando especialidades:', e);
            setEspecialidadesOpt([]);
        }
    }, []);

    useEffect(() => {
        loadEspecialidadesOnce();
    }, [loadEspecialidadesOnce]);


    const fetchCitas = useCallback(async ({ term = q.trim(), espId = especialidadOpt?.value } = {}) => {
        try {
            setLoading(true);
            setErrorMsg('');

            const res = await CitaService.listarDesdeMedico('PENDIENTE');
            const base = Array.isArray(res?.citas) ? res.citas : (Array.isArray(res) ? res : []);

            const byText = term
                ? base.filter(row => {
                    const per = row?.paciente?.persona;
                    const nombre = [per?.apellidos, per?.nombres].filter(Boolean).join(' ').toLowerCase();
                    const ci = (per?.identificacion ?? '').toLowerCase();
                    const motivo = (row?.motivo ?? '').toLowerCase();
                    const t = term.toLowerCase();
                    return nombre.includes(t) || ci.includes(t) || motivo.includes(t);
                })
                : base;

            // Filtro por especialidad en cliente
            const filtered = espId
                ? byText.filter(row => {
                    const esp = row?.medico?.especialidad;
                    const id = (esp?._id ?? esp) ? String(esp?._id ?? esp) : null;
                    return id === String(espId);
                })
                : byText;

            setData(filtered);
        } catch (err) {
            console.error(err);
            setErrorMsg('No se pudieron cargar las citas. Reintenta.');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [q, especialidadOpt?.value]);

    // Montaje inicial
    useEffect(() => {
        if (didMountOnce.current) return;
        didMountOnce.current = true;
        isMounted.current = true;
        fetchCitas();
        return () => { isMounted.current = false; };
    }, [fetchCitas]);

    // Re-fetch con debounce al cambiar filtros
    useEffect(() => {
        if (!isMounted.current) return;
        const h = setTimeout(() => { fetchCitas(); }, 300);
        return () => clearTimeout(h);
    }, [q, especialidadOpt, fetchCitas]);

    function handleBuscar() {
        fetchCitas();
    }

    function handleEspecialidadChange(opt) {
        setEspecialidadOpt(opt);
        // recarga inmediata con el nuevo filtro
        fetchCitas({ espId: opt?.value ?? null });
    }

    /* =======================
       Columnas DataTable
    ======================= */
    const columns = useMemo(
        () => [
            {
                name: 'Cédula',
                selector: row => row?.paciente?.persona?.identificacion ?? '—',
                sortable: true,
                style: { maxWidth: '150px' },
                wrap: true,
            },
            {
                name: 'Paciente',
                selector: row => {
                    const per = row?.paciente?.persona;
                    const ap = per?.apellidos ?? '';
                    const no = per?.nombres ?? '';
                    const full = [ap, no].filter(Boolean).join(' ');
                    return full || '—';
                },
                sortable: true,
                grow: 2,
                wrap: true,
            },
            {
                name: 'Motivo',
                selector: row => row?.motivo ?? '—',
                sortable: true,
                grow: 2,
                wrap: true,
            },
            {
                name: 'Fecha',
                selector: row => row?.fecha ?? '',
                sortable: true,
                format: row => {
                    if (!row?.fecha) return '—';
                    try {
                        const iso = String(row.fecha);
                        if (iso.includes('T')) return new Date(iso).toLocaleDateString('es-EC');
                        return iso;
                    } catch {
                        return '—';
                    }
                },
                style: { maxWidth: '160px' },
                wrap: true,
            },
            {
                name: 'Hora',
                selector: row => row?.hora ?? '—',
                sortable: true,
                style: { maxWidth: '120px' },
                wrap: true,
            },
            {
                name: 'Estado',
                selector: row => row?.estado ?? '—',
                sortable: true,
                style: { maxWidth: '160px' },
                cell: row => <EstadoBadge estado={row?.estado} />,
            },
            {
                name: 'Acciones',
                button: true,
                // ⚠️ No uses allowOverflow aquí para evitar el warning del DOM
                // allowOverflow: true,
                style: { maxWidth: '200px' },
                cell: row => {
                    const deshabilitarEdicion = row?.estado === 'CANCELADO' || row?.estado === 'FINALIZADO';
                    const deshabilitarCancelacion = row?.estado !== 'PENDIENTE';
                    const deshabilitarGestion = row?.estado !== 'PENDIENTE'; // Solo gestionar si está PENDIENTE

                    return (
                        <div className="flex items-center gap-2">
                            {/* Editar */}
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); editarCita(row); }}
                                disabled={deshabilitarEdicion}
                                className={[
                                    'p-2 rounded-md border transition',
                                    deshabilitarEdicion ? 'opacity-50 cursor-not-allowed border-neutral-200' : 'hover:bg-blue-50 border-blue-200'
                                ].join(' ')}
                                aria-label="Editar cita"
                                title={deshabilitarEdicion ? 'No editable' : 'Editar cita'}
                            >
                                <FiEdit2 className="text-blue-600" />
                            </button>

                            {/* Cancelar */}
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); cancelarCita(row); }}
                                disabled={deshabilitarCancelacion}
                                className={[
                                    'p-2 rounded-md border transition',
                                    deshabilitarCancelacion ? 'opacity-50 cursor-not-allowed border-neutral-200' : 'hover:bg-red-50 border-red-200'
                                ].join(' ')}
                                aria-label="Cancelar cita"
                                title={deshabilitarCancelacion ? 'Solo se puede cancelar si está PENDIENTE' : 'Cancelar cita'}
                            >
                                <FiX className="text-red-600" />
                            </button>

                            {/* Gestionar (Finalizar/Receta) */}
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); gestionarCita(row); }}
                                disabled={deshabilitarGestion}
                                className={[
                                    'p-2 rounded-md border transition',
                                    deshabilitarGestion ? 'opacity-50 cursor-not-allowed border-neutral-200' : 'hover:bg-emerald-50 border-emerald-200'
                                ].join(' ')}
                                aria-label="Gestionar cita"
                                title={deshabilitarGestion ? 'Solo PENDIENTE' : 'Finalizar / Recetar'}
                            >
                                <FiCheckSquare className="text-emerald-600" />
                            </button>
                        </div>
                    );
                },
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

    /* =======================
       Handlers de acciones
    ======================= */
    const gestionarCita = (row) => {
        setCitaAFinalizar(row);
        setOpenFinalizar(true);
    };

    const editarCita = (row) => {
        setCitaEnEdicion(row);
        setOpenEditar(true);
    };

    async function guardarEdicion(payload) {
        try {
            await CitaService.editarCitaMedico(payload);
         await fetchCitas();
        } catch (error) {
            notify.error('No se pudo editar la cita.');
        }
        
        setOpenEditar(false);
    }

    const cancelarCita = (row) => {
        confirm({
            type: 'cancel',
            title: '¿Cancelar cita?',
            text: 'Esta acción no se puede deshacer.',
            confirmText: 'Cancelar cita',
        }).then(async (isConfirmed) => {
            if (!isConfirmed) return;
            try {
                await CitaService.cancelarCita({ id: row._id });
                await fetchCitas();
            } catch (err) {
                console.error(err);
            }
        });
    };

    // Modal crear
    const onOpenModal = () => setIsModalOpen(true);
    const onCloseModal = () => setIsModalOpen(false);

    const onSaveNewCita = async (payload) => {
        await CitaService.crearCitaDesdeMedico(payload);
        onCloseModal();
        await fetchCitas();
    };

    async function guardarFinalizacion(payload) {
        try {
            await CitaService.finalizarCita(payload);
            await fetchCitas();
        } catch (err) {
            console.error(err);
        } finally {
            setOpenFinalizar(false);
        }
    }

    const lookupPaciente = async (identificacion) => {
        try {
            const res = await PacienteService.buscarPaciente(identificacion);
            return res?.paciente ?? res ?? null;
        } catch {
            return null;
        }
    };

    /* =======================
       Render
    ======================= */
    return (
        <section className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold">Citas pendientes</h1>
                <p className="text-neutral-600">Gestiona y finaliza las citas del día.</p>
            </header>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Búsqueda */}
                <div className="flex-1 flex items-center gap-2">
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
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

                {/* Especialidad */}
                <div className="w-64">
                    <Select
                        classNamePrefix="rs"
                        options={especialidadesOpt}
                        value={especialidadOpt}
                        onChange={handleEspecialidadChange}
                        placeholder="Filtrar por especialidad"
                        isClearable
                    />
                </div>

                {/* Crear cita */}
                <button
                    onClick={onOpenModal}
                    className="h-10 rounded-xl px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium text-sm md:text-base"
                >
                    + Agregar Cita
                </button>
            </div>

            {/* Error */}
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
                            Citas pendientes
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
                    dense={false}
                    customStyles={customStyles}
                    persistTableHead
                    responsive
                    noDataComponent={<div className="py-8 text-neutral-500">No hay citas para mostrar</div>}
                />
            </div>

            {/* Modal Agendar */}
            <AgendarCitasMedico
                open={isModalOpen}
                onClose={onCloseModal}
                onSave={onSaveNewCita}
                onLookupPaciente={lookupPaciente}
            />

            {/* Modal Editar */}
            <EditarCitaMedico
                open={openEditar}
                onClose={() => setOpenEditar(false)}
                onSave={guardarEdicion}
                loading={false}
                cita={citaEnEdicion}
            />

            {/* Modal Finalizar / Receta */}
            <FinalizarCitaMedico
                open={openFinalizar}
                onClose={() => setOpenFinalizar(false)}
                onSave={guardarFinalizacion}
                loading={false}
                cita={citaAFinalizar}
            />
        </section>
    );
}

/* ---------- Subcomponentes ---------- */
function EstadoBadge({ estado }) {
    const map = {
        PENDIENTE: 'bg-amber-100 text-amber-700 border-amber-200',
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
