"use client"

// Circuit hero — the hero section of the "maroon-fintech-landing" template
// (MIT, Kedhareswer Naidu) adapted for Syvaxia.
//
// A cream paper stage holds an animated circuit board whose signal pulses
// run toward a tilting brand puck; the puck leans under the pointer while
// the nearest chip lights up. A backer badge, a two-tone headline (words in
// *asterisks* render muted), a subtitle and a CTA row sit above; an info
// block and two live stat cards (period menus, hoverable donut splits) sit
// at its feet. Palette: the template's "forest" scheme, which matches the
// Syvaxia green. Everything is drawn inline — no runtime assets beyond the
// brand logo.
import * as React from "react"
import Link from "next/link"

import { useLeadModal } from "@/components/leads/lead-modal";
import PixelCard from "@/components/ui/pixel-card";

// ---------------------------------------------------------------------------
// content types (trimmed to what the hero needs)
// ---------------------------------------------------------------------------

export type HeroCategory = { label: string; value: number; color?: string }

export type HeroPeriod = {
  label: string
  range: string
  amount: number
  change: number
  /** Text under the change chip, e.g. "vs last intake". */
  versus: string
  categories: HeroCategory[]
}

export type HeroStatCard = { title: string; periods: HeroPeriod[] }

// ---------------------------------------------------------------------------
// palette — the template's "forest" scheme (matches the Syvaxia brand green)
// ---------------------------------------------------------------------------

const PAL = {
  frame: "#2f4436",
  paper: "#e5e4da",
  ink: "#141a16",
  muted: "#7f857b",
  brand: "#2f5640",
  night: "#121d17",
  card: "#1c2c22",
  cream: "#ecebe1",
  device: "#c9b79a",
  glow: "#ffd98a",
}

const CAT_COLORS = ["#efe9df", "#b8a99a", "#c4673f", "#7b6a5f", "#d9b48a"]

// ---------------------------------------------------------------------------
// hero data — training-flavoured replacements for the finance demo cards
// ---------------------------------------------------------------------------

const STAT_CARDS: HeroStatCard[] = [
  {
    title: "Cohort seats",
    periods: [
      {
        label: "Full cohort",
        range: "Feb 2026 · ABAP / FICO / MM",
        amount: 26,
        change: 8.3,
        versus: "seats vs last intake",
        categories: [
          { label: "Working professionals", value: 12 },
          { label: "Fresh graduates", value: 8 },
          { label: "Career switchers", value: 4 },
          { label: "Students", value: 2 },
        ],
      },
      {
        label: "This week",
        range: "Nov 19 – Nov 25, 2026",
        amount: 19,
        change: 12.5,
        versus: "seats vs last week",
        categories: [
          { label: "Working professionals", value: 9 },
          { label: "Fresh graduates", value: 6 },
          { label: "Career switchers", value: 3 },
          { label: "Students", value: 1 },
        ],
      },
      {
        label: "Today",
        range: "Nov 25, 2026",
        amount: 5,
        change: 2.0,
        versus: "enquiries vs yesterday",
        categories: [
          { label: "Working professionals", value: 3 },
          { label: "Fresh graduates", value: 2 },
        ],
      },
    ],
  },
  {
    title: "Placement pipeline",
    periods: [
      {
        label: "All time",
        range: "Since first cohort, 2025",
        amount: 118,
        change: 6.4,
        versus: "interviews vs last quarter",
        categories: [
          { label: "SAP FICO", value: 46 },
          { label: "SAP MM", value: 38 },
          { label: "SAP ABAP", value: 24 },
          { label: "Full Stack", value: 10 },
        ],
      },
      {
        label: "This year",
        range: "Jan – Nov 2026",
        amount: 74,
        change: 12.8,
        versus: "interviews vs last year",
        categories: [
          { label: "SAP FICO", value: 32 },
          { label: "SAP MM", value: 22 },
          { label: "SAP ABAP", value: 14 },
          { label: "Full Stack", value: 6 },
        ],
      },
      {
        label: "This month",
        range: "Nov 2026",
        amount: 9,
        change: -2.4,
        versus: "interviews vs October",
        categories: [
          { label: "SAP FICO", value: 4 },
          { label: "SAP ABAP", value: 3 },
          { label: "SAP MM", value: 2 },
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// logic
// ---------------------------------------------------------------------------

type Seg = { text: string; muted: boolean }

// "Enterprise-ready *SAP*" → [{Enterprise-ready,false},{SAP,true}]. An
// unclosed asterisk mutes the rest of the string.
function parseEmphasis(s: string): Seg[] {
  const out: Seg[] = []
  let muted = false
  for (const part of s.split("*")) {
    if (part) out.push({ text: part, muted })
    muted = !muted
  }
  return out
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

function formatCount(n: number, decimals: number): string {
  const fixed = Math.abs(n).toFixed(decimals)
  const dot = fixed.indexOf(".")
  const int = dot < 0 ? fixed : fixed.slice(0, dot)
  const frac = dot < 0 ? "" : fixed.slice(dot)
  return (n < 0 ? "-" : "") + int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + frac
}

function easeOutCubic(t: number): number {
  const u = 1 - clamp(t, 0, 1)
  return 1 - u * u * u
}

// Donut arcs in pathLength=100 units. Each arc gives up `gap` so neighbours
// never touch; an arc smaller than the gap still shows as a sliver.
function donutArcs(values: number[], gap: number): { start: number; len: number }[] {
  const total = values.reduce((a, v) => a + Math.max(0, v), 0)
  if (!total) return values.map(() => ({ start: 0, len: 0 }))
  const g = values.filter((v) => v > 0).length > 1 ? gap : 0
  let at = 0
  return values.map((v) => {
    const share = (Math.max(0, v) / total) * 100
    const arc = { start: at + g / 2, len: share > 0 ? Math.max(0.6, share - g) : 0 }
    at += share
    return arc
  })
}

// Arrow keys, Home and End inside a menu. Wraps.
function nextIndex(i: number, key: string, n: number): number {
  if (n <= 0) return -1
  if (key === "ArrowDown") return (i + 1 + n) % n
  if (key === "ArrowUp") return (i - 1 + n) % n
  if (key === "Home") return 0
  if (key === "End") return n - 1
  return i
}

// ---------------------------------------------------------------------------
// small hooks
// ---------------------------------------------------------------------------

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener?.("change", on)
    return () => mq.removeEventListener?.("change", on)
  }, [])
  return reduced
}

// Closes a popover on an outside press or Escape, returning focus to its button.
function useDismiss(open: boolean, close: () => void, boxRef: { current: HTMLElement | null }) {
  React.useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) close()
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("pointerdown", down)
    document.addEventListener("keydown", key)
    return () => {
      document.removeEventListener("pointerdown", down)
      document.removeEventListener("keydown", key)
    }
  }, [open, close, boxRef])
}

// ---------------------------------------------------------------------------
// marks
// ---------------------------------------------------------------------------

const PETAL = "M12 12C9.2 9.6 9.3 4 12 2.6C14.7 4 14.8 9.6 12 12Z"

function Asterisk({ size = 16, color = "currentColor", className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <svg className={"mfl-svg " + className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <g fill={color} stroke={color} strokeWidth="1.6" strokeLinejoin="round">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d={PETAL} transform={"rotate(" + a + " 12 12)"} />
        ))}
      </g>
    </svg>
  )
}

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg className={"mfl-svg mfl-chev" + (open ? " is-open" : "")} viewBox="0 0 10 10" width={9} height={9} aria-hidden="true">
      <path d="M2 3.6L5 6.6L8 3.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Arrow({ up }: { up: boolean }) {
  return (
    <svg className="mfl-svg" viewBox="0 0 10 10" width={8} height={8} aria-hidden="true">
      <path d={up ? "M5 1.5L8.6 7.5H1.4Z" : "M5 8.5L8.6 2.5H1.4Z"} fill="currentColor" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// tiny menu button — the period switcher inside each stat card
// ---------------------------------------------------------------------------

function MenuSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: number
  onChange: (i: number) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(value)
  const boxRef = React.useRef(null as HTMLDivElement | null)
  const btnRef = React.useRef(null as HTMLButtonElement | null)
  const listRef = React.useRef(null as HTMLUListElement | null)
  const id = React.useId().replace(/:/g, "")
  const close = React.useCallback(() => {
    setOpen(false)
    btnRef.current?.focus()
  }, [])
  useDismiss(open, close, boxRef)
  React.useEffect(() => {
    if (open) {
      setActive(value)
      listRef.current?.focus()
    }
  }, [open, value])

  const pick = (i: number) => {
    onChange(i)
    close()
  }

  return (
    <div className="mfl-menu" ref={boxRef}>
      <button
        ref={btnRef}
        type="button"
        className="mfl-menu-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label + ": " + options[value]}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        {options[value]}
        <Chevron open={open} />
      </button>
      {open && (
        <ul
          ref={listRef}
          className="mfl-menu-list"
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={id + "-" + active}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              pick(active)
            } else if (e.key === "Tab") setOpen(false)
            else {
              const n = nextIndex(active, e.key, options.length)
              if (n !== active) {
                e.preventDefault()
                setActive(n)
              }
            }
          }}
        >
          {options.map((o, i) => (
            <li
              key={o + i}
              id={id + "-" + i}
              role="option"
              aria-selected={i === value}
              className={"mfl-menu-opt" + (i === active ? " is-active" : "")}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              {o}
              {i === value && (
                <svg className="mfl-svg" viewBox="0 0 12 12" width={10} height={10} aria-hidden="true">
                  <path d="M2.5 6.2L5 8.6L9.5 3.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// hero art — circuit board + tilting device
// ---------------------------------------------------------------------------

type Chip = { x: number; y: number; glyph: string }

// Traces for the left half. The right half is the same board mirrored, so the
// device sits at the meeting point of both.
const TRACES = [
  "M0 236H96M156 236H232Q252 236 252 256V336Q252 356 272 356H430Q450 356 450 376V560Q450 580 470 580H600",
  "M0 470H118M178 470H300Q320 470 320 490V640Q320 660 340 660H612",
  "M84 0V122Q84 142 104 142H170",
  "M0 640H96M156 640H200Q220 640 220 660V760Q220 780 240 780H560",
  "M0 356H24M84 356H160",
  "M330 0V140Q330 160 350 160H380",
]

const CHIPS: Chip[] = [
  { x: 126, y: 236, glyph: "$" },
  { x: 148, y: 470, glyph: "%" },
  { x: 54, y: 356, glyph: "≡" },
  { x: 126, y: 640, glyph: "↗" },
  { x: 200, y: 142, glyph: "··" },
  { x: 410, y: 160, glyph: "◦" },
]

function CircuitBoard({ uid, reduced, hot }: { uid: string; reduced: boolean; hot: number }) {
  const g = uid + "-pulse"
  const half = (side: number) => (
    <g transform={side ? "translate(1440 0) scale(-1 1)" : undefined}>
      {TRACES.map((d, i) => (
        <path key={"t" + i} d={d} className="mfl-trace" />
      ))}
      {!reduced &&
        TRACES.map((d, i) => (
          <path
            key={"p" + i}
            d={d}
            pathLength={1000}
            className="mfl-pulse"
            stroke={"url(#" + g + ")"}
            style={{ animationDelay: -((i * 1.7 + side * 2.3) % 6) + "s", animationDuration: 5 + ((i + side) % 3) + "s" }}
          />
        ))}
      {CHIPS.map((c, i) => {
        const on = hot === i + side * CHIPS.length
        return (
          <g key={"c" + i} className={"mfl-chip" + (on ? " is-hot" : "")} transform={"translate(" + c.x + " " + c.y + ")"}>
            <rect x="-28" y="-16" width="56" height="32" rx="8" />
            <text x="0" y="4.5" textAnchor="middle" transform={side ? "scale(-1 1)" : undefined}>
              {c.glyph}
            </text>
          </g>
        )
      })}
    </g>
  )
  return (
    <svg className="mfl-svg mfl-circuit" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--mfl-brand)" stopOpacity="0" />
          <stop offset=".7" stopColor="var(--mfl-brand)" stopOpacity=".55" />
          <stop offset="1" stopColor="var(--mfl-glow)" stopOpacity=".9" />
        </linearGradient>
      </defs>
      {half(0)}
      {half(1)}
    </svg>
  )
}

function chipCenters(): { x: number; y: number }[] {
  return [...CHIPS.map((c) => ({ x: c.x, y: c.y })), ...CHIPS.map((c) => ({ x: 1440 - c.x, y: c.y }))]
}

function Device({ uid, pulse }: { uid: string; pulse: number }) {
  const p = uid + "-dev"
  return (
    <svg className="mfl-svg mfl-device-svg" viewBox="0 0 320 320" width={320} height={320} aria-hidden="true">
      <defs>
        <linearGradient id={p + "-face"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".04" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
        <radialGradient id={p + "-sheen"} cx=".28" cy=".22" r=".7">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={p + "-side"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".05" />
          <stop offset="1" stopColor="#000" stopOpacity=".45" />
        </linearGradient>
        <linearGradient id={p + "-led"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--mfl-glow)" stopOpacity="0" />
          <stop offset=".55" stopColor="var(--mfl-glow)" stopOpacity=".95" />
          <stop offset=".8" stopColor="#fff6e0" stopOpacity="1" />
          <stop offset="1" stopColor="var(--mfl-glow)" stopOpacity=".2" />
        </linearGradient>
        <filter id={p + "-blur"} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <g transform="rotate(-14 160 160)">
        {/* thickness: the same body pushed down and shaded */}
        <rect x="46" y="58" width="228" height="228" rx="76" fill="var(--mfl-device)" />
        <rect x="46" y="58" width="228" height="228" rx="76" fill={"url(#" + p + "-side)"} />
        {/* the light ring leaking out under the lid */}
        <g key={pulse} className="mfl-led">
          <path d="M270 150Q276 262 168 280" fill="none" stroke={"url(#" + p + "-led)"} strokeWidth="14" strokeLinecap="round" filter={"url(#" + p + "-blur)"} />
          <path d="M268 160Q270 258 172 276" fill="none" stroke={"url(#" + p + "-led)"} strokeWidth="3.4" strokeLinecap="round" />
        </g>
        {/* lid */}
        <rect x="46" y="44" width="228" height="228" rx="76" fill="var(--mfl-device)" />
        <rect x="46" y="44" width="228" height="228" rx="76" fill={"url(#" + p + "-face)"} />
        <rect x="46" y="44" width="228" height="228" rx="76" fill={"url(#" + p + "-sheen)"} />
        <rect x="47" y="45" width="226" height="226" rx="75" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.4" />
        {/* (the Syvaxia logo is overlaid as an image by the parent button) */}
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// hero stat cards
// ---------------------------------------------------------------------------

function Donut({
  cats,
  hover,
  setHover,
  colors,
}: {
  cats: HeroCategory[]
  hover: number
  setHover: (i: number) => void
  colors: string[]
}) {
  const arcs = donutArcs(
    cats.map((c) => c.value),
    3,
  )
  const total = cats.reduce((a, c) => a + c.value, 0)
  const shown = hover >= 0 && cats[hover] ? Math.round((cats[hover].value / (total || 1)) * 100) + "%" : ""
  return (
    <svg className="mfl-svg mfl-donut" viewBox="0 0 64 64" width={64} height={64} role="img" aria-label="Category split" onPointerLeave={() => setHover(-1)}>
      <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="9" />
      {arcs.map((a, i) =>
        a.len > 0 ? (
          <circle
            key={i}
            cx="32"
            cy="32"
            r="24"
            fill="none"
            pathLength={100}
            stroke={cats[i]?.color || colors[i % colors.length] || "#efe9df"}
            strokeWidth={hover === i ? 11 : 9}
            strokeDasharray={a.len + " " + (100 - a.len)}
            strokeDashoffset={-a.start}
            transform="rotate(-90 32 32)"
            className={"mfl-arc" + (hover >= 0 && hover !== i ? " is-dim" : "")}
            onPointerEnter={() => setHover(i)}
          />
        ) : null,
      )}
      <text x="32" y="35.5" textAnchor="middle" className="mfl-donut-t">
        {shown}
      </text>
    </svg>
  )
}

function StatCard({ card }: { card: HeroStatCard }) {
  const [pi, setPi] = React.useState(0)
  const [hover, setHover] = React.useState(-1)
  const p = card.periods[pi] || card.periods[0]
  if (!p) return null
  const up = p.change >= 0
  return (
    <article className="mfl-stat">
      <header className="mfl-stat-top">
        <div>
          <h3 className="mfl-stat-t">{card.title}</h3>
          <p className="mfl-stat-d">{p.range}</p>
        </div>
        <div className="mfl-stat-tools">
          <span className="mfl-ico" aria-hidden="true">
            <svg className="mfl-svg" viewBox="0 0 12 12" width={10} height={10}>
              <rect x="1.5" y="2.5" width="9" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
              <path d="M1.5 5H10.5M4 1.5V3.5M8 1.5V3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          </span>
          <MenuSelect label={card.title + " period"} options={card.periods.map((x) => x.label)} value={pi} onChange={(i) => (setPi(i), setHover(-1))} />
        </div>
      </header>
      <div className="mfl-stat-amt" key={pi}>
        {formatCount(p.amount, 0)}
      </div>
      <div className="mfl-stat-chg">
        <span className={"mfl-chg" + (up ? "" : " is-down")}>
          <Arrow up={up} />
          {Math.abs(p.change).toFixed(1)}%
        </span>
        <span>{p.versus}</span>
      </div>
      <div className="mfl-stat-split">
        <Donut cats={p.categories} hover={hover} setHover={setHover} colors={CAT_COLORS} />
        <div className="mfl-legend">
          <p className="mfl-legend-h">All categories</p>
          <ul>
            {p.categories.slice(0, 4).map((c, i) => (
              <li
                key={c.label}
                className={hover >= 0 && hover !== i ? "is-dim" : ""}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(-1)}
              >
                <i style={{ background: c.color || CAT_COLORS[i % CAT_COLORS.length] }} />
                <span>{c.label}</span>
                <b>{formatCount(c.value, 0)}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// the hero
// ---------------------------------------------------------------------------

const HERO_CSS = `
.mfl-root{position:relative;color:var(--mfl-ink);overflow-x:clip;font-family:"Inter Tight","Inter","Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;line-height:1.4}
.mfl-root :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:inherit}
.mfl-root :where(a){color:inherit;text-decoration:none}
.mfl-root :where(p,h1,h3,ul){margin:0;padding:0}
.mfl-root :where(ul){list-style:none}
.mfl-root :where(button,a,[tabindex]):focus-visible{outline:2px solid var(--mfl-glow);outline-offset:2px;border-radius:6px}
.mfl-svg{display:block;max-width:none;flex:none}

/* ---- buttons ---- */
.mfl-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 22px;border-radius:3px;font-size:14px;font-weight:500;letter-spacing:-.01em;transition:transform .25s cubic-bezier(.2,.8,.2,1),background-color .25s,box-shadow .25s,color .25s;white-space:nowrap}
.mfl-btn:active{transform:scale(.97)}
.mfl-btn--brand{background:var(--mfl-brand);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 1px 2px rgba(0,0,0,.18)}
.mfl-btn--brand:hover{background:color-mix(in srgb,var(--mfl-brand) 86%,#000);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 8px 22px -8px color-mix(in srgb,var(--mfl-brand) 70%,transparent)}
.mfl-btn--white{background:#fff;color:var(--mfl-ink);box-shadow:0 1px 2px rgba(0,0,0,.08)}
.mfl-btn--white:hover{box-shadow:0 8px 22px -10px rgba(0,0,0,.35)}

/* ---- hero ---- */
.mfl-hero{position:relative;display:flex;flex-direction:column;background:var(--mfl-paper);overflow:hidden;isolation:isolate}
.mfl-circuit-wrap{position:absolute;inset:0;z-index:0;pointer-events:none}
.mfl-circuit{position:absolute;inset:0;width:100%;height:100%}
.mfl-trace{fill:none;stroke:var(--mfl-ink);stroke-opacity:.13;stroke-width:1.4}
.mfl-pulse{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-dasharray:70 930;animation:mfl-run 6s linear infinite}
.mfl-chip{filter:drop-shadow(0 5px 10px rgba(20,30,16,.14))}
.mfl-chip rect{fill:var(--mfl-cream);stroke:var(--mfl-brand);stroke-opacity:.5;stroke-width:1.4;transition:fill .3s,stroke .3s,stroke-opacity .3s}
.mfl-chip text{font-size:13px;fill:var(--mfl-brand);fill-opacity:.6;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;transition:fill .3s,fill-opacity .3s}
.mfl-chip.is-hot rect{fill:var(--mfl-brand);stroke:var(--mfl-brand);stroke-opacity:1}
.mfl-chip.is-hot text{fill:var(--mfl-cream);fill-opacity:.95}
.mfl-float-tile{position:absolute;z-index:3;top:34%;right:14%;width:46px;height:46px;display:grid;place-items:center;border-radius:9px;background:linear-gradient(180deg,#fff,#f1ede6);box-shadow:0 1px 0 #fff inset,0 14px 30px -12px rgba(20,30,16,.45),0 0 0 1px rgba(0,0,0,.04);animation:mfl-bob 5s ease-in-out infinite}
.mfl-float-tile span{display:block;transition:transform .6s cubic-bezier(.3,1.6,.4,1)}
.mfl-float-tile:hover{box-shadow:0 1px 0 #fff inset,0 18px 34px -12px rgba(20,30,16,.55),0 0 0 1px color-mix(in srgb,var(--mfl-brand) 40%,transparent)}
.mfl-hero-head{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding:72px 20px 0}
.mfl-backer{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--mfl-ink);margin-bottom:22px}
.mfl-backer b{font-weight:500}
.mfl-backer-mark{display:inline-grid;place-items:center;width:16px;height:16px;border-radius:2px;background:var(--mfl-brand);color:#fff;font-size:10px;font-weight:700;margin-left:2px}
.mfl-h1{font-size:clamp(42px,6.2vw,92px);line-height:.98;font-weight:400;letter-spacing:-.055em;color:var(--mfl-ink)}
.mfl-line{display:block}
.mfl-mute{color:var(--mfl-muted)}
.mfl-h1 .mfl-line:nth-child(1){animation-delay:120ms}
.mfl-h1 .mfl-line:nth-child(2){animation-delay:190ms}
.mfl-sub{max-width:340px;margin-top:22px;font-size:14px;line-height:1.45;color:var(--mfl-muted)}
.mfl-cta-row{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:22px}
.mfl-in{animation:mfl-rise .9s cubic-bezier(.2,.8,.2,1) backwards}
.mfl-stage{position:relative;flex:1;min-height:360px;display:flex;flex-direction:column;justify-content:flex-end}
.mfl-device{position:absolute;z-index:1;left:50%;bottom:24px;width:clamp(230px,24vw,330px);aspect-ratio:1;transform:translateX(-50%);perspective:900px;--mfl-rx:0deg;--mfl-ry:0deg}
.mfl-device-btn{position:relative;display:block;width:100%;height:100%;border-radius:40%;transform:rotateX(var(--mfl-rx)) rotateY(var(--mfl-ry));transform-style:preserve-3d;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.mfl-device-btn:active{transform:rotateX(var(--mfl-rx)) rotateY(var(--mfl-ry)) scale(.96)}
.mfl-device-logo{position:absolute;left:50%;top:50%;width:56%;height:auto;transform:translate(-50%,-50%);pointer-events:none}
.mfl-device-float{display:block;width:100%;height:100%;animation:mfl-float 6s ease-in-out infinite,mfl-drop 1.1s cubic-bezier(.2,.8,.2,1) .2s backwards}
.mfl-device-svg{width:100%;height:100%;filter:drop-shadow(0 30px 30px rgba(20,30,16,.28)) drop-shadow(0 6px 8px rgba(20,30,16,.18))}
.mfl-device-shadow{position:absolute;left:18%;right:18%;bottom:-6%;height:12%;border-radius:50%;background:radial-gradient(closest-side,rgba(20,30,16,.32),transparent);z-index:-1;animation:mfl-shadow 6s ease-in-out infinite}
.mfl-led{animation:mfl-led 1.6s ease-out}
.mfl-callout{position:absolute;left:-34%;top:16%;display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 11px;border-radius:999px;background:rgba(255,255,255,.72);backdrop-filter:blur(8px);box-shadow:0 10px 24px -14px rgba(20,20,10,.5),0 0 0 1px rgba(0,0,0,.04);font-size:11.5px;color:var(--mfl-ink);white-space:nowrap;animation:mfl-bob 7s ease-in-out infinite,mfl-rise .9s cubic-bezier(.2,.8,.2,1) .9s backwards;pointer-events:none}
.mfl-rings{position:absolute;left:50%;bottom:calc(24px + clamp(230px,24vw,330px)/2);width:0;height:0;z-index:0}
.mfl-rings i{position:absolute;left:-160px;top:-160px;width:320px;height:320px;border-radius:50%;border:1px solid color-mix(in srgb,var(--mfl-brand) 45%,transparent);opacity:0;animation:mfl-ring 1.8s cubic-bezier(.2,.8,.2,1)}
.mfl-rings i:nth-child(2){animation-delay:.18s}
.mfl-rings i:nth-child(3){animation-delay:.36s}
.mfl-hero-foot{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding:0 20px 20px}
.mfl-hero-foot{pointer-events:none}
.mfl-hero-foot>*{pointer-events:auto}
.mfl-info{max-width:380px}
.mfl-info-k{display:flex;align-items:center;gap:6px;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--mfl-muted);margin-bottom:12px}
.mfl-info-t{font-size:clamp(17px,1.55vw,22px);line-height:1.18;letter-spacing:-.025em;color:var(--mfl-ink)}
.mfl-info-t .mfl-line{display:inline}
.mfl-cards{display:flex;gap:8px}

/* ---- hero stat cards ---- */
/* The surface (background, shadow, hover pixel reveal) comes from the
   PixelCard wrapper; the stat itself is transparent content. */
.mfl-stat{width:100%;padding:14px;border-radius:12px;background:transparent;color:var(--mfl-cream)}
.mfl-stat-top{display:flex;justify-content:space-between;gap:8px}
.mfl-stat-t{font-size:12px;font-weight:500;letter-spacing:-.01em}
.mfl-stat-d{font-size:9.5px;opacity:.55;margin-top:2px}
.mfl-stat-tools{display:flex;align-items:flex-start;gap:4px}
.mfl-ico{display:grid;place-items:center;width:22px;height:22px;border-radius:4px;background:rgba(255,255,255,.08)}
.mfl-stat-amt{font-size:22px;letter-spacing:-.03em;margin-top:12px;animation:mfl-swap .45s cubic-bezier(.2,.8,.2,1)}
.mfl-stat-chg{display:flex;align-items:center;gap:6px;font-size:10px;margin-top:6px;color:color-mix(in srgb,var(--mfl-cream) 60%,transparent)}
.mfl-chg{display:inline-flex;align-items:center;gap:4px;padding:3px 6px;border-radius:3px;background:color-mix(in srgb,var(--mfl-brand) 70%,#fff 6%);color:#fff;font-weight:500}
.mfl-chg.is-down{background:rgba(255,255,255,.1)}
.mfl-stat-split{display:flex;align-items:center;gap:12px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07)}
.mfl-donut{flex:none}
.mfl-arc{transition:stroke-width .25s,opacity .25s;cursor:pointer}
.mfl-arc.is-dim{opacity:.35}
.mfl-donut-t{font-size:9px;fill:var(--mfl-cream);font-weight:500}
.mfl-legend{flex:1;min-width:0}
.mfl-legend-h{font-size:9.5px;font-weight:500;margin-bottom:5px}
.mfl-legend ul{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px}
.mfl-legend li{display:grid;grid-template-columns:6px 1fr;column-gap:5px;font-size:8.5px;line-height:1.25;transition:opacity .25s;cursor:default}
.mfl-legend li.is-dim{opacity:.35}
.mfl-legend li i{width:6px;height:6px;border-radius:50%;margin-top:2px}
.mfl-legend li span{opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mfl-legend li b{grid-column:2;font-weight:500}

/* ---- menu select ---- */
.mfl-menu{position:relative}
.mfl-menu-btn{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 7px;border-radius:4px;font-size:10px;white-space:nowrap;transition:background-color .2s;background:rgba(255,255,255,.1);color:var(--mfl-cream)}
.mfl-menu-btn:hover{background:rgba(255,255,255,.18)}
.mfl-chev{transition:transform .25s}
.mfl-chev.is-open{transform:rotate(180deg)}
.mfl-menu-list{position:absolute;right:0;top:calc(100% + 4px);z-index:20;min-width:120px;padding:4px;border-radius:7px;outline:none;animation:mfl-pop .2s cubic-bezier(.2,.8,.2,1);transform-origin:top right;background:#121d17;color:var(--mfl-cream);box-shadow:0 16px 40px -10px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.06)}
.mfl-menu-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 8px;border-radius:4px;font-size:11px;cursor:pointer}
.mfl-menu-opt.is-active{background:rgba(255,255,255,.08)}
.mfl-live{width:6px;height:6px;border-radius:50%;background:#7bd389;box-shadow:0 0 0 0 rgba(123,211,137,.6);animation:mfl-ping 2s infinite}

/* ---- keyframes ---- */
@keyframes mfl-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes mfl-pop{from{opacity:0;transform:scale(.94) translateY(-4px)}to{opacity:1;transform:none}}
@keyframes mfl-swap{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes mfl-run{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
@keyframes mfl-bob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(3deg)}}
@keyframes mfl-float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(1.5deg)}}
@keyframes mfl-shadow{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.86);opacity:.7}}
@keyframes mfl-drop{from{opacity:0;transform:translateY(60px) scale(.9) rotate(-8deg)}to{opacity:1;transform:none}}
@keyframes mfl-led{0%{opacity:.35}25%{opacity:1;filter:brightness(1.6)}100%{opacity:1}}
@keyframes mfl-ring{0%{opacity:.9;transform:scale(.6)}100%{opacity:0;transform:scale(2.4)}}
@keyframes mfl-ping{0%{box-shadow:0 0 0 0 rgba(123,211,137,.6)}80%,100%{box-shadow:0 0 0 7px rgba(123,211,137,0)}}
@keyframes mfl-spin{to{transform:rotate(360deg)}}

/* ---- small screens ---- */
@media (max-width:980px){
.mfl-hero-foot{flex-direction:column;align-items:stretch}
.mfl-cards{overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:4px;margin:0 -20px;padding-left:20px;padding-right:20px}
.mfl-cards>*{flex:none;scroll-snap-align:start}
.mfl-stage{min-height:0;padding-top:clamp(250px,40vw,360px)}
.mfl-device{top:20px;bottom:auto}
.mfl-rings{bottom:auto;top:calc(20px + clamp(230px,24vw,330px)/2)}
.mfl-float-tile{display:none}
}
@media (max-width:640px){
.mfl-hero-head{padding-top:64px}
.mfl-callout{left:-10%;top:-6%}
}

/* ---- reduced motion ---- */
@media (prefers-reduced-motion:reduce){
.mfl-root *,.mfl-root *::before,.mfl-root *::after{animation:none !important;transition:none !important}
}
`

type PointerEv = React.PointerEvent<HTMLElement>

export function CircuitHero() {
  const { openLeadModal } = useLeadModal()
  const uid = React.useId().replace(/:/g, "")
  const reduced = useReducedMotion()
  const heroRef = React.useRef(null as HTMLElement | null)
  const svgWrapRef = React.useRef(null as HTMLDivElement | null)
  const deviceRef = React.useRef(null as HTMLDivElement | null)

  const [hotChip, setHotChip] = React.useState(-1)
  const [pulse, setPulse] = React.useState(0)
  const [spin, setSpin] = React.useState(0)

  // ---- hero pointer: tilt the device, light the nearest chip --------------
  const centers = React.useMemo(chipCenters, [])
  const onHeroMove = (e: PointerEv) => {
    if (e.pointerType === "touch") return
    const dev = deviceRef.current
    const hero = heroRef.current
    if (dev && hero && !reduced) {
      const r = hero.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      dev.style.setProperty("--mfl-rx", (-ny * 18).toFixed(2) + "deg")
      dev.style.setProperty("--mfl-ry", (nx * 24).toFixed(2) + "deg")
    }
    const box = svgWrapRef.current
    if (!box) return
    const b = box.getBoundingClientRect()
    // undo preserveAspectRatio="xMidYMid slice"
    const s = Math.max(b.width / 1440, b.height / 900)
    const vx = (e.clientX - b.left - (b.width - 1440 * s) / 2) / s
    const vy = (e.clientY - b.top - (b.height - 900 * s) / 2) / s
    let best = -1
    let bestD = 90
    centers.forEach((c, i) => {
      const d = Math.hypot(c.x - vx, c.y - vy)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    if (best !== hotChip) setHotChip(best)
  }
  const onHeroLeave = () => {
    setHotChip(-1)
    deviceRef.current?.style.setProperty("--mfl-rx", "0deg")
    deviceRef.current?.style.setProperty("--mfl-ry", "0deg")
  }

  const press = () => {
    setPulse((p) => p + 1)
    setSpin((s) => s + 1)
  }

  const rootStyle = {
    "--mfl-brand": PAL.brand,
    "--mfl-paper": PAL.paper,
    "--mfl-ink": PAL.ink,
    "--mfl-muted": PAL.muted,
    "--mfl-night": PAL.night,
    "--mfl-card": PAL.card,
    "--mfl-cream": PAL.cream,
    "--mfl-device": PAL.device,
    "--mfl-glow": PAL.glow,
  } as React.CSSProperties

  const two = (s: string, cls = "") =>
    s.split("\n").map((line, li) => (
      <span className={"mfl-line " + cls} key={li}>
        {parseEmphasis(line).map((seg, si) => (
          <span key={si} className={seg.muted ? "mfl-mute" : undefined}>
            {seg.text}
          </span>
        ))}
      </span>
    ))

  return (
    <div className="mfl-root" style={rootStyle}>
      <style>{HERO_CSS}</style>

      <header
        ref={heroRef}
        className="mfl-hero"
        style={{ minHeight: "max(680px, calc(100svh - 64px))" }}
        onPointerMove={onHeroMove}
        onPointerLeave={onHeroLeave}
      >
        <div className="mfl-circuit-wrap" ref={svgWrapRef}>
          <CircuitBoard uid={uid} reduced={reduced} hot={hotChip} />
        </div>

        <button type="button" className="mfl-float-tile" aria-label="Send a signal to the device" onClick={press}>
          <span style={{ transform: "rotate(" + spin * 60 + "deg)" }}>
            <Asterisk size={20} color={PAL.ink} />
          </span>
        </button>

        <div className="mfl-hero-head">
          <p className="mfl-backer mfl-in" style={{ animationDelay: "60ms" }}>
            Backed by
            <span className="mfl-backer-mark" aria-hidden="true">
              N
            </span>
            <b>Nesto Group</b>
          </p>
          <h1 className="mfl-h1">{two("Enterprise-Ready *SAP*\nConsultants", "mfl-in")}</h1>
          <p className="mfl-sub mfl-in" style={{ animationDelay: "260ms" }}>
            Train like a delivery consultant — live S/4HANA systems, scenario labs every module,
            and a capstone project you defend.
          </p>
          <div className="mfl-cta-row mfl-in" style={{ animationDelay: "340ms" }}>
            <button type="button" className="mfl-btn mfl-btn--brand" onClick={() => openLeadModal({ intent: "demo" })}>
              Book a Free Consultation
            </button>
            <Link className="mfl-btn mfl-btn--white" href="/courses">
              Explore all tracks
            </Link>
          </div>
        </div>

        <div className="mfl-stage">
          <div className="mfl-rings" key={pulse} aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="mfl-device" ref={deviceRef}>
            <button type="button" className="mfl-device-btn" aria-label="Press the device" onClick={press}>
              <span className="mfl-device-float">
                <Device uid={uid} pulse={pulse} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="mfl-device-logo" src="/logo.png?v=3" alt="" />
              </span>
            </button>
            <span className="mfl-device-shadow" aria-hidden="true" />
            <span className="mfl-callout" aria-hidden="true">
              <span className="mfl-live" />
              {pulse ? "Synced just now" : "Live S/4HANA · week one"}
            </span>
          </div>

          <div className="mfl-hero-foot">
            <div className="mfl-info mfl-in" style={{ animationDelay: "480ms" }}>
              <p className="mfl-info-k">
                <Asterisk size={10} /> /live/
              </p>
              <p className="mfl-info-t">
                {two("Cohorts capped at 20–30 so everyone gets *reviewed, every single week.")}
              </p>
            </div>
            <div className="mfl-cards mfl-in" style={{ animationDelay: "560ms" }}>
              {STAT_CARDS.slice(0, 2).map((c, i) => (
                <PixelCard
                  key={c.title + i}
                  colors={["#244634", "#2f5640", "#58cb3f"]}
                  glowColor="#7ddd61"
                  shape="square"
                  origin="pointer"
                  gap={6}
                  pixelSize={3}
                  speed={28}
                  revealDuration={500}
                  spotlight={0.45}
                  glow={0.45}
                  opacity={0.55}
                  fade={0.75}
                  trigger="hover"
                  radius={14}
                  clickPulse
                  theme="dark"
                  className="mfl-pixel-stat"
                  style={{
                    width: 272,
                    height: "auto",
                    background: "linear-gradient(180deg,#1c2c22 0%,#121d17 100%)",
                  }}
                >
                  <StatCard card={c} />
                </PixelCard>
              ))}
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
