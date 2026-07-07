import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/temporada")({
  head: () => ({
    meta: [
      { title: "Black Butler — Temporada 1 — Media Server" },
      {
        name: "description",
        content: "Episódios da Temporada 1 de Black Butler. Acompanhe Sebastian e Ciel Phantomhive.",
      },
    ],
  }),
  component: Temporada,
});

const poster = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

function Art({ g, className = "" }: { g: string; className?: string }) {
  return <div className={className} style={{ backgroundImage: g }} />;
}

function Sidebar() {
  const items = ["🏠", "🎬", "📺", "🌸"];
  return (
    <aside className="absolute inset-y-0 left-0 w-16 bg-zinc-950/80 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 z-30">
      <div className="size-9 bg-cyan-500 rounded-xl grid place-items-center text-black">⚡</div>
      {items.map((i, idx) => (
        <div
          key={i}
          className={`size-9 grid place-items-center rounded-lg ${idx === 2 ? "bg-zinc-800 text-cyan-400" : "text-zinc-500"}`}
        >
          {i}
        </div>
      ))}
    </aside>
  );
}

const episodes = [
  {
    n: 1, title: "Seu mordomo, Able", dur: "24m", rating: "7.1", end: "10:29",
    g: poster("#15803d", "#065f46"),
    desc: "A propriedade Phantomhive está agitada com os preparativos para uma reunião importante entre o Jovem Mestre e um capitão da indústria. A empregada, o jardineiro e o cozinheiro são tolos, mas o Mordomo é um homem de talentos ocultos.",
  },
  {
    n: 2, title: "Seu Mordomo, o Mais Forte", dur: "24m", rating: "7.4", end: "10:29",
    g: poster("#7c2d12", "#3b0764"),
    desc: "Os planos para suprimir uma revolta são colocados em espera quando o Jovem Mestre é sequestrado. O Mordomo é obrigado a agir decisivamente.",
  },
  {
    n: 3, title: "Seu Mordomo, Onipotente", dur: "24m", rating: "6.7", end: "10:29",
    g: poster("#6d28d9", "#db2777"),
    desc: "Quando a noiva do Jovem Mestre aparece para uma visita inesperada, a Propriedade Phantomhive passa por uma explosão repugnante de fofura.",
  },
  {
    n: 4, title: "Seu Mordomo, Caprichoso", dur: "24m", rating: "7.0", end: "10:29",
    g: poster("#334155", "#0f172a"),
    desc: "Um misterioso convidado chega à mansão, e Sebastian precisa lidar com as exigências peculiares enquanto protege os segredos da família.",
  },
  {
    n: 5, title: "Seu mordomo, encontro casual", dur: "24m", rating: "7.3", end: "10:29",
    g: poster("#1e3a8a", "#0c4a6e"),
    desc: "Ciel e Sebastian investigam uma série de desaparecimentos em Londres sob a luz da lua.",
  },
];

function Temporada() {
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
          <Sidebar />

          <div className="ml-16">
            {/* HERO */}
            <section
              ref={heroRef}
              onMouseMove={onHeroMove}
              onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
              className="relative min-h-[46vh] overflow-hidden"
            >
              <div
                className="absolute inset-0 will-change-transform"
                style={{ transform: `translateY(${scrollY * 0.2}px)` }}
              >
                <Art
                  g={poster("#1a1a1a", "#3b0764")}
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

              <Link
                to="/serie"
                className="absolute top-6 right-6 z-10 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-zinc-300 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
              >
                ← Voltar
              </Link>

              <div className="relative h-full flex items-end gap-8 px-10 pt-24 pb-8">
                <div className="hidden md:block relative shrink-0 cine-reveal" style={{ animationDelay: "0.1s" }}>
                  <div className="absolute -inset-6 rounded-full bg-cyan-400/30 blur-3xl animate-ambient pointer-events-none" />
                  <div className="relative w-44 aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]">
                    <Art g={poster("#3b0764", "#1e3a8a")} className="w-full h-full" />
                  </div>
                </div>

                <div className="max-w-2xl">
                  <Link to="/serie" className="inline-block text-xs text-cyan-400 hover:text-cyan-300 mb-2 cine-reveal" style={{ animationDelay: "0.15s" }}>
                    Black Butler
                  </Link>
                  <h1 className="text-4xl font-semibold text-zinc-50 leading-tight mb-3 cine-reveal" style={{ animationDelay: "0.25s" }}>
                    Temporada 1
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 mb-6 cine-reveal" style={{ animationDelay: "0.35s" }}>
                    <span>24 episódios</span>
                    <span className="text-zinc-600">•</span>
                    <span>2008</span>
                    <span className="text-zinc-600">•</span>
                    <span className="flex items-center gap-1 text-amber-400">★ 7.4</span>
                  </div>
                  <div className="flex flex-wrap gap-3 cine-reveal" style={{ animationDelay: "0.45s" }}>
                    <Link to="/episodio" className="px-7 py-2.5 bg-cyan-500 text-black rounded-lg text-sm font-semibold hover:bg-cyan-400 transition-all hover:shadow-[0_0_28px_-4px_rgba(34,211,238,0.7)]">
                      ▶ Assistir do início
                    </Link>
                    <button className="px-4 py-2.5 bg-zinc-800/80 text-zinc-100 rounded-lg text-sm font-semibold border border-white/5 hover:border-cyan-400/40 transition-colors">
                      ✓ Marcar visto
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* LISTA DE EPISÓDIOS */}
            <div className="px-10 -mt-2 relative z-10 pb-12">
              <h2 className="text-base font-medium text-zinc-100 mb-4">Episódios</h2>
              <div className="space-y-3">
                {episodes.map((ep, i) => (
                  <Link
                    key={ep.n}
                    to="/episodio"
                    className="group grid grid-cols-[auto_1fr_auto] gap-4 items-start rounded-xl border border-white/10 bg-zinc-900/40 p-3 hover:border-cyan-400/40 hover:bg-zinc-900/70 transition-colors cine-reveal"
                    style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                  >
                    <div className="relative w-48 shrink-0 aspect-video rounded-lg overflow-hidden">
                      <Art g={ep.g} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <span className="size-10 grid place-items-center rounded-full bg-cyan-500 text-black">▶</span>
                      </div>
                    </div>
                    <div className="min-w-0 py-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-medium text-zinc-100 group-hover:text-white truncate">
                          {ep.n}. {ep.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                        <span>{ep.dur}</span>
                        <span className="flex items-center gap-1 text-amber-400">★ {ep.rating}</span>
                        <span>Termina às {ep.end}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2">{ep.desc}</p>
                    </div>
                    <div className="flex flex-col gap-2 text-zinc-500 pt-1">
                      <span className="hover:text-cyan-400">ⓘ</span>
                      <span className="hover:text-cyan-400">✓</span>
                      <span className="hover:text-cyan-400">♥</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}