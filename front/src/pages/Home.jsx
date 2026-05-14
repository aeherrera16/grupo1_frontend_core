import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroCity from '../assets/banquito.jpg';
import heroTower from '../assets/banquito2.jpg';
import heroGlass from '../assets/banquito3.webp';
import { portals } from '../config/portals';

export function Home() {
  const navigate = useNavigate();
  const clientPortals = ['personaNatural', 'empresa'];
  const staffPortals = ['operador', 'cajero'];
  const [slideIndex, setSlideIndex] = useState(0);
  const [infoModal, setInfoModal] = useState(null);
  const [showIntranet, setShowIntranet] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownTimerRef = useRef(null);

  const slides = useMemo(
    () => [
      {
        title: 'Soluciones en linea para clientes y empresas.',
        description: 'Gestiona cuentas, pagos masivos y consultas desde un portal confiable con roles claramente definidos.',
        image: heroCity,
      },
      {
        title: 'Pagos masivos con control de validaciones.',
        description: 'Carga y seguimiento en tiempo real, con corte horario y confirmaciones detalladas por lote.',
        image: heroTower,
      },
      {
        title: 'Banca digital con procesos seguros.',
        description: 'Operaciones guiadas, trazabilidad e historial para clientes y equipos internos.',
        image: heroGlass,
      },
    ],
    [],
  );

  const navItems = useMemo(
    () => [
      {
        label: 'Quienes somos',
        items: [
          { title: 'Banco BanQuito', body: 'Institucion financiera ecuatoriana enfocada en banca digital y atencion personalizada.' },
          { title: 'Valores', body: 'Transparencia, seguridad operativa y servicio responsable con nuestros clientes.' },
          { title: 'Sostenibilidad', body: 'Programas de inclusion financiera y apoyo a comunidades locales.' },
        ],
      },
      {
        label: 'Personas',
        items: [
          { title: 'Cuentas', body: 'Cuentas de ahorro y transaccionales con control de saldos y movimientos.' },
          { title: 'Transferencias', body: 'Envio de transferencias con validaciones y confirmaciones.' },
          { title: 'Seguridad', body: 'Buenas practicas y verificacion de acceso.' },
        ],
      },
      {
        label: 'Empresas',
        items: [
          { title: 'Banca empresas', body: 'Herramientas para pagos masivos y administracion de tesoreria.' },
          { title: 'Cash management', body: 'Control de flujos y autorizaciones empresariales.' },
          { title: 'Pagos masivos', body: 'Carga de lotes con validacion y reportes detallados.' },
        ],
      },
      {
        label: 'Canales de atencion',
        items: [
          { title: 'Banca digital', body: 'Acceso en linea seguro para clientes y equipos internos.' },
          { title: 'Sucursales', body: 'Atencion presencial con personal autorizado.' },
          { title: 'Soporte', body: 'Canales de ayuda y seguimiento de solicitudes.' },
        ],
      },
      {
        label: 'Transparencia',
        items: [
          { title: 'Tasas y tarifas', body: 'Informacion actualizada de costos operativos y comisiones.' },
          { title: 'Politicas', body: 'Lineamientos de seguridad, privacidad y proteccion de datos.' },
          { title: 'Informes', body: 'Reportes institucionales y cumplimiento normativo.' },
        ],
      },
    ],
    [],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePortalSelect = (portal) => {
    navigate(`/login/${portal}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-banker-dark">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm font-semibold text-slate-700">
          <div className="flex items-center gap-2 text-base font-black tracking-[0.2em] text-banker-navy">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-banker-gold text-xs text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
            </span>
            BancoBanQuito
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Banca digital</div>
        </div>
        <nav className="border-t border-slate-200 bg-white/80">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => {
                  if (dropdownTimerRef.current) {
                    clearTimeout(dropdownTimerRef.current);
                  }
                  setOpenDropdown(item.label);
                }}
                onMouseLeave={() => {
                  dropdownTimerRef.current = setTimeout(() => {
                    setOpenDropdown(null);
                  }, 200);
                }}
              >
                <button
                  className="flex items-center gap-2 text-slate-600 transition hover:text-banker-navy"
                  type="button"
                  onClick={() => setOpenDropdown((current) => (current === item.label ? null : item.label))}
                >
                  {item.label}
                  <span className="text-[10px]">▾</span>
                </button>
                {openDropdown === item.label ? (
                  <div
                    className="absolute left-0 top-full z-20 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold uppercase text-slate-600 shadow-xl"
                    onMouseEnter={() => {
                      if (dropdownTimerRef.current) {
                        clearTimeout(dropdownTimerRef.current);
                      }
                      setOpenDropdown(item.label);
                    }}
                    onMouseLeave={() => {
                      dropdownTimerRef.current = setTimeout(() => {
                        setOpenDropdown(null);
                      }, 200);
                    }}
                  >
                    <div className="space-y-2">
                      {item.items.map((entry) => (
                        <button
                          key={entry.title}
                          onMouseDown={() => setInfoModal({ ...entry, section: item.label })}
                          onClick={() => setInfoModal({ ...entry, section: item.label })}
                          className="w-full rounded-lg px-3 py-2 text-left text-[11px] tracking-[0.2em] text-slate-600 transition hover:bg-slate-100 hover:text-banker-navy"
                          type="button"
                        >
                          {entry.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="login-hero relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: `url(${slides[slideIndex].image})` }}
          />
          <div className="absolute inset-0 bg-[#102f3f]/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102f3f]/95 via-[#102f3f]/80 to-[#102f3f]/40" />
          <div className="relative grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="login-panel flex flex-col bg-[#102f3f]/95 px-6 py-6 text-white shadow-xl">
              <div className="rounded-2xl border border-[#1f6173]/60 bg-[#1f6173]/30 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f4f7fb]">
                BancoBanQuito en linea
              </div>
              <h2 className="mt-5 text-2xl font-black">Accesos disponibles</h2>
              <p className="mt-2 text-sm text-[#f4f7fb]/80">
                Selecciona tu portal para continuar con operaciones y consultas.
              </p>

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  {clientPortals.map((key) => (
                    <button
                      key={key}
                      onClick={() => handlePortalSelect(key)}
                      className="fade-up flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-[#102f3f] transition hover:-translate-y-0.5 hover:bg-slate-50"
                    >
                      <span>{portals[key].label}</span>
                      <span className="text-lg">›</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowIntranet((prev) => !prev)}
                      className="fade-up-delay flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                      type="button"
                    >
                      <span>Intranet</span>
                      <span className="text-lg">▾</span>
                    </button>
                    {showIntranet ? (
                      <div className="absolute left-0 right-0 mt-2 rounded-xl border border-white/10 bg-[#102f3f] p-2 text-sm text-[#f4f7fb]">
                        {staffPortals.map((key) => (
                          <button
                            key={key}
                            onClick={() => handlePortalSelect(key)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-semibold transition hover:bg-[#1f6173]"
                            type="button"
                          >
                            <span>{portals[key].label}</span>
                            <span className="text-lg">›</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-[#f4f7fb]/80">
                Selecciona un portal para iniciar sesion. El formulario aparece en pantalla completa.
              </div>

              <div className="mt-auto rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs leading-5 text-[#f4f7fb]/80">
                Clientes: usa credencial web. Personal banco: usuario Core con permisos aprobados.
              </div>
            </aside>

            <div className="relative flex flex-col justify-center px-8 py-10 text-white drop-shadow-md">
              <span className="fade-up inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f4f7fb] backdrop-blur-sm">
                Experiencia digital
              </span>
              <h1 className="fade-up-delay mt-6 text-4xl font-black leading-tight md:text-5xl">
                {slides[slideIndex].title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
                {slides[slideIndex].description}
              </p>

              <div className="mt-10 flex items-center gap-2 text-white/70">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition ${
                      slideIndex === index ? 'bg-white' : 'bg-white/40'
                    }`}
                    onClick={() => setSlideIndex(index)}
                    aria-label={`Slide ${index + 1}`}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {infoModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{infoModal.section}</p>
                <h3 className="mt-2 text-2xl font-black text-banker-navy">{infoModal.title}</h3>
              </div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setInfoModal(null)}
                type="button"
              >
                Cerrar
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{infoModal.body}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
