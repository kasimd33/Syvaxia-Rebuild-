/**
 * Generates the five gated syllabus PDFs into public/syllabi/ from the
 * canonical course data. Placeholder-quality typeset documents (Helvetica,
 * no dependencies) — replace with designed brand PDFs before launch if
 * desired; the pipeline reads whatever file sits at the syllabusFile path.
 *
 * Run: node scripts/generate-syllabi.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { courses } from "../src/data/courses.ts";

const OUT_DIR = join(import.meta.dirname, "..", "public", "syllabi");

// ─── Minimal PDF writer (Helvetica, multi-page) ─────────────────────────────

function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Wrap plain text at ~92 characters so it fits 10pt Helvetica at 50pt margin. */
function wrap(text: string, width = 92): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > width) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.length > 0 ? lines : [""];
}

interface StyledLine {
  text: string;
  /** Heading sizes: 20 (title), 13 (section), 9 (meta/normal). */
  size: number;
  gapBefore: number;
}

function buildCourseLines(course: (typeof courses)[number]): StyledLine[] {
  const lines: StyledLine[] = [];
  const push = (text: string, size = 9, gapBefore = 2) => {
    for (const [index, wrapped] of wrap(text).entries()) {
      lines.push({ text: index > 0 ? `  ${wrapped}` : wrapped, size, gapBefore: index === 0 ? gapBefore : 0 });
    }
  };

  push(course.title.toUpperCase(), 16, 0);
  push(`${course.tagline}`, 10, 4);
  push("", 9, 2);
  push(
    `${course.durationWeeks} weeks · ${course.hoursPerWeek} hrs/week · ${course.modules.length} modules · Level: ${course.level} · Language: ${course.language}`,
    9,
    4,
  );
  push(
    `Delivery: ${course.deliveryModes.join(", ")} · Live system access: ${course.liveSystemAccess ? "Yes" : "No"}`,
    9,
    0,
  );

  push("RECOMMENDED FOR", 12, 14);
  for (const item of course.recommendedFor) push(`- ${item}`, 9, 2);

  push("PREREQUISITES", 12, 12);
  for (const item of course.prerequisites) push(`- ${item}`, 9, 2);

  push("TOOLS & ENVIRONMENT", 12, 12);
  push(course.tools.join(" · "), 9, 2);

  push("TARGET ROLES", 12, 12);
  push(course.roles.join(" · "), 9, 2);

  push("CURRICULUM", 12, 14);
  for (const module of course.modules) {
    push(`${module.code} — ${module.title} (${module.weeks} ${module.weeks === 1 ? "week" : "weeks"})`, 10, 8);
    for (const topic of module.topics) push(`   · ${topic}`, 9, 1);
    if (module.lab) push(`   Lab: ${module.lab}`, 9, 1);
  }

  push("CAPSTONE PROJECT", 12, 14);
  push(course.capstone.title, 10, 2);
  push(course.capstone.description, 9, 2);
  for (const deliverable of course.capstone.deliverables) push(`- ${deliverable}`, 9, 1);

  push("TRAINER", 12, 14);
  push(`${course.trainer.name} — ${course.trainer.role}, ${course.trainer.yearsExperience} years`, 10, 2);
  push(course.trainer.bio, 9, 2);
  for (const credential of course.trainer.credentials) push(`- ${credential}`, 9, 1);

  push("UPCOMING COHORTS", 12, 14);
  for (const cohort of course.cohorts) {
    push(
      `- Starts ${cohort.startDate} · ${cohort.timing} · ${cohort.mode} · ${cohort.seatsLeft}/${cohort.seatsTotal} seats left (${cohort.status})`,
      9,
      2,
    );
  }

  push("", 9, 10);
  push(
    "Syvaxia does not offer job or salary guarantees. Cohort seats are confirmed on first-come, first-serve basis.",
    8,
    4,
  );
  push("Questions? WhatsApp us or visit syvaxia.com — Where passion meets innovation.", 8, 2);

  return lines;
}

function buildPdf(lines: StyledLine[]): Uint8Array {
  // Paginate: each page ~660pt of usable height; estimate line height = size * 1.5 + gap.
  const pages: StyledLine[][] = [];
  let current: StyledLine[] = [];
  let used = 0;
  const pageHeight = 680;
  for (const line of lines) {
    const height = line.size * 1.45 + line.gapBefore;
    if (used + height > pageHeight && current.length > 0) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(line);
    used += height;
  }
  if (current.length > 0) pages.push(current);

  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentIds: number[] = [];
  // Layout: 1 = catalog, 2 = pages tree, then per page: page obj + content obj, last = font.
  const fontId = 3 + pages.length * 2;

  const contentStreams = pages.map((page) => {
    let stream = "BT\n";
    let y = 792 - 60;
    for (const line of page) {
      y -= line.gapBefore + line.size * 1.45;
      stream += `/F1 ${line.size} Tf 1 0 0 1 50 ${y.toFixed(1)} Tm (${escapePdfText(line.text)}) Tj\n`;
    }
    stream += "ET";
    return stream;
  });

  for (let i = 0; i < pages.length; i++) {
    pageObjectIds.push(3 + i * 2);
    contentIds.push(4 + i * 2);
  }

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  for (let i = 0; i < pages.length; i++) {
    objects[pageObjectIds[i]!] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ` +
      `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`;
    objects[contentIds[i]] = `<< /Length ${contentStreams[i]!.length} >>\nstream\n${contentStreams[i]}\nendstream`;
  }
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefStart = pdf.length;
  const maxId = objects.length;
  pdf += `xref\n0 ${maxId}\n0000000000 65535 f \n`;
  for (let id = 1; id < maxId; id++) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxId} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

// ─── Generate ───────────────────────────────────────────────────────────────

mkdirSync(OUT_DIR, { recursive: true });

for (const course of courses) {
  const filename = course.syllabusFile.split("/").pop()!;
  const pdf = buildPdf(buildCourseLines(course));
  writeFileSync(join(OUT_DIR, filename), pdf);
  console.log(`✓ ${filename} — ${(pdf.length / 1024).toFixed(1)} kB, ${course.modules.length} modules`);
}

console.log(`\nDone: ${courses.length} syllabi written to public/syllabi/`);
