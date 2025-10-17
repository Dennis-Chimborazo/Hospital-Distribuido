'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/services/ApiService';
import styles from './page.module.css';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const user = (form.get('user') || '').toString().trim();
    const password = (form.get('password') || '').toString().trim();
    const remember = form.get('remember') === 'on';

    if (!user || !password) {
      setError('Por favor complete usuario y contraseña.');
      setLoading(false);
      return;
    }

    try {
      const response = await ApiService.login({ user, password, remember });
      // si tu servicio devuelve token/payload, podrías guardarlo aquí

      if (response) {
        router.push(`/${response.message.toLowerCase()}`);
      }
    } catch (err) {
      // Intenta leer mensaje del backend si existe
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Error inesperado al iniciar sesión.';
      setError(msg);
      console.log('Login error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 lg:py-20 grid lg:grid-cols-2 gap-8 items-center">
      {/* Columna izquierda (copy) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-brand-600 text-white grid place-items-center font-bold shadow-sm">NA</div>
          <div className="leading-tight">
            <div className="text-sm text-neutral-500">Hospital</div>
            <div className="text-base sm:text-lg font-semibold">Nuevo Amanecer</div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Acceso profesionales – <span className="text-brand-700">Sucursal Cuenca</span>
        </h2>

        <p className="text-neutral-600 max-w-prose">
          Ingresa para gestionar citas, pacientes y paneles operativos del hospital.
        </p>

        <ul className="text-sm text-neutral-600 list-disc pl-5 space-y-1">
          <li>UX accesible y 100% responsive.</li>
          <li>Arquitectura lista para rutas internas.</li>
          <li>Preparado para SSO/2FA más adelante.</li>
        </ul>
      </div>

      {/* Columna derecha (card) */}
      <div className={styles.card} role="region" aria-labelledby="login-title">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="text-center">
            <h3 id="login-title" className="text-xl font-semibold">Ingresar</h3>
            <p className="text-sm text-neutral-500">Nuevo Amanecer – Cuenca</p>
          </div>

          {error ? (
            <div className={styles.alert} role="alert">
              <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.alertIcon}>
                <path d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7A2 2 0 003.48 22h17.04a2 2 0 001.72-3.44l-8.48-14.7a2 2 0 00-3.48 0z" />
              </svg>
              <span>{error}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="user" className={styles.label}>Usuario</label>
            <input
              id="user"
              name="user"
              type="text"
              required
              autoComplete="username"
              placeholder="mi usuario secreto"
              className={styles.input}
              aria-invalid={!!error}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={styles.label}>Contraseña</label>
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className={styles.linkSm}
                aria-pressed={show}
                aria-controls="password"
              >
                {show ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                name="password"
                type={show ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={styles.input}
                aria-invalid={!!error}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className={styles.eyeBtn}
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
              >
                {show ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className={styles.rowBetween}>
            <label className={styles.checkbox}>
              <input type="checkbox" name="remember" />
              <span>Recuérdame</span>
            </label>
            <a href="#" className={styles.link}>¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" /> Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </button>

          <p className={styles.legal}>
            Al continuar aceptas nuestros <a className={styles.link} href="#">Términos</a> y{' '}
            <a className={styles.link} href="#">Política de Privacidad</a>.
          </p>
        </form>
      </div>
    </section>
  );
}
