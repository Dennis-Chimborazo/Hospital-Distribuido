import './globals.css';
import ToastProvider from '@/components/ToastProvider.jsx';

export const metadata = { /* ... */ };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className="
          min-h-screen text-neutral-900 dark:text-neutral-100
          [--sbw:0px]              /* default sin sidebar */
          [--footer-h:64px]        /* h-16 */
          bg-[radial-gradient(circle_at_20%_20%,rgba(33,183,165,0.10)_2px,transparent_3px)_0_0/60px_60px,
              radial-gradient(circle_at_0_0,rgba(33,183,165,0.06)_2px,transparent_3px)_30px_30px/60px_60px,
              linear-gradient(180deg,rgba(11,36,48,0.92)_0%,rgba(11,36,48,0.80)_220px,#e9fbfa_220px)]
        "
      >
        <ToastProvider />

        {/* El main no maneja el scroll; solo deja espacio al footer fijo */}
        <main className="pb-[var(--footer-h)]">
          {children}
        </main>

        {/* Footer fijo alineado con el sidebar (forma de L) */}
       <footer className="app-footer">
  <div className="app-footer__inner">
    <span>
      © {new Date().getFullYear()} <strong style={{color:'#5fe7db'}}>Hospital Nuevo Amanecer</strong>. Todos los derechos reservados.
    </span>

    <nav className="app-footer__links">
      <a href="#">Términos</a>
      <a href="#">Privacidad</a>
      <a href="#">Soporte</a>
    </nav>
  </div>
</footer>


      </body>
    </html>
  );
}
