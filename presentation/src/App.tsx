import { useCallback, useEffect, useState, type ReactNode } from "react"

const TOTAL = 13
import {
  Joana,
  Prefeitura,
  Camara,
  Hospital,
  Escola,
  Praca,
  Rodovia,
  Bus,
  GovBuilding,
  LevelBadge,
  CityPanorama,
} from "./deck/pixel"

/* ─────────────────────────── shared primitives ─────────────────────────── */

function Tag({ children, tone = "emerald" }: { children: ReactNode; tone?: "emerald" | "gold" | "cream" }) {
  const tones = {
    emerald: "text-emerald border-emerald/40 bg-emerald/10",
    gold: "text-gold border-gold/40 bg-gold/10",
    cream: "text-cream-dim border-line bg-cream/5",
  }
  return <span className={`hud-label inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 ${tones[tone]}`}>{children}</span>
}

function DialogBox({
  speaker,
  color = "emerald",
  children,
  avatar,
}: {
  speaker: string
  color?: "emerald" | "gold"
  children: ReactNode
  avatar?: ReactNode
}) {
  const c = color === "emerald" ? "border-emerald text-emerald" : "border-gold text-gold"
  return (
    <div className="flex items-start gap-3">
      {avatar && <div className="h-11 w-11 shrink-0 rounded-sm border border-line bg-petrol p-1">{avatar}</div>}
      <div className={`relative flex-1 rounded-sm border-2 ${c} bg-ink/70 px-4 py-3`}>
        <div className={`hud-label mb-1 ${color === "emerald" ? "text-emerald" : "text-gold"}`}>{speaker}</div>
        <p className="text-[0.95rem] leading-snug text-cream">{children}</p>
      </div>
    </div>
  )
}

function Card({ children, className = "", accent }: { children: ReactNode; className?: string; accent?: "emerald" | "gold" }) {
  const top = accent === "emerald" ? "before:bg-emerald" : accent === "gold" ? "before:bg-gold" : "before:bg-line"
  return (
    <div
      className={`relative overflow-hidden rounded-md border border-line bg-petrol/60 p-4 before:absolute before:inset-x-0 before:top-0 before:h-1 ${top} before:content-[''] ${className}`}
    >
      {children}
    </div>
  )
}

/* Slide chrome — a 16:9 stage with HUD framing */
function Slide({
  n,
  kicker,
  children,
  bg = "grid",
}: {
  n: number
  kicker: string
  children: ReactNode
  bg?: "grid" | "plain"
}) {
  return (
    <div className={`relative flex h-full w-full flex-col bg-ink ${bg === "grid" ? "map-grid" : ""}`}>
      {/* top HUD bar */}
      <div className="flex items-center justify-between border-b border-line px-8 py-3">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-emerald blink" style={{ clipPath: "polygon(50% 0,100% 50%,50% 100%,0 50%)" }} />
          <span className="hud-label text-cream-dim">Aurora: Quem Decide?</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hud-label text-slate">{kicker}</span>
          <span className="font-pixel text-[0.55rem] text-gold">{String(n).padStart(2, "0")}/{TOTAL}</span>
        </div>
      </div>
      {/* content */}
      <div className="slide-in min-h-0 flex-1 px-10 py-7">{children}</div>
      {/* bottom disclaimer strip */}
      <div className="flex items-center justify-between border-t border-line px-8 py-2">
        <span className="hud-label text-slate/70">Educativo · Não partidário · Personagens e cidade fictícios</span>
        <span className="hud-label text-slate/70">MAC5784 - Inteligência Artificial em Jogos de Computador (2026)</span>
      </div>
    </div>
  )
}

function Heading({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-[2.1rem] font-extrabold leading-none tracking-tight text-cream">{children}</h2>
      {sub && <p className="mt-2 max-w-2xl text-[0.95rem] leading-snug text-cream-dim">{sub}</p>}
    </div>
  )
}

/* ────────────────────────────── SLIDE 1 — Capa ─────────────────────────── */

function SlideCover() {
  const spots: { c: ReactNode; label: string; pos: string }[] = [
    { c: <Prefeitura className="h-full w-full" />, label: "Prefeitura", pos: "left-[6%] top-[20%]" },
    { c: <Escola className="h-full w-full" />, label: "Escola", pos: "left-[20%] top-[54%]" },
    { c: <Hospital className="h-full w-full" />, label: "Hospital", pos: "right-[8%] top-[18%]" },
    { c: <Praca className="h-full w-full" />, label: "Praça", pos: "right-[22%] top-[56%]" },
    { c: <Rodovia className="h-full w-full" />, label: "Rodovia", pos: "left-[3%] top-[64%]" },
    { c: <GovBuilding className="h-full w-full" />, label: "Prédios públicos", pos: "right-[3%] top-[62%]" },
  ]
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <CityPanorama className="h-full w-full opacity-60" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

      {/* orbiting building tiles */}
      {spots.map((s) => (
        <div key={s.label} className={`absolute ${s.pos} floaty`} style={{ animationDelay: `${Math.random()}s` }}>
          <div className="h-14 w-14 rounded-sm border border-line bg-petrol/80 p-1.5 backdrop-blur-sm">{s.c}</div>
          <span className="hud-label mt-1 block text-center text-[0.45rem] text-cream-dim">{s.label}</span>
        </div>
      ))}

      {/* Joana centered */}
      <div className="absolute bottom-[16%] left-1/2 h-40 w-28 -translate-x-1/2 floaty">
        <Joana className="h-full w-full drop-shadow-[0_6px_0_rgba(0,0,0,0.4)]" />
      </div>

      {/* title block */}
      <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
        <Tag tone="gold">◆ Proposta de projeto · Cidade fictícia de Aurora do Brasil</Tag>
        <h1 className="mt-4 font-display text-[4.2rem] font-extrabold leading-[0.92] tracking-tight text-cream drop-shadow-[0_3px_0_rgba(0,0,0,0.5)]">
          AURORA: <span className="text-gold">QUEM DECIDE?</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-snug text-cream-dim">
          Um jogo sobre cidadania, escolhas e quem realmente pode resolver cada problema público
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Tag>Jogo educativo 2D</Tag>
          <Tag tone="cream">Educação política e cidadania</Tag>
          <Tag tone="gold">Python + Arcade</Tag>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8">
        <span className="hud-label text-slate">MAC5784 - Inteligência Artificial em Jogos de Computador (2026)</span>
        <span className="hud-label text-slate">Não partidário · Fictício</span>
      </div>
    </div>
  )
}

/* ─────────────────────────── SLIDE 2 — O problema ──────────────────────── */

function SlideProblema() {
  const items = [
    { icon: <Bus className="h-8 w-8" />, t: "Transporte urbano ruim", ask: "Prefeito?" },
    { icon: <Hospital className="h-8 w-8" />, t: "Unidade de saúde", ask: "Governador?" },
    { icon: <Escola className="h-8 w-8" />, t: "Escola pública", ask: "Vereador?" },
    { icon: <Rodovia className="h-8 w-8" />, t: "Rodovia com buracos", ask: "Deputado?" },
    { icon: <span className="text-3xl">🚓</span>, t: "Segurança pública", ask: "Presidente?" },
    { icon: <span className="text-3xl">📜</span>, t: "Criação de leis", ask: "Câmara?" },
  ]
  return (
    <Slide n={3} kicker="Capítulo 0 · A dúvida">
      <Heading sub="A divisão de responsabilidades públicas nem sempre é clara para o cidadão.">
        Todo mundo sabe reclamar. Mas sabemos <span className="text-gold">a quem cobrar?</span>
      </Heading>
      <div className="grid grid-cols-3 gap-4">
        {items.map((it) => (
          <Card key={it.t} accent="emerald" className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-sm border border-line bg-ink">{it.icon}</div>
            <div>
              <p className="text-sm font-semibold text-cream">{it.t}</p>
              <p className="mt-1 font-pixel text-[0.5rem] text-gold">{it.ask}</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-cream-dim">
        <span className="font-pixel text-[0.5rem] text-emerald">?</span>
        Linhas cruzadas, respostas incertas — é aqui que Aurora começa.
      </div>
    </Slide>
  )
}

/* ─────────────────────────── SLIDE 3 — A ideia ─────────────────────────── */

function SlideIdeia() {
  const pilares = [
    { e: "🎮", t: "Explorar", d: "Percorrer a cidade top-down" },
    { e: "💬", t: "Conversar", d: "Ouvir NPCs e moradores" },
    { e: "🔎", t: "Investigar", d: "Coletar evidências e leis" },
    { e: "⚖️", t: "Decidir", d: "Apontar quem tem competência" },
  ]
  return (
    <Slide n={4} kicker="Capítulo 0 · A oportunidade">
      <Heading>
        E se aprender cidadania fosse <span className="text-gold">uma missão?</span>
      </Heading>
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-3">
          <DialogBox speaker="Morador · NPC" color="gold">
            Precisamos resolver este problema no bairro. Ninguém parece saber por onde começar…
          </DialogBox>
          <DialogBox speaker="Joana" color="emerald" avatar={<Joana className="h-full w-full" />}>
            Mas quem tem competência para fazer isso?
          </DialogBox>
          <p className="rounded-md border border-line bg-petrol/50 px-4 py-3 text-sm leading-snug text-cream-dim">
            <span className="text-gold">Por que um jogo?</span> A proposta é converter educação política em{" "}
            <span className="text-cream">exploração, diálogo, investigação e decisão</span> — porque aprende-se
            competência institucional <span className="text-emerald">praticando</span>, não decorando.
          </p>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {pilares.map((p) => (
            <Card key={p.t} accent="gold" className="flex flex-col justify-between">
              <span className="text-2xl">{p.e}</span>
              <div className="mt-3">
                <p className="font-display text-base font-bold text-cream">{p.t}</p>
                <p className="mt-0.5 text-xs leading-tight text-cream-dim">{p.d}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* ────────────────────────── SLIDE 4 — Como funciona ────────────────────── */

function SlideComoFunciona() {
  const steps = [
    "Encontrar o problema",
    "Conversar com moradores",
    "Coletar evidências",
    "Identificar a competência",
    "Tomar uma decisão",
    "Entender o porquê",
  ]
  return (
    <Slide n={5} kicker="Loop de gameplay">
      <Heading sub="Cada missão seguirá o mesmo loop investigativo — o conteúdo vive dentro dele.">
        Aprender <span className="text-gold">fazendo</span>
      </Heading>
      <div className="flex items-stretch gap-1.5">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-1.5">
            <Card accent={i === steps.length - 1 ? "gold" : "emerald"} className="flex h-32 flex-1 flex-col justify-between">
              <span className="font-pixel text-[0.55rem] text-gold">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-[0.82rem] font-semibold leading-tight text-cream">{s}</p>
            </Card>
            {i < steps.length - 1 && <span className="text-emerald">→</span>}
          </div>
        ))}
      </div>
      <div className="mt-6 grid place-items-center">
        <div className="rounded-md border-2 border-gold bg-gold/10 px-6 py-4 text-center">
          <p className="hud-label mb-2 text-gold">A fórmula da decisão fundamentada</p>
          <p className="font-display text-2xl font-extrabold text-cream">
            Problema <span className="text-emerald">+</span> Testemunho <span className="text-emerald">+</span> Lei{" "}
            <span className="text-gold">=</span> Decisão
          </p>
        </div>
      </div>
    </Slide>
  )
}

/* ─────────────────────────── SLIDE 5 — A jornada ───────────────────────── */

function SlideJornada() {
  const caps = [
    {
      lvl: "municipio" as const,
      icon: "🏙️",
      cap: "Capítulo 1",
      t: "O Município",
      d: "Problemas locais do cotidiano.",
      items: ["Saúde básica", "Escolas municipais", "Transporte urbano", "Serviços locais"],
    },
    {
      lvl: "estado" as const,
      icon: "🗺️",
      cap: "Capítulo 2",
      t: "O Estado",
      d: "Problemas de alcance regional.",
      items: ["Hospitais de referência", "Rodovias estaduais", "Segurança pública"],
    },
    {
      lvl: "uniao" as const,
      icon: "🇧🇷",
      cap: "Capítulo 3",
      t: "A União",
      d: "Questões nacionais.",
      items: ["Leis federais", "Políticas nacionais", "Relações entre estados"],
    },
  ]
  return (
    <Slide n={6} kicker="Mapa de progressão">
      <Heading sub="Joana avançará de bairro em bairro — e de nível em nível de governo.">
        Uma cidade. <span className="text-gold">Três níveis de governo.</span>
      </Heading>
      <div className="grid grid-cols-3 gap-4">
        {caps.map((c, i) => (
          <div key={c.t} className="relative">
            <Card accent={i === 2 ? "gold" : "emerald"} className="h-full">
              <div className="flex items-center gap-3">
                <LevelBadge level={c.lvl} className="h-11 w-11" />
                <div>
                  <p className="hud-label text-gold">{c.cap}</p>
                  <p className="font-display text-xl font-extrabold text-cream">
                    {c.icon} {c.t}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-cream-dim">{c.d}</p>
              <ul className="mt-3 space-y-1.5">
                {c.items.map((it) => (
                  <li key={it} className="flex items-center gap-2 text-sm text-cream">
                    <span className="h-1.5 w-1.5 bg-emerald" /> {it}
                  </li>
                ))}
              </ul>
            </Card>
            {i < caps.length - 1 && (
              <div className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 font-pixel text-xs text-gold">▸</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-9 w-7">
          <Joana className="h-full w-full" />
        </div>
        <div className="relative h-1.5 flex-1 rounded-full bg-petrol">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald to-gold" />
        </div>
        <span className="hud-label text-cream-dim">Progresso da jornada</span>
      </div>
    </Slide>
  )
}

/* ────────────────────── SLIDE 6 — Quem decide o quê ────────────────────── */

function SlideMatriz() {
  const rows = [
    { lvl: "municipio" as const, level: "Município", leg: "Vereador", exe: "Prefeito" },
    { lvl: "estado" as const, level: "Estado", leg: "Deputado Estadual", exe: "Governador" },
    { lvl: "uniao" as const, level: "União", leg: "Dep. Federal + Senador", exe: "Presidente" },
  ]
  return (
    <Slide n={7} kicker="Matriz de competências">
      <Heading>
        Do problema à <span className="text-gold">responsabilidade</span>
      </Heading>
      <div className="grid grid-cols-[1.1fr_1fr_1fr] overflow-hidden rounded-md border border-line">
        <div className="border-b border-line bg-petrol px-4 py-3 hud-label text-cream-dim">Nível</div>
        <div className="border-b border-l border-line bg-emerald/15 px-4 py-3 hud-label text-emerald">📜 Legislativo</div>
        <div className="border-b border-l border-line bg-gold/15 px-4 py-3 hud-label text-gold">⚙️ Executivo</div>
        {rows.map((r) => (
          <div key={r.level} className="contents">
            <div className="flex items-center gap-2 border-b border-line bg-petrol/40 px-4 py-4 last:border-b-0">
              <LevelBadge level={r.lvl} className="h-8 w-8" />
              <span className="font-display font-bold text-cream">{r.level}</span>
            </div>
            <div className="border-b border-l border-line px-4 py-4 text-cream">{r.leg}</div>
            <div className="border-b border-l border-line px-4 py-4 text-cream">{r.exe}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card accent="emerald">
          <p className="font-display font-bold text-emerald">📜 Legislativo</p>
          <p className="text-sm text-cream-dim">Cria leis e fiscaliza.</p>
        </Card>
        <Card accent="gold">
          <p className="font-display font-bold text-gold">⚙️ Executivo</p>
          <p className="text-sm text-cream-dim">Administra e executa políticas públicas.</p>
        </Card>
      </div>
      <p className="mt-4 text-center text-sm text-cream-dim">
        O jogo também ensina os <span className="text-gold">limites</span> de cada cargo — não apenas suas atribuições.
      </p>
    </Slide>
  )
}

/* ─────────────────────── SLIDE 7 — Mecânicas ───────────────────────────── */

function SlideMecanicas() {
  const cards = [
    { e: "🗺️", t: "Exploração", d: "Movimentação top-down pela cidade." },
    { e: "💬", t: "NPCs e missões", d: "Problemas públicos apresentados por personagens." },
    { e: "🔎", t: "Side quests", d: "Moradores dão testemunhos e novas perspectivas." },
    { e: "⭐", t: "Sistema de provas", d: "Problema + testemunho + legislação justificam a decisão." },
    { e: "📖", t: "Diário de Cidadania", d: "Consulta rápida do que cada cargo faz — e não faz." },
  ]
  return (
    <Slide n={8} kicker="Mecânicas de aprendizagem">
      <Heading>
        O conteúdo está <span className="text-gold">dentro da mecânica</span>
      </Heading>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <Card key={c.t} accent={i % 2 ? "gold" : "emerald"} className={i === 4 ? "col-span-1" : ""}>
            <span className="text-3xl">{c.e}</span>
            <p className="mt-2 font-display text-lg font-bold text-cream">{c.t}</p>
            <p className="mt-1 text-sm leading-tight text-cream-dim">{c.d}</p>
          </Card>
        ))}
        <div className="col-span-1 grid place-items-center rounded-md border-2 border-gold bg-gold/10 p-4">
          <p className="text-center text-sm font-semibold leading-snug text-cream">
            O jogador não decora uma aula. Ele <span className="text-gold">usa o conhecimento para avançar.</span>
          </p>
        </div>
      </div>
    </Slide>
  )
}

/* ──────────────────── SLIDE 8 — Objetivo pedagógico ────────────────────── */

function SlideObjetivo() {
  const goals = [
    { n: "01", v: "Relacionar", d: "um problema ao nível de governo responsável." },
    { n: "02", v: "Explicar", d: "ao menos uma atribuição do cargo envolvido." },
    { n: "03", v: "Distinguir", d: "Legislativo de Executivo." },
    { n: "04", v: "Compreender", d: "que políticas envolvem competências, orçamento, leis e escolhas." },
  ]
  return (
    <Slide n={9} kicker="Objetivos de aprendizagem">
      <Heading>
        O que queremos que o jogador <span className="text-gold">aprenda?</span>
      </Heading>
      <div className="grid grid-cols-4 gap-3">
        {goals.map((g) => (
          <Card key={g.n} accent="emerald" className="h-32">
            <span className="font-pixel text-xl text-gold">{g.n}</span>
            <p className="mt-2 font-display text-lg font-extrabold text-emerald">{g.v}</p>
            <p className="mt-1 text-xs leading-tight text-cream-dim">{g.d}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 rounded-md border border-line bg-petrol/50 px-5 py-4">
          <p className="hud-label text-slate">Antes</p>
          <p className="mt-1 font-display text-lg italic text-cream-dim">"Alguém deveria resolver isso."</p>
        </div>
        <span className="font-pixel text-gold">→</span>
        <div className="flex-[1.3] rounded-md border-2 border-gold bg-gold/10 px-5 py-4">
          <p className="hud-label text-gold">Depois</p>
          <p className="mt-1 font-display text-lg font-bold text-cream">
            "Esse problema é responsabilidade de <span className="text-emerald">___</span> porque{" "}
            <span className="text-emerald">___</span>."
          </p>
        </div>
      </div>
    </Slide>
  )
}

/* ────────────────── SLIDE 9 — Cidadania além do voto ───────────────────── */

function SlideCidadania() {
  const cycle = ["Informação", "Participação", "Fiscalização", "Cobrança", "Decisão pública"]
  return (
    <Slide n={10} kicker="Cidadania contínua">
      <Heading sub="A proposta não reduz cidadania ao processo eleitoral.">
        Participar também é <span className="text-gold">uma mecânica do jogo</span>
      </Heading>
      <div className="grid grid-cols-5 items-center gap-5">
        <div className="col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            {cycle.map((c, i) => (
              <div key={c} className="flex items-center gap-2">
                <div className="rounded-sm border border-emerald/50 bg-emerald/10 px-3 py-2 text-sm font-semibold text-cream">
                  {c}
                </div>
                <span className="text-emerald">{i === cycle.length - 1 ? "↺" : "→"}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-md border border-line bg-petrol/50 px-4 py-3 text-sm text-cream-dim">
            As <span className="text-emerald">side quests</span> transformam{" "}
            <span className="text-cream">ouvir a comunidade</span> em parte da resolução dos problemas.
          </p>
        </div>
        <div className="col-span-2 grid place-items-center rounded-md border-2 border-gold bg-gold/10 p-6">
          <div className="mb-3 flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 w-8 rounded-sm border border-line bg-petrol p-0.5">
                <Joana className="h-full w-full" />
              </div>
            ))}
          </div>
          <p className="text-center font-display text-2xl font-extrabold leading-tight text-cream">
            Cidadania não <span className="text-gold">termina no voto.</span>
          </p>
        </div>
      </div>
    </Slide>
  )
}

/* ─────────────────────────── SLIDE 10 — ODS ────────────────────────────── */

function SlideODS() {
  const complement = [
    { n: "11", t: "Cidades Sustentáveis", c: "#f99d26" },
    { n: "17", t: "Parcerias", c: "#19486a" },
    { n: "03", t: "Saúde e Bem-Estar", c: "#4c9f38" },
    { n: "10", t: "Redução das Desigualdades", c: "#dd1367" },
    { n: "09", t: "Infraestrutura", c: "#fd6925" },
  ]
  const chain = ["Compreender instituições", "Participar melhor", "Fiscalizar melhor", "Cobrar políticas", "Fortalecer instituições"]
  return (
    <Slide n={2} kicker="Agenda 2030 · ODS">
      <Heading sub="Escolhemos este tema porque instituições compreendidas são pré-condição para qualquer meta da Agenda 2030 — sem cidadãos que saibam cobrar, políticas públicas não se sustentam.">
        Educação cidadã como <span className="text-gold">infraestrutura</span> para o desenvolvimento sustentável
      </Heading>
      <div className="grid grid-cols-2 gap-4">
        <Card accent="emerald">
          <div className="flex items-start gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-sm bg-[#00689d] font-pixel text-cream">16</div>
            <div>
              <p className="font-display text-lg font-extrabold text-cream">Paz, Justiça e Instituições Eficazes</p>
              <p className="mt-1 text-sm text-cream-dim">
                <span className="text-emerald">16.6</span> instituições eficazes e transparentes ·{" "}
                <span className="text-emerald">16.7</span> decisões inclusivas e participativas
              </p>
            </div>
          </div>
        </Card>
        <Card accent="gold">
          <div className="flex items-start gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-sm bg-[#c5192d] font-pixel text-cream">04</div>
            <div>
              <p className="font-display text-lg font-extrabold text-cream">Educação de Qualidade</p>
              <p className="mt-1 text-sm text-cream-dim">
                <span className="text-gold">4.7</span> conhecimentos para cidadania e desenvolvimento sustentável
              </p>
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="hud-label text-slate">Complementares</span>
        {complement.map((o) => (
          <div key={o.n} className="flex items-center gap-2 rounded-sm border border-line bg-petrol/50 px-2.5 py-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-sm font-pixel text-[0.5rem] text-cream" style={{ background: o.c }}>
              {o.n}
            </span>
            <span className="text-xs text-cream-dim">{o.t}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-md border border-emerald/30 bg-emerald/5 px-4 py-3">
        {chain.map((c, i) => (
          <span key={c} className="flex items-center gap-1.5 text-sm text-cream">
            {c} {i < chain.length - 1 && <span className="text-gold">→</span>}
          </span>
        ))}
      </div>
    </Slide>
  )
}

/* ────────────────── SLIDE 11 — Tecnologia e arquitetura ────────────────── */

function SlideTech() {
  const modules = [
    { t: "Motor gráfico", d: "sprites · renderização · views · teclado · áudio", a: "emerald" as const },
    { t: "Conteúdo educativo", d: "missões, cargos, problemas e side quests", a: "gold" as const },
    { t: "Motor de regras", d: "valida decisões: problema + testemunho + lei", a: "emerald" as const },
    { t: "Interface", d: "menus, diálogos, HUD e diário de cidadania", a: "gold" as const },
    { t: "Persistência", d: "salvar e retomar o progresso da jornada", a: "emerald" as const },
    { t: "Qualidade", d: "testes automatizados das regras do jogo", a: "gold" as const },
  ]
  return (
    <Slide n={11} kicker="O que vamos usar · Arquitetura">
      <Heading sub="Arquitetura modular planejada para facilitar a evolução do conteúdo e a inclusão de novas missões.">
        Vamos construir em Python. <span className="text-gold">Pensado como jogo.</span>
      </Heading>
      <div className="grid grid-cols-[auto_1fr] items-center gap-6">
        <div className="grid place-items-center">
          <div className="grid h-28 w-28 place-items-center rounded-md border-2 border-gold bg-gold/10 text-center">
            <div>
              <span className="text-3xl">🎮</span>
              <p className="mt-1 font-display text-xs font-extrabold leading-tight text-cream">Aurora:<br />Quem Decide?</p>
            </div>
          </div>
          <span className="mt-2 hud-label text-emerald">Python 3</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {modules.map((m) => (
            <Card key={m.t} accent={m.a} className="h-24">
              <p className="font-display text-sm font-bold text-cream">{m.t}</p>
              <p className="mt-1 font-pixel text-[0.45rem] leading-relaxed text-cream-dim">{m.d}</p>
            </Card>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Tag tone="cream">Assets visuais e fontes: Kenney — CC0 →</Tag>
        <Tag tone="emerald">Diagrama modular</Tag>
      </div>
    </Slide>
  )
}

/* ──────────────────── SLIDE 12 — Assets Kenney (CC0) ───────────────────── */

function SlideAssets() {
  const packs = [
    {
      img: "/kenney/roguelike-modern-city.png",
      name: "Roguelike Modern City",
      use: "Cidade top-down em tiles 16×16 — chão, prédios, árvores e veículos.",
      files: "1036 arquivos",
      url: "https://kenney.nl/assets/roguelike-modern-city",
    },
    {
      img: "/kenney/pixel-vehicle-pack.png",
      name: "Pixel Vehicle Pack",
      use: "Pessoas (Joana e NPCs), veículos nas ruas e mobiliário urbano.",
      files: "50 arquivos",
      url: "https://kenney.nl/assets/pixel-vehicle-pack",
    },
    {
      img: "/kenney/ui-pack.png",
      name: "UI Pack",
      use: "Painéis e botões 9-slice para menus, diálogos e missões.",
      files: "430 arquivos",
      url: "https://kenney.nl/assets/ui-pack",
    },
    {
      img: "/kenney/tiny-town.png",
      name: "Tiny Town",
      use: "Tiles complementares de cidade (integração futura).",
      files: "130 arquivos",
      url: "https://kenney.nl/assets/tiny-town",
    },
  ]
  return (
    <Slide n={12} kicker="Recursos de produção">
      <Heading sub="Todo o kit visual virá do acervo CC0 do kenney.nl. Estes são os prints reais de cada pack — clique nos links para ver o conteúdo completo.">
        O que vamos usar para <span className="text-gold">construir Aurora</span>
      </Heading>
      <div className="grid grid-cols-2 gap-3">
        {packs.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="group flex gap-3 overflow-hidden rounded-md border border-line bg-petrol/60 p-2.5 transition-colors hover:border-emerald"
          >
            <div className="grid h-24 w-40 shrink-0 place-items-center overflow-hidden rounded-sm border border-line bg-ink">
              <img src={p.img} alt={`Preview do pack ${p.name}`} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-display text-base font-bold text-cream">{p.name}</p>
                <span className="hud-label shrink-0 rounded-sm border border-emerald/40 bg-emerald/10 px-1.5 py-0.5 text-emerald">CC0</span>
              </div>
              <p className="mt-1 text-xs leading-tight text-cream-dim">{p.use}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                <span className="font-pixel text-[0.45rem] text-slate">{p.files}</span>
                <span className="truncate font-pixel text-[0.45rem] text-gold group-hover:underline">{p.url.replace("https://", "")}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-cream-dim">
        <span className="text-emerald">Kenney — CC0</span>: uso livre, sem custo e sem atribuição obrigatória — acelera a produção e libera o time para focar no{" "}
        <span className="text-cream">conteúdo educativo</span>.
      </p>
    </Slide>
  )
}

/* ─────────────────────── SLIDE 13 — Encerramento ───────────────────────── */

function SlideEncerramento() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <CityPanorama className="h-full w-full opacity-70" dusk />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
      <div className="absolute bottom-[14%] left-[12%] h-36 w-24 floaty">
        <Joana className="h-full w-full drop-shadow-[0_6px_0_rgba(0,0,0,0.4)]" />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-10 text-center">
        <h1 className="font-display text-[5rem] font-extrabold leading-none tracking-tight text-cream drop-shadow-[0_3px_0_rgba(0,0,0,0.5)]">
          QUEM <span className="text-gold">DECIDE?</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-snug text-cream">
          Depois de Aurora, essa pergunta deve ser <span className="text-gold">mais fácil de responder.</span>
        </p>
        <p className="mt-3 max-w-lg text-sm text-cream-dim">
          Educação política não partidária, interativa e baseada em problemas reais do cotidiano.
        </p>
        <div className="mt-8 flex items-center gap-4">
          {["Entender", "Participar", "Cobrar"].map((w) => (
            <span
              key={w}
              className="font-display text-2xl font-extrabold text-cream"
            >
              {w}
              {w !== "Cobrar" && <span className="ml-4 text-emerald">·</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8">
        <span className="hud-label text-gold">Aurora: Quem Decide?</span>
        <span className="hud-label text-slate">MAC5784 - Inteligência Artificial em Jogos de Computador (2026) · Não partidário · Fictício</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   APRESENTAÇÃO 2 — GAME DESIGN (a partir do GDD)
   ═══════════════════════════════════════════════════════════════════════════ */

/* small flow node */
function Node({ children, tone = "petrol" }: { children: ReactNode; tone?: "petrol" | "emerald" | "gold" }) {
  const t =
    tone === "emerald"
      ? "border-emerald/50 bg-emerald/10 text-cream"
      : tone === "gold"
        ? "border-gold/50 bg-gold/10 text-cream"
        : "border-line bg-petrol/60 text-cream"
  return <div className={`rounded-sm border px-3 py-2 text-center text-sm leading-tight ${t}`}>{children}</div>
}

/* ── V2 · SLIDE 1 — Capa Game Design ─────────────────────────── */
function V2Cover() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <div className="absolute inset-0 map-grid opacity-60" />
      <div className="absolute inset-0">
        <CityPanorama className="h-full w-full opacity-25" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />

      <div className="absolute right-8 top-8 h-16 w-16 floaty">
        <LevelBadge level="uniao" className="h-full w-full" />
      </div>
      <div className="absolute bottom-[14%] right-[10%] h-28 w-20 floaty">
        <Joana className="h-full w-full" />
      </div>

      <div className="relative flex h-full flex-col justify-center px-14">
        <Tag tone="emerald">◆ Documento de Game Design · GDD</Tag>
        <h1 className="mt-4 font-display text-[3.6rem] font-extrabold leading-[0.95] tracking-tight text-cream">
          Como <span className="text-gold">Aurora</span> foi projetada
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-snug text-cream-dim">
          O design por trás do jogo: da mecânica à emoção — segundo MDA, as lentes de Schell e as Quatro Chaves de Lazzaro.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Tag tone="gold">MDA Framework</Tag>
          <Tag>Serious Game</Tag>
          <Tag tone="cream">Protótipo · vertical slice</Tag>
        </div>
        <p className="mt-8 max-w-md rounded-md border-l-2 border-gold bg-petrol/50 px-4 py-3 font-display text-lg italic text-cream">
          "Antes de cobrar, descubra quem decide."
        </p>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8">
        <span className="hud-label text-slate">Projeto acadêmico — USP</span>
        <span className="hud-label text-slate">Educativo · Não partidário · Fictício</span>
      </div>
    </div>
  )
}

/* ── V2 · SLIDE 2 — Pilar e hipótese ─────────────────────────── */
function V2Pilar() {
  return (
    <Slide n={2} kicker="Pilar de design · Fullerton">
      <div className="flex h-full flex-col">
        <Heading sub="O jogo é, deliberadamente, um protótipo.">
          Um único pilar. <span className="text-gold">Uma hipótese a provar.</span>
        </Heading>
        <div className="grid flex-1 grid-cols-2 gap-6">
          <Card accent="gold" className="flex flex-col justify-center">
            <p className="hud-label text-gold">Pilar único</p>
            <p className="mt-3 font-display text-3xl font-extrabold leading-tight text-cream">
              Toda mecânica leva o jogador a <span className="text-emerald">raciocinar sobre responsabilidade pública.</span>
            </p>
            <p className="mt-4 text-base text-cream-dim">Se uma feature não serve a isso, fica fora do escopo do protótipo.</p>
          </Card>
          <Card accent="emerald" className="flex flex-col justify-center">
            <p className="hud-label text-emerald">Hipótese central</p>
            <p className="mt-3 text-lg leading-relaxed text-cream">
              Uma missão de <span className="text-gold">responsabilidade</span> somada a um sistema de{" "}
              <span className="text-gold">provas</span> ensina a divisão de competências melhor que um texto expositivo —
              e gera <span className="text-emerald">fiero</span> ("eu descobri quem decide").
            </p>
            <div className="mt-4 rounded-sm border-l-2 border-emerald bg-ink/50 px-3 py-2">
              <p className="text-sm leading-snug text-cream-dim">
                <span className="font-display font-bold text-emerald">fiero</span>{" "}
                <span className="text-slate">(it. "orgulho")</span> — a emoção de{" "}
                <span className="text-cream">triunfo pessoal ao superar um desafio</span>; é a chave{" "}
                <span className="text-cream">Hard Fun</span> das Quatro Chaves da Diversão de{" "}
                <span className="text-cream">Nicole Lazzaro</span>. No jogo, surge no instante em que o jogador deduz e
                acerta o nível de governo responsável.
              </p>
            </div>
          </Card>
        </div>
        <div className="mt-6 rounded-md border border-line bg-petrol/40 px-5 py-4">
          <p className="hud-label mb-3 text-center text-slate">Do design ao aprendizado</p>
          <div className="flex items-center justify-center gap-3">
            {["Mecânica", "Provas", "Dedução", "Fiero", "Aprendizado"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="rounded-sm border border-line bg-ink/60 px-4 py-2 text-base text-cream">{s}</span>
                {i < 4 && <span className="text-gold">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 3 — MDA Framework ────────────────────────────── */
function V2MDA() {
  const rows = [
    { l: "Mecânicas", d: "Explorar top-down · conversar · missão de múltipla escolha · coletar provas · side quests · diário", tone: "emerald" as const },
    { l: "Dinâmicas", d: "Investigar antes de responder · cruzar testemunhos com o diário · deduzir o nível responsável", tone: "gold" as const },
    { l: "Estéticas", d: "Descoberta (primária) · Desafio · Narrativa · Expressão cívica", tone: "gold" as const },
  ]
  return (
    <Slide n={3} kicker="Enquadramento MDA">
      <div className="flex h-full flex-col">
      <Heading sub="Projetamos de baixo para cima (mecânica → dinâmica → estética); o jogador experimenta de cima para baixo.">
        Mecânicas, Dinâmicas, <span className="text-gold">Estéticas</span>
      </Heading>
      {/* Reprodução da Figura 1 original do artigo MDA */}
      <div className="mb-4 rounded-md border border-line bg-petrol/40 px-6 py-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { m: "Mechanics", s: "Rules" },
            { m: "Dynamics", s: "System" },
            { m: "Aesthetics", s: '"Fun"' },
          ].map((c) => (
            <div key={c.m} className="rounded-sm border border-line bg-ink/60 px-3 py-2 text-center">
              <p className="font-display text-base font-bold text-cream">{c.m}</p>
              <p className="hud-label text-slate">{c.s}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="hud-label shrink-0 text-emerald">Designer</span>
            <span className="h-px flex-1 bg-gradient-to-r from-emerald/20 to-emerald" />
            <span className="text-emerald">▶</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gold">◀</span>
            <span className="h-px flex-1 bg-gradient-to-l from-gold/20 to-gold" />
            <span className="hud-label shrink-0 text-gold">Player · Jogador</span>
          </div>
        </div>
        <p className="hud-label mt-3 text-center text-slate">
          Figura 1 — MDA Framework · Hunicke, LeBlanc &amp; Zubek (2004)
        </p>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3">
        {rows.map((r) => (
          <Card key={r.l} accent={r.tone} className="flex items-center gap-4 py-4">
            <span className="w-28 shrink-0 font-display text-lg font-bold text-cream">{r.l}</span>
            <span className="h-6 w-px bg-line" />
            <span className="text-base text-cream-dim">{r.d}</span>
          </Card>
        ))}
      </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 4 — Quatro Chaves da Diversão ────────────────── */
function V2Chaves() {
  const keys = [
    { k: "Serious Fun", e: "propósito", icon: "🎯", d: "aprender competências; provas e diário dão peso de trabalho real", primary: true },
    { k: "Easy Fun", e: "curiosidade", icon: "🔍", d: "explorar Aurora, ouvir moradores, descobrir cargos", primary: false },
    { k: "Hard Fun", e: "fiero", icon: "🏆", d: "acertar o nível de governo responsável", primary: false },
    { k: "People Fun", e: "calor humano", icon: "🤝", d: "Discussão com outros jogadores)", primary: false },
  ]
  return (
    <Slide n={4} kicker="Quatro Chaves da Diversão · Lazzaro">
      <div className="flex h-full flex-col">
        <Heading sub="Quais emoções o jogo busca — e como cada mecânica as entrega.">
          A emoção é <span className="text-gold">parte do projeto</span>
        </Heading>
        <div className="grid flex-1 grid-cols-4 gap-4">
          {keys.map((k) => (
            <Card key={k.k} accent={k.primary ? "gold" : "emerald"} className="flex flex-col">
              <p className="font-display text-xl font-bold text-cream">{k.k}</p>
              <span className={`hud-label mt-1 ${k.primary ? "text-gold" : "text-emerald"}`}>{k.e}</span>
              <div className="grid flex-1 place-items-center py-2">
                <span className="text-6xl">{k.icon}</span>
              </div>
              <p className="text-sm leading-snug text-cream-dim">{k.d}</p>
              {k.primary && <span className="mt-2 hud-label text-gold">◆ Primária</span>}
            </Card>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 rounded-md border border-emerald/30 bg-emerald/5 px-4 py-3 text-sm text-cream">
          <span className="hud-label text-slate">PX Spiral</span>
          {["curiosidade", "investigação", "dúvida", "fiero", "alívio", "próxima missão"].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              {s} {i < 5 && <span className="text-gold">→</span>}
            </span>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 5 — Mecânicas ────────────────────────────────── */
function V2Mecanicas() {
  const m = [
    { e: "🗺️", t: "Exploração top-down", d: "Mapeamento natural (setas/WASD); cada prédio ancora um cargo." },
    { e: "💬", t: "Diálogo (E/Enter)", d: "NPCs apresentam problema, função do cargo e a pergunta." },
    { e: "⚖️", t: "Missão-âncora", d: "Múltipla escolha por nível/cargo" },
    { e: "⭐", t: "Provas (valor endógeno)", d: "Problema + testemunho + lei" },
    { e: "🧑‍🤝‍🧑", t: "Side quests", d: "Ouvir moradores concede a prova :testemunho e estrela." },
    { e: "📖", t: "Diário de Cidadania", d: "Memória externa: o que cada cargo faz — e não faz." },
  ]
  return (
    <Slide n={5} kicker="Mecânicas do protótipo">
      <div className="flex h-full flex-col">
        <Heading sub="Seis mecânicas — todas subordinadas ao pilar de raciocinar sobre responsabilidade.">
          O que o jogador <span className="text-gold">faz</span>
        </Heading>
        <div className="grid flex-1 auto-rows-fr grid-cols-3 gap-4">
          {m.map((x, i) => (
            <Card key={x.t} accent={i % 2 ? "gold" : "emerald"} className="flex flex-col justify-center">
              <span className="text-3xl">{x.e}</span>
              <p className="mt-2 font-display text-lg font-bold text-cream">{x.t}</p>
              <p className="mt-1 text-sm leading-snug text-cream-dim">{x.d}</p>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 6 — Regras ───────────────────────────────────── */
function V2Regras() {
  const r = [
    "Uma missão = uma pergunta de responsabilidade.",
    "Errar não pune com game over — devolve uma dica que reformula o raciocínio.",
    "Provas embasam, não substituem, o raciocínio.",
    "Progressão por níveis: Município → Estado → União.",
    "Distinção de poderes é regra de conteúdo (Legislativo × Executivo).",
    "Fidelidade cívica: fontes oficiais, sem partido, voto ou evento real.",
  ]
  return (
    <Slide n={6} kicker="Regras do sistema formal">
      <div className="flex h-full flex-col">
        <Heading sub="A cidade é o círculo mágico: dentro dela, provas e estrelas têm valor.">
          As regras que <span className="text-gold">sustentam o aprendizado</span>
        </Heading>
        <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-4">
          {r.map((x, i) => (
            <Card key={i} accent={i < 3 ? "emerald" : "gold"} className="flex items-center gap-4">
              <span className="font-pixel text-lg text-gold">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-base leading-snug text-cream">{x}</p>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 7 — Espaços (o mundo) ────────────────────────── */
function V2Espacos() {
  return (
    <Slide n={7} kicker="Espaços · mapa de interesse de Schell">
      <Heading sub="Os espaços são organizados para que o lugar ensine: cada ambiente materializa um nível de governo.">
        O lugar <span className="text-gold">é o argumento</span>
      </Heading>
      <div className="grid grid-cols-[1.1fr_1fr] gap-6">
        <div className="flex flex-col items-center justify-center gap-3">
          <Node tone="gold">
            <span className="hud-label text-gold">Hub</span>
            <br />
            Praça de Aurora
          </Node>
          <span className="text-emerald">↓</span>
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1">
              <Camara className="h-10 w-10" />
              <Node tone="emerald">Câmara · Legislativo</Node>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Prefeitura className="h-10 w-10" />
              <Node tone="emerald">Prefeitura · Executivo</Node>
            </div>
          </div>
          <span className="text-gold">↓ Etapa 2</span>
          <Node>Centro Estadual · dep. estadual / governador</Node>
          <span className="text-gold">↓ Etapa 3</span>
          <Node>Capital / Congresso · deputados, senadores, presidente</Node>
        </div>
        <div className="grid content-center gap-2.5">
          {[
            ["Praça", "Hub inicial — a curiosidade nasce"],
            ["Câmara", "Legislativo local: propor e fiscalizar"],
            ["Prefeitura", "Executivo local: executar e orçar"],
            ["Centro Estadual", "Hospitais, rodovias, segurança"],
            ["Capital / Congresso", "Leis nacionais; Câmara × Senado"],
          ].map(([a, b]) => (
            <div key={a} className="flex items-center gap-3 rounded-sm border border-line bg-petrol/50 px-3 py-2">
              <span className="w-36 shrink-0 font-display text-sm font-bold text-cream">{a}</span>
              <span className="text-xs text-cream-dim">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 8 — Sensações / Game Feel ────────────────────── */
function V2GameFeel() {
  const f = [
    { t: "Entrada", icon: "⌨️", d: "Resposta imediata e previsível ao teclado (mapeamento natural)." },
    { t: "Resposta", icon: "💬", d: "Feedback claro em diálogos e na resolução da missão." },
    { t: "Contexto", icon: "🗺️", d: "Andar até a Prefeitura é, em si, um argumento: 'é aqui que se executa'." },
    { t: "Musica/Ambientes/Cores", icon: "🎵", d: "Outros artefatos que afetam a experiência sensorial do jogador." },
  ]
  return (
    <Slide n={8} kicker="Sensações · Game Feel de Swink">
      <div className="flex h-full flex-col">
        <Heading sub="A metáfora segura: a cidade fictícia discute instituições reais sem citá-las.">
          Da <span className="text-gold">dúvida</span> à <span className="text-emerald">clareza</span>
        </Heading>
        <div className="grid flex-1 grid-cols-4 gap-4">
          {f.map((x, i) => (
            <Card key={x.t} accent={i % 2 ? "gold" : "emerald"} className="flex flex-col justify-center">
              <span className="text-5xl">{x.icon}</span>
              <p className="mt-3 font-display text-xl font-bold text-cream">{x.t}</p>
              <p className="mt-2 text-sm leading-snug text-cream-dim">{x.d}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid place-items-center">
          <div className="rounded-md border-2 border-gold bg-gold/10 px-8 py-4 text-center">
            <p className="hud-label mb-1 text-gold">Sensação-alvo dominante</p>
            <p className="font-display text-2xl font-extrabold text-cream">
              "Agora sei quem decide." <span className="text-emerald">→ momento de fiero</span>
            </p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 9 — Narrativa ────────────────────────────────── */
function V2Narrativa() {
  const atos = [
    { lvl: "municipio" as const, t: "Ato 1 · Município", d: "Problemas perto de casa. Joana aprende vereador e prefeito." },
    { lvl: "estado" as const, t: "Ato 2 · Estado", d: "Grandes demais para um município. Deputado estadual e governador." },
    { lvl: "uniao" as const, t: "Ato 3 · União", d: "Leis para todo o país. Deputados federais, senadores, presidente." },
  ]
  return (
    <Slide n={9} kicker="Narrativa · tecida, não pregada">
      <div className="flex h-full flex-col">
        <Heading>
          Três atos, <span className="text-gold">três níveis de governo</span>
        </Heading>
        <DialogBox speaker="Logline" color="emerald" avatar={<Joana className="h-full w-full" />}>
          Joana muda-se para Aurora do Brasil, percebe que todos reclamam mas ninguém sabe quem resolve — e decide entender
          a política conversando com quem ocupa cada cargo.
        </DialogBox>
        <div className="mt-5 grid flex-1 grid-cols-3 gap-4">
          {atos.map((a) => (
            <Card key={a.t} accent="gold" className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <LevelBadge level={a.lvl} className="h-10 w-10" />
                <p className="font-display text-lg font-bold text-cream">{a.t}</p>
              </div>
              <p className="mt-3 text-base leading-snug text-cream-dim">{a.d}</p>
            </Card>
          ))}
        </div>
        <p className="mt-5 text-center text-sm text-cream-dim">
          Encerramento: decisões públicas dependem de{" "}
          <span className="text-emerald">competência, orçamento, leis e participação.</span>
        </p>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 10 — Teoria dos jogos ────────────────────────── */
function V2GameTheory() {
  const map = [
    ["Agente", "Cargo com poder de decisão — e a cidadã Joana"],
    ["Estratégia", "Legislar, executar, fiscalizar, cooperar"],
    ["Payoff", "Provas, estrelas e feedback educativo"],
    ["Informação", "Descobrir 'quem decide' é a mecânica central"],
  ]
  const dilemas = [
    { t: "Dilema do orçamento", d: "Saúde × transporte × educação disputam o mesmo recurso (trade-off)." },
    { t: "Ação coletiva", d: "Um serviço só se viabiliza se município + estado cooperarem (ODS 17)." },
    { t: "Assimetria de informação", d: "O payoff do cidadão melhora quando ele descobre quem decide." },
  ]
  return (
    <Slide n={10} kicker="Teoria dos jogos · agentes estratégicos">
      <div className="flex h-full flex-col">
        <Heading sub="A política pública é um sistema de agentes com competências, orçamentos e interesses que decidem sob restrições.">
          Decisão estratégica como <span className="text-gold">conteúdo</span>
        </Heading>
        <div className="grid flex-1 grid-cols-2 gap-5">
          <div className="grid content-between gap-3">
            <p className="hud-label text-emerald">Mapeamento cívico</p>
            {map.map(([a, b]) => (
              <div key={a} className="flex items-center gap-3 rounded-sm border border-line bg-petrol/50 px-4 py-3">
                <span className="w-28 shrink-0 font-display text-base font-bold text-gold">{a}</span>
                <span className="text-sm text-cream-dim">{b}</span>
              </div>
            ))}
          </div>
          <div className="grid content-between gap-3">
            <p className="hud-label text-gold">Dilemas viram missões</p>
            {dilemas.map((d) => (
              <Card key={d.t} accent="gold" className="flex flex-col justify-center py-3">
                <p className="font-display text-base font-bold text-cream">{d.t}</p>
                <p className="mt-1 text-sm leading-snug text-cream-dim">{d.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 11 — Playtesting ─────────────────────────────── */
function V2Playtest() {
  const q = [
    ["🎯", "Por quê?", "O jogador deduz o nível de governo? Consegue explicar uma atribuição depois?"],
    ["👥", "Quem?", "Amigos e colegas; depois, estudantes do público-alvo."],
    ["📍", "Onde?", "Turma de ensino fundamental II ou médio."],
    ["👀", "O quê?", "Momentos de dúvida na múltipla escolha + surpresas (o que confunde ou encanta)."],
    ["📝", "Como?", "Observar rostos, entrevista curta, pedir 'as 3 coisas menos claras'."],
  ]
  return (
    <Slide n={11} kicker="Plano de playtesting · 5 perguntas de Schell">
      <div className="flex h-full flex-col">
        <Heading>
          Validar a hipótese <span className="text-gold">com pessoas reais</span>
        </Heading>
        <div className="grid flex-1 grid-cols-5 gap-3">
          {q.map(([ic, a, b], i) => (
            <Card key={a} accent={i === 0 ? "gold" : "emerald"} className="flex flex-col">
              <p className="font-display text-lg font-extrabold text-gold">{a}</p>
              <div className="grid flex-1 place-items-center py-1">
                <span className="text-4xl">{ic}</span>
              </div>
              <p className="text-sm leading-snug text-cream-dim">{b}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid place-items-center">
          <div className="rounded-md border-2 border-emerald bg-emerald/10 px-8 py-4 text-center">
            <p className="hud-label mb-1 text-emerald">Métrica de sucesso</p>
            <p className="font-display text-xl font-bold text-cream">
              A maioria relaciona o problema ao nível correto <span className="text-gold">e</span> justifica com uma atribuição —
              sem ajuda.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 12 — Oportunidades de design ─────────────────── */
function V2Backlog() {
  const items = [
    { p: "🟢", t: "Dilema de orçamento jogável", d: "Primeiro trade-off explícito — custo de oportunidade.", a: "gold" as const },
    { p: "🟢", t: "Reforço do fiero", d: "Feedback de acerto mais expressivo no 'descobri quem decide'.", a: "gold" as const },
    { p: "🟢", t: "Diário como avaliação formativa", d: "Quiz de fechamento por etapa checa os objetivos.", a: "gold" as const },
    { p: "🟡", t: "NPCs como agentes estratégicos", d: "Cargos que 'decidem' segundo incentivos e limites.", a: "emerald" as const },
    { p: "🟡", t: "Missões de cooperação entre níveis", d: "Coordenar município + estado (ODS 17).", a: "emerald" as const },
    { p: "🔵", t: "Simulação de orçamento", d: "Alocar recursos e ver consequências ao longo do tempo.", a: "emerald" as const },
  ]
  return (
    <Slide n={12} kicker="Oportunidades de design · backlog">
      <div className="flex h-full flex-col">
        <Heading sub="Cada item traz uma pergunta de protótipo e a estética-alvo.">
          Para onde <span className="text-gold">Aurora pode evoluir</span>
        </Heading>
        <div className="grid flex-1 auto-rows-fr grid-cols-3 gap-4">
          {items.map((x) => (
            <Card key={x.t} accent={x.a} className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-base">{x.p}</span>
                <p className="font-display text-base font-bold leading-tight text-cream">{x.t}</p>
              </div>
              <p className="mt-2 text-sm leading-snug text-cream-dim">{x.d}</p>
            </Card>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-4 text-sm text-cream-dim">
          <span>🟢 alta</span>
          <span>🟡 média</span>
          <span>🔵 exploratória</span>
          <span className="text-slate">· toda evolução serve ao pilar único e passa por playtesting</span>
        </div>
      </div>
    </Slide>
  )
}

/* ── V2 · SLIDE 13 — Encerramento Game Design ────────────────── */
function V2Encerramento() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <CityPanorama className="h-full w-full opacity-70" dusk />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
      <div className="relative flex h-full flex-col items-center justify-center px-10 text-center">
        <Tag tone="gold">◆ Pilar único</Tag>
        <h1 className="mt-4 font-display text-[3.4rem] font-extrabold leading-[0.95] tracking-tight text-cream drop-shadow-[0_3px_0_rgba(0,0,0,0.5)]">
          Cada mecânica leva a <span className="text-gold">raciocinar sobre responsabilidade.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-snug text-cream">
          Aurora não ensina em quem votar. <span className="text-emerald">Ensina como o Estado funciona</span> e como o
          cidadão pode participar dele.
        </p>
        <div className="mt-6 flex items-center gap-3">
          {["MDA", "Schell", "Lazzaro", "Fullerton"].map((w, i) => (
            <span key={w} className="font-display text-lg font-bold text-cream">
              {w}
              {i < 3 && <span className="ml-3 text-gold">·</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8">
        <span className="hud-label text-gold">Aurora: Quem Decide? · Game Design</span>
        <span className="hud-label text-slate">Projeto acadêmico — USP</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   APRESENTAÇÃO 3 — NARRATIVA, PERSONAGENS E MUNDO
   Narratologia aplicada ao jogo + propostas de evolução.
   Referências: Nakamura (MAC5784 · Narrativas em jogos digitais);
   Isbister — Better Game Characters by Design; Zimmerman — Narrative,
   Interactivity, Play, and Games.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── V3 · SLIDE 1 — Capa ─────────────────────────────────────── */
function V3Cover() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <img src="/game/municipio.png" alt="Município de Aurora" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />

      <div className="absolute bottom-[12%] right-[7%] h-32 w-24 floaty">
        <Joana className="h-full w-full" />
      </div>
      <div className="absolute right-[26%] top-[16%] h-14 w-14 floaty" style={{ animationDelay: "0.4s" }}>
        <Camara className="h-full w-full" />
      </div>
      <div className="absolute right-[14%] top-[30%] h-14 w-14 floaty" style={{ animationDelay: "0.8s" }}>
        <Prefeitura className="h-full w-full" />
      </div>

      <div className="relative flex h-full flex-col justify-center px-14">
        <Tag tone="gold">◆ Narratologia aplicada · do enredo à emoção</Tag>
        <h1 className="mt-4 font-display text-[3.4rem] font-extrabold leading-[0.95] tracking-tight text-cream">
          Narrativa, <span className="text-gold">Personagens</span> e Mundo
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-snug text-cream-dim">
          Joana acaba de <span className="text-cream">tirar o primeiro título de eleitora</span> e percorre três ambientes
          navegáveis para descobrir <span className="text-gold">quem decide</span> cada problema.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Tag>Enredo · Personagens</Tag>
          <Tag tone="cream">Narrador · Ambientação</Tag>
          <Tag tone="gold">Implementado no jogo</Tag>
        </div>
        <p className="mt-7 max-w-lg text-xs leading-relaxed text-slate">
          Referências: Nakamura (MAC5784) · Isbister, <span className="italic">Better Game Characters by Design</span> ·
          Zimmerman, <span className="italic">Narrative, Interactivity, Play, and Games</span>.
        </p>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8">
        <span className="hud-label text-gold">Aurora: Quem Decide?</span>
        <span className="hud-label text-slate">MAC5784 (2026) · Educativo · Não partidário · Fictício</span>
      </div>
    </div>
  )
}

/* ── V3 · SLIDE 2 — Elementos da narratologia ────────────────── */
function V3Narratologia() {
  const els = [
    { icon: "🕰️", t: "Ambientação", s: "tempo e espaço", d: "Aurora do Brasil, no presente: praça, Câmara, Prefeitura e capitais.", a: "emerald" as const },
    { icon: "🧑", t: "Personagens", s: "protagonista + elenco", d: "Joana (avatar da jogadora) e os cargos públicos como NPCs.", a: "gold" as const },
    { icon: "🎙️", t: "Narrador", s: "quem conta", d: "Diálogos dos NPCs, o cenário que fala e o Diário de Cidadania.", a: "emerald" as const },
    { icon: "📈", t: "Enredo", s: "sequência de eventos", d: "Do primeiro título à jornada pelos três níveis de governo.", a: "gold" as const },
  ]
  return (
    <Slide n={2} kicker="Narratologia · os quatro elementos">
      <div className="flex h-full flex-col">
        <Heading sub="Partimos dos elementos clássicos da narrativa (Nakamura) e os mapeamos ao que o jogo entrega.">
          O que compõe a <span className="text-gold">narrativa de Aurora</span>
        </Heading>
        <div className="grid flex-1 grid-cols-[1.25fr_1fr] gap-5">
          <div className="grid grid-cols-2 gap-4">
            {els.map((e) => (
              <Card key={e.t} accent={e.a} className="flex flex-col justify-center">
                <span className="text-4xl">{e.icon}</span>
                <p className="mt-2 font-display text-lg font-bold text-cream">{e.t}</p>
                <span className={`hud-label ${e.a === "gold" ? "text-gold" : "text-emerald"}`}>{e.s}</span>
                <p className="mt-1.5 text-sm leading-snug text-cream-dim">{e.d}</p>
              </Card>
            ))}
          </div>
          <div className="flex flex-col overflow-hidden rounded-md border border-line bg-petrol/40">
            <img src="/game/abertura.png" alt="Abertura — Joana tira o título" className="h-full w-full object-cover" />
            <p className="shrink-0 px-3 py-2 text-xs text-cream-dim">
              A narrativa é <span className="text-emerald">tecida, não pregada</span>: emerge das missões, dos testemunhos e do cenário.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 3 — Enredo: o primeiro título ────────────────── */
function V3Enredo() {
  return (
    <Slide n={3} kicker="Enredo · o incidente que inicia a história">
      <div className="flex h-full flex-col">
        <Heading sub="O gancho dramático liga a história diretamente ao exercício da cidadania.">
          Tudo começa com o <span className="text-gold">primeiro título de eleitora</span>
        </Heading>
        <div className="grid flex-1 grid-cols-[1.15fr_1fr] gap-5">
          <div className="flex flex-col gap-3">
            <DialogBox speaker="Logline" color="emerald" avatar={<Joana className="h-full w-full" />}>
              Joana acaba de tirar o primeiro título de eleitora em Aurora do Brasil. Com o documento na mão, quer entender
              o que significa, na prática, exercer a cidadania — e começa a descobrir quem decide cada problema.
            </DialogBox>
            <div className="grid flex-1 grid-cols-2 gap-3">
              <Card accent="gold" className="flex flex-col justify-center">
                <p className="hud-label text-gold">Novo poder</p>
                <p className="mt-1 text-sm leading-snug text-cream">Votar — escolher representantes.</p>
              </Card>
              <Card accent="emerald" className="flex flex-col justify-center">
                <p className="hud-label text-emerald">Novo dever</p>
                <p className="mt-1 text-sm leading-snug text-cream">Fiscalizar, cobrar e participar.</p>
              </Card>
              <Card accent="emerald" className="col-span-2 flex items-center gap-3">
                <span className="text-3xl">🪪</span>
                <p className="text-sm leading-snug text-cream-dim">
                  O título é a <span className="text-gold">ruptura do equilíbrio</span>: a pergunta "e agora, o que faço com isso?"
                  impulsiona toda a investigação.
                </p>
              </Card>
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-line bg-petrol/40">
            <img src="/game/abertura.png" alt="Joana tira o primeiro título de eleitora" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 4 — Arco (equilíbrio de Todorov) ─────────────── */
function V3Arco() {
  const eq = [
    { n: "1", icon: "🪪", t: "Equilíbrio", d: "Joana tira o primeiro título." },
    { n: "2", icon: "❓", t: "Ruptura", d: "Novo poder e dever: o que fazer com isso?" },
    { n: "3", icon: "🔍", t: "Reconhecimento", d: "Decide investigar quem decide." },
    { n: "4", icon: "🚌", t: "Jornada", d: "Percorre município, estado e União." },
    { n: "5", icon: "🗳️", t: "Novo equilíbrio", d: "Cidadã ativa: sabe cobrar e participar." },
  ]
  return (
    <Slide n={4} kicker="Estrutura · equilíbrio de Todorov / três atos">
      <div className="flex h-full flex-col">
        <Heading sub="O enredo é uma quebra e restauração de equilíbrio — agora ancorada no exercício da cidadania.">
          Do <span className="text-emerald">"tirei o título"</span> ao <span className="text-gold">"sei como participar"</span>
        </Heading>
        <div className="flex flex-1 items-stretch gap-2">
          {eq.map((s, i) => (
            <div key={s.t} className="flex flex-1 items-center gap-2">
              <Card accent={i === eq.length - 1 ? "gold" : "emerald"} className="flex h-full flex-1 flex-col justify-between">
                <span className="font-pixel text-[0.55rem] text-gold">0{s.n}</span>
                <div className="grid flex-1 place-items-center py-1">
                  <span className="text-5xl leading-none">{s.icon}</span>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-cream">{s.t}</p>
                  <p className="mt-1 text-xs leading-tight text-cream-dim">{s.d}</p>
                </div>
              </Card>
              {i < eq.length - 1 && <span className="text-emerald">→</span>}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[
            { lvl: "municipio" as const, t: "Ato 1 · Município", d: "Perto de casa: vereador e prefeita." },
            { lvl: "estado" as const, t: "Ato 2 · Estado", d: "Grandes demais p/ um município: deputado estadual e governador." },
            { lvl: "uniao" as const, t: "Ato 3 · União", d: "Leis do país: deputados, senadores e presidente." },
          ].map((a) => (
            <Card key={a.t} accent="gold" className="flex items-center gap-3">
              <LevelBadge level={a.lvl} className="h-9 w-9 shrink-0" />
              <div>
                <p className="font-display text-sm font-bold text-cream">{a.t}</p>
                <p className="mt-0.5 text-xs leading-tight text-cream-dim">{a.d}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 5 — Personagens ──────────────────────────────── */
function V3Personagens() {
  const npcs = [
    { n: "Caio Bairro", r: "Vereador", l: "municipio" as const },
    { n: "Marina Prado", r: "Prefeita", l: "municipio" as const },
    { n: "Lia Campos", r: "Dep. Estadual", l: "estado" as const },
    { n: "Raul Nogueira", r: "Governador", l: "estado" as const },
    { n: "Helena Norte", r: "Senadora", l: "uniao" as const },
    { n: "Lúcio Silva", r: "Presidente", l: "uniao" as const },
  ]
  return (
    <Slide n={5} kicker="Personagens · avatar e elenco">
      <div className="flex h-full flex-col">
        <Heading sub="A protagonista é um avatar habitável (Isbister): a jogadora projeta-se nela nos níveis visceral, cognitivo, social e de fantasia cívica.">
          Quem <span className="text-gold">habita</span> Aurora
        </Heading>
        <div className="grid flex-1 grid-cols-[0.9fr_1.1fr_1fr] gap-4">
          <Card accent="gold" className="flex flex-col items-center justify-center text-center">
            <div className="h-24 w-16">
              <Joana className="h-full w-full" />
            </div>
            <p className="mt-2 font-display text-xl font-extrabold text-cream">Joana</p>
            <p className="hud-label text-gold">protagonista · avatar</p>
            <p className="mt-2 text-sm text-cream-dim">
              Nova eleitora. Ponto de vista da jogadora: aprende competência institucional agindo, não decorando.
            </p>
          </Card>
          <div className="grid grid-cols-1 content-center gap-2.5">
            {npcs.map((c) => (
              <div key={c.n} className="flex items-center gap-3 rounded-sm border border-line bg-petrol/50 px-3 py-2">
                <LevelBadge level={c.l} className="h-8 w-8 shrink-0" />
                <div>
                  <p className="font-display text-sm font-bold text-cream">{c.n}</p>
                  <p className="hud-label text-emerald">{c.r}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col overflow-hidden rounded-md border border-line bg-petrol/40">
            <img src="/game/interior.png" alt="Interior da Câmara com o vereador" className="h-full w-full object-cover" />
            <p className="shrink-0 px-3 py-2 text-xs text-cream-dim">
              Cada cargo tem voz e temperamento próprios (traços legíveis / <span className="text-gold">OCEAN</span>).
            </p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 6 — Papéis sociais de NPCs ───────────────────── */
function V3PapeisSociais() {
  const rows = [
    { papel: "Mentor", quem: "Vereador, prefeita e demais cargos", como: "Ensinam atribuições; dão missões e feedback.", a: "gold" as const },
    { papel: "Guia", quem: "Diário de Cidadania", como: "Base de consulta: o que cada cargo faz e não faz.", a: "emerald" as const },
    { papel: "Aliado", quem: "Moradores (side quests)", como: "Testemunhos; apoio que vira prova e estrela.", a: "emerald" as const },
    { papel: "Informante", quem: "Servidores e recepção", como: "Trocam informação por atenção do jogador.", a: "gold" as const },
    { papel: "Figuração viva", quem: "Multidão da capital", como: "Densidade que caracteriza o ambiente.", a: "emerald" as const },
  ]
  return (
    <Slide n={6} kicker="Papéis sociais dos NPCs · Isbister (cap. 9)">
      <div className="flex h-full flex-col">
        <Heading sub="Cada NPC ocupa um papel social que cria expectativas e momentos de interação definidores.">
          NPCs como <span className="text-gold">papéis sociais</span>
        </Heading>
        <div className="grid flex-1 grid-cols-[1.4fr_1fr] gap-5">
          <div className="grid content-center gap-2.5">
            {rows.map((r) => (
              <Card key={r.papel} accent={r.a} className="flex items-center gap-4 py-2.5">
                <span className="w-32 shrink-0 font-display text-base font-bold text-cream">{r.papel}</span>
                <span className="w-56 shrink-0 text-sm text-gold">{r.quem}</span>
                <span className="h-6 w-px bg-line" />
                <span className="text-sm text-cream-dim">{r.como}</span>
              </Card>
            ))}
          </div>
          <div className="flex flex-col overflow-hidden rounded-md border border-line bg-petrol/40">
            <img src="/game/uniao.png" alt="Multidão na capital federal" className="h-full w-full object-cover" />
            <p className="shrink-0 px-3 py-2 text-xs text-cream-dim">
              A <span className="text-gold">multidão da capital</span> é figuração viva: o papel social do ambiente.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 7 — Narrador ─────────────────────────────────── */
function V3Narrador() {
  const tipos = [
    { icon: "💬", t: "Narrador diegético", d: "Os próprios NPCs contam o problema e a função do cargo.", a: "emerald" as const },
    { icon: "🏚️", t: "Environmental storytelling", d: "Terreno vazio, praça sem manutenção, hospital lotado: o cenário narra o problema.", a: "gold" as const },
    { icon: "📖", t: "Narrador interativo", d: "O Diário de Cidadania responde ao que a jogadora investiga e coleta.", a: "emerald" as const },
  ]
  return (
    <Slide n={7} kicker="Narrador · quem (e o quê) conta a história">
      <div className="flex h-full flex-col">
        <Heading sub="Aurora usa três vozes narrativas que se reforçam.">
          O cenário também <span className="text-gold">narra</span>
        </Heading>
        <div className="grid flex-1 grid-cols-[1fr_1fr_1fr_1.1fr] gap-4">
          {tipos.map((t) => (
            <Card key={t.t} accent={t.a} className="flex flex-col justify-center">
              <span className="text-4xl">{t.icon}</span>
              <p className="mt-2 font-display text-base font-bold text-cream">{t.t}</p>
              <p className="mt-1.5 text-sm leading-snug text-cream-dim">{t.d}</p>
            </Card>
          ))}
          <div className="flex flex-col overflow-hidden rounded-md border border-line bg-petrol/40">
            <img src="/game/problema.png" alt="Problema sinalizado no mapa" className="h-full w-full object-cover" />
            <p className="shrink-0 px-3 py-2 text-xs text-cream-dim">O marcador no mapa já conta o problema antes do diálogo.</p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 8 — Mundo: três ambientes navegáveis ─────────── */
function V3Mundo() {
  const envs = [
    { img: "/game/municipio.png", t: "Município de Aurora", d: "Calmo e próximo: praça, Câmara, Prefeitura.", dots: 3 },
    { img: "/game/estado.png", t: "Capital do Estado", d: "Médio porte: Assembleia e Palácio do Governo.", dots: 5 },
    { img: "/game/uniao.png", t: "Capital Federal", d: "Movimentada: Congresso, multidão e trânsito.", dots: 9 },
  ]
  return (
    <Slide n={8} kicker="Ambientação · o lugar é o argumento">
      <div className="flex h-full flex-col">
        <Heading sub="De um mapa único para três ambientes separados e navegáveis — a densidade de cada um ensina antes de qualquer diálogo.">
          Três <span className="text-gold">ambientes navegáveis</span>
        </Heading>
        <div className="grid flex-1 grid-cols-3 gap-4">
          {envs.map((e) => (
            <div key={e.t} className="flex flex-col overflow-hidden rounded-md border border-line bg-petrol/50">
              <img src={e.img} alt={e.t} className="h-40 w-full object-cover" />
              <div className="flex flex-1 flex-col gap-1 px-3 py-2.5">
                <p className="font-display text-base font-bold text-cream">{e.t}</p>
                <p className="text-xs leading-snug text-cream-dim">{e.d}</p>
                <div className="mt-auto flex items-center gap-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span key={i} className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: i < e.dots ? "#f5c451" : "#2a4a44" }} />
                  ))}
                  <span className="ml-1 hud-label text-slate">movimento</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-cream-dim">
          Bordas arborizadas e densidade crescente: a mudança de <span className="text-emerald">ritmo e multidão</span> é, em si,
          environmental storytelling e <span className="text-gold">game feel</span>.
        </p>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 9 — Viagem entre ambientes ───────────────────── */
function V3Viagem() {
  const steps = [
    { icon: "🚏", t: "Rodoviária", d: "Pontos de ônibus sobre a avenida, sem outras interações." },
    { icon: "🎟️", t: "Pegar o ônibus (E)", d: "A viagem só acontece ao embarcar na estação." },
    { icon: "🎬", t: "Fade de viagem", d: "Transição de tela dá a sensação de deslocamento." },
    { icon: "🏙️", t: "Chegada", d: "Desembarque em frente ao ônibus de volta, no novo ambiente." },
  ]
  return (
    <Slide n={9} kicker="Mundo · viagem entre ambientes">
      <div className="flex h-full flex-col">
        <Heading sub="As rodoviárias conectam os ambientes e ficam mais desenvolvidas conforme o nível de governo.">
          Pegue o <span className="text-gold">ônibus</span> na rodoviária
        </Heading>
        <div className="grid flex-1 grid-cols-[1fr_1fr_0.95fr] gap-4">
          <div className="overflow-hidden rounded-md border border-line bg-petrol/40">
            <img src="/game/rodoviaria.png" alt="Rodoviária e ônibus" className="h-full w-full object-cover" />
          </div>
          <div className="overflow-hidden rounded-md border border-line bg-petrol/40">
            <img src="/game/viagem.png" alt="Fade de viagem de ônibus" className="h-full w-full object-cover" />
          </div>
          <div className="grid content-center gap-2.5">
            {steps.map((s) => (
              <Card key={s.t} accent="emerald" className="flex items-center gap-3 py-2.5">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="font-display text-sm font-bold text-cream">{s.t}</p>
                  <p className="text-xs leading-tight text-cream-dim">{s.d}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-cream-dim">
          Viajar é livre a qualquer momento; ao concluir uma etapa, o jogo <span className="text-gold">indica a rodoviária</span> do
          próximo ambiente.
        </p>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 10 — Interatividade narrativa (Zimmerman) ────── */
function V3Interatividade() {
  const modos = [
    ["Cognitiva", "interpretar o problema; deduzir quem decide"],
    ["Funcional", "teclado, HUD, minimapa, Diário — o aparato do jogo"],
    ["Explícita", "a escolha da missão: apontar o nível responsável"],
    ["Meta / cultural", "discutir respostas com colegas; comunidade em sala"],
  ]
  return (
    <Slide n={10} kicker="Narrativa no jogo × sobre o jogo · Zimmerman">
      <div className="flex h-full flex-col">
        <Heading sub="Nakamura separa a narrativa que está no jogo da que se forma ao redor dele; Zimmerman divide a interatividade narrativa em quatro modos.">
          Onde a história <span className="text-gold">acontece</span>
        </Heading>
        <div className="grid flex-1 grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            <Card accent="emerald" className="flex-1">
              <p className="font-display text-base font-bold text-emerald">Narrativa no jogo</p>
              <p className="mt-1 text-sm text-cream-dim">
                Selecionar elementos narrativos · detalhar conforme a relevância · desenhar a experiência em torno deles.
              </p>
            </Card>
            <Card accent="gold" className="flex-1">
              <p className="font-display text-base font-bold text-gold">Narrativa sobre o jogo</p>
              <p className="mt-1 text-sm text-cream-dim">
                <span className="italic">Sensemaking</span> de quem joga · formação de comunidade e experiência fora do jogo.
              </p>
            </Card>
          </div>
          <div className="grid content-center gap-2.5">
            <p className="hud-label text-slate">Quatro modos de interatividade narrativa</p>
            {modos.map(([a, b]) => (
              <div key={a} className="flex items-center gap-3 rounded-sm border border-line bg-petrol/50 px-4 py-2.5">
                <span className="w-32 shrink-0 font-display text-sm font-bold text-gold">{a}</span>
                <span className="text-xs text-cream-dim">{b}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-cream-dim">
          O jogo é um <span className="text-emerald">sistema narrativo</span>: estado inicial → mudança → compreensão
          (<span className="text-gold">"agora sei quem decide"</span>).
        </p>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 11 — Emoções sociais e escolhas ──────────────── */
function V3Emocoes() {
  const cards = [
    { e: "⚖️", t: "Escolhas significativas", d: "Apontar o nível responsável tem consequência: acerto gera fiero.", a: "gold" as const },
    { e: "🌊", t: "Flow", d: "Desafio calibrado ao saber adquirido mantém a jogadora na zona de fluxo.", a: "emerald" as const },
    { e: "💞", t: "Emoções sociais", d: "Testemunhos dos moradores geram empatia pelo custo coletivo do problema.", a: "gold" as const },
    { e: "🪞", t: "Projeção no avatar", d: "Arte estilizada deixa a jogadora preencher Joana com a própria experiência.", a: "emerald" as const },
  ]
  return (
    <Slide n={11} kicker="Emoções e escolhas · Isbister (cap. 1)">
      <div className="flex h-full flex-col">
        <Heading sub="Jogos movem pela combinação de escolha + flow + emoções sociais; é dela que vem a força cívica de Aurora.">
          A emoção vem da <span className="text-gold">escolha com consequência</span>
        </Heading>
        <div className="grid flex-1 grid-cols-[1fr_1fr_1fr_1.1fr] gap-4">
          {cards.map((c) => (
            <Card key={c.t} accent={c.a} className="flex flex-col justify-center">
              <span className="text-4xl">{c.e}</span>
              <p className="mt-2 font-display text-base font-bold text-cream">{c.t}</p>
              <p className="mt-1.5 text-sm leading-snug text-cream-dim">{c.d}</p>
            </Card>
          ))}
          <div className="flex flex-col overflow-hidden rounded-md border border-line bg-petrol/40">
            <img src="/game/estado.png" alt="Capital do Estado" className="h-full w-full object-cover" />
            <p className="shrink-0 px-3 py-2 text-xs text-cream-dim">
              "Uma série de escolhas interessantes": cidadania <span className="text-emerald">sentida</span>, não só informada.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 12 — Próximos passos narrativos ──────────────── */
function V3Procedural() {
  const items = [
    { t: "Ramos de consequência", d: "Respostas mudam o estado da cidade em missões futuras.", a: "gold" as const },
    { t: "Multilinearidade leve", d: "Ordem de visita aos cargos varia; a história se recombina.", a: "emerald" as const },
    { t: "Cidade como story-machine", d: "Problemas emergem do sistema (à la The Sims), não de um roteiro fixo.", a: "gold" as const },
    { t: "Narrador-guia com voz", d: "Comentários que reforçam o environmental storytelling.", a: "emerald" as const },
    { t: "Comunidade / sensemaking", d: "Comparar respostas entre colegas em sala.", a: "gold" as const },
    { t: "Momentos definidores", d: "Reações visíveis dos NPCs a acertos e erros.", a: "emerald" as const },
  ]
  return (
    <Slide n={12} kicker="Próximos passos · enredos procedimentais e multilineares">
      <div className="flex h-full flex-col">
        <Heading sub="Nakamura e Zimmerman apontam o caminho: usar as próprias regras do jogo como blocos de construção da história.">
          Deixar a <span className="text-gold">jogabilidade contar</span> a história
        </Heading>
        <div className="grid flex-1 auto-rows-fr grid-cols-3 gap-4">
          {items.map((x) => (
            <Card key={x.t} accent={x.a} className="flex flex-col justify-center">
              <p className="font-display text-base font-bold text-cream">{x.t}</p>
              <p className="mt-1.5 text-sm leading-snug text-cream-dim">{x.d}</p>
            </Card>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-emerald/30 bg-emerald/5 px-5 py-2.5 text-center text-sm text-cream">
          Objetivo: um <span className="text-gold">game-story</span> que só um jogo poderia contar — a narrativa que emerge de
          <span className="text-emerald"> procedimentos, relações e sistemas</span>.
        </div>
      </div>
    </Slide>
  )
}

/* ── V3 · SLIDE 13 — Encerramento ────────────────────────────── */
function V3Encerramento() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <img src="/game/uniao.png" alt="Capital Federal" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
      <div className="relative flex h-full flex-col items-center justify-center px-10 text-center">
        <Tag tone="gold">◆ Narrativa a serviço da cidadania</Tag>
        <h1 className="mt-4 font-display text-[3.2rem] font-extrabold leading-[0.95] tracking-tight text-cream drop-shadow-[0_3px_0_rgba(0,0,0,0.5)]">
          Uma eleitora, uma cidade, <span className="text-gold">três níveis de governo.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-snug text-cream">
          Com enredo, personagens, narrador e ambientes navegáveis, Aurora transforma{" "}
          <span className="text-emerald">"tirei o título"</span> em{" "}
          <span className="text-gold">"sei como participar"</span>.
        </p>
        <div className="mt-6 flex items-center gap-3">
          {["Nakamura", "Isbister", "Zimmerman"].map((w, i) => (
            <span key={w} className="font-display text-lg font-bold text-cream">
              {w}
              {i < 2 && <span className="ml-3 text-gold">·</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8">
        <span className="hud-label text-gold">Aurora: Quem Decide? · Narrativa e Personagens</span>
        <span className="hud-label text-slate">Projeto acadêmico — USP</span>
      </div>
    </div>
  )
}

/* ──────────────────────────── Deck controller ──────────────────────────── */

const DECKS = {
  1: {
    title: "O protótipo",
    slides: [
      SlideCover,
      SlideODS,
      SlideProblema,
      SlideIdeia,
      SlideComoFunciona,
      SlideJornada,
      SlideMatriz,
      SlideMecanicas,
      SlideObjetivo,
      SlideCidadania,
      SlideTech,
      SlideAssets,
      SlideEncerramento,
    ],
  },
  2: {
    title: "Design do projeto real",
    slides: [
      V2Cover,
      V2Pilar,
      V2MDA,
      V2Chaves,
      V2Mecanicas,
      V2Regras,
      V2Espacos,
      V2GameFeel,
      V2Narrativa,
      V2GameTheory,
      V2Playtest,
      V2Backlog,
      V2Encerramento,
    ],
  },
  3: {
    title: "Narrativa e personagens",
    slides: [
      V3Cover,
      V3Narratologia,
      V3Enredo,
      V3Arco,
      V3Personagens,
      V3PapeisSociais,
      V3Narrador,
      V3Mundo,
      V3Viagem,
      V3Interatividade,
      V3Emocoes,
      V3Procedural,
      V3Encerramento,
    ],
  },
} as const

type Version = 1 | 2 | 3

/* Segmented control to switch between the two evolutionary presentations */
function VersionSwitch({ version, onChange }: { version: Version; onChange: (v: Version) => void }) {
  return (
    <div className="pointer-events-auto absolute left-1/2 top-4 z-20 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-md border border-line bg-ink/85 p-1 backdrop-blur-sm">
        {([1, 2, 3] as Version[]).map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`hud-label rounded-sm px-3 py-1.5 transition ${
              version === v ? "bg-gold text-ink" : "text-cream-dim hover:text-gold"
            }`}
          >
            Apresentação {v}
            <span className={`ml-2 normal-case ${version === v ? "text-ink/70" : "text-slate"}`}>· {DECKS[v].title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [version, setVersion] = useState<Version>(1)
  const [i, setI] = useState(0)
  const slides = DECKS[version].slides
  const go = useCallback((d: number) => setI((p) => Math.min(slides.length - 1, Math.max(0, p + d))), [slides.length])

  const switchVersion = useCallback((v: Version) => {
    setVersion(v)
    setI(0)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  const Current = slides[i]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#06141c] p-4 sm:p-6">
      {/* 16:9 stage */}
      <div className="relative w-full max-w-[1280px]" style={{ aspectRatio: "16 / 9" }}>
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-line shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)]">
          <Current key={`${version}-${i}`} />
          {/* version selector lives on the first slide of each presentation */}
          {i === 0 && <VersionSwitch version={version} onChange={switchVersion} />}
        </div>
      </div>

      {/* controls */}
      <div className="flex w-full max-w-[1280px] items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={i === 0}
          className="hud-label rounded-sm border border-line bg-petrol px-4 py-2 text-cream-dim transition hover:border-emerald hover:text-emerald disabled:cursor-not-allowed disabled:opacity-30"
        >
          ◀ Anterior
        </button>

        <div className="flex items-center gap-3">
          <span className="hud-label hidden text-slate sm:inline">
            Apresentação {version} · {DECKS[version].title}
          </span>
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Ir para o slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? "w-6 bg-gold" : "w-2 bg-slate/50 hover:bg-emerald"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => go(1)}
          disabled={i === slides.length - 1}
          className="hud-label rounded-sm border border-line bg-petrol px-4 py-2 text-cream-dim transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
        >
          Próximo ▶
        </button>
      </div>
    </div>
  )
}
