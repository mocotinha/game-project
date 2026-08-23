import { useCallback, useEffect, useState, type ReactNode } from "react"

const TOTAL = 13
import {
  Joana,
  Prefeitura,
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
        <span className="hud-label text-slate/70">Projeto acadêmico — USP</span>
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
        <span className="hud-label text-slate">Projeto acadêmico — USP</span>
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
    <Slide n={2} kicker="Capítulo 0 · A dúvida">
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
    <Slide n={3} kicker="Capítulo 0 · A oportunidade">
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
    <Slide n={4} kicker="Loop de gameplay">
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
    <Slide n={5} kicker="Mapa de progressão">
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
    <Slide n={6} kicker="Matriz de competências">
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
    <Slide n={7} kicker="Mecânicas de aprendizagem">
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
    <Slide n={8} kicker="Objetivos de aprendizagem">
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
    <Slide n={9} kicker="Cidadania contínua">
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
    <Slide n={10} kicker="Agenda 2030 · ODS">
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
    { t: "Arcade 3.x", d: "sprites · renderização · views · teclado · áudio", a: "emerald" as const },
    { t: "Conteúdo educativo", d: "missions.py · roles.py · problems.py · sidequests.py", a: "gold" as const },
    { t: "Motor de regras", d: "rules.py", a: "emerald" as const },
    { t: "Interface", d: "ui.py", a: "gold" as const },
    { t: "Persistência", d: "save_manager.py · JSON", a: "emerald" as const },
    { t: "Testes", d: "pytest", a: "gold" as const },
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
  const sprites = [
    { c: <GovBuilding className="h-full w-full" />, pack: "Roguelike Modern City", use: "Edifícios e ruas top-down" },
    { c: <Prefeitura className="h-full w-full" />, pack: "RPG Urban Pack", use: "Prédios públicos e cenário urbano" },
    { c: <Joana className="mx-auto h-full w-auto" />, pack: "RPG Urban Pack", use: "Joana, NPCs e moradores" },
    { c: <Rodovia className="h-full w-full" />, pack: "City Kit (Roads)", use: "Rodovias e vias" },
    { c: <span className="text-3xl">⭐</span>, pack: "UI Pack · Game Icons", use: "HUD, provas e ícones de missão" },
    { c: <span className="text-3xl">💬</span>, pack: "Input Prompts · Emotes", use: "Caixas de diálogo e teclas" },
  ]
  const fonts = [
    { name: "Kenney Future", role: "Display / títulos", pixel: false, w: "font-extrabold" },
    { name: "Kenney Future Narrow", role: "Rótulos de HUD", pixel: false, w: "font-bold" },
    { name: "Kenney Pixel", role: "Números e placares", pixel: true, w: "" },
    { name: "Kenney Mini Square", role: "Micro-labels", pixel: true, w: "" },
  ]
  return (
    <Slide n={12} kicker="Recursos de produção">
      <Heading sub="Todo o kit visual e tipográfico virá do acervo CC0 do kenney.nl — uso livre, sem custo e sem atribuição obrigatória.">
        O que vamos usar para <span className="text-gold">construir Aurora</span>
      </Heading>
      <div className="grid grid-cols-[1.55fr_1fr] gap-5">
        {/* sprites */}
        <div>
          <p className="hud-label mb-2 text-emerald">Sprites · packs Kenney</p>
          <div className="grid grid-cols-3 gap-3">
            {sprites.map((s) => (
              <Card key={s.pack + s.use} accent="emerald" className="flex flex-col">
                <div className="grid h-16 place-items-center rounded-sm border border-line bg-ink p-1.5">
                  <div className="h-12 w-12">{s.c}</div>
                </div>
                <p className="mt-2 font-pixel text-[0.45rem] leading-relaxed text-gold">{s.pack}</p>
                <p className="mt-1 text-xs leading-tight text-cream-dim">{s.use}</p>
              </Card>
            ))}
          </div>
        </div>
        {/* fonts */}
        <div>
          <p className="hud-label mb-2 text-gold">Fontes · Kenney Fonts (11 × CC0)</p>
          <div className="space-y-2.5">
            {fonts.map((f) => (
              <div key={f.name} className="rounded-md border border-line bg-petrol/50 px-3 py-2.5">
                <div className="flex items-baseline justify-between">
                  <span className={`text-cream ${f.pixel ? "font-pixel text-[0.7rem]" : `font-display text-lg ${f.w}`}`}>
                    {f.pixel ? "AURORA 2026" : "Aurora"}
                  </span>
                  <span className="hud-label text-slate">{f.role}</span>
                </div>
                <p className="mt-1 text-xs text-cream-dim">{f.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-cream-dim">
        <span className="text-emerald">Kenney — CC0</span>: acelera a produção, mantém coerência visual e libera o time para focar no{" "}
        <span className="text-cream">conteúdo educativo</span>. <span className="text-slate">Amostras aproximadas.</span>
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
        <span className="hud-label text-slate">Projeto acadêmico — USP · Não partidário · Fictício</span>
      </div>
    </div>
  )
}

/* ──────────────────────────── Deck controller ──────────────────────────── */

const SLIDES = [
  SlideCover,
  SlideProblema,
  SlideIdeia,
  SlideComoFunciona,
  SlideJornada,
  SlideMatriz,
  SlideMecanicas,
  SlideObjetivo,
  SlideCidadania,
  SlideODS,
  SlideTech,
  SlideAssets,
  SlideEncerramento,
]

export default function App() {
  const [i, setI] = useState(0)
  const go = useCallback((d: number) => setI((p) => Math.min(SLIDES.length - 1, Math.max(0, p + d))), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  const Current = SLIDES[i]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#06141c] p-4 sm:p-6">
      {/* 16:9 stage */}
      <div className="relative w-full max-w-[1280px]" style={{ aspectRatio: "16 / 9" }}>
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-line shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)]">
          <Current key={i} />
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

        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, idx) => (
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

        <button
          onClick={() => go(1)}
          disabled={i === SLIDES.length - 1}
          className="hud-label rounded-sm border border-line bg-petrol px-4 py-2 text-cream-dim transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
        >
          Próximo ▶
        </button>
      </div>
    </div>
  )
}
