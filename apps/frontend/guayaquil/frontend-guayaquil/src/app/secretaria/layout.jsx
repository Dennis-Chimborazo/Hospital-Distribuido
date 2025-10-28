// src/app/medico/layout.jsx
import NavbarSecretaria from "@/components/narvar/NarvarSecretaria";
export default function MedicoLayout({ children }) {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="md:min-h-dvh border-r bg-white sticky top-0">
          <NavbarSecretaria />
        </aside>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
