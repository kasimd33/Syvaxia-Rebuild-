import { getServerEnv } from "@/env";

/**
 * Instant sales webhook alerts (PRD Task 3.3).
 * Supports Slack, Discord, and a JSON bridge (e.g. a Google Sheets
 * Apps Script Web App). Dispatch is best-effort: failures are logged and
 * never block lead capture.
 */

export interface SalesAlert {
  title: string;
  subtitle?: string;
  fields: Array<{ label: string; value: string }>;
}

export async function dispatchSalesAlert(alert: SalesAlert): Promise<void> {
  let url: string;
  let type: "slack" | "discord" | "sheets";

  try {
    const env = getServerEnv();
    if (!env.SALES_WEBHOOK_URL) return;
    url = env.SALES_WEBHOOK_URL;
    type = env.SALES_WEBHOOK_TYPE;
  } catch {
    // Env not provisioned (e.g. static preview build) — skip silently.
    return;
  }

  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const text = [
    alert.title,
    alert.subtitle ? `_${alert.subtitle}_` : "",
    ...alert.fields.map((field) => `• *${field.label}:* ${field.value}`),
    `_${timestamp} IST_`,
  ]
    .filter(Boolean)
    .join("\n");

  let body: string;
  let contentType = "application/json";

  if (type === "discord") {
    body = JSON.stringify({ content: text });
  } else if (type === "slack") {
    body = JSON.stringify({ text });
  } else {
    // Sheets bridge: raw structured record for Apps Script to append.
    body = JSON.stringify({
      title: alert.title,
      subtitle: alert.subtitle ?? "",
      fields: alert.fields,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
    });
    if (!response.ok) {
      console.error(`[webhook] dispatch failed with HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("[webhook] dispatch failed:", error);
  }
}
