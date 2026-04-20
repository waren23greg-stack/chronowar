// ============================================================
//  CHRONOWAR — Narrative Service
// ============================================================
import { buildPrompt } from "./engine";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function generateNarration(info, ctx) {
  const prompt = buildPrompt(info, ctx);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
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
