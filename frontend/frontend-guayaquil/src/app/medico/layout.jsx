'use client';
import NavbarMedic from '@/components/narvar/NarvarMedic';

export default function MedicoLayout({ children }) {
  return (
    <div className="[--sbw:280px]">
      {/* Sidebar: fijo, sin scroll, termina justo en el inicio del footer */}
      <aside
        className="
          fixed top-0 left-0 z-50
          w-[var(--sbw)]
          h-[calc(100vh_-_var(--footer-h))]
          bg-[#0b2430] border-r border-white/5
          overflow-hidden
        "
      >
        <NavbarMedic />
      </aside>

      {/* Contenido: ocupa todo el ancho disponible, sin max-w */}
      <div
        className="
          min-h-[calc(100vh_-_var(--footer-h))]
          ml-[var(--sbw)]
          pb-[var(--footer-h)]
          bg-[#f4fbfb] text-neutral-900
          px-6 lg:px-10 py-8
          max-w-none w-full
        "
      >
        {/* ¡Nada de mx-auto ni max-w-6xl aquí! */}
        {children}
      </div>
    </div>
  );
}
