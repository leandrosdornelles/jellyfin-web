import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Media Server" },
      { name: "description", content: "Continue assistindo, filmes e séries da sua biblioteca." },
    ],
  }),
  component: Index,
});

const poster = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

const continueRow = [
  { title: "The Eminence in Shadow", sub: "T1 • E7 • Um Torneio Extravagante", pct: 65, g: poster("#1e3a8a", "#7c3aed") },
  { title: "Frieren e a Jornada", sub: "T1 • E2 • Não precisa ser agora", pct: 12, g: poster("#065f46", "#15803d") },
  { title: "O Chapolin Colorado", sub: "T6 • E18 • Não foi pênalti!", pct: 88, g: poster("#b91c1c", "#f59e0b") },
];

const posterRow = [
  { title: "Tokyo Ghoul", year: "2014", g: poster("#0f172a", "#334155") },
  { title: "High School of the Dead", year: "2010", g: poster("#7f1d1d", "#1e293b") },
  { title: "Roll Over and Die", year: "2026", g: poster("#6d28d9", "#db2777") },
  { title: "Witch Hat Atelier", year: "2026", g: poster("#0e7490", "#0f766e") },
  { title: "Release that Witch", year: "2026", g: poster("#9a3412", "#7c2d12") },
  { title: "Solo Leveling", year: "2025", g: poster("#1e1b4b", "#4338ca") },
];

function Art({ g, className = "" }: { g: string; className?: string }) {
  return <div className={className} style={{ backgroundImage: g }} />;
}

function EdgeRow({ title, action, children }: { title: string; action: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium text-zinc-100 tracking-tight">{title}</h2>
        <button className="text-xs text-zinc-500 hover:text-cyan-400">{action}</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3" style={{ maskImage: "linear-gradient(to right, black 88%, transparent)" }}>
        {children}
      </div>
    </section>
  );
}

function DirTwo() {
  return (
    <div className="relative min-h-[80vh] rounded-2xl overflow-hidden bg-zinc-950 text-zinc-300 border border-white/10">
      <aside className="absolute inset-y-0 left-0 w-16 bg-zinc-950/80 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 z-20">
        <div className="size-9 bg-cyan-500 rounded-xl grid place-items-center text-black">⚡</div>
        {["🏠", "🎬", "📺", "🌸"].map((i, idx) => (
          <div key={i} className={`size-9 grid place-items-center rounded-lg ${idx === 0 ? "bg-zinc-800 text-cyan-400" : "text-zinc-500"}`}>{i}</div>
        ))}
      </aside>
      <section className="relative h-[55vh] ml-16">
        <Art g={poster("#0c4a6e", "#3b0764")} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent" />
        <div className="relative h-full flex flex-col justify-end px-10 pb-10 max-w-xl">
          <span className="inline-block w-fit px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-3">Continuar assistindo</span>
          <h1 className="text-5xl font-semibold text-zinc-50 leading-tight mb-2">O Último Protocolo</h1>
          <p className="text-zinc-300 text-sm mb-5">T3 • E12 • No limiar da cidade subterrânea.</p>
          <div className="w-56 h-1 bg-zinc-800 rounded-full overflow-hidden mb-4"><div className="w-2/3 h-full bg-cyan-500" /></div>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-cyan-500 text-black rounded-lg text-sm font-semibold">▶ Continuar</button>
            <button className="px-6 py-2 bg-zinc-800/80 text-zinc-100 rounded-lg text-sm font-semibold border border-white/5">Detalhes</button>
          </div>
        </div>
      </section>
      <div className="ml-16 px-10 -mt-6 relative z-10 space-y-9 pb-10">
        <EdgeRow title="A seguir" action="Ver tudo">
          {continueRow.map((c) => (
            <div key={c.title} className="group shrink-0 w-72 cursor-pointer">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 mb-2 transition-all duration-300 ease-out ring-1 ring-transparent group-hover:-translate-y-1 group-hover:ring-cyan-400/70 group-hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.45)]">
                <Art g={c.g} className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-cyan-400/0 transition-colors duration-300 group-hover:bg-cyan-400/5" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800"><div className="h-full bg-cyan-500" style={{ width: `${c.pct}%` }} /></div>
              </div>
              <p className="text-sm font-medium text-zinc-100 transition-colors group-hover:text-white">{c.title}</p>
              <p className="text-xs text-zinc-500">{c.sub}</p>
            </div>
          ))}
        </EdgeRow>
        <EdgeRow title="Filmes recentes" action="Ver biblioteca">
          {posterRow.map((p) => (
            <div key={p.title} className="group shrink-0 w-40 cursor-pointer">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 mb-2 transition-all duration-300 ease-out ring-1 ring-transparent group-hover:-translate-y-1 group-hover:ring-cyan-400/70 group-hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.45)]">
                <Art g={p.g} className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-cyan-400/0 transition-colors duration-300 group-hover:bg-cyan-400/5" />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-bold text-zinc-100">4K</div>
              </div>
              <p className="text-sm font-medium text-zinc-100 truncate transition-colors group-hover:text-white">{p.title}</p>
              <p className="text-xs text-zinc-500">{p.year}</p>
            </div>
          ))}
        </EdgeRow>
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <DirTwo />
      </div>
    </div>
  );
}
