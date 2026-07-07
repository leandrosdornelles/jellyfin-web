import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Filmes — Media Server" },
      {
        name: "description",
        content: "Explore a biblioteca de filmes, séries e animes do seu servidor.",
      },
    ],
  }),
  component: Biblioteca,
});

const poster = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

function Art({ g, className = "" }: { g: string; className?: string }) {
  return <div className={className} style={{ backgroundImage: g }} />;
}

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

function Sidebar({ active = 1 }: { active?: number }) {
  const items = ["🏠", "🎬", "📺", "🌸"];
  return (
    <aside className="absolute inset-y-0 left-0 w-16 bg-zinc-950/80 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 z-30">
      <div className="size-9 bg-cyan-500 rounded-xl grid place-items-center text-black">⚡</div>
      {items.map((i, idx) => (
        <div
          key={i}
          className={`size-9 grid place-items-center rounded-lg ${idx === active ? "bg-zinc-800 text-cyan-400" : "text-zinc-500"}`}
        >
          {i}
        </div>
      ))}
    </aside>
  );
}

const G = [
  poster("#0f172a", "#334155"),
  poster("#7f1d1d", "#1e293b"),
  poster("#6d28d9", "#db2777"),
  poster("#0e7490", "#0f766e"),
  poster("#9a3412", "#7c2d12"),
  poster("#1e1b4b", "#4338ca"),
  poster("#1e3a8a", "#7c3aed"),
  poster("#065f46", "#15803d"),
  poster("#b91c1c", "#f59e0b"),
  poster("#3b0764", "#1e3a8a"),
  poster("#0c4a6e", "#3b0764"),
  poster("#334155", "#0f172a"),
];

const items = [
  { title: "007 Contra GoldenEye", year: "1995", q: "4K" },
  { title: "1974", year: "2026", q: "HD" },
  { title: "Acampamento Proibido", year: "2024", q: "HD" },
  { title: "Alma", year: "2020", q: "4K" },
  { title: "Almas Reencarnadas", year: "2005", q: "HD" },
  { title: "Anexo", year: "2022", q: "4K" },
  { title: "Annabelle 2: A Criação do Mal", year: "2017", q: "4K" },
  { title: "Antrum — A Cova do Demônio", year: "2018", q: "HD" },
  { title: "As Crônicas do Medo", year: "2012", q: "HD" },
  { title: "As Fitas de Poughkeepsie", year: "2007", q: "HD" },
  { title: "Asih 2", year: "2020", q: "HD" },
  { title: "Assustador", year: "2016", q: "4K" },
  { title: "Aviso do Inferno", year: "2022", q: "HD" },
  { title: "Bad Ben", year: "2016", q: "HD" },
  { title: "Banzé no Oeste", year: "1974", q: "HD" },
  { title: "Belzebuth", year: "2019", q: "4K" },
  { title: "Blade Runner 2049", year: "2017", q: "4K" },
  { title: "Blade Runner: O Caçador", year: "1982", q: "4K" },
  { title: "A Bruxa na Janela", year: "2018", q: "HD" },
  { title: "C U Soon", year: "2020", q: "HD" },
  { title: "Câmera Doméstica", year: "2025", q: "HD" },
  { title: "Creepy", year: "2016", q: "4K" },
];

const filters = ["AZ", "Recentes", "Nota", "Ano"];
const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const genrePool = ["Suspense", "Terror", "Drama", "Ficção", "Ação", "Mistério"];
const synopsis =
  "Uma trama envolvente que mistura tensão e atmosfera, conduzindo o espectador por reviravoltas inesperadas até um desfecho memorável.";

type Movie = {
  title: string;
  year: string;
  q: string;
  g: string;
  rating: string;
  duration: string;
  genres: string[];
  progress?: number;
};

function PosterCard({ m, i, fixed }: { m: Movie; i: number; fixed?: boolean }) {
  return (
    <TiltCard
      max={12}
      className={`cine-reveal group/card ${fixed ? "shrink-0 w-[160px]" : ""}`}
    >
      <Link to="/detalhe" className="group block">
        <div
          className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 mb-2 ring-1 ring-transparent group-hover:ring-cyan-400/70 group-hover:shadow-[0_18px_50px_-12px_rgba(34,211,238,0.5)] transition-all duration-300"
          style={{ animationDelay: `${(i % 8) * 0.04}s` }}
        >
          <Art
            g={m.g}
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background:
                "radial-gradient(220px circle at var(--gx,50%) var(--gy,50%), rgba(34,211,238,0.18), transparent 70%)",
            }}
          />
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-bold text-zinc-100">
            {m.q}
          </div>
          {/* RICH HOVER CARD */}
          <div className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black via-black/85 to-transparent p-3 pt-8">
            <div className="flex items-center gap-2 text-[10px] text-zinc-300 mb-1.5">
              <span className="text-cyan-300 font-semibold">★ {m.rating}</span>
              <span>•</span>
              <span>{m.duration}</span>
              <span>•</span>
              <span>{m.year}</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-snug line-clamp-3 mb-2">
              {synopsis}
            </p>
            <div className="flex flex-wrap gap-1 mb-2.5">
              {m.genres.map((gn) => (
                <span
                  key={gn}
                  className="px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] text-zinc-300"
                >
                  {gn}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-1 grid place-items-center h-8 rounded-lg bg-cyan-500 text-black text-xs font-semibold">
                ▶ Reproduzir
              </span>
              <span className="size-8 grid place-items-center rounded-lg bg-white/10 text-zinc-200 text-sm">
                +
              </span>
            </div>
          </div>
        </div>
        {typeof m.progress === "number" && (
          <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-2 -mt-1">
            <div
              className="h-full bg-cyan-400"
              style={{ width: `${m.progress}%` }}
            />
          </div>
        )}
        <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
          {m.title}
        </p>
        <p className="text-xs text-zinc-500">{m.year}</p>
      </Link>
    </TiltCard>
  );
}

function Track({ title, movies }: { title: string; movies: Movie[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 560, behavior: "smooth" });
  };
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3 px-8">
        <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            className="size-8 grid place-items-center rounded-full bg-zinc-800/80 border border-white/5 text-zinc-300 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => scroll(1)}
            className="size-8 grid place-items-center rounded-full bg-zinc-800/80 border border-white/5 text-zinc-300 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
          >
            ›
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto px-8 pb-3 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {movies.map((m, i) => (
          <PosterCard key={m.title} m={m} i={i} fixed />
        ))}
      </div>
    </section>
  );
}

function Hero({ movies }: { movies: Movie[] }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: "50%", y: "50%" });

  useEffect(() => {
    const id = setInterval(() => setIdx((v) => (v + 1) % movies.length), 6000);
    return () => clearInterval(id);
  }, [movies.length]);

  const m = movies[idx];
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSpot({
      x: `${((e.clientX - r.left) / r.width) * 100}%`,
      y: `${((e.clientY - r.top) / r.height) * 100}%`,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="relative h-[440px] overflow-hidden border-b border-white/10"
    >
      <Art g={m.g} className="absolute inset-0 w-full h-full animate-kenburns" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(500px circle at ${spot.x} ${spot.y}, rgba(34,211,238,0.14), transparent 65%)`,
        }}
      />
      <div className="relative h-full flex flex-col justify-end p-10 max-w-2xl">
        <span className="text-xs font-semibold text-cyan-300 tracking-widest uppercase mb-3">
          Em destaque
        </span>
        <h2
          key={m.title}
          className="cine-reveal text-4xl font-bold text-white tracking-tight mb-3"
        >
          {m.title}
        </h2>
        <div className="flex items-center gap-3 text-sm text-zinc-300 mb-4">
          <span className="text-cyan-300 font-semibold">★ {m.rating}</span>
          <span>{m.year}</span>
          <span>{m.duration}</span>
          <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs">{m.q}</span>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed mb-6 line-clamp-3">
          {synopsis}
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/detalhe"
            className="px-6 py-2.5 bg-cyan-500 text-black rounded-lg text-sm font-semibold hover:bg-cyan-400 transition-all hover:shadow-[0_0_28px_-4px_rgba(34,211,238,0.7)]"
          >
            ▶ Reproduzir
          </Link>
          <Link
            to="/detalhe"
            className="px-6 py-2.5 bg-white/10 text-zinc-100 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            Mais informações
          </Link>
        </div>
        <div className="flex items-center gap-1.5 mt-6">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1 rounded-full transition-all ${
                i === idx ? "w-8 bg-cyan-400" : "w-3 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Biblioteca() {
  const [active, setActive] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const data = useMemo<Movie[]>(
    () =>
      items.map((m, i) => ({
        ...m,
        g: G[i % G.length],
        rating: (7 + (i % 3) + (i % 5) * 0.1).toFixed(1),
        duration: `${1 + (i % 2)}h ${10 + ((i * 7) % 50)}min`,
        genres: [genrePool[i % genrePool.length], genrePool[(i + 2) % genrePool.length]],
      })),
    [],
  );

  const tracks = useMemo(
    () => [
      {
        title: "Continue assistindo",
        movies: data.slice(0, 7).map((m, i) => ({ ...m, progress: 20 + ((i * 13) % 70) })),
      },
      { title: "Adicionados recentemente", movies: data.slice(7, 16) },
      { title: "Mais bem avaliados", movies: [...data].slice(0, 10).reverse() },
      { title: "Para maratonar", movies: data.slice(12, 22) },
    ],
    [data],
  );

  const hero = useMemo(() => data.slice(0, 3), [data]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="relative rounded-2xl overflow-hidden bg-zinc-950 text-zinc-300 border border-white/10">
          <Sidebar />

          <div className="ml-16">
            {/* HEADER */}
            <div className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-md border-b border-white/10 px-8 py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight truncate">
                    Filmes
                  </h1>
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-800/70 border border-white/5 text-xs text-zinc-400">
                    236 títulos
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative hidden sm:block">
                    <input
                      placeholder="Buscar título…"
                      className="h-9 w-56 rounded-lg bg-zinc-800/80 border border-white/5 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400/40"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                      ⚲
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="px-4 py-2 bg-zinc-800/80 border border-white/5 text-zinc-200 rounded-lg text-sm font-medium hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
                  >
                    {showAll ? "Ver trilhas" : "Ver tudo (A-Z)"}
                  </button>
                </div>
              </div>

              {/* FILTROS */}
              <div className="flex items-center gap-2 mt-4">
                {filters.map((f, i) => (
                  <button
                    key={f}
                    onClick={() => setActive(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      active === i
                        ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-300"
                        : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {showAll ? (
              /* GRID + ALFABETO */
              <div className="flex">
                <div className="flex-1 px-8 py-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
                    {data.map((m, i) => (
                      <PosterCard key={m.title} m={m} i={i} />
                    ))}
                  </div>
                </div>

                {/* ÍNDICE A-Z */}
                <div className="hidden lg:flex flex-col items-center gap-0.5 py-8 pr-4 sticky top-32 self-start max-h-[80vh] overflow-y-auto">
                  {alphabet.map((l) => (
                    <button
                      key={l}
                      className="text-[11px] leading-tight text-zinc-600 hover:text-cyan-400 transition-colors px-1"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <Hero movies={hero} />
                <div className="py-8">
                  {tracks.map((t) => (
                    <Track key={t.title} title={t.title} movies={t.movies} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}