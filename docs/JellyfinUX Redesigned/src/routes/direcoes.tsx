import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/direcoes")({
  head: () => ({
    meta: [{ title: "Direções de Design — Detalhe" }],
  }),
  component: Directions,
});

const poster = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

function Art({ g, className = "" }: { g: string; className?: string }) {
  return <div className={className} style={{ backgroundImage: g }} />;
}

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

const tags = [
  "psychological thriller",
  "mental illness",
  "anime",
  "suspense",
  "split personality",
  "j-pop",
];

const synopsis =
  'Mima Kirigoe é membro de uma banda de J-Pop chamada "CHAM!", que decide deixar o grupo para se dedicar à carreira de atriz. Alguns fãs ficam descontentes com a mudança e, conforme avança em sua nova carreira, Mima mergulha em um intenso drama psicológico no qual fantasia e realidade se confundem.';

function Sidebar() {
  return (
    <aside className="w-16 shrink-0 border-r border-zinc-900 bg-zinc-950/80 flex flex-col items-center py-6 gap-6">
      <div className="size-9 bg-cyan-500 rounded-xl grid place-items-center text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]">
        ⚡
      </div>
      {["🏠", "🎬", "📺", "🌸"].map((i, idx) => (
        <div
          key={i}
          className={`size-9 grid place-items-center rounded-lg ${idx === 1 ? "bg-zinc-800 text-cyan-400" : "text-zinc-500"}`}
        >
          {i}
        </div>
      ))}
    </aside>
  );
}

function MetaRow() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
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
  );
}

/* ─────────────── V1: Cinematic Theatre ─────────────── */
function V1() {
  return (
    <div className="flex bg-zinc-950 text-zinc-300 rounded-2xl overflow-hidden border border-white/10">
      <Sidebar />
      <main className="flex-1 relative">
        <div className="absolute top-0 inset-x-0 h-[420px] bg-gradient-to-b from-cyan-900/15 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="relative px-10 py-10 space-y-14">
          {/* Hero lado a lado */}
          <section className="flex gap-10 items-end animate-fade-in">
            <div className="w-52 aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shrink-0 transition-transform duration-500 hover:scale-105">
              <Art g={poster("#1e3a8a", "#0c4a6e")} className="w-full h-full" />
            </div>
            <div className="space-y-4 pb-1">
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold tracking-widest uppercase rounded border border-cyan-500/20">
                  Filme
                </span>
                <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold tracking-widest uppercase rounded border border-zinc-700">
                  Animação
                </span>
              </div>
              <h1 className="text-6xl font-bold tracking-tight text-white">Perfect Blue</h1>
              <p className="text-cyan-400/80 italic text-lg">A cor da ilusão é o azul perfeito</p>
              <MetaRow />
              <div className="flex gap-3 pt-2">
                <button className="flex items-center gap-2 px-8 py-3 bg-cyan-500 text-zinc-950 font-bold rounded-xl hover:bg-cyan-400 hover:scale-105 transition-all shadow-lg shadow-cyan-500/20">
                  ▶ Assistir
                </button>
                <button className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-200">
                  + Lista
                </button>
                <button className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-200">
                  ♥ Favorito
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            <div className="space-y-14">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                  Sinopse
                </h3>
                <p className="text-zinc-400 leading-relaxed text-lg max-w-3xl">{synopsis}</p>
                <div className="flex flex-wrap gap-2 mt-6">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Elenco e Equipe
                  </h3>
                  <button className="text-xs text-cyan-500 hover:underline">Ver tudo</button>
                </div>
                <div className="grid grid-cols-6 gap-5">
                  {cast.map((c) => (
                    <div key={c.name} className="flex flex-col items-center gap-3 group cursor-pointer">
                      <div className="size-20 rounded-full p-0.5 ring-2 ring-transparent group-hover:ring-cyan-400 transition-all overflow-hidden">
                        <Art g={c.g} className="w-full h-full rounded-full" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-white">{c.name}</p>
                        <p className="text-[10px] text-zinc-500">{c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Mais como este
                  </h3>
                  <button className="text-xs text-cyan-500 hover:underline">Ver tudo</button>
                </div>
                <div className="grid grid-cols-6 gap-5">
                  {related.map((p) => (
                    <div key={p.title} className="group cursor-pointer">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-zinc-800 group-hover:ring-2 group-hover:ring-cyan-500 transition-all">
                        <Art g={p.g} className="w-full h-full" />
                      </div>
                      <p className="text-xs font-bold text-zinc-200 truncate">{p.title}</p>
                      <p className="text-[10px] text-zinc-500">{p.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Reprodução
                </h4>
                <div>
                  <p className="text-[10px] text-zinc-500 mb-2">Áudio</p>
                  <div className="bg-zinc-950/50 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-zinc-200">
                    Japonês • TrueHD 5.1 ▾
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 mb-2">Legendas</p>
                  <div className="bg-zinc-950/50 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-zinc-200">
                    Português • SUBRIP ▾
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Ficha técnica
                </h4>
                {[
                  ["Diretor", "Satoshi Kon"],
                  ["Roteiro", "Sadayuki Murai"],
                  ["Estúdio", "Madhouse"],
                  ["Gêneros", "Animação, Thriller"],
                  ["Vídeo", "4K HEVC SDR"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] text-zinc-500 mb-0.5">{k}</p>
                    <p className="text-xs font-medium text-zinc-200">{v}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─────────────── V2: Theatre Glass ─────────────── */
function V2() {
  return (
    <div className="flex bg-zinc-950 text-zinc-300 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
      <Sidebar />
      <main className="flex-1">
        {/* Hero com backdrop */}
        <section className="relative min-h-[480px] flex items-end p-12">
          <Art g={poster("#0c4a6e", "#3b0764")} className="absolute inset-0 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <button className="absolute top-8 right-8 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-zinc-400 hover:text-white transition-all backdrop-blur-md">
            ← VOLTAR
          </button>
          <div className="relative z-10 flex gap-10 items-end animate-fade-in">
            <div className="w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 hover:scale-105 transition-transform duration-500">
              <Art g={poster("#1e3a8a", "#0c4a6e")} className="w-full h-full" />
            </div>
            <div className="flex-1 pb-2">
              <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold tracking-widest uppercase rounded-full border border-cyan-500/20 mb-4">
                Filme • Animação
              </span>
              <h1 className="text-7xl font-extrabold tracking-tight text-white mb-2">
                Perfect Blue
              </h1>
              <p className="text-cyan-400/80 text-xl font-medium italic mb-6">
                A cor da ilusão é o azul perfeito
              </p>
              <div className="mb-8">
                <MetaRow />
              </div>
              <div className="flex gap-4">
                <button className="px-10 py-4 bg-cyan-500 text-zinc-950 font-bold rounded-xl flex items-center gap-3 hover:bg-cyan-400 hover:scale-105 transition-all shadow-xl shadow-cyan-500/20">
                  ▶ Assistir
                </button>
                <button className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                  ＋
                </button>
                <button className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                  ♥
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="p-12 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-14">
          <div className="space-y-14">
            <section>
              <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-white">
                <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                Sinopse
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">{synopsis}</p>
              <div className="flex flex-wrap gap-2 mt-7">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-full text-xs text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-end mb-7">
                <h2 className="text-2xl font-bold text-white">Elenco e Equipe</h2>
                <button className="text-cyan-400 text-sm font-semibold">Ver tudo</button>
              </div>
              <div className="flex gap-8 overflow-x-auto pb-3">
                {cast.map((c) => (
                  <div key={c.name} className="flex flex-col items-center gap-3 min-w-[96px] group cursor-pointer">
                    <div className="size-24 rounded-full overflow-hidden border-4 border-zinc-900 shadow-xl group-hover:scale-105 group-hover:border-cyan-500/50 transition-all">
                      <Art g={c.g} className="w-full h-full" />
                    </div>
                    <div className="text-center">
                      <p className="text-white text-sm font-bold">{c.name}</p>
                      <p className="text-zinc-500 text-[11px]">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-end mb-7">
                <h2 className="text-2xl font-bold text-white">Mais como este</h2>
                <button className="text-cyan-400 text-sm font-semibold">Ver tudo</button>
              </div>
              <div className="grid grid-cols-4 gap-6">
                {related.slice(0, 4).map((p) => (
                  <div key={p.title} className="group cursor-pointer space-y-3">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/5 group-hover:ring-2 group-hover:ring-cyan-500/50 transition-all">
                      <Art g={p.g} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold truncate">{p.title}</p>
                      <p className="text-zinc-500 text-[11px]">{p.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside>
            <div className="p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl space-y-10 shadow-xl">
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Reprodução
                </h3>
                {[
                  ["Áudio", "Japonês • TrueHD 5.1"],
                  ["Legendas", "Português • SUBRIP"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5 cursor-pointer hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        {k}
                      </span>
                      <span className="text-sm font-medium text-zinc-100">{v}</span>
                    </div>
                    <span className="text-zinc-600">▾</span>
                  </div>
                ))}
              </div>
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Ficha Técnica
                </h3>
                <div className="grid grid-cols-2 gap-y-6">
                  {[
                    ["Diretor", "Satoshi Kon"],
                    ["Roteiro", "Sadayuki Murai"],
                    ["Estúdio", "Madhouse"],
                    ["Gêneros", "Animação, Thriller"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                        {k}
                      </span>
                      <span className="text-sm text-zinc-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-3.5 bg-zinc-950 border border-white/5 rounded-xl text-[10px] font-black tracking-widest text-zinc-200 hover:bg-zinc-900 transition-colors">
                  IMDb ↗
                </button>
                <button className="flex-1 py-3.5 bg-zinc-950 border border-white/5 rounded-xl text-[10px] font-black tracking-widest text-zinc-200 hover:bg-zinc-900 transition-colors">
                  TMDB ↗
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ─────────────── V3: Glass Focus ─────────────── */
function V3() {
  return (
    <div className="flex bg-zinc-950 text-zinc-300 rounded-2xl overflow-hidden border border-white/10 relative">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[520px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-zinc-950 to-zinc-950" />
          <div className="absolute -top-20 -right-20 w-[480px] h-[480px] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative px-10 py-8">
          <div className="flex justify-end mb-6">
            <button className="px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm text-zinc-400 backdrop-blur-md transition-all">
              ← Voltar
            </button>
          </div>

          <div className="flex gap-12 items-end mb-16 animate-fade-in">
            <div className="w-60 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50 shrink-0 group relative">
              <Art
                g={poster("#1e3a8a", "#0c4a6e")}
                className="w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex-1 pb-3">
              <div className="flex gap-3 mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded border border-cyan-500/20">
                  Filme
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded">
                  Animação
                </span>
              </div>
              <h1 className="text-7xl font-extrabold text-white mb-2 tracking-tight">
                Perfect Blue
              </h1>
              <p className="text-cyan-400/80 italic text-xl font-medium mb-6">
                A cor da ilusão é o azul perfeito
              </p>
              <div className="mb-8">
                <MetaRow />
              </div>
              <div className="flex gap-3">
                <button className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  ▶ Assistir
                </button>
                {["＋", "♥", "⋯"].map((s) => (
                  <button
                    key={s}
                    className="px-4 py-3.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 pb-12">
            <div className="space-y-12">
              <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
                <h2 className="text-xl font-bold mb-4 text-white">Sinopse</h2>
                <p className="text-zinc-400 leading-relaxed text-lg max-w-3xl mb-6 font-light">
                  {synopsis}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-default"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>

              <section className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Elenco e Equipe</h2>
                  <span className="text-xs font-bold text-cyan-400 cursor-pointer hover:underline uppercase tracking-widest">
                    Ver tudo
                  </span>
                </div>
                <div className="flex gap-8 overflow-x-auto pb-3">
                  {cast.map((c) => (
                    <div key={c.name} className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer">
                      <div className="size-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-cyan-400 transition-all p-1">
                        <Art g={c.g} className="w-full h-full rounded-full" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-zinc-100">{c.name}</p>
                        <p className="text-[11px] text-zinc-500">{c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="animate-fade-in" style={{ animationDelay: "450ms" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Mais como este</h2>
                  <span className="text-xs font-bold text-cyan-400 cursor-pointer hover:underline uppercase tracking-widest">
                    Ver tudo
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-5">
                  {related.map((p) => (
                    <div key={p.title} className="group cursor-pointer">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-zinc-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-cyan-400/70 group-hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.45)]">
                        <Art
                          g={p.g}
                          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="text-xs font-bold text-zinc-200 truncate">{p.title}</p>
                      <p className="text-[10px] text-zinc-500">{p.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Reprodução
                </h3>
                {[
                  ["Áudio", "Japonês • TrueHD 5.1"],
                  ["Legendas", "Português • SUBRIP"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="p-3.5 bg-zinc-950/60 rounded-xl border border-white/5 hover:border-cyan-400/30 transition-colors cursor-pointer"
                  >
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">
                      {k}
                    </p>
                    <p className="text-sm font-medium text-zinc-100">{v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Ficha técnica
                </h3>
                {[
                  ["Diretor", "Satoshi Kon"],
                  ["Roteiro", "Sadayuki Murai"],
                  ["Estúdio", "Madhouse"],
                  ["Gêneros", "Animação, Thriller"],
                  ["Vídeo", "4K HEVC SDR"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] text-zinc-500 mb-0.5">{k}</p>
                    <p className="text-sm text-zinc-200">{v}</p>
                  </div>
                ))}
                <div className="flex gap-3 pt-3 border-t border-white/5">
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 font-mono">
                    IMDb ↗
                  </button>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 font-mono">
                    TMDB ↗
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

const OPTIONS = [
  { id: 1, label: "1 · Cinematic Theatre", desc: "Hero lado a lado, ambient glow no topo, painéis de vidro" },
  { id: 2, label: "2 · Theatre Glass", desc: "Hero com backdrop imersivo, CTA com brilho, painel glass robusto" },
  { id: 3, label: "3 · Glass Focus", desc: "Glow azul difuso, animações de entrada em cascata, micro-interações" },
] as const;

function Directions() {
  const [active, setActive] = useState<1 | 2 | 3>(1);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <p className="text-sm text-zinc-400 mb-3">
          Escolha a direção para a tela de detalhe — clique para visualizar cada uma:
        </p>
        <div className="flex flex-wrap gap-3">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => setActive(o.id)}
              className={`px-4 py-2.5 rounded-xl text-left border transition-all ${
                active === o.id
                  ? "bg-cyan-500 text-black border-cyan-400 font-semibold"
                  : "bg-zinc-900 border-white/10 text-zinc-300 hover:border-cyan-400/40"
              }`}
            >
              <span className="block text-sm">{o.label}</span>
              <span className={`block text-[11px] ${active === o.id ? "text-black/70" : "text-zinc-500"}`}>
                {o.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {active === 1 && <V1 />}
        {active === 2 && <V2 />}
        {active === 3 && <V3 />}
      </div>
    </div>
  );
}