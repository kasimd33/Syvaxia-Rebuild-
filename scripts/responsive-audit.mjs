// Responsive audit: screenshot key pages at mobile / tablet / desktop
// widths and report horizontal overflow (layout wider than viewport).
import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3100";
const OUT = "scripts/shots";
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  { path: "/", name: "home" },
  { path: "/courses", name: "courses" },
  { path: "/courses/sap-abap", name: "course-detail" },
  { path: "/enterprise", name: "enterprise" },
  { path: "/about", name: "about" },
];

const viewports = [
  { w: 375, h: 812, tag: "mobile" }, // iPhone-ish
  { w: 768, h: 1024, tag: "tablet" },
  { w: 1440, h: 900, tag: "desktop" },
];

const browser = await chromium.launch();
const issues = [];

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  for (const p of pages) {
    try {
      await page.goto(BASE + p.path, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1200); // let animations settle
      // horizontal overflow check
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        const docW = doc.scrollWidth;
        const vw = window.innerWidth;
        const wide = [];
        if (docW > vw + 1) {
          document.querySelectorAll("*").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.right > vw + 8 && r.width > 24 && !el.closest("[data-overflow-ok]")) {
              const cls = (el.className && typeof el.className === "string") ? el.className.slice(0, 60) : el.tagName;
              wide.push(`${el.tagName}.${cls} → right=${Math.round(r.right)}`);
            }
          });
        }
        return { docW, vw, wide: wide.slice(0, 6) };
      });
      const file = `${OUT}/${p.name}-${vp.tag}.png`;
      await page.screenshot({ path: file, fullPage: vp.tag === "mobile" });
      const flag = overflow.docW > overflow.vw + 1 ? "OVERFLOW" : "ok";
      issues.push({ page: p.name, vp: vp.tag, flag, docW: overflow.docW, vw: overflow.vw, wide: overflow.wide });
      console.log(`${p.name} [${vp.tag}] ${flag} (doc ${overflow.docW} vs viewport ${overflow.vw})`);
      if (overflow.wide.length) overflow.wide.forEach((w) => console.log("   ↳ " + w));
    } catch (e) {
      console.log(`${p.name} [${vp.tag}] ERROR ${e.message.slice(0, 80)}`);
      issues.push({ page: p.name, vp: vp.tag, flag: "ERROR", error: e.message.slice(0, 200) });
    }
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(issues, null, 2));
console.log("\nDone. Screenshots in " + OUT);
