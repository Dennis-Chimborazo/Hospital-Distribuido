// src/components/NavbarMedico.jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Si no instalas lucide-react, reemplaza iconos por emojis y borra esta línea
import { Users, LogOut } from 'lucide-react';

const navItems = [
  { href: '/secretaria', label: 'Inicio', icon: Users },
  { href: '/secretaria/pacientes', label: 'Pacientes', icon: Users },
  { href: '/secretaria/citas', label: 'Citas', icon: Users },
  { href: '/secretaria/historialCitas', label: 'Historial  de Citas', icon: Users },
];

export default function NavbarSecretaria() {
  const pathname = usePathname();
  return (
    <nav className="px-3 py-4">
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="size-9 rounded-lg bg-blue-600 text-white grid place-items-center font-semibold shadow-sm">HV</div>
        <div className="leading-tight">
          <div className="text-xs text-neutral-500">Hospital Nuevo Amanecer</div>
          <div className="text-sm font-semibold">Panel del secretaria</div>
        </div>
      </div>

      <div className="text-xs uppercase tracking-wide text-neutral-400 px-2 mb-2">Secciones</div>
      <ul className="space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 border text-sm font-medium',
                  active ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-neutral-200 hover:border-blue-300 hover:bg-blue-50/60',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                {/* Si no usas lucide, cambia <Icon /> por un emoji: <span>👥</span> */}
                <Icon className="size-4" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <hr className="my-4 border-neutral-200" />

      <button
        type="button"
        className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 border bg-white border-neutral-200 text-red-600 hover:bg-red-50 text-sm font-medium"
        onClick={() => { window.location.href = '/login'; }}
      >
        <LogOut className="size-4" />
        <span>Cerrar sesión</span>
      </button>
    </nav>
  );
}
