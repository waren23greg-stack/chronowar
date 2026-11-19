/* global process */
// Vercel serverless proxy: keeps the LLM API key server-side.
const MAX_PROMPT = 16000;
const MAX_TOKENS = 1200;
const REASONING_RESERVE = 500; // gpt-oss "thinking" tokens count toward max_tokens

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "Server key not configured" });

  const { prompt, maxTokens } = req.body || {};
  if (typeof prompt !== "string" || !prompt || prompt.length > MAX_PROMPT)
    return res.status(400).json({ error: "Invalid prompt" });

  const base = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
  const model = process.env.LLM_MODEL || "openai/gpt-oss-120b";
  const isGptOss = model.startsWith("openai/gpt-oss");
  const outTokens = Math.min(Number(maxTokens) || 300, MAX_TOKENS);

  try {
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        max_tokens: outTokens + (isGptOss ? REASONING_RESERVE : 0),
        ...(isGptOss ? { reasoning_effort: "low" } : {}),
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: `Upstream ${r.status}`, detail: (await r.text()).slice(0, 300) });
    const data = await r.json();
    return res.status(200).json({ text: data.choices?.[0]?.message?.content ?? null });
  } catch {
    return res.status(502).json({ error: "Upstream failure" });
  }
}
