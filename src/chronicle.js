// ============================================================
//  CHRONOWAR — Battle Chronicle
//  After checkmate, Claude writes the full war as one epic story
// ============================================================

export async function generateBattleChronicle(storyLog, winner, moveCount) {
  const verses = storyLog
    .slice()
    .reverse()
    .map((e, i) => `Move ${e.n}: ${e.t}`)
    .join("\n\n");

  const prompt = `You are the Grand Chronicler of CHRONOWAR. A legendary war across three realms of time has ended.

WINNER: ${winner === "white" ? "The Luminar Order (light)" : "The Umbral Conclave (shadow)"}
TOTAL MOVES: ${moveCount}
LOSER: ${winner === "white" ? "The Umbral Conclave" : "The Luminar Order"}

THE WAR VERSES (each move narrated):
${verses}

Now write THE COMPLETE BATTLE CHRONICLE — a single, flowing epic narrative of this entire war. It must:
- Have a dramatic title (e.g. "The Fall of the Void Empress" or "When the Oracle Crossed Time")  
- Open with an epic scene-setting paragraph describing both armies at the dawn of war
- Weave together the key moments from the verses above into a cohesive story
- Build to a climactic final battle around the checkmate
- End with an epilogue about what happened to the three realms after the war
- Be written in the style of ancient myth and epic poetry — vivid, dramatic, timeless
- Total length: 5–8 paragraphs

Format your response as:
TITLE: [title here]

[full chronicle text]`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const titleMatch = text.match(/TITLE:\s*(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : "The Chronicle of the Three Realms";
    const body = text.replace(/TITLE:\s*.+\n?/, "").trim();
    return { title, body };
  } catch (err) {
    console.error("Chronicle error:", err);
    return {
      title: "The Chronicle of the Three Realms",
      body: `In the age before memory, two great orders clashed across the rivers of time itself. The ${winner === "white" ? "Luminar Order" : "Umbral Conclave"} emerged victorious after ${moveCount} legendary moves, their chronicles to be sung across eternity.`,
    };
  }
}
