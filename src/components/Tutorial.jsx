// ============================================================
//  CHRONOWAR — Tutorial v2 — Interactive, Professional
// ============================================================
import { useState } from "react";
import { King, Queen, Rook, Bishop, Knight, Pawn, Sage, PhaseWalker } from "../pieces";

// ── Interactive mini board ─────────────────────────────────
function MiniBoard({ grid, highlights = [], moveHints = [], size = 48, realm = "present" }) {
  const colors = {
    past:    { light:"#d9c49a", dark:"#9e7a44", hl:"#f0d060", hint:"rgba(50,30,8,.55)" },
    present: { light:"#b8c98a", dark:"#6a8848", hl:"#d4e055", hint:"rgba(20,50,8,.55)" },
    future:  { light:"#b8a8d8", dark:"#6848a0", hl:"#d8b8ff", hint:"rgba(40,10,80,.55)" },
  }[realm] || { light:"#b8c98a", dark:"#6a8848", hl:"#d4e055", hint:"rgba(20,50,8,.55)" };

  const PIECES = { K: King, Q: Queen, R: Rook, B: Bishop, N: Knight, P: Pawn, S: Sage, X: PhaseWalker };

  return (
    <div style={{ display:"inline-block", border:"1.5px solid rgba(100,70,20,.4)", borderRadius:4, overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,.35)" }}>
      {grid.map((row, ri) => (
        <div key={ri} style={{ display:"flex" }}>
          {row.map((cell, ci) => {
            const isLight = (ri+ci)%2===0;
            const isHL    = highlights.some(h=>h[0]===ri&&h[1]===ci);
            const isHint  = moveHints.some(h=>h[0]===ri&&h[1]===ci);
            const bg = isHL ? colors.hl : isLight ? colors.light : colors.dark;
            const pieceCode = cell;
            const isWhite = pieceCode && pieceCode[0]==="W";
            const pType = pieceCode && pieceCode.split("_")[1];
            const PComp = pType && PIECES[pType];
            return (
              <div key={ci} style={{ width:size, height:size, background:bg, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {isHint && <div style={{ position:"absolute", width:"36%", height:"36%", borderRadius:"50%", background:colors.hint, opacity:.75 }}/>}
                {PComp && <PComp size={size*0.82} isWhite={isWhite} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Step definitions ─────────────────────────────────────
const N = null;
const STEPS = [
  {
    title: "Welcome to ChronoWar",
    icon: "⚔",
    content: [
      "ChronoWar is chess reimagined across three simultaneous battlefields — the Past, Present, and Future.",
      "Every move you make is narrated by an ancient chronicler as epic mythic prose. Your game becomes a living legend.",
      "The rules are built on classical chess, with powerful new mechanics that make every game unique.",
    ],
    visual: (
      <div style={{ display:"flex", gap:20, justifyContent:"center", alignItems:"flex-end", flexWrap:"wrap" }}>
        {[
          { realm:"past",    label:"PAST ECHOES",    h:44 },
          { realm:"present", label:"THE LIVING WAR", h:60 },
          { realm:"future",  label:"FATE'S SHADOW",  h:44 },
        ].map(({ realm, label, h }) => (
          <div key={realm} style={{ textAlign:"center" }}>
            <MiniBoard realm={realm} size={h} grid={[
              [N,N,N,N,N,N],[N,N,N,N,N,N],[N,N,N,N,N,N],
              [N,N,N,N,N,N],[N,N,N,N,N,N],[N,N,N,N,N,N],
            ]}/>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:".42rem", letterSpacing:"3px", color:"rgba(80,55,20,.6)", marginTop:8 }}>{label}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "The Board & Pieces",
    icon: "♟",
    content: [
      "Each realm has its own 6×6 board with a full army. The Present realm starts populated — Past and Future begin empty, filling as pieces cross realms.",
      "All classical chess movement applies: Kings, Queens, Rooks, Bishops, Knights, and Pawns follow standard rules.",
      "ChronoWar adds two unique pieces: the Oracle (moves like a Rook) and the Phase Walker (slides diagonally through allied pieces).",
    ],
    visual: (
      <div>
        <MiniBoard realm="present" size={52} grid={[
          ["B_R","B_N","B_B","B_Q","B_K","B_S"],
          ["B_X","B_P","B_P","B_P","B_P","B_P"],
          [N,N,N,N,N,N], [N,N,N,N,N,N],
          ["W_P","W_P","W_P","W_P","W_P","W_X"],
          ["W_S","W_N","W_B","W_Q","W_K","W_R"],
        ]}/>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:16, justifyContent:"center" }}>
          {[
            [King,    "W","King"],
            [Queen,   "W","Queen"],
            [Rook,    "W","Rook"],
            [Bishop,  "W","Bishop"],
            [Knight,  "W","Knight"],
            [Pawn,    "W","Pawn"],
            [Sage,    "W","Oracle"],
            [PhaseWalker,"W","Phase Walker"],
          ].map(([C,w,name]) => (
            <div key={name} style={{ textAlign:"center" }}>
              <C size={36} isWhite={w==="W"} />
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:".36rem", color:"rgba(80,55,20,.5)", letterSpacing:"1px", marginTop:3 }}>{name.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Selecting & Moving",
    icon: "👆",
    content: [
      "Click any of your pieces to select it. Valid move squares appear as dark ink dots.",
      "Click a highlighted square to move. If you click an enemy piece on a highlighted square, you capture it.",
      "Your selected piece rises slightly — a gold ring marks it. Click elsewhere to deselect.",
    ],
    visual: (
      <div style={{ textAlign:"center" }}>
        <MiniBoard realm="present" size={56} realm="present"
          grid={[
            [N,N,N,N,N,N],[N,N,N,N,N,N],
            [N,N,N,N,N,N],[N,"B_P",N,N,N,N],
            [N,N,N,N,N,N],["W_N",N,N,N,N,N],
          ]}
          highlights={[[5,0]]}
          moveHints={[[3,1],[4,2],[3,2],[4,1]]}
        />
        <div style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:".82rem", color:"rgba(80,55,20,.6)", marginTop:12 }}>
          Knight selected — dots show valid moves, enemy piece is capturable
        </div>
      </div>
    ),
  },
  {
    title: "The Phase Walker",
    icon: "◈",
    content: [
      "The Phase Walker is ChronoWar's most unique piece. It slides diagonally — just like a Bishop — but passes through allied pieces as if they are air.",
      "It cannot pass through enemy pieces, and it cannot capture by passing — only by landing.",
      "Use Phase Walkers to threaten squares that would be impossible for any other piece to reach through your own formation.",
    ],
    visual: (
      <div style={{ textAlign:"center" }}>
        <MiniBoard realm="future" size={54}
          grid={[
            [N,N,N,"B_R",N,N],[N,N,N,N,N,N],
            [N,N,"W_P",N,N,N],[N,"W_P",N,N,N,N],
            [N,N,N,N,N,N],["W_X",N,N,N,N,N],
          ]}
          highlights={[[5,0]]}
          moveHints={[[4,1],[3,2],[2,3],[1,4],[0,5]]}
        />
        <div style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:".82rem", color:"rgba(80,55,20,.6)", marginTop:12 }}>
          Phase Walker slides through allied pawns — threatens the enemy Rook
        </div>
      </div>
    ),
  },
  {
    title: "Cross-Realm Movement",
    icon: "🌀",
    content: [
      "Kings can move between adjacent realms: Past ↔ Present ↔ Future. The King moves sideways in time, appearing at the same board position in the next realm.",
      "Pawns that reach the far rank (row 0 for White, row 5 for Black) can promote to any piece OR cross into an adjacent realm instead.",
      "Each side has a budget of 18 cross-realm moves total. A piece that crosses realms cannot cross again for 2 turns (Temporal Fatigue).",
    ],
    visual: (
      <div style={{ display:"flex", gap:16, justifyContent:"center", alignItems:"center", flexWrap:"wrap" }}>
        {[["past","PAST"], ["present","PRESENT"], ["future","FUTURE"]].map(([r,l],i) => (
          <div key={r} style={{ textAlign:"center" }}>
            <MiniBoard realm={r} size={44}
              grid={[[N,N,N,N,N,N],[N,N,N,N,N,N],[N,N,N,N,N,N],[N,N,N,N,N,N],[N,N,N,N,N,N],[N,N,N,"W_K",N,N]]}
              highlights={i===1 ? [[5,3]] : []}
            />
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:".4rem", letterSpacing:"3px", color:"rgba(80,55,20,.5)", marginTop:6 }}>{l}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Check, Checkmate & Draws",
    icon: "☠",
    content: [
      "Your King is in Check when an enemy piece can capture it on the next move. You must resolve check immediately — move the King, block, or capture the attacker.",
      "Checkmate ends the game — your King is in check with no legal escape. The game is over.",
      "Draws occur by: Threefold Repetition (same position 3 times), the 50-Move Rule (no capture or pawn move in 50 moves each), Stalemate (no legal moves but not in check), or Insufficient Material.",
    ],
    visual: (
      <div style={{ textAlign:"center" }}>
        <MiniBoard realm="present" size={54}
          grid={[
            ["B_R",N,N,N,"B_K",N],[N,N,N,N,N,N],
            [N,N,N,N,N,N],[N,N,N,N,N,N],
            [N,N,N,N,N,N],[N,"W_Q","W_K",N,N,N],
          ]}
          highlights={[[0,4]]}
        />
        <div style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:".82rem", color:"#8b1a00", marginTop:12, fontWeight:600 }}>
          Black King is in Check — must move or block
        </div>
      </div>
    ),
  },
  {
    title: "The Narrative Engine",
    icon: "📜",
    content: [
      "Every move triggers a real-time narration from Claude — 2 to 3 sentences of epic mythic prose describing the moment.",
      "The chronicle builds move by move into a complete saga. After the game ends, Claude writes the entire war as one flowing epic story.",
      "You can export a parchment Chronicle Card — a beautiful image showing your saga title, key moments, and battle statistics — and share it on X or Instagram.",
    ],
    visual: (
      <div style={{
        background:"rgba(8,4,18,.85)",
        border:"1px solid rgba(180,130,40,.25)",
        borderRadius:10, padding:"18px 20px",
        fontFamily:"'Crimson Text',serif",
        fontStyle:"italic", fontSize:".95rem",
        color:"rgba(215,190,145,.88)", lineHeight:1.85,
      }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:".42rem", letterSpacing:"4px", color:"rgba(180,130,40,.5)", marginBottom:10, fontStyle:"normal" }}>
          MOVE 12 — THE CHRONICLE
        </div>
        "The Chronorider of the Luminar Order leapt across the boundary of Past and Present, its hooves echoing across fractured timelines. Monarch Auris watched from the Future, his silver eyes tracing the arcs of fate yet unwritten. The Umbral Conclave trembled — the third realm had been breached."
      </div>
    ),
  },
  {
    title: "Chronicle Points & Ranking",
    icon: "🏆",
    content: [
      "Every action earns Chronicle Points (CP): captures, cross-realm moves, checks, promotions, and victories all score points.",
      "Your ELO rating tracks your skill against the AI — beating Hard difficulty is worth far more than Easy.",
      "Climb through 7 rank tiers: Timewarden → Chronorider → Realm Knight → Sage of Ages → Phase Walker → Time Sovereign → Eternal Lord.",
    ],
    visual: (
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
        {[
          ["🛡","Timewarden","0 CP","rgba(130,100,60,.8)"],
          ["🏇","Chronorider","200 CP","rgba(100,150,50,.8)"],
          ["⚔","Realm Knight","500 CP","rgba(50,120,180,.8)"],
          ["✦","Sage of Ages","1,000 CP","rgba(200,150,40,.9)"],
          ["◈","Phase Walker","2,000 CP","rgba(150,80,220,.9)"],
          ["♛","Time Sovereign","4,000 CP","rgba(220,100,40,.9)"],
          ["♔","Eternal Lord","8,000 CP","rgba(240,80,80,.9)"],
        ].map(([icon,name,cp,color]) => (
          <div key={name} style={{
            background:"rgba(0,0,0,.12)",
            border:`1px solid ${color}40`,
            borderRadius:7, padding:"8px 12px",
            display:"flex", alignItems:"center", gap:8,
          }}>
            <span style={{ fontSize:".9rem" }}>{icon}</span>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:".44rem", color, letterSpacing:"1px" }}>{name}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:".38rem", color:"rgba(80,55,20,.45)", letterSpacing:"1px" }}>{cp}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Pro Tour & Challenges",
    icon: "⚔",
    content: [
      "The Pro Tour presents 8 narrative challenge scenarios — each with a unique setup, lore briefing, and escalating difficulty.",
      "Challenges are unlocked sequentially. Completing each one awards bonus CP and ELO, and advances the ChronoWar story.",
      "The final challenge — The Eternal War — pits you against the full Umbral Conclave at maximum difficulty. Your name in the chronicles depends on it.",
    ],
    visual: (
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {[
          ["01","The Echo of Dawn","Easy · Past Realm","Beginner","rgba(180,140,50,.8)"],
          ["04","The Oracle War","Medium · Future Realm","Intermediate","rgba(100,150,200,.8)"],
          ["08","The Eternal War","Hard · All Realms","Legendary","rgba(220,80,80,.9)"],
        ].map(([num,title,sub,diff,color]) => (
          <div key={num} style={{
            background:"rgba(0,0,0,.12)",
            border:`1px solid ${color}30`,
            borderRadius:8, padding:"10px 16px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:".55rem", color:"#2a1004", letterSpacing:"1px" }}>{title}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:".4rem", color:"rgba(80,55,20,.5)", letterSpacing:"1px", marginTop:3 }}>{sub}</div>
            </div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:".42rem", color, letterSpacing:"2px" }}>{diff.toUpperCase()}</div>
          </div>
        ))}
      </div>
    ),
  },
];

// ── Main Tutorial component ───────────────────────────────
export default function Tutorial({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const total   = STEPS.length;

  return (
    <div style={{
      position:"fixed", inset:0,
      background:"rgba(0,0,0,.88)",
      backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:200,
    }}>
      <div style={{
        background:"linear-gradient(160deg, #d8c898, #c4ac70)",
        border:"1.5px solid rgba(130,90,25,.45)",
        borderRadius:16,
        width:"min(680px, 96vw)",
        maxHeight:"92vh",
        display:"flex", flexDirection:"column",
        boxShadow:"0 0 100px rgba(0,0,0,.55), 0 0 0 6px rgba(100,65,15,.1)",
        animation:"overlayIn .45s cubic-bezier(.34,1.56,.64,1)",
        overflow:"hidden",
      }}>
        {/* Progress bar */}
        <div style={{ height:3, background:"rgba(100,65,15,.2)", flexShrink:0 }}>
          <div style={{ height:"100%", width:`${((step+1)/total)*100}%`, background:"linear-gradient(90deg,#c89030,#f0d060)", transition:"width .4s ease" }}/>
        </div>

        {/* Header */}
        <div style={{ padding:"20px 28px 14px", borderBottom:"1px solid rgba(120,80,20,.2)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:"1.6rem", width:40, textAlign:"center" }}>{current.icon}</div>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:".46rem", letterSpacing:"4px", color:"rgba(100,70,20,.5)", marginBottom:4 }}>
                STEP {step+1} OF {total}
              </div>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.1rem", color:"#2a1004", letterSpacing:"2px" }}>
                {current.title}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 28px" }}>
          {/* Text */}
          <div style={{ marginBottom:24 }}>
            {current.content.map((para, i) => (
              <p key={i} style={{
                fontFamily:"'Crimson Text',serif",
                fontSize:"1rem", color:"rgba(40,22,6,.85)",
                lineHeight:1.85, margin:"0 0 12px",
              }}>{para}</p>
            ))}
          </div>
          {/* Visual */}
          {current.visual && (
            <div style={{ padding:"20px", background:"rgba(0,0,0,.06)", borderRadius:10, border:"1px solid rgba(100,70,20,.15)" }}>
              {current.visual}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 28px", borderTop:"1px solid rgba(120,80,20,.18)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          {/* Dot navigation */}
          <div style={{ display:"flex", gap:7 }}>
            {STEPS.map((_,i) => (
              <div key={i} onClick={()=>setStep(i)} style={{
                width: i===step ? 22 : 7, height:7,
                borderRadius:4,
                background: i===step ? "#c89030" : i<step ? "rgba(200,148,40,.4)" : "rgba(100,70,25,.2)",
                cursor:"pointer", transition:"all .3s",
              }}/>
            ))}
          </div>

          <div style={{ display:"flex", gap:10 }}>
            {step > 0 && (
              <button onClick={()=>setStep(s=>s-1)} style={{
                background:"rgba(0,0,0,.08)", border:"1px solid rgba(100,70,20,.3)",
                borderRadius:6, padding:"8px 18px",
                fontFamily:"'Cinzel',serif", fontSize:".52rem",
                letterSpacing:"2px", color:"rgba(80,55,20,.7)", cursor:"pointer",
              }}>← BACK</button>
            )}
            {step < total-1 ? (
              <button onClick={()=>setStep(s=>s+1)} style={{
                background:"rgba(80,50,8,.88)", border:"1px solid rgba(200,150,40,.5)",
                borderRadius:6, padding:"8px 22px",
                fontFamily:"'Cinzel',serif", fontSize:".52rem",
                letterSpacing:"2px", color:"#f0d060", cursor:"pointer",
                boxShadow:"0 2px 12px rgba(0,0,0,.3)",
              }}>NEXT →</button>
            ) : (
              <button onClick={onClose} style={{
                background:"rgba(80,50,8,.92)", border:"1px solid rgba(200,150,40,.55)",
                borderRadius:6, padding:"8px 22px",
                fontFamily:"'Cinzel',serif", fontSize:".52rem",
                letterSpacing:"3px", color:"#f0d060", cursor:"pointer",
                boxShadow:"0 0 20px rgba(200,150,40,.2)",
              }}>⚔ BEGIN THE WAR</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
