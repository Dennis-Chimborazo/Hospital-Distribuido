// MedicoLayout.jsx
'use client';
import NavbarMedic from '@/components/narvar/NarvarMedic';

export default function MedicoLayout({ children }) {
  return (
    <div className="med-shell" style={{ ['--sbw']: '280px' }}>
      <aside className="med-sidebar">
        <NavbarMedic />
      </aside>

      {/* 🔥 nada de padding ni container aquí */}
      <main className="med-main">
        {/* Si luego quieres un “respiro”, ponlo DENTRO de tus cards, no aquí */}
        {children}
      </main>
    </div>
  );
}
