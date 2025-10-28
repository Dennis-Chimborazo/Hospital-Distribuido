'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, History, LogOut } from 'lucide-react';
import styles from './NavbarMedic.module.css';

const navItems = [
  { href: '/medico/citas', label: 'Citas', icon: Users },
  { href: '/medico/historialCitas', label: 'Historial de Citas', icon: History },
];

export default function NavbarMedic() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div className={styles.logoBox}>NA</div>
        <div className="leading-tight">
          <div className={styles.subText}>Hospital Nuevo Amanecer</div>
          <div className={styles.title}>Panel del médico</div>
        </div>
      </div>

      {/* Secciones */}
      <div className={styles.sectionLabel}>Secciones</div>
      <ul className={styles.navList}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.navItem} ${active ? styles.active : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={styles.icon} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.divider} />

      {/* Cerrar sesión */}
      <button
        type="button"
        className={styles.logoutBtn}
        onClick={() => { window.location.href = '/login'; }}
      >
        <LogOut className={styles.icon} />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}
