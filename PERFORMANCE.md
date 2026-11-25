# Syvaxia — Performance, SEO & Launch Checklist

Verification status as of Phase 5 completion. Items marked ☐ require
credentials, content, or a live domain that only the site owner can supply.

## ✅ Already implemented (verified in code/build)

| Item | Status |
|---|---|
| Static prerender for every content route (RSC) | ✅ `/`, `/courses`, `/courses/[slug]` ×5, `/enterprise`, `/about`, `/advisor` all ○/● |
| Self-hosted fonts via `next/font` (`display: swap`, no Google CSS request) | ✅ Inter + Plus Jakarta Sans + JetBrains Mono |
| Floating AI advisor code-split, loaded on first open (`next/dynamic`, `ssr: false`) | ✅ |
| Edge runtime API route (advisor) with per-IP rate limiting | ✅ 429 after 8 req/10 min (tested) |
| JSON-LD: `EducationalOrganization`, `FAQPage` (home), `Course` + `FAQPage` (every course page) | ✅ verified in served HTML |
| `sitemap.xml` — 9 URLs, correct priorities | ✅ prerendered, tested |
| `robots.txt` — allows all, disallows `/api/`, points to sitemap | ✅ prerendered, tested |
| Canonical URLs + per-page metadata (title template, OG, Twitter card) | ✅ |
| Accessible interactive targets ≥ 44–48px, WCAG-AA palette, focus rings | ✅ |
| Honest-claims policy: ranges + disclosures, no guarantees | ✅ enforced in data files |
| Images: optimizer disabled for Cloudflare compatibility; assets pre-sized | ✅ |
| Lead pipeline: `POST /api/leads` (DB → syllabus ledger → Resend PDF → sales webhook → WhatsApp hand-off) | ✅ wired; validation + graceful-degradation paths tested |
| Enterprise pipeline: `POST /api/enterprise` (DB → emails → high-priority webhook) | ✅ wired; validation paths tested |
| Multi-step lead modal + gated syllabus + cohort builder → API wiring | ✅ |

## ☐ Owner launch checklist (requires your credentials/content)

### Content & assets
- [ ] Replace the WhatsApp placeholder (`919999999999`) in `.env` → `NEXT_PUBLIC_WHATSAPP_NUMBER`
- [ ] Drop the 5 syllabus PDFs into `public/syllabi/` (`sap-abap.pdf`, `sap-fico.pdf`, `sap-mm.pdf`, `sap-ewm.pdf`, `full-stack-java.pdf`)
- [ ] Review trainer names/bios in `src/data/courses.ts` (currently realistic placeholders)
- [ ] Verify salary bands in `src/data/career-paths.ts` against current aggregators
- [ ] Create a 1200×630 OG image (`public/og.png`) and update `layout.tsx` openGraph image — logo works but a purpose-built OG card converts better
- [ ] Add `app/favicon.ico` + `app/apple-icon.png`

### Infrastructure (all free tiers)
- [ ] Provision Neon project → set `DATABASE_URL` (pooled connection string)
- [ ] Resend: verify `syvaxia.com` domain (SPF/DKIM) → set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- [ ] Create Slack/Discord incoming webhook → set `SALES_WEBHOOK_URL` + type
- [ ] Google AI Studio → create Gemini API key → set `GEMINI_API_KEY`
- [ ] Push repo to GitHub → Cloudflare Pages project: build `npx @cloudflare/next-on-pages@1`, output `.vercel/output/static`, compatibility flag `nodejs_compat`
- [ ] Set all env vars in Cloudflare Pages project settings (Production + Preview)
- [ ] Cutover DNS → `syvaxia.com` on Cloudflare Pages, verify SSL
- [ ] Apply DB migrations: `npm run db:generate` committed; `npm run db:push` (or `drizzle-kit migrate`) against prod Neon

### Post-deploy QA
- [ ] Lighthouse (mobile, prod URL) ≥ 95 across all four categories — budget: LCP < 1.2 s on 4G, CLS < 0.01
- [ ] Submit sitemap in Google Search Console; request indexing for `/` + 5 course pages
- [ ] Test every form endpoint from a clean session (lead modal, syllabus gate, enterprise builder, advisor)
- [ ] Confirm Resend delivery < 5 s and webhook alert round-trip (PRD acceptance criterion #2)
- [ ] Verify `https://syvaxia.com/sitemap.xml` and `/robots.txt` on the production domain
- [ ] Stress-check advisor rate limit behaves per-IP at the edge

## Performance techniques applied (reference)

1. **RSC-first architecture** — interactivity isolated to small client components; content pages ship ~0 KB page JS beyond shared runtime.
2. **Font strategy** — `next/font` self-hosts and preloads three families with `display: swap`; zero external font requests, zero layout shift from font loading.
3. **Code splitting** — the AI advisor chat (~15 kB) is fetched only on first open of the floating widget.
4. **Edge APIs** — advisor runs on Cloudflare's edge runtime with the Neon HTTP driver pattern; no Node cold starts.
5. **No client-side data fetching for content** — all catalogs are compile-time TypeScript; filtering/search is client arithmetic.
6. **CSS** — single Tailwind stylesheet; animations are transform/opacity-only (`translateY`, `pulse`), no JS animation libraries.
