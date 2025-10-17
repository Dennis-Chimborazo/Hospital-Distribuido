'use client';

import { useEffect, useRef, useState } from 'react';
import PacienteService from '@/services/Paciente.service';

export default function AgendarCitasMedico({
    open,
    onClose,
    onSave,
    loading = false,
}) {
    const dialogRef = useRef(null);
    const firstInputRef = useRef(null);

    const [errors, setErrors] = useState({});
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [paciente, setPaciente] = useState(null);

    const [form, setForm] = useState({
        medico: '',
        paciente: '',
        motivo: '',
        fecha: '', // yyyy-MM-dd
        hora: '',
        // HH:mm (24h)
    });

    useEffect(() => {
        if (open) {
            setErrors({});
            setLookupError('');
            setPaciente(null);
            setTimeout(() => firstInputRef.current?.focus(), 0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => (document.body.style.overflow = '');
    }, [open]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    // --- Normaliza cualquier forma de respuesta del backend a un "view model" sin exponer IDs ---
    function normalizePaciente(apiData) {
        // si viene { paciente: {...} }, tomar ese; si viene directo, usarlo tal cual
        const p = apiData?.paciente ?? apiData ?? null;
        if (!p) return null;

        const persona = p.persona ?? {};
        return {
            // Usamos este ID SOLO para enviar al backend, NO se muestra en UI:
            pacienteId: p._id ?? p.pacienteId ?? null,

            // Datos visibles:
            nombres: persona.nombres ?? p.nombres ?? '',
            apellidos: persona.apellidos ?? p.apellidos ?? '',
            identificacion: persona.identificacion ?? p.identificacion ?? '',
            email: persona.email ?? p.email ?? '',
            telefono: persona.telefono ?? p.telefono ?? '',
            direccion: persona.direccion ?? p.direccion ?? '',

            // Datos clínicos del paciente:
            grupo_sanguineo: p.grupo_sanguineo ?? '',
            alergias: Array.isArray(p.alergias) ? p.alergias : [],
            antecedente_familiar: p.antecedente_familiar ?? '',
        };
    }

    async function handleLookup() {
        const identificacion = form.identificacion.trim(); // ← corrige variable
        setLookupError('');
        setPaciente(null);

        if (!identificacion) {
            setLookupError('Ingrese una identificación para buscar.');
            return;
        }

        try {
            setLookupLoading(true);
            let data = null;

            if (typeof onLookupPaciente === 'function') {
                data = await onLookupPaciente(identificacion);
            } else {
                // Asume que el service ya devuelve el objeto final (no response.ok/json)
                data = await PacienteService.buscarPaciente(identificacion);
            }

            const normalized = normalizePaciente(data);
            if (!normalized || !normalized.identificacion) {
                setLookupError('Paciente no encontrado con esa identificación.');
                setPaciente(null);
            } else {
                setPaciente(normalized);
            }
        } catch (err) {
            setLookupError(err.message || 'Error al buscar paciente.');
        } finally {
            setLookupLoading(false);
        }
    }


    function validate() {
        const e = {};
        if (!form.identificacion.trim()) e.identificacion = 'Requerido';
        if (!paciente?.pacienteId) e.paciente = 'Debe seleccionar un paciente válido (busque por identificación).';
        if (!form.motivo.trim()) e.motivo = 'Requerido';
        if (!form.fecha) e.fecha = 'Requerido';
        if (!form.hora) e.hora = 'Requerido';
        if (form.hora && !/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(form.hora)) e.hora = 'Formato HH:mm 24h';
        return e;
    }

    // Combina fecha (yyyy-MM-dd) y hora (HH:mm) a ISO
    function combineDateTimeToISO(dateStr, timeStr) {
        const iso = new Date(`${dateStr}T${timeStr}:00`);
        return iso.toISOString();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const eobj = validate();
        setErrors(eobj);
        if (Object.keys(eobj).length) return;

        const payload = {
            paciente: paciente.pacienteId,         // ← ID usado solo para enviar (no visible)
            motivo: form.motivo.trim(),
            fecha: combineDateTimeToISO(form.fecha, form.hora),
            hora: form.hora,
        };

        await onSave?.(payload);
    }

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nueva-cita-title"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Dialog */}
            <div className="absolute inset-0 grid place-items-center p-4">
                <div
                    ref={dialogRef}
                    className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-neutral-200 overflow-hidden"
                >
                    <header className="px-5 py-4 border-b bg-neutral-50">
                        <h3 id="nueva-cita-title" className="text-lg font-semibold">
                            Nueva cita
                        </h3>
                        <p className="text-sm text-neutral-600">
                            Busca al paciente por identificación y define los detalles de la cita.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="p-5 space-y-6">
                        {/* Búsqueda de paciente */}
                        <section className="space-y-3">
                            <h4 className="text-sm font-semibold text-neutral-700">Paciente</h4>

                            <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
                                <Field
                                    refEl={firstInputRef}
                                    label="Identificación"
                                    name="identificacion"
                                    value={form.identificacion}
                                    onChange={handleChange}
                                    error={errors.identificacion}
                                    placeholder="Ej. 0102030405"
                                />
                                <button
                                    type="button"
                                    onClick={handleLookup}
                                    className="h-10 rounded-xl px-4 border bg-blue-600 text-white border-blue-600 hover:brightness-105 disabled:opacity-70"
                                    disabled={lookupLoading}
                                >
                                    {lookupLoading ? 'Buscando…' : 'Buscar'}
                                </button>
                            </div>

                            {lookupError && (
                                <p className="text-sm text-red-600">{lookupError}</p>
                            )}

                            {/* Tarjeta de paciente encontrado (sin IDs visibles) */}
                            {paciente && (
                                <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
                                    <p className="font-medium text-emerald-900">
                                        Seleccionado: {paciente.nombres} {paciente.apellidos}
                                    </p>
                                    <div className="mt-1 grid sm:grid-cols-2 gap-x-6 text-sm text-emerald-900/90">
                                        {paciente.identificacion && <span><b>CI:</b> {paciente.identificacion}</span>}
                                        {paciente.email && <span><b>Email:</b> {paciente.email}</span>}
                                        {paciente.telefono && <span><b>Teléfono:</b> {paciente.telefono}</span>}
                                        {paciente.direccion && <span className="sm:col-span-1"><b>Dirección:</b> {paciente.direccion}</span>}
                                        {paciente.grupo_sanguineo && <span><b>Grupo:</b> {paciente.grupo_sanguineo}</span>}
                                        {Array.isArray(paciente.alergias) && paciente.alergias.length > 0 && (
                                            <span className="sm:col-span-2"><b>Alergias:</b> {paciente.alergias.join(', ')}</span>
                                        )}
                                        {paciente.antecedente_familiar && (
                                            <span className="sm:col-span-2"><b>Antecedentes:</b> {paciente.antecedente_familiar}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {errors.paciente && (
                                <p className="text-sm text-red-600">{errors.paciente}</p>
                            )}
                        </section>

                        {/* Detalles de la cita */}
                        <section className="space-y-3">
                            <h4 className="text-sm font-semibold text-neutral-700">Detalles</h4>

                            <div className="grid sm:grid-cols-3 gap-3">
                                <Field
                                    label="Motivo"
                                    name="motivo"
                                    value={form.motivo}
                                    onChange={handleChange}
                                    error={errors.motivo}
                                    placeholder="Consulta general, control, etc."
                                />

                                <Field
                                    label="Fecha"
                                    name="fecha"
                                    type="date"
                                    value={form.fecha}
                                    onChange={handleChange}
                                    error={errors.fecha}
                                />

                                <Field
                                    label="Hora (24h)"
                                    name="hora"
                                    type="time"
                                    value={form.hora}
                                    onChange={handleChange}
                                    error={errors.hora}
                                />
                            </div>
                        </section>

                        {/* Acciones */}
                        <footer className="pt-2 flex justify-end gap-2">
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
                                className="h-10 rounded-xl px-4 border bg-blue-600 text-white border-blue-600 hover:brightness-105 disabled:opacity-70"
                                disabled={loading}
                            >
                                {loading ? 'Guardando…' : 'Guardar'}
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
        </div>
    );
}

/* ---------- Subcomponentes ---------- */

function Field({ label, name, value, onChange, type = 'text', placeholder, error, refEl }) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-neutral-800">{label}</span>
            <input
                ref={refEl || null}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={[
                    'mt-1 w-full h-10 rounded-xl border px-3 outline-none bg-white',
                    error
                        ? 'border-red-400 focus:ring-4 focus:ring-red-200'
                        : 'border-neutral-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200',
                ].join(' ')}
            />
            {error && <span className="text-xs text-red-600">{error}</span>}
        </label>
    );
}
