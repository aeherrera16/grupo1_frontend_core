import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import heroCity from '../assets/banquito.jpg';
import heroTower from '../assets/banquito2.jpg';
import heroGlass from '../assets/banquito3.webp';
import { portals } from '../config/portals';
import { useAuth } from '../hooks/useAuth';

const portalConfig = {
  personaNatural: {
    image: heroCity,
    intro: 'Hola, te damos la bienvenida',
    subtitle: 'Ingresa a tu banca personal en linea.',
  },
  empresa: {
    image: heroTower,
    intro: 'Bienvenido a banca empresas',
    subtitle: 'Gestiona pagos masivos y tesoreria con seguridad.',
  },
  operador: {
    image: heroGlass,
    intro: 'Acceso operativo interno',
    subtitle: 'Gestione clientes, cuentas y credenciales autorizadas.',
  },
  cajero: {
    image: heroCity,
    intro: 'Acceso de ventanilla',
    subtitle: 'Registre movimientos con controles de seguridad.',
  },
};

export function LoginPage() {
  const { portal } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = useMemo(() => portalConfig[portal], [portal]);
  const portalInfo = portal ? portals[portal] : null;

  if (!portal || !config || !portalInfo) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    document.title = `${portalInfo.label} | BancoBanQuito`;
  }, [portalInfo.label]);

  const isFormValid = () => {
    return form.username.trim() !== '' && form.password.trim() !== '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    setAuthError('');

    try {
      await login(portal, form.username, form.password);
      navigate(portalInfo.startPath);
    } catch (err) {
      setAuthError(err.message || 'Credenciales inválidas. Por favor intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-banker-dark">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm font-semibold text-slate-700">
          <button className="flex items-center gap-2 text-banker-navy" onClick={() => navigate('/')} type="button">
            <span className="text-lg">←</span>
            Inicio
          </button>
          <div className="flex items-center gap-2 text-base font-black tracking-[0.2em] text-banker-navy">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-banker-gold text-xs text-white">BQ</span>
            BancoBanQuito
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Banca digital</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
            <div className="bg-white p-12 lg:p-16">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-8">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-black text-emerald-700">
                  BQ
                </span>
                Portal {portalInfo.label}
              </div>
              
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{config.intro}</h1>
              <p className="mt-3 text-slate-500 font-medium">{config.subtitle}</p>

              <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre de Usuario</label>
                  <input
                    className="w-full bg-slate-50 rounded-2xl border border-slate-100 px-5 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    type="text"
                    placeholder="Ingrese su usuario..."
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Contraseña</label>
                  <input
                    className="w-full bg-slate-50 rounded-2xl border border-slate-100 px-5 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>

                {authError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in shake duration-300">
                    ✗ {authError}
                  </div>
                )}

                <button
                  className="w-full py-5 rounded-2xl bg-slate-900 text-white text-sm font-black uppercase tracking-widest transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 active:scale-[0.98] disabled:bg-slate-300"
                  disabled={isSubmitting || !isFormValid()}
                >
                  {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="mt-10 flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Tus datos están protegidos por encriptación de grado bancario.
                </p>
              </div>
            </div>

            <div className="relative hidden lg:block overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
                style={{ backgroundImage: `url(${config.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <p className="text-white text-2xl font-black tracking-tight leading-tight">BancoBanQuito</p>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Excelencia e integridad financiera</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
