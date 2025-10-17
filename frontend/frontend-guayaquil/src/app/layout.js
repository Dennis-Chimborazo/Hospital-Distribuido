import './globals.css';
import ToastProvider from '@/components/ToastProvider.jsx';
export const metadata = {
  title: {
    default: 'Nuevo Amanecer – Sucursal Cuenca',
    template: '%s · Nuevo Amanecer',
  },
  description: 'Portal de profesionales – Nuevo Amanecer, Sucursal Cuenca.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-dvh flex flex-col bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100">
        {/* Contenido principal */}
        <ToastProvider />

        <main className="flex-1">
          {children}

        </main>

        {/* Footer sticky */}
        <footer className="mt-auto border-t border-neutral-200/60 dark:border-neutral-800/60 
                           bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs sm:text-sm 
                          text-neutral-600 dark:text-neutral-400 
                          flex flex-wrap items-center gap-4 justify-between">

            <span className="font-medium">
              © {new Date().getFullYear()} Nuevo Amanecer. Todos los derechos reservados.
            </span>

            <nav className="flex items-center gap-6">
              <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Términos
              </a>
              <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Privacidad
              </a>
              <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Soporte
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
