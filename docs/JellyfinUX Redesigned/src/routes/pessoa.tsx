import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/pessoa")({
  head: () => ({
    meta: [
      { title: "Kōji Shiraishi — Media Server" },
      {
        name: "description",
        content:
          "Diretor japonês de terror found-footage. Conheça a filmografia de Kōji Shiraishi.",
      },
    ],
  }),
  component: Person,
});

const poster = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

function Art({ g, className = "" }: { g: string; className?: string }) {
  return <div className={className} style={{ backgroundImage: g }} />;
}

/* Card com tilt 3D + brilho seguindo o cursor */
function TiltCard({
  children,
  className = "",
  max = 10,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;
    setStyle({
      transform: `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`,
      "--gx": `${px * 100}%`,
      "--gy": `${py * 100}%`,
    } as React.CSSProperties);
  };

  const reset = () =>
    setStyle({ transform: "perspective(700px) rotateX(0) rotateY(0) scale(1)" });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={className}
      style={{ transition: "transform 0.25s ease-out", ...style }}
    >
      {children}
    </div>
  );
}

const roles = ["Diretor", "Roteirista", "Ator"];

const films = [
  { title: "Kinki", year: "2025", q: "HD", g: poster("#7f1d1d", "#1e293b") },
  { title: "Sayuri", year: "2024", q: "4K", g: poster("#b91c1c", "#450a0a") },
  { title: "Senritsu Kaiki World", year: "2023", q: "HD", g: poster("#0c4a6e", "#1e1b4b") },
  { title: "Kidan: Pedaço de Escuridão", year: "2016", q: "HD", g: poster("#3b0764", "#1e293b") },
  { title: "Cthulhu", year: "2007", q: "SD", g: poster("#065f46", "#052e16") },
  { title: "Grotesque", year: "2009", q: "HD", g: poster("#7c2d12", "#1c1917") },
  { title: "Noroi: The Curse", year: "2005", q: "4K", g: poster("#334155", "#0f172a") },
  { title: "Occult", year: "2009", q: "HD", g: poster("#4338ca", "#1e1b4b") },
  { title: "Shirome", year: "2010", q: "SD", g: poster("#0e7490", "#134e4a") },
  { title: "Sadako vs Kayako", year: "2016", q: "4K", g: poster("#9a3412", "#450a0a") },
  { title: "A Record of Sweet Murder", year: "2014", q: "HD", g: poster("#6d28d9", "#1e3a8a") },
  { title: "Carved 2", year: "2008", q: "SD", g: poster("#1e3a8a", "#0c4a6e") },
];

function Person() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 35, active: false });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onHeroMove = (e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      active: true,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="relative rounded-2xl overflow-hidden bg-zinc-950 text-zinc-300 border border-white/10">
          {/* Sidebar (consistente com a home) */}
          <aside className="absolute inset-y-0 left-0 w-16 bg-zinc-950/80 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 z-30">
            <div className="size-9 bg-cyan-500 rounded-xl grid place-items-center text-black">⚡</div>
            {["🏠", "🎬", "📺", "🌸"].map((i, idx) => (
              <div
                key={i}
                className={`size-9 grid place-items-center rounded-lg ${idx === 1 ? "bg-zinc-800 text-cyan-400" : "text-zinc-500"}`}
              >
                {i}
              </div>
            ))}
          </aside>

          <div className="ml-16">
            {/* HERO imersivo */}
            <section
              ref={heroRef}
              onMouseMove={onHeroMove}
              onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
              className="relative min-h-[52vh] overflow-hidden"
            >
              <div
                className="absolute inset-0 will-change-transform"
                style={{ transform: `translateY(${scrollY * 0.25}px)` }}
              >
                <Art
                  g={poster("#111827", "#450a0a")}
                  className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%] animate-kenburns"
                />
              </div>
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: spot.active ? 1 : 0,
                  background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, rgba(34,211,238,0.18), transparent 70%)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent" />

              <button className="absolute top-6 right-6 z-10 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-zinc-300 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors">
                ← Voltar
              </button>

              <div className="relative h-full flex items-end gap-8 px-10 pt-24 pb-10">
                {/* Retrato circular */}
                <div className="hidden md:block relative shrink-0 cine-reveal" style={{ animationDelay: "0.1s" }}>
                  <div className="absolute -inset-6 rounded-full bg-cyan-400/25 blur-3xl animate-ambient pointer-events-none" />
                  <div className="relative w-44 h-44 rounded-full overflow-hidden border border-white/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]">
                    <Art g={poster("#374151", "#1c1917")} className="w-full h-full" />
                  </div>
                </div>

                {/* Bloco principal */}
                <div className="max-w-2xl">
                  <span className="inline-block w-fit px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-3 cine-reveal" style={{ animationDelay: "0.15s" }}>
                    Pessoa · Diretor
                  </span>
                  <h1 className="text-5xl font-semibold text-zinc-50 leading-tight mb-1 cine-reveal" style={{ animationDelay: "0.25s" }}>
                    白石晃士
                  </h1>
                  <p className="text-cyan-300/80 text-base mb-4 cine-reveal" style={{ animationDelay: "0.32s" }}>
                    Kōji Shiraishi
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-300 mb-4 cine-reveal" style={{ animationDelay: "0.42s" }}>
                    <span className="text-zinc-400">Nascimento:</span>
                    <span className="font-medium text-zinc-100">01/06/1973 (53 anos)</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">Okayama, Japão</span>
                  </div>

                  <div className="flex flex-wrap gap-2 cine-reveal" style={{ animationDelay: "0.5s" }}>
                    {roles.map((r) => (
                      <span
                        key={r}
                        className="px-2.5 py-1 rounded-full bg-zinc-800/70 border border-white/5 text-xs text-zinc-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5 cine-reveal" style={{ animationDelay: "0.58s" }}>
                    <button className="px-4 py-2 bg-zinc-800/80 text-zinc-100 rounded-lg text-sm font-semibold border border-white/5 hover:border-cyan-400/40 transition-colors">
                      ♥ Favorito
                    </button>
                    <button className="px-3 py-2 bg-zinc-800/80 text-cyan-400 rounded-lg text-sm font-medium border border-white/5 hover:border-cyan-400/40 transition-colors">
                      IMDb ↗
                    </button>
                    <button className="px-3 py-2 bg-zinc-800/80 text-cyan-400 rounded-lg text-sm font-medium border border-white/5 hover:border-cyan-400/40 transition-colors">
                      TheTVDB ↗
                    </button>
                    <button className="px-3 py-2 bg-zinc-800/80 text-cyan-400 rounded-lg text-sm font-medium border border-white/5 hover:border-cyan-400/40 transition-colors">
                      TMDB ↗
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* CONTEÚDO */}
            <div className="px-10 -mt-4 relative z-10 pb-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10">
              <div className="min-w-0 space-y-10">
                <section>
                  <h2 className="text-base font-medium text-zinc-100 mb-3">Biografia</h2>
                  <p className="text-sm leading-relaxed text-zinc-400 max-w-2xl">
                    Kōji Shiraishi é um diretor e roteirista japonês conhecido por suas obras de
                    terror no estilo found-footage. Ganhou notoriedade internacional com
                    "Noroi: The Curse" (2005) e seguiu explorando o horror psicológico e o
                    sobrenatural em títulos como "Occult", "Grotesque" e "Sadako vs Kayako".
                  </p>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-zinc-100 tracking-tight">
                      Filmografia
                    </h2>
                    <span className="text-xs text-zinc-500">{films.length} títulos</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8">
                    {films.map((f, i) => (
                      <TiltCard
                        key={f.title}
                        max={12}
                        className="cine-reveal group shrink-0 cursor-pointer"
                      >
                        <Link to="/detalhe" className="block">
                          <div
                            className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 mb-2 ring-1 ring-transparent group-hover:ring-cyan-400/70 group-hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.45)] transition-all"
                            style={{ animationDelay: `${(i % 5) * 0.05}s` }}
                          >
                            <Art
                              g={f.g}
                              className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-110"
                            />
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                background:
                                  "radial-gradient(160px circle at var(--gx,50%) var(--gy,50%), rgba(34,211,238,0.22), transparent 60%)",
                              }}
                            />
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-bold text-zinc-100">
                              {f.q}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-zinc-100 truncate transition-colors group-hover:text-white">
                            {f.title}
                          </p>
                          <p className="text-xs text-zinc-500">{f.year}</p>
                        </Link>
                      </TiltCard>
                    ))}
                  </div>
                </section>
              </div>

              {/* Coluna lateral */}
              <aside className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-5">
                  <h3 className="text-sm font-medium text-zinc-100 mb-4">Detalhes</h3>
                  <dl className="space-y-3 text-sm">
                    {[
                      ["Nome de nascimento", "白石晃士"],
                      ["Também conhecido", "Kōji Shiraishi"],
                      ["Nascimento", "01/06/1973"],
                      ["Local", "Okayama, Japão"],
                      ["Área", "Diretor · Roteirista"],
                      ["Títulos", `${films.length} filmes`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex flex-col">
                        <dt className="text-xs text-zinc-500">{k}</dt>
                        <dd className="text-zinc-200">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-white/5">
                    <button className="text-xs text-cyan-400 hover:text-cyan-300">IMDb ↗</button>
                    <button className="text-xs text-cyan-400 hover:text-cyan-300">TheTVDB ↗</button>
                    <button className="text-xs text-cyan-400 hover:text-cyan-300">TMDB ↗</button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}