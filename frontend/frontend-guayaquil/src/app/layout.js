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
        <footer
          className="
            fixed bottom-0 right-0 left-[var(--sbw)] z-40 h-[var(--footer-h)]
            border-t border-teal-900/20 dark:border-teal-300/15
            bg-gradient-to-r from-[#0e3a4d] via-[#0b3041] to-[#0e3a4d]
            text-teal-100 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]
          "
        >
          <div className="h-full px-4 max-w-none w-full flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium">
              © {new Date().getFullYear()} Nuevo Amanecer. Todos los derechos reservados.
            </span>
            <nav className="flex items-center gap-6">
              <a className="hover:text-teal-300 transition-colors" href="#">Términos</a>
              <a className="hover:text-teal-300 transition-colors" href="#">Privacidad</a>
              <a className="hover:text-teal-300 transition-colors" href="#">Soporte</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
