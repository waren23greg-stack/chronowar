// ============================================================
//  CHRONOWAR — Game Engine
//  3-Realm Narrative Chess Variant
// ============================================================

export const BS = 6;
export const REALMS = ["past", "present", "future"];
export const COLS = ["a", "b", "c", "d", "e", "f"];

export const REALM_CFG = {
  past: {
    name: "PAST ECHOES",
    subtitle: "Where strategies are born",
    icon: "⏳",
    // Board squares — aged parchment / sepia ink
    light:    "#d9c49a",
    dark:     "#9e7a44",
    // Highlight states
    lastFrom: "#c8a855",
    lastTo:   "#e8c040",
    selBg:    "#f0d060",
    selRing:  "#7a5010",
    moveDot:  "#5a3808",
    crossDot: "#c07010",
    capRing:  "#8b2010",
    // Panel / border
    glow:     "#c89030",
    text:     "#6b3f0a",
    border:   "rgba(130,90,30,.6)",
    bg:       "rgba(98,54,0,.18)",
    particleColor: "#c89030",
    // Map skin vars
    mapTint:  "rgba(180,130,50,.12)",
    inkColor: "#5a3808",
  },
  present: {
    name: "THE LIVING WAR",
    subtitle: "The eternal battleground",
    icon: "⚔",
    // Board squares — forest/military map green
    light:    "#b8c98a",
    dark:     "#6a8848",
    lastFrom: "#9ab855",
    lastTo:   "#c8d840",
    selBg:    "#d4e055",
    selRing:  "#3a5510",
    moveDot:  "#2a4008",
    crossDot: "#608018",
    capRing:  "#8b1010",
    glow:     "#6a9030",
    text:     "#2a4a08",
    border:   "rgba(60,100,30,.55)",
    bg:       "rgba(0,54,20,.18)",
    particleColor: "#6a9030",
    mapTint:  "rgba(80,130,40,.1)",
    inkColor: "#2a4008",
  },
  future: {
    name: "FATE'S SHADOW",
    subtitle: "Destiny yet unwritten",
    icon: "✧",
    // Board squares — aged indigo / blueprint map
    light:    "#b8a8d8",
    dark:     "#6848a0",
    lastFrom: "#9878c8",
    lastTo:   "#c8a0f0",
    selBg:    "#d8b8ff",
    selRing:  "#3a1870",
    moveDot:  "#2a0858",
    crossDot: "#8030c0",
    capRing:  "#8b1050",
    glow:     "#8848c0",
    text:     "#3a1870",
    border:   "rgba(100,50,160,.55)",
    bg:       "rgba(40,0,80,.18)",
    particleColor: "#8848c0",
    mapTint:  "rgba(100,60,180,.1)",
    inkColor: "#2a0858",
  },
};

export const SYMBOLS = {
  W_K: "♔", W_Q: "♕", W_R: "♖", W_B: "♗", W_N: "♘",
  W_P: "♙", W_S: "✦", W_X: "◈",
  B_K: "♚", B_Q: "♛", B_R: "♜", B_B: "♝", B_N: "♞",
  B_P: "♟", B_S: "✧", B_X: "◉",
};

export const LORE = {
  W_K: "Monarch Auris the Eternal",
  W_Q: "Lady Solenne, Weaver of Time",
  W_R: "Pillar of Dawn",
  W_B: "Temporal Seer",
  W_N: "Chronorider",
  W_P: "Timewarden",
  W_S: "The Oracle",
  W_X: "Phase Walker",
  B_K: "Lich-Lord Vex'rath",
  B_Q: "Void Empress Nythera",
  B_R: "Shadow Bastion",
  B_B: "Dark Prelate",
  B_N: "Void Rider",
  B_P: "Entropy Herald",
  B_S: "Decay Oracle",
  B_X: "Shadow Phaser",
};

export const PIECE_DESC = {
  W_K: "Sovereign — moves 1 any direction, crosses realms",
  W_Q: "Sovereign Mage — slides any direction, unlimited",
  W_R: "Battlements — slides orthogonally",
  W_B: "Seer — slides diagonally",
  W_N: "Rider — leaps in L-shape",
  W_P: "Warden — advances forward, crosses realms",
  W_S: "Oracle (Sage) — slides orthogonally like a Rook",
  W_X: "Phase Walker — slides diagonally, phases through allies",
  B_K: "Dark Sovereign — moves 1 any direction, crosses realms",
  B_Q: "Void Empress — slides any direction, unlimited",
  B_R: "Shadow Bastion — slides orthogonally",
  B_B: "Dark Prelate — slides diagonally",
  B_N: "Void Rider — leaps in L-shape",
  B_P: "Entropy Herald — advances forward, crosses realms",
  B_S: "Decay Oracle — slides orthogonally like a Rook",
  B_X: "Shadow Phaser — slides diagonally, phases through allies",
};

export const isW = (p) => p && p[0] === "W";
export const isB = (p) => p && p[0] === "B";
export const sameCol = (a, b) => (isW(a) && isW(b)) || (isB(a) && isB(b));
export const pt = (p) => p && p.split("_")[1];

export function makeBoard(fill = false) {
  const b = Array(BS).fill(null).map(() => Array(BS).fill(null));
  if (fill) {
    b[0] = ["B_R", "B_N", "B_B", "B_Q", "B_K", "B_S"];
    b[1] = ["B_X", "B_P", "B_P", "B_P", "B_P", "B_P"];
    b[4] = ["W_P", "W_P", "W_P", "W_P", "W_P", "W_X"];
    b[5] = ["W_S", "W_N", "W_B", "W_Q", "W_K", "W_R"];
  }
  return b;
}

export const initBoards = () => ({
  past: makeBoard(),
  present: makeBoard(true),
  future: makeBoard(),
});

export function rawMoves(boards, realm, row, col) {
  const p = boards[realm][row][col];
  if (!p) return [];
  const w = isW(p), t = pt(p), b = boards[realm], ms = [];

  const slide = (dr, dc, passOwn = false) => {
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < BS && c >= 0 && c < BS) {
      const sq = b[r][c];
      if (sq && sameCol(p, sq)) {
        if (passOwn) { r += dr; c += dc; continue; }
        break;
      }
      ms.push({ realm, row: r, col: c, cap: !!sq, cross: false });
      if (sq) break;
      r += dr; c += dc;
    }
  };

  const add = (r, c) => {
    if (r < 0 || r >= BS || c < 0 || c >= BS) return;
    const sq = b[r][c];
    if (!sameCol(p, sq)) ms.push({ realm, row: r, col: c, cap: !!sq, cross: false });
  };

  const crossRealm = () => {
    const i = REALMS.indexOf(realm);
    [-1, 1].forEach((d) => {
      const nr = REALMS[i + d];
      if (nr && !boards[nr][row][col])
        ms.push({ realm: nr, row, col, cap: false, cross: true });
    });
  };

  if (t === "R" || t === "S")
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc]) => slide(dr, dc));
  else if (t === "B")
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => slide(dr, dc));
  else if (t === "Q")
    [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => slide(dr, dc));
  else if (t === "X")
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => slide(dr, dc, true));
  else if (t === "N")
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => add(row+dr, col+dc));
  else if (t === "K") {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        if (dr || dc) add(row + dr, col + dc);
    crossRealm();
  } else if (t === "P") {
    const dir = w ? -1 : 1, start = w ? 4 : 1, nr = row + dir;
    if (nr >= 0 && nr < BS && !b[nr][col]) {
      ms.push({ realm, row: nr, col, cap: false, cross: false });
      const nr2 = row + 2 * dir;
      if (row === start && nr2 >= 0 && nr2 < BS && !b[nr2][col])
        ms.push({ realm, row: nr2, col, cap: false, cross: false });
    }
    [-1, 1].forEach((dc) => {
      const r = row + dir, c = col + dc;
      if (r >= 0 && r < BS && c >= 0 && c < BS && b[r][c] && !sameCol(p, b[r][c]))
        ms.push({ realm, row: r, col: c, cap: true, cross: false });
    });
    crossRealm();
  }
  return ms;
}

export const applyMove = (boards, fr, frow, fcol, tr, trow, tcol) => {
  const nb = {
    past: boards.past.map((r) => [...r]),
    present: boards.present.map((r) => [...r]),
    future: boards.future.map((r) => [...r]),
  };
  const p = nb[fr][frow][fcol];
  nb[fr][frow][fcol] = null;
  const promo =
    pt(p) === "P" && ((isW(p) && trow === 0) || (isB(p) && trow === BS - 1));
  nb[tr][trow][tcol] = promo ? (isW(p) ? "W_Q" : "B_Q") : p;
  return nb;
};

export function inCheck(boards, white) {
  let kR, kRow, kCol;
  outer: for (const r of REALMS)
    for (let i = 0; i < BS; i++)
      for (let j = 0; j < BS; j++)
        if (boards[r][i][j] === (white ? "W_K" : "B_K")) {
          kR = r; kRow = i; kCol = j;
          break outer;
        }
  if (!kR) return false;
  for (const r of REALMS)
    for (let i = 0; i < BS; i++)
      for (let j = 0; j < BS; j++) {
        const p = boards[r][i][j];
        if (!p || isW(p) === white) continue;
        if (rawMoves(boards, r, i, j).some(m => m.realm === kR && m.row === kRow && m.col === kCol))
          return true;
      }
  return false;
}

export const legalMoves = (boards, realm, row, col) => {
  const p = boards[realm][row][col];
  if (!p) return [];
  return rawMoves(boards, realm, row, col).filter(
    (m) => !inCheck(applyMove(boards, realm, row, col, m.realm, m.row, m.col), isW(p))
  );
};

export const hasAnyLegal = (boards, white) => {
  for (const r of REALMS)
    for (let i = 0; i < BS; i++)
      for (let j = 0; j < BS; j++) {
        const p = boards[r][i][j];
        if (p && isW(p) === white && legalMoves(boards, r, i, j).length > 0)
          return true;
      }
  return false;
};

export const buildPrompt = (info, ctx) => {
  const from = `${COLS[info.fc]}${6 - info.fr}`;
  const to   = `${COLS[info.tc]}${6 - info.tr}`;
  const events = [
    info.cap   ? `${LORE[info.cap]} has been SLAIN and their essence scattered across the void!` : null,
    info.chk   ? `The enemy King now trembles in CHECK — doom approaches!` : null,
    info.cross ? `A CROSS-REALM TRANSCENDENCE tears through the fabric of time itself!` : null,
    info.promo ? `A humble soldier achieves apotheosis — PROMOTED to the seat of royalty!` : null,
  ].filter(Boolean).join(" ");

  return `You are the Epic Chronicler of CHRONOWAR — the eternal war across three time realms between the Luminar Order (white, noble & radiant) and the Umbral Conclave (black, shadowed & ancient). Three realms exist simultaneously: the PAST (sepia-amber, Echoes of Ancients), the PRESENT (emerald, The Living War), and the FUTURE (violet, Shadow of Fate). Pieces are legendary named characters.

Move #${info.num}: ${LORE[info.piece]} of the ${info.side === "white" ? "Luminar Order" : "Umbral Conclave"} moves from ${from} to ${to} in the ${info.frRealm.toUpperCase()} realm${info.trRealm !== info.frRealm ? ` — transcending to the ${info.trRealm.toUpperCase()} realm` : ""}.${events ? " " + events : ""}

Chronicle so far: ${ctx || "The two armies have assumed their eternal positions at the dawn of the temporal war — all of existence holds its breath."}

Write exactly 2–3 sentences of vivid, mythic narrative for this single moment. Use the character's full lore name. Be poetic, dramatic, and epic. Every move is a verse in an immortal saga that will be sung across eternity.`;
};
