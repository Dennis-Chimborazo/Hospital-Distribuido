'use client';

import { useEffect, useRef, useState } from 'react';

export default function PacienteCreateModal({ open, onClose, onSave, loading = false }) {
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  // Estado del formulario (Persona + Paciente)
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    identificacion: '',
    fecha_nacimiento: '',
    sexo: '',
    telefono: '',
    email: '',
    direccion: '',
    grupo_sanguineo: '',
    alergias: '',                 // texto separado por comas (lo convertimos a array)
    antecedente_familiar: '',
  });

  useEffect(() => {
    if (open) {
      setErrors({});
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

  function validate() {
    const e = {};
    if (!form.nombres.trim()) e.nombres = 'Requerido';
    if (!form.apellidos.trim()) e.apellidos = 'Requerido';
    if (!form.identificacion.trim()) e.identificacion = 'Requerido';
    if (!form.fecha_nacimiento) e.fecha_nacimiento = 'Requerido';
    if (!form.email.trim()) e.email = 'Requerido';
    if (!form.direccion.trim()) e.direccion = 'Requerido';
    // email simple
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Correo inválido';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    // transformar alergias a array
    const payload = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        identificacion: form.identificacion.trim(),
        fecha_nacimiento: new Date(form.fecha_nacimiento).toISOString(),
        sexo: form.sexo,
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        direccion: form.direccion.trim(),
        grupo_sanguineo: form.grupo_sanguineo,
        alergias: form.alergias
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        antecedente_familiar: form.antecedente_familiar.trim(),
    };
    await onSave?.(payload); // el padre decide si llama API y cierra el modal
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuevo-paciente-title"
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
            <h3 id="nuevo-paciente-title" className="text-lg font-semibold">
              Nuevo paciente
            </h3>
            <p className="text-sm text-neutral-600">Completa los datos de Persona y Paciente.</p>
          </header>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Persona */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-700">Datos de la persona</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field
                  refEl={firstInputRef}
                  label="Nombres"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  error={errors.nombres}
                />
                <Field
                  label="Apellidos"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  error={errors.apellidos}
                />
                <Field
                  label="Identificación"
                  name="identificacion"
                  value={form.identificacion}
                  onChange={handleChange}
                  error={errors.identificacion}
                />
                <Field
                  label="Fecha de nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  error={errors.fecha_nacimiento}
                />
                <Select
                  label="Sexo"
                  name="sexo"
                  value={form.sexo}
                  onChange={handleChange}
                  options={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Femenino' },
                  ]}
                />
                <Field
                  label="Teléfono"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <Field
                  label="Dirección"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  error={errors.direccion}
                />
              </div>
            </section>

            {/* Paciente */}
            <section className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-neutral-700">Datos clínicos</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <Select
                  label="Grupo sanguíneo"
                  name="grupo_sanguineo"
                  value={form.grupo_sanguineo}
                  onChange={handleChange}
                  options={[
                    'A+','A-','B+','B-','AB+','AB-','O+','O-'
                  ].map(v => ({ value: v, label: v }))}
                />
                <Field
                  label="Alergias (separadas por coma)"
                  name="alergias"
                  placeholder="Penicilina, Polen, Mariscos"
                  value={form.alergias}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Textarea
                  label="Antecedente familiar"
                  name="antecedente_familiar"
                  value={form.antecedente_familiar}
                  onChange={handleChange}
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

/* ---------- Subcomponentes de formulario ---------- */

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

function Select({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full h-10 rounded-xl border border-neutral-300 px-3 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
      >
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      <textarea
        name={name}
        rows={3}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
      />
    </label>
  );
}
