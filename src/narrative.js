// ============================================================
//  CHRONOWAR — Narrative Service
//  Calls Claude API to generate epic saga narration
// ============================================================

import { buildPrompt } from "./engine";

export async function generateNarration(info, ctx) {
  const prompt = buildPrompt(info, ctx);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 220,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text || null;
  } catch (err) {
    console.error("Narration error:", err);
    return null;
  }
}
