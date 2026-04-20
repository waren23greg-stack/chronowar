// ============================================================
//  CHRONOWAR — Battle Chronicle Generator
//  Every game produces a unique epic narrative
// ============================================================

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// ── Varied fallback engine (for when API is unavailable) ──
const OPENING_ARCHETYPES = [
  (w, l) => `Before the first dawn of recorded time, the ${w} and the ${l} stood across the fractured timelines — armies of legend shaped from the very fabric of fate. Neither side would yield. Neither side could.`,
  (w, l) => `The seers spoke of it in whispers across three realms: a war that would not merely decide kingdoms, but rewrite the architecture of time itself. The ${w} heard the prophecy first. The ${l} refused to believe it.`,
  (w, l) => `When the Temporal Convergence aligned all three realms under a single sky, the ${w} and the ${l} met not as enemies, but as forces of nature — inevitable, ancient, and absolute.`,
  (w, l) => `There are wars written in stone, and wars written in fire. This war was written in light and shadow both — the ${w} bearing the radiance of a thousand suns, the ${l} carrying the cold weight of an eternal night.`,
  (w, l) => `The chronicles say the boards trembled when both armies assumed their positions. Across Past, Present, and Future, something fundamental shifted — as though the universe itself understood that what followed would leave a permanent mark.`,
];

const TURNING_POINT_ARCHETYPES = [
  (count, cap, cross) => `The war turned at move ${Math.floor(count / 3)} — a single decision that unravelled an entire flank. ${cap > 5 ? "The fallen were many; the board grew quieter with every sacrifice." : "Both sides had played conservatively, but the mask of patience finally slipped."} ${cross > 2 ? "The realm crossings had been breathtaking — warriors flickering between Past, Present, and Future like ghosts refusing to be bound." : ""}`,
  (count, cap, cross) => `For ${Math.floor(count / 2)} moves the balance held, each side matching the other's cunning move for move. Then the formation broke — not with a catastrophic blunder, but with a single piece placed one square too deep. ${cap > 8 ? "The captures had been relentless; whole bloodlines of warriors erased from the timeline." : ""} ${cross > 3 ? "Realm transcendences had torn the fabric of strategy open — moves appearing from timelines the opponent hadn't considered." : ""}`,
  (count, cap, cross) => `The middle game was a masterpiece of controlled chaos. ${cross > 4 ? `${cross} realm crossings reshaped the battlefield so profoundly that pieces fought in timelines they had never been meant to enter.` : "The three realms pulled at loyalties like gravity pulling at stars."} By move ${Math.floor(count * 0.6)}, the endgame had already been decided — only the pieces hadn't realised it yet.`,
];

const CHECKMATE_ARCHETYPES = [
  (w) => `The final move was not loud. There was no thunder, no divine pronouncement — just the quiet, irrevocable geometry of a King with nowhere left to go. The ${w} had not simply won a game. They had closed a chapter of eternity.`,
  (w) => `When the checkmate came, it arrived like the final word of an ancient poem — inevitable, perfect, devastating. The ${w} had seen it seven moves ahead. Their opponent had seen it three. That four-move gap was the difference between legend and ruin.`,
  (w) => `The ${w}'s King stood in the wreckage of the board like a monument, surrounded by the silence of a war that had finally ended. The last piece fell not with grief but with a kind of terrible beauty — the acknowledgment that this battle had been worthy of the cosmos that hosted it.`,
  (w) => `Checkmate was not a defeat. It was a completion. The ${w} had not destroyed their enemy — they had fulfilled the war's ancient purpose, writing the closing verse of a saga that would echo across all three realms until the timelines themselves unravelled.`,
];

const EPILOGUE_ARCHETYPES = [
  (w, l, count) => `After ${count} moves, the ${w} returned to their realm in silence. The ${l} dissolved back into the shadows of history. The three boards — Past, Present, Future — stood empty, waiting for the next war, the next chronicle, the next pair of armies brave enough to test the boundaries of time.`,
  (w, l, count) => `The Grand Chronicler sealed the tome. ${count} moves. Three realms. One winner. And yet — as the ink dried and the candles guttered — a strange peace settled over the timelines. The ${w} had won. But the ${l} had made them earn every single move of it.`,
  (w, l, count) => `Across all three realms, the memory of those ${count} moves burned like stars — brief, brilliant, permanent. The ${w} would be remembered. The ${l} would be remembered too, for a worthy adversary is as much a part of the legend as the victor. The chronicles would be sung until time itself forgot how to count.`,
  (w, l, count) => `The war that spanned Past, Present, and Future ended as all great wars do — not with celebration, but with a profound, aching quiet. ${count} moves. A universe of decisions. The ${w} carried their victory forward into a new age. The ${l} carried their defeat into legend. Both, in the end, are forms of immortality.`,
];

const TITLE_POOL = [
  (w, moves) => `The ${moves < 25 ? "Swift" : moves < 50 ? "Long" : "Eternal"} ${w === "Luminar Order" ? "Radiance" : "Darkness"}`,
  (w) => `When ${w === "Luminar Order" ? "Light Consumed Shadow" : "Shadow Swallowed the Dawn"}`,
  (w, moves) => `The ${moves}-Move ${w === "Luminar Order" ? "Enlightenment" : "Eclipse"}`,
  () => "The War Across Three Realms",
  (w) => `${w === "Luminar Order" ? "Auris Triumphant" : "Vex'rath's Ascendancy"}`,
  (w) => `The ${w === "Luminar Order" ? "Luminar Conquest" : "Umbral Reckoning"}`,
  (w, moves) => `${moves > 60 ? "The Century Chronicle" : moves > 40 ? "The Long Siege" : "The Swift Reckoning"}: A War of Three Realms`,
  (w) => `Fate's Final Verse — The ${w} War`,
];

function buildFallbackChronicle(winner, moveCount, gameStats = {}) {
  const w = winner === "white" ? "Luminar Order" : "Umbral Conclave";
  const l = winner === "white" ? "Umbral Conclave" : "Luminar Order";
  const cap = gameStats.captures || 0;
  const cross = gameStats.crossRealm || 0;
  const checks = gameStats.checks || 0;

  // Pick archetypes using game data as seed for variation
  const seed = (moveCount * 7 + cap * 3 + cross * 11 + checks * 5) % 4;
  const title = TITLE_POOL[seed % TITLE_POOL.length](w, moveCount);
  const opening = OPENING_ARCHETYPES[seed % OPENING_ARCHETYPES.length](w, l);
  const turning = TURNING_POINT_ARCHETYPES[(seed + 1) % TURNING_POINT_ARCHETYPES.length](moveCount, cap, cross);
  const checkmatePara = CHECKMATE_ARCHETYPES[(seed + 2) % CHECKMATE_ARCHETYPES.length](w);
  const epilogue = EPILOGUE_ARCHETYPES[(seed + 3) % EPILOGUE_ARCHETYPES.length](w, l, moveCount);

  // Dynamic middle section based on game stats
  const middleParts = [];
  if (checks > 0) middleParts.push(`The King was placed in check ${checks} time${checks > 1 ? "s" : ""} — each one a moment where the war's outcome balanced on a knife's edge, the armies holding their breath across all three timelines.`);
  if (cross > 5) middleParts.push(`${cross} realm transcendences shattered the conventional boundaries of the war — warriors flickering between amber Past, emerald Present, and violet Future as though the laws of time had become mere suggestions.`);
  if (cap > 10) middleParts.push(`${cap} pieces fell in that war — each one a named warrior, a legend in their own right, erased from the board but never from the chronicle. Their sacrifice shaped every move that followed.`);

  const body = [opening, turning, middleParts.join(" "), checkmatePara, epilogue]
    .filter(Boolean).join("\n\n");

  return { title, body };
}

// ── Main chronicle generator ──────────────────────────────
export async function generateBattleChronicle(storyLog, winner, moveCount, gameStats = {}) {
  const w = winner === "white" ? "the Luminar Order (light, radiant, noble)" : "the Umbral Conclave (shadow, ancient, ruthless)";
  const l = winner === "white" ? "the Umbral Conclave" : "the Luminar Order";

  // Build a rich verse summary from the story log
  const keyMoments = storyLog
    .slice()
    .reverse()
    .filter((e, i) => i < 20) // cap at 20 verses for prompt length
    .map((e) => `Move ${e.n} [${e.side === "white" ? "LUMINAR" : "UMBRAL"}]: ${e.t}`)
    .join("\n\n");

  const statsBlock = [
    `Total moves: ${moveCount}`,
    gameStats.captures  ? `Pieces captured: ${gameStats.captures}` : null,
    gameStats.crossRealm ? `Cross-realm transcendences: ${gameStats.crossRealm}` : null,
    gameStats.checks     ? `Times in check: ${gameStats.checks}` : null,
  ].filter(Boolean).join("\n");

  // Seed phrase to force unique story angles each game
  const angles = [
    "Focus on the rivalry between the two commanders — tell it as a personal duel of wills across time.",
    "Tell it from the perspective of a fallen piece — a soldier who witnessed the whole war from the ground.",
    "Frame it as a prophecy being fulfilled — every move was foretold, and the chronicle reveals how.",
    "Tell it as a mythological creation story — this war is why the three realms exist as they do today.",
    "Frame it as a tragedy — even the winner paid an enormous price, and the victory is bittersweet.",
    "Tell it as if the three realms themselves are sentient and chose a side — the landscape shaped the war.",
  ];
  const angle = angles[(moveCount + (gameStats.captures || 0)) % angles.length];

  const prompt = `You are the Grand Chronicler of CHRONOWAR — the keeper of all wars across the three realms of time.

A legendary war has just ended. Here is everything you know:

VICTOR: ${w}
DEFEATED: ${l}
${statsBlock}

NARRATIVE ANGLE FOR THIS CHRONICLE: ${angle}

KEY BATTLE VERSES (the actual moves as they were narrated):
${keyMoments || "The war was swift and the verses few — write of the silence between the moves."}

YOUR TASK: Write THE COMPLETE BATTLE CHRONICLE — a single flowing epic narrative unique to this exact game. Requirements:
- TITLE: a dramatic, specific title that reflects THIS game's character (not generic)
- Opening paragraph: both armies at the dawn of the war, evocative of the narrative angle
- 2–3 middle paragraphs: weave the key verses above into a coherent story arc, name specific pieces from the verses (use their full lore names), reference actual moves where possible
- Climax: the final confrontation and checkmate — make it feel like the inevitable end of a myth
- Epilogue: what the three realms became after this war — specific to who won
- Style: ancient myth, epic poetry, vivid and dramatic — NOT a chess commentary
- Length: 5–7 paragraphs
- IMPORTANT: Make this feel completely different from any other ChronoWar chronicle — use the narrative angle as your guiding voice

Respond in this exact format:
TITLE: [title here]

[full chronicle body — paragraphs separated by blank lines]`;

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
        max_tokens: 1400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = (data.content?.[0]?.text || "").trim();
    const titleMatch = text.match(/TITLE:\s*(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : null;
    const body = text.replace(/TITLE:\s*.+\n?/, "").trim();

    if (!title || !body || body.length < 100) throw new Error("Incomplete response");
    return { title, body };

  } catch (err) {
    console.warn("Chronicle API failed, using rich fallback:", err.message);
    return buildFallbackChronicle(winner, moveCount, gameStats);
  }
}
