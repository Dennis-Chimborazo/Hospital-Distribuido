// EditarCitaMedico.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { confirm } from '../confirm';

export default function EditarCitaMedico({
    open,
    onClose,
    onSave,
    loading = false,
    cita, // objeto de la cita a editar
}) {
    const dialogRef = useRef(null);

    const [errors, setErrors] = useState({});
    const [pacienteVM, setPacienteVM] = useState(null);
    const [form, setForm] = useState({
        motivo: '',
        fecha: '', // yyyy-MM-dd
        hora: '',  // HH:mm
    });

    // ---------- Helpers fecha/hora ----------
    function toDateInputValue(isoOrDate) {
        if (!isoOrDate) return '';
        const d = new Date(isoOrDate);
        if (isNaN(d.getTime())) return '';
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function toTimeInputValue(isoOrTime) {
        if (typeof isoOrTime === 'string' && /^\d{2}:\d{2}$/.test(isoOrTime)) return isoOrTime;
        if (isoOrTime) {
            const d = new Date(isoOrTime);
            if (!isNaN(d.getTime())) {
                const hh = String(d.getHours()).padStart(2, '0');
                const mi = String(d.getMinutes()).padStart(2, '0');
                return `${hh}:${mi}`;
            }
        }
        return '';
    }

    function combineDateTimeToISO(dateStr, timeStr) {
        const iso = new Date(`${dateStr}T${timeStr}:00`);
        return iso.toISOString();
    }

    // ---------- Normalización paciente desde la cita ----------
    function normalizePacienteFromCita(c) {
        if (!c?.paciente) return null;
        const persona = c.paciente.persona ?? {};
        return {
            nombres: persona.nombres ?? '',
            apellidos: persona.apellidos ?? '',
            identificacion: persona.identificacion ?? '',
            email: persona.email ?? '',
            telefono: persona.telefono ?? '',
            direccion: persona.direccion ?? '',
            grupo_sanguineo: c.paciente.grupo_sanguineo ?? '',
            alergias: Array.isArray(c.paciente.alergias) ? c.paciente.alergias : [],
            antecedente_familiar: c.paciente.antecedente_familiar ?? '',
        };
    }

    // ---------- Cargar datos al abrir ----------
    useEffect(() => {
        if (!open) return;

        setErrors({});
        setPacienteVM(normalizePacienteFromCita(cita));

        setForm({
            motivo: cita?.motivo ?? '',
            fecha: toDateInputValue(cita?.fecha ?? cita?.fechaHora),
            hora: toTimeInputValue(cita?.hora ?? cita?.fecha ?? cita?.fechaHora),
        });

        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open, cita]);

    // ---------- Handlers ----------
    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function validate() {
        const e = {};
        if (!form.motivo.trim()) e.motivo = 'Requerido';
        if (!form.fecha) e.fecha = 'Requerido';
        if (!form.hora) e.hora = 'Requerido';
        if (form.hora && !/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(form.hora)) e.hora = 'Formato HH:mm 24h';
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const eobj = validate();
        setErrors(eobj);
        if (Object.keys(eobj).length) return;

        const ok = await confirm({
            type: 'edit',
            title: '¿Editar cita?',
            text: 'Se cambiará la información de la cita seleccionada.',
            confirmText: 'Editar',
        });
        if (!ok) return;

        const payload = {
            _id: cita?._id,                      // necesario para editar
            motivo: form.motivo.trim(),
            fecha: combineDateTimeToISO(form.fecha, form.hora),
            hora: form.hora,                     // si tu backend guarda hora separada
        };

        await onSave?.(payload);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="editar-cita-title">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Dialog */}
            <div className="absolute inset-0 grid place-items-center p-4">
                <div
                    ref={dialogRef}
                    className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-neutral-200 overflow-hidden"
                >
                    <header className="px-5 py-4 border-b bg-neutral-50">
                        <h3 id="editar-cita-title" className="text-lg font-semibold">Editar cita</h3>
                        <p className="text-sm text-neutral-600">Actualiza los datos de la cita seleccionada.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="p-5 space-y-6">
                        {/* Paciente (solo lectura) */}
                        <section className="space-y-3">
                            <h4 className="text-sm font-semibold text-neutral-700">Paciente</h4>

                            {pacienteVM ? (
                                <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
                                    <p className="font-medium text-emerald-900">
                                        {pacienteVM.apellidos} {pacienteVM.nombres}
                                    </p>
                                    <div className="mt-1 grid sm:grid-cols-2 gap-x-6 text-sm text-emerald-900/90">
                                        {pacienteVM.identificacion && <span><b>CI:</b> {pacienteVM.identificacion}</span>}
                                        {pacienteVM.email && <span><b>Email:</b> {pacienteVM.email}</span>}
                                        {pacienteVM.telefono && <span><b>Teléfono:</b> {pacienteVM.telefono}</span>}
                                        {pacienteVM.direccion && <span className="sm:col-span-1"><b>Dirección:</b> {pacienteVM.direccion}</span>}
                                        {pacienteVM.grupo_sanguineo && <span><b>Grupo:</b> {pacienteVM.grupo_sanguineo}</span>}
                                        {Array.isArray(pacienteVM.alergias) && pacienteVM.alergias.length > 0 && (
                                            <span className="sm:col-span-2"><b>Alergias:</b> {pacienteVM.alergias.join(', ')}</span>
                                        )}
                                        {pacienteVM.antecedente_familiar && (
                                            <span className="sm:col-span-2"><b>Antecedentes:</b> {pacienteVM.antecedente_familiar}</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500">Cargando datos del paciente…</p>
                            )}
                        </section>

                        {/* Motivo, Fecha, Hora */}
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
                                {loading ? 'Guardando…' : 'Guardar cambios'}
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
