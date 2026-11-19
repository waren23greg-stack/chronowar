// ============================================================
//  CHRONOWAR — Narrative Service
//  Calls our /api/narrate proxy; the LLM key never reaches the browser.
// ============================================================
import { buildPrompt } from "./engine";

export async function generateNarration(info, ctx) {
  const prompt = buildPrompt(info, ctx);
  try {
    const res = await fetch("/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, maxTokens: 220 }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.text || null;
  } catch (err) {
    console.error("Narration error:", err);
    return null;
  }
}
