'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const MAX_OBS = 1000;
const MAX_IND_GEN = 2000;

const SUG_DOSIS = ['250 mg', '500 mg', '1 tableta', '2 tabletas', '5 ml', '10 ml'];
const SUG_FREC = ['cada 8 horas', 'cada 12 horas', 'cada 24 horas', '2 veces al día', '3 veces al día'];
const SUG_DUR = ['3 días', '5 días', '7 días', '10 días', '14 días'];

export default function FinalizarCitaMedico({
    open,
    onClose,
    onSave,
    loading = false,
    cita,
}) {
    const dialogRef = useRef(null);
    const firstMedRef = useRef(null);
    const errorBoxRef = useRef(null);

    const [errors, setErrors] = useState({});
    const [observaciones, setObservaciones] = useState('');
    const [agregarReceta, setAgregarReceta] = useState(false);

    const [tipoReceta, setTipoReceta] = useState('NORMAL');
    const [vigencia, setVigencia] = useState('');
    const [indicacionesGenerales, setIndicacionesGenerales] = useState('');
    const [medicamentos, setMedicamentos] = useState([
        { nombre: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' },
    ]);

    const pacienteVM = useMemo(() => {

        const p = cita?.paciente?.persona;
        return {
            nombres: p?.nombres ?? '',
            apellidos: p?.apellidos ?? '',
            identificacion: p?.identificacion ?? '',
        };
    }, [cita]);

    useEffect(() => {
        if (!open) return;
        setErrors({});
        setObservaciones('');
        setAgregarReceta(false);
        setTipoReceta('NORMAL');
        setVigencia('');
        setIndicacionesGenerales('');
        setMedicamentos([{ nombre: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' }]);

        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const todayYYYYMMDD = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    };

    const trimMed = (m) => ({
        nombre: (m.nombre ?? '').trim(),
        dosis: (m.dosis ?? '').trim(),
        frecuencia: (m.frecuencia ?? '').trim(),
        duracion: (m.duracion ?? '').trim(),
        indicaciones: (m.indicaciones ?? '').trim(),
    });

    const isEmptyMed = (m) => !m.nombre && !m.dosis && !m.frecuencia && !m.duracion && !m.indicaciones;
    const cleanedMedicamentos = (list) => list.map(trimMed).filter(m => !isEmptyMed(m));

    function validate() {
        const e = {};
        if (!observaciones.trim()) e.observaciones = 'Requerido';

        if (agregarReceta) {
            if (!tipoReceta) e.tipoReceta = 'Seleccione un tipo de receta';
            const medsOk = cleanedMedicamentos(medicamentos);
            if (medsOk.length === 0) {
                e.medicamentos = 'Agregue al menos un medicamento con datos';
            } else {
                medsOk.forEach((m, i) => {
                    if (!m.nombre) e[`medicamento_${i}_nombre`] = 'Requerido';
                    if (!m.dosis) e[`medicamento_${i}_dosis`] = 'Requerido';
                    if (!m.frecuencia) e[`medicamento_${i}_frecuencia`] = 'Requerido';
                    if (!m.duracion) e[`medicamento_${i}_duracion`] = 'Requerido';
                });
            }
        }
        return e;
    }

    function scrollToFirstError(eobj) {
        if (errorBoxRef.current) {
            errorBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (eobj.observaciones) {
            document.getElementById('obs-textarea')?.focus();
            return;
        }
        const key = Object.keys(eobj).find(k => k.startsWith('medicamento_'));
        if (key) {
            const idx = Number(key.split('_')[1]);
            document.querySelector(`[data-med-row="${idx}"] input, [data-med-row="${idx}"] textarea`)?.focus();
        }
    }

    function handleMedicamentoChange(idx, field, value) {
        setMedicamentos(prev => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
    }

    function addMedicamento() {
        setMedicamentos(prev => [...prev, { nombre: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' }]);
        setTimeout(() => {
            const el = document.querySelector(`[data-med-nombre="${medicamentos.length}"]`);
            el?.focus();
        }, 0);
    }

    function removeEmptyRows() {
        setMedicamentos(prev => {
            const next = cleanedMedicamentos(prev);
            return next.length ? next : [{ nombre: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' }];
        });
    }

    function removeMedicamento(idx) {
        setMedicamentos(prev => {
            const next = prev.filter((_, i) => i !== idx);
            return next.length ? next : [{ nombre: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' }];
        });
    }

    function handleToggleReceta(checked) {
        setAgregarReceta(checked);
        if (checked) setTimeout(() => firstMedRef.current?.focus(), 0);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const eobj = validate();
        setErrors(eobj);
        if (Object.keys(eobj).length) {
            scrollToFirstError(eobj);
            return;
        }

        const medsOk = agregarReceta ? cleanedMedicamentos(medicamentos) : [];

        const payload = {
            id: cita?._id,
            observaciones: observaciones.trim(),
            receta: agregarReceta

                ? {
                    agregar: true,
                    paciente: cita?.paciente?.id,
                    tipo_receta: tipoReceta,
                    vigencia: vigencia ? new Date(`${vigencia}T00:00:00`).toISOString() : undefined,
                    medicamentos: medsOk,
                    indicaciones_generales: (indicacionesGenerales ?? '').trim() || undefined,
                }
                : { agregar: false },
        };
        
        await onSave?.(payload);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="finalizar-cita-title">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 grid place-items-center p-4">
                <div
                    ref={dialogRef}
                    className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl border border-neutral-200 overflow-hidden"
                >
                    {/* Header fijo */}
                    <header className="px-5 py-4 border-b bg-neutral-50">
                        <div className="flex flex-col gap-1">
                            <h3 id="finalizar-cita-title" className="text-lg font-semibold">Gestionar cita</h3>
                            <p className="text-sm text-neutral-600">Finaliza la cita e (opcional) agrega la receta médica.</p>
                            <div className="mt-1 text-sm">
                                <span className="font-semibold">{pacienteVM.apellidos} {pacienteVM.nombres}</span>
                                {pacienteVM.identificacion && <span className="text-neutral-600"> — CI: {pacienteVM.identificacion}</span>}
                            </div>
                        </div>
                    </header>

                    {/* Body con scroll */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                        {/* Observaciones */}
                        <section className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-neutral-700">Observaciones</h4>
                                <span className="text-xs text-neutral-500">{observaciones.length}/{MAX_OBS}</span>
                            </div>
                            <label className="block">
                                <textarea
                                    id="obs-textarea"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value.slice(0, MAX_OBS))}
                                    rows={4}
                                    className={[
                                        'mt-1 w-full rounded-xl border px-3 py-2 outline-none bg-white',
                                        errors.observaciones ? 'border-red-400 focus:ring-4 focus:ring-red-200'
                                            : 'border-neutral-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200',
                                    ].join(' ')}
                                    placeholder="Escribe observaciones de la consulta…"
                                    aria-invalid={!!errors.observaciones}
                                />
                                {errors.observaciones && <span className="text-xs text-red-600">{errors.observaciones}</span>}
                            </label>
                        </section>

                        {/* Receta */}
                        <section className="space-y-3">
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={agregarReceta}
                                    onChange={(e) => handleToggleReceta(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <span className="text-sm font-medium text-neutral-800">Agregar receta médica</span>
                            </label>

                            {Object.keys(errors).some(k => k === 'tipoReceta' || k === 'medicamentos' || k.startsWith('medicamento_')) && (
                                <div
                                    ref={errorBoxRef}
                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                                >
                                    Revisa los campos de la receta. {errors.tipoReceta && <b>{errors.tipoReceta}</b>} {errors.medicamentos && <b>{errors.medicamentos}</b>}
                                </div>
                            )}

                            <div className={['transition-opacity duration-200', agregarReceta ? 'opacity-100' : 'opacity-60'].join(' ')}>
                                <fieldset disabled={!agregarReceta} className="mt-2 rounded-xl border border-neutral-200">
                                    {/* Header receta */}
                                    <div className="p-4 pb-0 grid sm:grid-cols-3 gap-3">
                                        <Field
                                            label="Tipo de receta"
                                            name="tipo_receta"
                                            as="select"
                                            value={tipoReceta}
                                            onChange={(e) => setTipoReceta(e.target.value)}
                                            error={errors.tipoReceta}
                                        >
                                            <option value="NORMAL">NORMAL</option>
                                            <option value="CONTROLADA">CONTROLADA</option>
                                            <option value="REPETIBLE">REPETIBLE</option>
                                        </Field>

                                        <Field
                                            label="Vigencia"
                                            name="vigencia"
                                            type="date"
                                            value={vigencia}
                                            onChange={(e) => setVigencia(e.target.value)}
                                            min={todayYYYYMMDD()}
                                        />

                                        <div />
                                    </div>

                                    {/* Medicamentos */}
                                    <div className="mt-4 px-4 pb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h6 className="text-sm font-semibold text-neutral-700">Fármacos Prescritos</h6>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={addMedicamento}
                                                    className="h-9 px-3 rounded-lg bg-blue-600 text-white hover:brightness-105 text-sm"
                                                    title="Agregar medicamento"
                                                >
                                                    + Agregar Medicamento
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={removeEmptyRows}
                                                    className="h-9 px-3 rounded-lg border bg-white hover:bg-neutral-50 text-sm"
                                                    title="Descartar filas vacías"
                                                >
                                                    Descartar vacíos
                                                </button>
                                            </div>
                                        </div>

                                        {/* datalist */}
                                        <datalist id="dl-dosis">{SUG_DOSIS.map(v => <option key={v} value={v} />)}</datalist>
                                        <datalist id="dl-frec">{SUG_FREC.map(v => <option key={v} value={v} />)}</datalist>
                                        <datalist id="dl-dur">{SUG_DUR.map(v => <option key={v} value={v} />)}</datalist>

                                        {/* Encabezados tabla */}
                                        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60">
                                            <div className="grid sm:grid-cols-5 gap-2 px-3 py-2 text-xs font-semibold text-neutral-600">
                                                <span>Nombre</span>
                                                <span>Dosis</span>
                                                <span>Frecuencia</span>
                                                <span>Duración</span>
                                                <span className="flex items-center justify-between">
                                                    <span>Indicaciones <span className="text-[11px] text-neutral-500">(Opcional)</span></span>
                                                    <span className="text-rose-500 text-base leading-none select-none">&times;</span>
                                                </span>
                                            </div>

                                            {/* Lista con scroll propio */}
                                            <div className="max-h-72 overflow-y-auto divide-y">
                                                {medicamentos.map((m, idx) => {
                                                    const isFirst = idx === 0;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="px-3 py-2"
                                                            data-med-row={idx}
                                                        >
                                                            <div className="grid sm:grid-cols-5 gap-2">
                                                                <SmallField
                                                                    label={null}
                                                                    value={m.nombre}
                                                                    onChange={(e) => handleMedicamentoChange(idx, 'nombre', e.target.value)}
                                                                    error={errors[`medicamento_${idx}_nombre`]}
                                                                    inputProps={{
                                                                        ref: isFirst ? firstMedRef : undefined,
                                                                        'data-med-nombre': idx,
                                                                        placeholder: 'Paracetamol…',
                                                                    }}
                                                                />
                                                                <SmallField
                                                                    label={null}
                                                                    value={m.dosis}
                                                                    onChange={(e) => handleMedicamentoChange(idx, 'dosis', e.target.value)}
                                                                    error={errors[`medicamento_${idx}_dosis`]}
                                                                    inputProps={{ list: 'dl-dosis', placeholder: '500 mg / 1 tab…' }}
                                                                />
                                                                <SmallField
                                                                    label={null}
                                                                    value={m.frecuencia}
                                                                    onChange={(e) => handleMedicamentoChange(idx, 'frecuencia', e.target.value)}
                                                                    error={errors[`medicamento_${idx}_frecuencia`]}
                                                                    inputProps={{ list: 'dl-frec', placeholder: 'cada 8 horas…' }}
                                                                />
                                                                <SmallField
                                                                    label={null}
                                                                    value={m.duracion}
                                                                    onChange={(e) => handleMedicamentoChange(idx, 'duracion', e.target.value)}
                                                                    error={errors[`medicamento_${idx}_duracion`]}
                                                                    inputProps={{ list: 'dl-dur', placeholder: '5 días…' }}
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        value={m.indicaciones}
                                                                        onChange={(e) => handleMedicamentoChange(idx, 'indicaciones', e.target.value)}
                                                                        placeholder="Tomar con alimentos…"
                                                                        className="w-full h-9 rounded-lg border px-2 outline-none bg-white text-sm border-neutral-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeMedicamento(idx)}
                                                                        className="shrink-0 h-8 w-8 rounded-md border text-rose-600 hover:bg-rose-50"
                                                                        title="Eliminar fila"
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Indicaciones generales */}
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-neutral-800">Indicaciones generales</span>
                                                <span className="text-xs text-neutral-500">{indicacionesGenerales.length}/{MAX_IND_GEN}</span>
                                            </div>
                                            <textarea
                                                rows={3}
                                                value={indicacionesGenerales}
                                                onChange={(e) => setIndicacionesGenerales(e.target.value.slice(0, MAX_IND_GEN))}
                                                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none bg-white border-neutral-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                                                placeholder="Indicaciones generales para el paciente…"
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </section>
                    </form>

                    {/* Footer fijo */}
                    <footer className="px-5 py-3 border-t bg-white flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 rounded-xl px-4 border bg-white border-neutral-300 hover:bg-neutral-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="__noop" // no hace falta; el form está arriba. Lo dejamos sin form id.
                            onClick={(e) => {
                                // dispara el submit del form principal
                                const form = dialogRef.current?.querySelector('form');
                                form?.requestSubmit();
                            }}
                            className="h-10 rounded-xl px-4 border bg-emerald-600 text-white border-emerald-600 hover:brightness-105 disabled:opacity-70"
                            disabled={loading}
                        >
                            {loading ? 'Guardando…' : 'Finalizar cita'}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}

/* ---------- Campos ---------- */
function Field({ label, name, value, onChange, type = 'text', placeholder, error, as = 'input', children, min }) {
    const Tag = as === 'select' ? 'select' : 'input';
    return (
        <label className="block">
            {label && <span className="text-sm font-medium text-neutral-800">{label}</span>}
            <Tag
                name={name}
                type={as === 'select' ? undefined : type}
                value={value}
                onChange={onChange}
                min={min}
                className={[
                    'mt-1 w-full h-10 rounded-xl border px-3 outline-none bg-white',
                    error ? 'border-red-400 focus:ring-4 focus:ring-red-200'
                        : 'border-neutral-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200',
                ].join(' ')}
                placeholder={placeholder}
                aria-invalid={!!error}
            >
                {as === 'select' ? children : null}
            </Tag>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </label>
    );
}

function SmallField({ label, value, onChange, error, inputProps }) {
    return (
        <label className="block">
            {label ? <span className="text-xs font-medium text-neutral-800">{label}</span> : null}
            <input
                {...(inputProps || {})}
                value={value}
                onChange={onChange}
                className={[
                    'mt-1 w-full h-9 rounded-lg border px-2 outline-none bg-white text-sm',
                    error ? 'border-red-400 focus:ring-4 focus:ring-red-200'
                        : 'border-neutral-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200',
                ].join(' ')}
                aria-invalid={!!error}
            />
            {error && <span className="text-xs text-red-600">{error}</span>}
        </label>
    );
}
