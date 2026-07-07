import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/detalhe")({
  head: () => ({
    meta: [
      { title: "Perfect Blue (1998) — Media Server" },
      {
        name: "description",
        content:
          "A cor da ilusão é o azul perfeito. Drama psicológico de Satoshi Kon sobre Mima Kirigoe.",
      },
    ],
  }),
  component: Detail,
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

const tags = [
  "psychological thriller",
  "mental illness",
  "anime",
  "suspense",
  "split personality",
  "j-pop",
];

const cast = [
  { name: "Junko Iwao", role: "Mima Kirigoe", g: poster("#7c3aed", "#1e3a8a") },
  { name: "Rica Matsumoto", role: "Rumi", g: poster("#0e7490", "#0f766e") },
  { name: "Shiho Niiyama", role: "Rei", g: poster("#b91c1c", "#f59e0b") },
  { name: "Masaaki Ōkura", role: "Mamoru Uchida", g: poster("#065f46", "#15803d") },
  { name: "Shinpachi Tsuji", role: "Tadokoro", g: poster("#6d28d9", "#db2777") },
  { name: "Emiko Furukawa", role: "Yukiko", g: poster("#0f172a", "#334155") },
];

const related = [
  { title: "Princesa Mononoke", year: "1997", g: poster("#15803d", "#065f46") },
  { title: "Cloud", year: "2024", g: poster("#334155", "#0f172a") },
  { title: "Chime", year: "2024", g: poster("#1e293b", "#0e7490") },
  { title: "Resident Evil: Damnation", year: "2012", g: poster("#7f1d1d", "#1e1b4b") },
  { title: "Resident Evil: Degeneration", year: "2008", g: poster("#9a3412", "#7c2d12") },
  { title: "O Palhaço no Milharal", year: "2025", g: poster("#4338ca", "#db2777") },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-zinc-800/70 border border-white/5 text-xs text-zinc-300 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors cursor-default">
      {children}
    </span>
  );
}

function EdgeRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium text-zinc-100 tracking-tight">{title}</h2>
        <button className="text-xs text-zinc-500 hover:text-cyan-400">Ver tudo</button>
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-3"
        style={{ maskImage: "linear-gradient(to right, black 90%, transparent)" }}
      >
        {children}
      </div>
    </section>
  );
}

function Detail() {
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
              className="relative min-h-[62vh] overflow-hidden"
            >
              {/* Ken Burns + parallax no fundo */}
              <div
                className="absolute inset-0 will-change-transform"
                style={{ transform: `translateY(${scrollY * 0.25}px)` }}
              >
                <Art
                  g={poster("#0c4a6e", "#3b0764")}
                  className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%] animate-kenburns"
                />
              </div>
              {/* Spotlight seguindo o cursor */}
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
                {/* Poster */}
                <div className="hidden md:block relative shrink-0 cine-reveal" style={{ animationDelay: "0.1s" }}>
                  {/* Ambient glow pulsante atrás do pôster */}
                  <div className="absolute -inset-6 rounded-full bg-cyan-400/30 blur-3xl animate-ambient pointer-events-none" />
                  <div className="relative w-52 aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]">
                    <Art g={poster("#1e3a8a", "#0c4a6e")} className="w-full h-full" />
                  </div>
                </div>

                {/* Bloco principal */}
                <div className="max-w-2xl">
                  <span className="inline-block w-fit px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-3 cine-reveal" style={{ animationDelay: "0.15s" }}>
                    Filme · Animação
                  </span>
                  <h1 className="text-5xl font-semibold text-zinc-50 leading-tight mb-3 cine-reveal" style={{ animationDelay: "0.25s" }}>
                    Perfect Blue
                  </h1>
                  <p className="text-cyan-300/80 text-sm italic mb-4 cine-reveal" style={{ animationDelay: "0.35s" }}>
                    A cor da ilusão é o azul perfeito
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 mb-6 cine-reveal" style={{ animationDelay: "0.45s" }}>
                    <span className="font-medium text-zinc-100">1998</span>
                    <span className="text-zinc-600">•</span>
                    <span>1h 22m</span>
                    <span className="text-zinc-600">•</span>
                    <span className="px-1.5 py-0.5 rounded border border-white/15 text-xs">R</span>
                    <span className="text-zinc-600">•</span>
                    <span className="flex items-center gap-1 text-amber-400">★ 8.0</span>
                    <span className="flex items-center gap-1 text-red-400">🍅 85%</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-100">
                      4K HEVC
                    </span>
                  </div>

                  {/* CTAs em destaque */}
                  <div className="flex flex-wrap gap-3 cine-reveal" style={{ animationDelay: "0.55s" }}>
                    <button className="px-7 py-2.5 bg-cyan-500 text-black rounded-lg text-sm font-semibold hover:bg-cyan-400 transition-all hover:shadow-[0_0_28px_-4px_rgba(34,211,238,0.7)]">
                      ▶ Assistir
                    </button>
                    <button className="px-4 py-2.5 bg-zinc-800/80 text-zinc-100 rounded-lg text-sm font-semibold border border-white/5 hover:border-cyan-400/40 transition-colors">
                      + Lista
                    </button>
                    <button className="px-4 py-2.5 bg-zinc-800/80 text-zinc-100 rounded-lg text-sm font-semibold border border-white/5 hover:border-cyan-400/40 transition-colors">
                      ♥ Favorito
                    </button>
                    <button className="size-10 grid place-items-center bg-zinc-800/80 text-zinc-100 rounded-lg border border-white/5 hover:border-cyan-400/40 transition-colors">
                      ⋯
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* CONTEÚDO */}
            <div className="px-10 -mt-4 relative z-10 pb-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10">
              {/* Coluna principal */}
              <div className="min-w-0 space-y-10">
                <section>
                  <h2 className="text-base font-medium text-zinc-100 mb-3">Sinopse</h2>
                  <p className="text-sm leading-relaxed text-zinc-400 max-w-2xl">
                    Mima Kirigoe é membro de uma banda de J-Pop chamada "CHAM!", que decide deixar
                    o grupo para se dedicar à carreira de atriz. Alguns fãs ficam descontentes com a
                    mudança e, conforme avança em sua nova carreira, Mima mergulha em um intenso
                    drama psicológico no qual fantasia e realidade se confundem.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {tags.map((t) => (
                      <Pill key={t}>{t}</Pill>
                    ))}
                  </div>
                </section>

                <EdgeRow title="Elenco e Equipe">
                  {cast.map((c) => (
                    <TiltCard key={c.name} max={14} className="group shrink-0 w-32 cursor-pointer text-center">
                      <div className="relative aspect-square rounded-full overflow-hidden border border-white/5 mb-2 mx-auto w-28 ring-1 ring-transparent group-hover:ring-cyan-400/70 group-hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.45)]">
                        <Art g={c.g} className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-110" />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "radial-gradient(120px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.25), transparent 60%)" }}
                        />
                      </div>
                      <p className="text-sm font-medium text-zinc-100 truncate transition-colors group-hover:text-white">
                        {c.name}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{c.role}</p>
                    </TiltCard>
                  ))}
                </EdgeRow>

                <EdgeRow title="Mais como este">
                  {related.map((p) => (
                    <TiltCard key={p.title} max={12} className="group shrink-0 w-40 cursor-pointer">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 mb-2 ring-1 ring-transparent group-hover:ring-cyan-400/70 group-hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.45)]">
                        <Art g={p.g} className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-110" />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "radial-gradient(160px circle at var(--gx,50%) var(--gy,50%), rgba(34,211,238,0.22), transparent 60%)" }}
                        />
                      </div>
                      <p className="text-sm font-medium text-zinc-100 truncate transition-colors group-hover:text-white">
                        {p.title}
                      </p>
                      <p className="text-xs text-zinc-500">{p.year}</p>
                    </TiltCard>
                  ))}
                </EdgeRow>
              </div>

              {/* Coluna lateral: ficha técnica + faixas */}
              <aside className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-5 space-y-4">
                  <h3 className="text-sm font-medium text-zinc-100">Reprodução</h3>
                  <label className="block">
                    <span className="text-xs text-zinc-500">Áudio</span>
                    <select className="mt-1 w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-cyan-400/60 focus:outline-none">
                      <option>Japonês · TrueHD 5.1 · Original</option>
                      <option>Português · AAC 2.0</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs text-zinc-500">Legendas</span>
                    <select className="mt-1 w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-cyan-400/60 focus:outline-none">
                      <option>Português · SUBRIP</option>
                      <option>English · SUBRIP</option>
                      <option>Desativado</option>
                    </select>
                  </label>
                </div>

                <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-5">
                  <h3 className="text-sm font-medium text-zinc-100 mb-4">Ficha técnica</h3>
                  <dl className="space-y-3 text-sm">
                    {[
                      ["Diretor", "Satoshi Kon"],
                      ["Roteiro", "Sadayuki Murai"],
                      ["Estúdio", "Madhouse, Rex Entertainment"],
                      ["Gêneros", "Animação, Thriller"],
                      ["Vídeo", "4K HEVC SDR"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex flex-col">
                        <dt className="text-xs text-zinc-500">{k}</dt>
                        <dd className="text-zinc-200">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex gap-3 mt-5 pt-4 border-t border-white/5">
                    <button className="text-xs text-cyan-400 hover:text-cyan-300">IMDb ↗</button>
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