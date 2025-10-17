'use client';
import { CalendarCheck, Users, ClipboardList } from 'lucide-react';
import './MedicoHome.css';

export default function MedicoHome() {
  const kpis = [
    { label: 'Consultas agendadas', value: 10, icon: CalendarCheck },
    { label: 'Pacientes atendidos', value: 4, icon: Users },
    { label: 'Pendientes', value: 3, icon: ClipboardList },
  ];

  return (
    <section className="medicohome">
      <div className="medicohome__wrapper">
        <div className="medicohome__card">
          <header className="medicohome__header">
            <h1 className="medicohome__title">Resumen de tu día de trabajo</h1>
            <p className="medicohome__subtitle">Consultas, pacientes y pendientes.</p>
          </header>

          <div className="medicohome__kpiGrid">
            {kpis.map(({ label, value, icon: Icon }) => (
              <div key={label} className="medicohome__kpiCard">
                <div className="medicohome__kpiHead">
                  <div>
                    <div className="medicohome__kpiLabel">{label}</div>
                    <div className="medicohome__kpiValue">{value}</div>
                  </div>
                  <div className="medicohome__kpiBadge">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
