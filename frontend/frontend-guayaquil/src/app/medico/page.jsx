'use client';
import { CalendarCheck, Users, ClipboardList } from 'lucide-react';

export default function MedicoHome() {
  const kpis = [
    { label: 'Consultas agendadas', value: 10, icon: CalendarCheck },
    { label: 'Pacientes atendidos', value: 4, icon: Users },
    { label: 'Pendientes', value: 3, icon: ClipboardList },
  ];

  return (
    <section className="space-y-8">
      <header className="pt-1">
        <h1 className="text-xl font-semibold text-[#0d3744]">Resumen de tu día de trabajo</h1>
        <p className="text-neutral-600">Consultas, pacientes y pendientes.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-white/95 border border-black/5 shadow-[0_18px_34px_rgba(0,0,0,.06),_0_2px_6px_rgba(0,0,0,.04)] p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-neutral-500">{label}</div>
                <div className="mt-1 text-3xl font-extrabold">{value}</div>
              </div>
              <div className="rounded-xl p-2.5 bg-teal-50 ring-1 ring-teal-600/20 text-teal-700">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
