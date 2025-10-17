'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PacienteService from '@/services/Paciente.service';
import './AgendarCitasMedico.css'; // estilos del modal

export default function AgendarCitasMedico({
    open,
    onClose,
    onSave,
    loading = false,
    onLookupPaciente, // opcional
}) {
    const dialogRef = useRef(null);
    const firstInputRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    const [errors, setErrors] = useState({});
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [paciente, setPaciente] = useState(null);

    const [form, setForm] = useState({
        identificacion: '',
        motivo: '',
        fecha: '',
        hora: '',
    });

    // Asegura renderizado en cliente antes del portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Bloquea scroll al abrir modal
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

    // Manejar cambios
    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Normalizar paciente
    function normalizePaciente(apiData) {
        const p = apiData?.paciente ?? apiData ?? null;
        if (!p) return null;
        const persona = p.persona ?? {};
        return {
            pacienteId: p._id ?? p.pacienteId ?? null,
            nombres: persona.nombres ?? p.nombres ?? '',
            apellidos: persona.apellidos ?? p.apellidos ?? '',
            identificacion: persona.identificacion ?? p.identificacion ?? '',
            email: persona.email ?? p.email ?? '',
            telefono: persona.telefono ?? p.telefono ?? '',
            direccion: persona.direccion ?? p.direccion ?? '',
            grupo_sanguineo: p.grupo_sanguineo ?? '',
            alergias: Array.isArray(p.alergias) ? p.alergias : [],
            antecedente_familiar: p.antecedente_familiar ?? '',
        };
    }

    // Buscar paciente
    async function handleLookup() {
        const identificacion = form.identificacion.trim();
        setLookupError('');
        setPaciente(null);

        if (!identificacion) {
            setLookupError('Ingrese una identificación para buscar.');
            return;
        }

        try {
            setLookupLoading(true);
            const data =
                typeof onLookupPaciente === 'function'
                    ? await onLookupPaciente(identificacion)
                    : await PacienteService.buscarPaciente(identificacion);

            const normalized = normalizePaciente(data);
            if (!normalized || !normalized.identificacion) {
                setLookupError('Paciente no encontrado con esa identificación.');
                setPaciente(null);
            } else {
                setPaciente(normalized);
            }
        } catch (err) {
            setLookupError(err?.message || 'Error al buscar paciente.');
        } finally {
            setLookupLoading(false);
        }
    }

    // Validar formulario
    function validate() {
        const e = {};
        if (!form.identificacion.trim()) e.identificacion = 'Requerido';
        if (!paciente?.pacienteId)
            e.paciente =
                'Debe seleccionar un paciente válido (busque por identificación).';
        if (!form.motivo.trim()) e.motivo = 'Requerido';
        if (!form.fecha) e.fecha = 'Requerido';
        if (!form.hora) e.hora = 'Requerido';
        if (form.hora && !/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(form.hora))
            e.hora = 'Formato HH:mm 24h';
        return e;
    }

    function combineDateTimeToISO(dateStr, timeStr) {
        const iso = new Date(`${dateStr}T${timeStr}:00`);
        return iso.toISOString();
    }

    // Guardar cita
    async function handleSubmit(e) {
        e.preventDefault();
        const eobj = validate();
        setErrors(eobj);
        if (Object.keys(eobj).length) return;

        const payload = {
            paciente: paciente.pacienteId,
            motivo: form.motivo.trim(),
            fecha: combineDateTimeToISO(form.fecha, form.hora),
            hora: form.hora,
        };

        await onSave?.(payload);
    }

    // No renderizar si no está abierto
    if (!open || !mounted) return null;

    const modalUI = (
        <div
            className="amodal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nueva-cita-title"
            style={{ position: 'fixed', inset: 0, zIndex: 2147483647 }}
        >
            {/* Fondo oscuro clickeable */}
            <div className="absolute inset-0 amodal__backdrop" onClick={onClose} />

            {/* Cuerpo del modal */}
            <div className="amodal__center">
                <div ref={dialogRef} className="w-full max-w-3xl amodal__card">
                    <header className="amodal__header">
                        <h3 id="nueva-cita-title" className="amodal__title">
                            Nueva cita
                        </h3>
                        <p className="amodal__sub">
                            Busca al paciente por identificación y define los detalles de la
                            cita.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="amodal__body amodal__form">
                        {/* ========= PACIENTE ========= */}
                        <section className="form-section">
                            <h4 className="section-title">Paciente</h4>

                            {/* Búsqueda: input + botón alineados */}
                            <div className="input-row">
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
                                    className="btn btn-primary disabled:opacity-70"
                                    disabled={lookupLoading}
                                >
                                    {lookupLoading ? 'Buscando…' : 'Buscar'}
                                </button>
                            </div>

                            {/* Ayuda / errores */}
                            {lookupError ? (
                                <p className="field-error">{lookupError}</p>
                            ) : (
                                <p className="field-help">Busca por cédula o identificación del paciente.</p>
                            )}
                            {errors.paciente && <p className="field-error">{errors.paciente}</p>}

                            {/* Tarjeta de paciente seleccionado */}
                            {paciente && (
                                <div className="patient-card">
                                    <p className="patient-title">
                                        Seleccionado: {paciente.nombres} {paciente.apellidos}
                                    </p>
                                    <div className="patient-grid">
                                        {paciente.identificacion && <span><b>CI:</b> {paciente.identificacion}</span>}
                                        {paciente.email && <span><b>Email:</b> {paciente.email}</span>}
                                        {paciente.telefono && <span><b>Teléfono:</b> {paciente.telefono}</span>}
                                        {paciente.direccion && <span><b>Dirección:</b> {paciente.direccion}</span>}
                                        {paciente.grupo_sanguineo && <span><b>Grupo:</b> {paciente.grupo_sanguineo}</span>}
                                        {Array.isArray(paciente.alergias) && paciente.alergias.length > 0 && (
                                            <span className="col-span-2"><b>Alergias:</b> {paciente.alergias.join(', ')}</span>
                                        )}
                                        {paciente.antecedente_familiar && (
                                            <span className="col-span-2"><b>Antecedentes:</b> {paciente.antecedente_familiar}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        <div className="divider" />

                        {/* ========= DETALLES ========= */}
                        <section className="form-section">
                            <h4 className="section-title">Detalles</h4>

                            {/* Motivo a lo ancho */}
                            <div className="grid-2">
                                <div className="col-span-2">
                                    <Field
                                        label="Motivo"
                                        name="motivo"
                                        value={form.motivo}
                                        onChange={handleChange}
                                        error={errors.motivo}
                                        placeholder="Consulta general, control, etc."
                                    />
                                </div>

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

                        {/* ========= ACCIONES ========= */}
                        <footer className="amodal__footer amodal__footer--bar">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-ghost"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
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

    // Renderizar fuera del flujo del DOM
    return createPortal(modalUI, document.body);
}

/* ---------- Subcomponente Field ---------- */
function Field({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder,
    error,
    refEl,
}) {
    return (
        <label className="block">
            <span className="amodal__label">{label}</span>
            <input
                ref={refEl || null}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={[
                    'mt-1 w-full h-10 rounded-xl border px-3 outline-none bg-white',
                    'amodal__input',
                    error
                        ? 'border-red-400 focus:ring-4 focus:ring-red-200'
                        : 'border-neutral-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200',
                ].join(' ')}
            />
            {error && <span className="text-xs text-red-600">{error}</span>}
        </label>
    );
}
