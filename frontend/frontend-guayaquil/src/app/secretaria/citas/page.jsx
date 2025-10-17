'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import DataTable from 'react-data-table-component';
import CitaService from '../../../services/Citas.service';
import AgendarCitasSecretaria from '@/components/modal/AgendarCitasSecretaria';
import EditarCitaSecretaria from '@/components/modal/EditarCitaSecretaria';
import { useNotify } from '@/components/useNotify';
import { confirm } from '@/components/confirm';
import Select from 'react-select';
import { FiEdit2, FiX } from 'react-icons/fi';

const ESTADO_OPTIONS = [
    { value: null, label: 'Todos los estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'CANCELADO', label: 'Cancelado' },
    { value: 'FINALIZADO', label: 'Finalizado' },
];

export default function CitasSecretaria() {
    const notify = useNotify();
    const [q, setQ] = useState('');
    const [estado, setEstado] = useState(null); // 'PENDIENTE' | 'CANCELADO' | 'FINALIZADO' | null
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [openEditar, setOpenEditar] = useState(false);
    const [citaEnEdicion, setCitaEnEdicion] = useState(null);


    // Nuevo estado para el modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Evita el doble fetch SOLO en el primer montaje (Strict Mode)
    const didMountOnce = useRef(false);
    const isMounted = useRef(false);

    // Asegúrate de que el backend pueda manejar 'q' y 'estado' como filtros
    const fetchCitas = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            let res = await CitaService.listarPorEstado('PENDIENTE');
            const nextData = Array.isArray(res?.citas)
                ? res.citas
                : Array.isArray(res)
                    ? res
                    : [];
            setData(nextData);
        } catch (err) {
            console.error(err);
            setErrorMsg('No se pudieron cargar las citas. Reintenta.');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [q, estado]);

    // 1) Montaje inicial: evita la doble ejecución en dev
    useEffect(() => {
        if (didMountOnce.current) return; // si Strict Mode llama 2 veces, la 2da se ignora
        didMountOnce.current = true;
        isMounted.current = true;
        fetchCitas();

        // cleanup para saber si el componente se desmontó al navegar
        return () => {
            isMounted.current = false;
        };
    }, [fetchCitas]);

    // 2) Re-fetch cuando cambien filtros (ya después del primer montaje)
    useEffect(() => {
        if (!isMounted.current) return; // aún no montado del todo
        // Un pequeño debounce sería útil aquí para 'q'
        const handler = setTimeout(() => {
            fetchCitas();
        }, 300); // Espera 300ms después de que 'q' o 'estado' cambien

        return () => {
            clearTimeout(handler);
        };
    }, [estado, q, fetchCitas]);

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
                name: 'Cedula',
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
            // {
            //     name: 'Medico',
            //     selector: (row) => {
            //         const per = row?.medico?.persona;
            //         const ap = per?.apellidos ?? '';
            //         const no = per?.nombres ?? '';
            //         const full = [ap, no].filter(Boolean).join(' ');
            //         return full || '—';
            //     },
            //     sortable: true,
            //     grow: 2,
            // },
            // {
            //     name: 'Motivo',
            //     selector: (row) => row?.motivo ?? '—',
            //     sortable: true,
            //     grow: 2,
            // },
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
                maxWidth: '140px',
                cell: (row) => {
                    const deshabilitarEdicion = row?.estado === 'CANCELADO' || row?.estado === 'FINALIZADO';
                    const deshabilitarCancelacion = row?.estado !== 'PENDIENTE';

                    return (
                        <div className="flex items-center gap-2">
                            {/* Editar */}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); editarCita(row); }}
                                disabled={deshabilitarEdicion}
                                className={[
                                    'p-2 rounded-md border transition',
                                    deshabilitarEdicion
                                        ? 'opacity-50 cursor-not-allowed border-neutral-200'
                                        : 'hover:bg-blue-50 border-blue-200'
                                ].join(' ')}
                                aria-label="Editar cita"
                                title={deshabilitarEdicion ? 'No editable' : 'Editar cita'}
                            >
                                <FiEdit2 className="text-blue-600" />
                            </button>

                            {/* Cancelar */}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); cancelarCita(row); }}
                                disabled={deshabilitarCancelacion}
                                className={[
                                    'p-2 rounded-md border transition',
                                    deshabilitarCancelacion
                                        ? 'opacity-50 cursor-not-allowed border-neutral-200'
                                        : 'hover:bg-red-50 border-red-200'
                                ].join(' ')}
                                aria-label="Cancelar cita"
                                title={deshabilitarCancelacion ? 'Solo se puede cancelar si está PENDIENTE' : 'Cancelar cita'}
                            >
                                <FiX className="text-red-600" />
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

    const editarCita = (row) => {
        setCitaEnEdicion(row);
        setOpenEditar(true);
    };

    async function guardarEdicion(payload) {
        try {
            const res = await CitaService.editarCitaSecretaria(payload);
            console.log(res)
            notify.success('Cita editada.');
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
                notify.success('Cita cancelada.');
                await fetchCitas();

            } catch (err) {
                notify.error('No se pudo cancelar la cita.');
            }
        });
    }

    // ********** Lógica del Modal **********
    const onOpenModal = () => setIsModalOpen(true);
    const onCloseModal = () => setIsModalOpen(false);

    // Función que se ejecuta al guardar la cita en el modal
    const onSaveNewCita = async (payload) => {
        try {
            await CitaService.crearCitaDesdeSecretaria(payload);
            await fetchCitas();
            onCloseModal();
        } catch (error) {
            console.error('Error al agendar cita:', err);

        }
    };


    return (
        <section className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold">Citas</h1>
                <p className="text-neutral-600">Resumen de tu día de trabajo.</p>
            </header>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">

                {/* Filtro de búsqueda */}
                <div className="flex-1 flex items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar por paciente, motivo, CI..."
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Select de estado y botón de Agregar Cita */}
                <div className="flex items-center gap-2">
                    <div className="w-48">
                        <Select
                            label="Estado"
                            name="estado"
                            value={estado ?? ''}
                            onChange={(e) => setEstado(e.target.value === '' ? null : e.target.value)}
                            options={ESTADO_OPTIONS}
                        />
                    </div>

                    <button
                        onClick={onOpenModal}
                        className="h-10 rounded-xl px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium text-sm md:text-base"
                    >
                        + Agregar Cita
                    </button>
                </div>
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
                            {ESTADO_OPTIONS.find(opt => opt.value === estado)?.label ?? 'Citas'}
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
                    noDataComponent={
                        <div className="py-8 text-neutral-500">No hay citas para mostrar</div>
                    }
                />
            </div>

            {/* Modal de Agendar Cita */}
            <AgendarCitasSecretaria
                open={isModalOpen}
                onClose={onCloseModal}
                onSave={onSaveNewCita}
            />
            <EditarCitaSecretaria
                open={openEditar}
                onClose={() => setOpenEditar(false)}
                onSave={guardarEdicion}
                loading={false}
                cita={citaEnEdicion}
            />

        </section>
    );
}

// ** Mantenemos los subcomponentes del archivo original (o asumimos que están importados) **

// --- Subcomponentes auxiliares ---

function EstadoBadge({ estado }) {
    const map = {
        PENDIENTE: 'bg-amber-100 text-amber-700 border-amber-200',
        CANCELADO: 'bg-rose-100 text-rose-700 border-rose-200',
        FINALIZADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    const cls = map[estado] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200';

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
        >
            {estado ?? '—'}
        </span>
    );
}