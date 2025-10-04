// app/medico/page.jsx
export default function MedicoHome() {
  return (
    <section className="space-y-6">
      <header>
        <p className="text-neutral-600">Resumen de tu día de trabajo.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-sm text-neutral-500">Consultas agendadas</div>
          <div className="text-2xl font-semibold">10</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-sm text-neutral-500">Pacientes atendidos</div>
          <div className="text-2xl font-semibold">4</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-sm text-neutral-500">Pendientes</div>
          <div className="text-2xl font-semibold">3</div>
        </div>
      </div>
    </section>
  );
}
