// Pixel-art SVG sprite library for "Aurora: Quem Decide?"
// Everything is drawn on integer grids and scaled up crisply.

type SvgProps = { className?: string; title?: string }

const P = {
  ink: "#0a1f2b",
  petrol: "#103343",
  petrol2: "#17475c",
  emerald: "#2ec4a3",
  emeraldDeep: "#14846c",
  gold: "#f5c451",
  goldDeep: "#e0a92e",
  cream: "#f4efe3",
  brick: "#c96b4a",
  brickDark: "#a4523a",
  window: "#8fd4e8",
  roof: "#22586e",
  sky: "#0d2734",
  road: "#243743",
  grass: "#1c7a5e",
  skin: "#e6b48a",
  hair: "#3a2a20",
}

// ── Joana — pixel character sprite ─────────────────────────────
export function Joana({ className, title = "Joana" }: SvgProps) {
  return (
    <svg viewBox="0 0 16 22" className={`pixelated ${className ?? ""}`} role="img" aria-label={title}>
      <title>{title}</title>
      {/* hair */}
      <rect x="4" y="1" width="8" height="4" fill={P.hair} />
      <rect x="3" y="2" width="1" height="6" fill={P.hair} />
      <rect x="12" y="2" width="1" height="6" fill={P.hair} />
      {/* face */}
      <rect x="4" y="4" width="8" height="5" fill={P.skin} />
      {/* eyes */}
      <rect x="5" y="6" width="1" height="1" fill={P.ink} />
      <rect x="10" y="6" width="1" height="1" fill={P.ink} />
      {/* smile */}
      <rect x="7" y="7" width="2" height="1" fill={P.brickDark} />
      {/* body / jacket (emerald) */}
      <rect x="4" y="9" width="8" height="7" fill={P.emerald} />
      <rect x="7" y="9" width="2" height="7" fill={P.emeraldDeep} />
      {/* backpack strap gold */}
      <rect x="5" y="10" width="1" height="5" fill={P.gold} />
      <rect x="10" y="10" width="1" height="5" fill={P.gold} />
      {/* arms */}
      <rect x="3" y="10" width="1" height="5" fill={P.emeraldDeep} />
      <rect x="12" y="10" width="1" height="5" fill={P.emeraldDeep} />
      <rect x="3" y="15" width="1" height="1" fill={P.skin} />
      <rect x="12" y="15" width="1" height="1" fill={P.skin} />
      {/* legs */}
      <rect x="5" y="16" width="2" height="5" fill={P.petrol2} />
      <rect x="9" y="16" width="2" height="5" fill={P.petrol2} />
      {/* shoes */}
      <rect x="4" y="20" width="3" height="1" fill={P.gold} />
      <rect x="9" y="20" width="3" height="1" fill={P.gold} />
    </svg>
  )
}

// ── Generic building tile factory ──────────────────────────────
function BuildingBase({
  className,
  title,
  body,
  roof,
  children,
  flag,
}: SvgProps & { body: string; roof: string; children?: React.ReactNode; flag?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`pixelated ${className ?? ""}`} role="img" aria-label={title}>
      <title>{title}</title>
      {flag && (
        <>
          <rect x="11" y="1" width="1" height="4" fill={P.cream} />
          <rect x="12" y="1" width="4" height="2" fill={flag} />
        </>
      )}
      {/* roof */}
      <rect x="3" y="5" width="18" height="3" fill={roof} />
      {/* body */}
      <rect x="4" y="8" width="16" height="14" fill={body} />
      {/* ground line */}
      <rect x="2" y="22" width="20" height="1" fill={P.ink} />
      {children}
    </svg>
  )
}

const win = (x: number, y: number) => <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" fill={P.window} />

export function Prefeitura({ className, title = "Prefeitura" }: SvgProps) {
  return (
    <BuildingBase className={className} title={title} body={P.cream} roof={P.roof} flag={P.emerald}>
      {/* columns */}
      <rect x="6" y="9" width="1" height="10" fill="#c7cfcb" />
      <rect x="9" y="9" width="1" height="10" fill="#c7cfcb" />
      <rect x="12" y="9" width="1" height="10" fill="#c7cfcb" />
      <rect x="15" y="9" width="1" height="10" fill="#c7cfcb" />
      <rect x="17" y="9" width="1" height="10" fill="#c7cfcb" />
      <rect x="5" y="8" width="14" height="1" fill={P.gold} />
      <rect x="10" y="16" width="4" height="6" fill={P.petrol} />
    </BuildingBase>
  )
}

export function Camara({ className, title = "Câmara Municipal" }: SvgProps) {
  return (
    <BuildingBase className={className} title={title} body="#dfe6df" roof={P.emeraldDeep} flag={P.gold}>
      {/* dome */}
      <rect x="10" y="3" width="4" height="2" fill={P.gold} />
      <rect x="11" y="2" width="2" height="1" fill={P.gold} />
      {win(6, 10)}{win(11, 10)}{win(16, 10)}
      <rect x="10" y="16" width="4" height="6" fill={P.petrol} />
    </BuildingBase>
  )
}

export function Hospital({ className, title = "Hospital" }: SvgProps) {
  return (
    <BuildingBase className={className} title={title} body={P.cream} roof="#b5352f">
      {/* cross */}
      <rect x="10" y="9" width="4" height="2" fill="#d7473f" />
      <rect x="11" y="8" width="2" height="4" fill="#d7473f" />
      {win(6, 14)}{win(11, 14)}{win(16, 14)}
      <rect x="10" y="18" width="4" height="4" fill={P.petrol2} />
    </BuildingBase>
  )
}

export function Escola({ className, title = "Escola" }: SvgProps) {
  return (
    <BuildingBase className={className} title={title} body={P.gold} roof={P.brickDark}>
      {/* bell */}
      <rect x="11" y="3" width="2" height="2" fill={P.cream} />
      {win(6, 11)}{win(16, 11)}
      <rect x="10" y="14" width="4" height="8" fill={P.brick} />
      <rect x="11" y="16" width="2" height="2" fill={P.gold} />
    </BuildingBase>
  )
}

export function GovBuilding({ className, title = "Prédio Governamental" }: SvgProps) {
  return (
    <BuildingBase className={className} title={title} body={P.petrol2} roof={P.roof} flag={P.gold}>
      {win(6, 10)}{win(11, 10)}{win(16, 10)}
      {win(6, 15)}{win(11, 15)}{win(16, 15)}
    </BuildingBase>
  )
}

export function Praca({ className, title = "Praça" }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={`pixelated ${className ?? ""}`} role="img" aria-label={title}>
      <title>{title}</title>
      <rect x="2" y="18" width="20" height="4" fill={P.grass} />
      {/* tree trunk */}
      <rect x="11" y="12" width="2" height="7" fill={P.brickDark} />
      {/* foliage */}
      <rect x="7" y="5" width="10" height="8" fill={P.emeraldDeep} />
      <rect x="9" y="3" width="6" height="3" fill={P.emerald} />
      <rect x="6" y="7" width="2" height="4" fill={P.emerald} />
      <rect x="16" y="7" width="2" height="4" fill={P.emerald} />
      {/* bench */}
      <rect x="3" y="16" width="4" height="1" fill={P.gold} />
    </svg>
  )
}

export function Rodovia({ className, title = "Rodovia" }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={`pixelated ${className ?? ""}`} role="img" aria-label={title}>
      <title>{title}</title>
      <rect x="0" y="16" width="24" height="8" fill={P.road} />
      <rect x="0" y="19" width="4" height="2" fill={P.gold} />
      <rect x="8" y="19" width="4" height="2" fill={P.gold} />
      <rect x="16" y="19" width="4" height="2" fill={P.gold} />
      {/* hills */}
      <rect x="2" y="10" width="8" height="6" fill={P.emeraldDeep} />
      <rect x="14" y="8" width="8" height="8" fill={P.grass} />
      {/* sign */}
      <rect x="11" y="6" width="1" height="6" fill="#9aa" />
      <rect x="9" y="4" width="6" height="3" fill={P.emerald} />
    </svg>
  )
}

export function Bus({ className, title = "Ônibus" }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={`pixelated ${className ?? ""}`} role="img" aria-label={title}>
      <title>{title}</title>
      <rect x="2" y="7" width="20" height="10" fill={P.gold} />
      <rect x="4" y="9" width="4" height="3" fill={P.window} />
      <rect x="10" y="9" width="4" height="3" fill={P.window} />
      <rect x="16" y="9" width="4" height="3" fill={P.window} />
      <rect x="2" y="15" width="20" height="2" fill={P.goldDeep} />
      <rect x="5" y="17" width="3" height="3" fill={P.ink} />
      <rect x="16" y="17" width="3" height="3" fill={P.ink} />
    </svg>
  )
}

// ── Level emblems: Município / Estado / União ──────────────────
export function LevelBadge({
  level,
  className,
}: {
  level: "municipio" | "estado" | "uniao"
  className?: string
}) {
  const glyph =
    level === "municipio" ? (
      <>
        <rect x="9" y="9" width="6" height="9" fill={P.cream} />
        <rect x="11" y="12" width="2" height="6" fill={P.petrol} />
        <rect x="8" y="7" width="8" height="2" fill={P.emerald} />
      </>
    ) : level === "estado" ? (
      <>
        {/* map region */}
        <rect x="7" y="8" width="10" height="9" fill={P.emerald} />
        <rect x="6" y="10" width="1" height="4" fill={P.emerald} />
        <rect x="17" y="9" width="1" height="5" fill={P.emerald} />
        <rect x="11" y="11" width="2" height="2" fill={P.gold} />
      </>
    ) : (
      <>
        {/* stars ring */}
        <rect x="11" y="7" width="2" height="2" fill={P.gold} />
        <rect x="7" y="11" width="2" height="2" fill={P.gold} />
        <rect x="15" y="11" width="2" height="2" fill={P.gold} />
        <rect x="9" y="15" width="2" height="2" fill={P.gold} />
        <rect x="13" y="15" width="2" height="2" fill={P.gold} />
      </>
    )
  return (
    <svg viewBox="0 0 24 24" className={`pixelated ${className ?? ""}`} role="img" aria-label={level}>
      <rect x="3" y="3" width="18" height="18" rx="0" fill={P.petrol} />
      <rect x="3" y="3" width="18" height="2" fill={P.emeraldDeep} />
      {glyph}
    </svg>
  )
}

// ── City panorama (top-down-ish) for cover / closing ───────────
export function CityPanorama({ className, dusk = false }: { className?: string; dusk?: boolean }) {
  return (
    <svg viewBox="0 0 200 90" className={`pixelated ${className ?? ""}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Cidade fictícia Aurora do Brasil">
      <defs>
        <linearGradient id={dusk ? "skyDusk" : "skyDay"} x1="0" y1="0" x2="0" y2="1">
          {dusk ? (
            <>
              <stop offset="0" stopColor="#3a2f52" />
              <stop offset="0.55" stopColor="#8a4a55" />
              <stop offset="1" stopColor="#e0a92e" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#123a4c" />
              <stop offset="1" stopColor="#17475c" />
            </>
          )}
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="90" fill={`url(#${dusk ? "skyDusk" : "skyDay"})`} />
      {/* sun / moon */}
      <rect x={dusk ? 150 : 24} y={dusk ? 40 : 12} width="14" height="14" fill={dusk ? P.gold : "#bfe3ef"} />
      {/* stars */}
      {!dusk && [30, 60, 100, 140, 175].map((x, i) => <rect key={x} x={x} y={8 + (i % 3) * 5} width="1" height="1" fill={P.cream} />)}
      {/* ground */}
      <rect x="0" y="66" width="200" height="24" fill={P.grass} />
      {/* road */}
      <rect x="0" y="74" width="200" height="6" fill={P.road} />
      {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180].map((x) => (
        <rect key={x} x={x + 4} y="76" width="8" height="2" fill={P.gold} />
      ))}
      {/* skyline blocks */}
      {[
        { x: 8, w: 16, h: 30, c: P.cream, roof: P.roof },
        { x: 28, w: 20, h: 42, c: P.petrol2, roof: P.roof },
        { x: 52, w: 14, h: 26, c: P.gold, roof: P.brickDark },
        { x: 70, w: 22, h: 36, c: "#dfe6df", roof: P.emeraldDeep },
        { x: 118, w: 18, h: 40, c: P.petrol2, roof: P.roof },
        { x: 140, w: 16, h: 28, c: P.cream, roof: "#b5352f" },
        { x: 160, w: 20, h: 34, c: P.gold, roof: P.brickDark },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={66 - b.h} width={b.w} height={b.h} fill={b.c} />
          <rect x={b.x} y={66 - b.h} width={b.w} height="3" fill={b.roof} />
          {Array.from({ length: Math.floor(b.h / 8) }).map((_, r) =>
            Array.from({ length: Math.floor(b.w / 6) }).map((_, cc) => (
              <rect key={`${r}-${cc}`} x={b.x + 2 + cc * 6} y={66 - b.h + 6 + r * 8} width="2" height="3" fill={dusk ? P.gold : P.window} opacity={dusk ? 0.9 : 0.8} />
            )),
          )}
        </g>
      ))}
      {/* central tree / praça */}
      <rect x="96" y="52" width="8" height="14" fill={P.brickDark} />
      <rect x="90" y="40" width="20" height="14" fill={P.emeraldDeep} />
      <rect x="94" y="36" width="12" height="6" fill={P.emerald} />
    </svg>
  )
}
