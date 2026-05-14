export function PageShell({ title, description, children }) {
  return (
    <div className="px-8 py-7">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-black text-banker-navy">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Panel({ title, children, actions }) {
  return (
    <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-black text-banker-navy">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export function ResultBox({ result, error }) {
  if (!result && !error) return null;

  return (
    <div className={`mt-5 rounded-sm border p-4 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-banker-blue/20 bg-[#f2f8fa] text-banker-navy'}`}>
      {error ? (
        <p>{error}</p>
      ) : (
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

export const inputClass = 'w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-banker-blue focus:ring-2 focus:ring-banker-blue/15';
export const primaryButtonClass = 'rounded-sm bg-banker-blue px-5 py-2.5 text-sm font-black text-white transition hover:bg-banker-navy disabled:cursor-not-allowed disabled:bg-slate-400';
export const secondaryButtonClass = 'rounded-sm border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-banker-navy transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400';
