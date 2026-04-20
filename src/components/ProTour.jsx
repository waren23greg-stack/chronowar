// ============================================================
//  CHRONOWAR — Pro Tour
//  8 legendary challenge scenarios
// ============================================================
import { useState } from "react";
import { REALM_CFG } from "../engine";
import { King, Queen, Rook, Knight, Bishop, Pawn, Sage, PhaseWalker } from "../pieces";

// ── Tour challenge definitions ────────────────────────────
export const TOUR_CHALLENGES = [
  {
    id: "echo_of_dawn",
    num: 1,
    title: "The Echo of Dawn",
    subtitle: "A kingdom's first breath",
    realm: "past",
    difficulty: "easy",
    cpReward: 120,
    eloBonus: 20,
    lore: "The Luminar Order faces its earliest test — a skirmish in the amber ruins of the Past realm. The Umbral forces are weak, scattered. Victory is expected. But expectation is a fool's shield.",
    hint: "Control the center. Develop your Oracle and Chronoriders early.",
    // White has a full army, Black is weakened
    setup: (boards) => {
      const b = { past: boards.past.map(r=>[...r]), present: boards.present.map(r=>[...r]), future: boards.future.map(r=>[...r]) };
      // Remove some black pieces from present
      b.present[0][0] = null; b.present[0][1] = null; b.present[0][5] = null;
      b.present[1][5] = null;
      return b;
    },
  },
  {
    id: "the_siege",
    num: 2,
    title: "The Siege of Present",
    subtitle: "Hold the living realm",
    realm: "present",
    difficulty: "easy",
    cpReward: 160,
    eloBonus: 30,
    lore: "Void Empress Nythera presses her assault on the Present realm. Your forces are outnumbered in the central theatre. You must defend, then counterattack — for if the Present falls, Past and Future follow.",
    hint: "Patience is power. Let them come to you, then strike through their overextension.",
    setup: (boards) => {
      const b = { past: boards.past.map(r=>[...r]), present: boards.present.map(r=>[...r]), future: boards.future.map(r=>[...r]) };
      // White has lost pieces — simulate mid-game pressure
      b.present[4][4] = null; b.present[5][0] = null;
      b.present[4][5] = null;
      b.present[3][3] = "B_N"; // enemy knight deep in white territory
      return b;
    },
  },
  {
    id: "phantom_crossing",
    num: 3,
    title: "The Phantom Crossing",
    subtitle: "Time is a battlefield",
    realm: "present",
    difficulty: "medium",
    cpReward: 220,
    eloBonus: 50,
    lore: "The Umbral Conclave deploys their Phase Walkers across all three realms. These spectral warriors slip through your formation like mist through stone. Learn to fight that which cannot be blocked.",
    hint: "Phase Walkers cannot capture the King directly — they must be cornered. Use your own Phase Walker to mirror their tactics.",
    setup: (boards) => {
      const b = { past: boards.past.map(r=>[...r]), present: boards.present.map(r=>[...r]), future: boards.future.map(r=>[...r]) };
      // Add phantom pieces to past and future
      b.past[2][2] = "B_X"; b.past[3][3] = "B_X";
      b.future[2][3] = "B_X"; b.future[3][2] = "B_X";
      return b;
    },
  },
  {
    id: "oracle_war",
    num: 4,
    title: "The Oracle War",
    subtitle: "Wisdom against wisdom",
    realm: "future",
    difficulty: "medium",
    cpReward: 280,
    eloBonus: 70,
    lore: "Lich-Lord Vex'rath sends the Decay Oracles to disrupt your temporal lines. Their orthogonal mastery mirrors your own Sages. This is a war of patience, of geometry, of seeing five moves into a fractured tomorrow.",
    hint: "Open files for your Sages early. The Decay Oracle and your Oracle cancel each other — the one who opens more lines wins.",
    setup: null, // standard start, harder AI
  },
  {
    id: "temporal_storm",
    num: 5,
    title: "The Temporal Storm",
    subtitle: "All three realms burn",
    realm: "present",
    difficulty: "medium",
    cpReward: 340,
    eloBonus: 90,
    lore: "A full assault across all three timelines simultaneously. The Umbral Conclave has never struck with such unified ferocity. Your armies are spread thin across Past, Present, and Future. Something will break. Decide what.",
    hint: "Sacrifice the past to save the present. Cross-realm moves are worth triple here — use your 18-crossing budget wisely.",
    setup: null,
  },
  {
    id: "lich_gambit",
    num: 6,
    title: "The Lich Gambit",
    subtitle: "Vex'rath plays for eternity",
    realm: "future",
    difficulty: "hard",
    cpReward: 420,
    eloBonus: 120,
    lore: "Lich-Lord Vex'rath himself enters the Future realm, abandoning all pretense. He plays a brutal, tactical game — sacrificing pawns like dust, hunting your Queen across timelines. This is the hardest fight you've faced.",
    hint: "Do not trade Queens early. His endgame is masterful — you must press for checkmate before the position simplifies.",
    setup: (boards) => {
      const b = { past: boards.past.map(r=>[...r]), present: boards.present.map(r=>[...r]), future: boards.future.map(r=>[...r]) };
      // Position Black King in Future with strong protection
      b.future[0] = ["B_R", "B_N", null, "B_Q", "B_K", null];
      b.future[1] = [null, "B_P", "B_B", null, "B_P", "B_P"];
      b.future[2][1] = "B_N";
      return b;
    },
  },
  {
    id: "void_empress",
    num: 7,
    title: "Nythera Ascendant",
    subtitle: "The Void Empress unchained",
    realm: "present",
    difficulty: "hard",
    cpReward: 520,
    eloBonus: 150,
    lore: "Void Empress Nythera has achieved Temporal Convergence — her pieces exist simultaneously in all three realms. She is everywhere at once. Your only hope is to collapse the convergence by checkmating her King before she stabilises.",
    hint: "Speed is everything. Trade material freely for tempo. The first check you deliver may be your most important move.",
    setup: null,
  },
  {
    id: "eternal_war",
    num: 8,
    title: "The Eternal War",
    subtitle: "The final chronicle",
    realm: "present",
    difficulty: "hard",
    cpReward: 800,
    eloBonus: 250,
    lore: "Both armies at full strength. No mercy, no quarter. The Chronicler has set down their quill — whoever wins this game, their name is written into eternity. This is ChronoWar. This is everything.",
    hint: "There are no hints. The eternal war requires an eternal mind.",
    setup: null,
    final: true,
  },
];

// ── Piece icon map ────────────────────────────────────────
const PIECE_MAP = { K: King, Q: Queen, R: Rook, B: Bishop, N: Knight, P: Pawn, S: Sage, X: PhaseWalker };

// ── Challenge card ────────────────────────────────────────
function ChallengeCard({ ch, completed, locked, onSelect }) {
  const [hov, setHov] = useState(false);
  const cfg = REALM_CFG[ch.realm];

  return (
    <div
      onClick={() => !locked && onSelect(ch)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        background: locked
          ? "rgba(0,0,0,.35)"
          : hov ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.06)",
        border: `1.5px solid ${completed ? "rgba(180,140,40,.55)" : locked ? "rgba(60,50,40,.3)" : hov ? cfg.border : "rgba(100,70,20,.2)"}`,
        borderRadius: 10,
        padding: "20px 22px",
        cursor: locked ? "not-allowed" : "pointer",
        transition: "all .22s",
        transform: hov && !locked ? "translateY(-3px)" : "none",
        boxShadow: hov && !locked ? `0 8px 30px rgba(0,0,0,.4), 0 0 20px ${cfg.glow}18` : "none",
        opacity: locked ? 0.45 : 1,
      }}
    >
      {/* Number */}
      <div style={{
        position: "absolute", top: -12, left: 16,
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: ".7rem", color: completed ? "#d4a843" : cfg.text,
        background: "inherit", padding: "2px 8px",
        letterSpacing: "2px",
      }}>
        {completed ? "✓" : `${ch.num < 10 ? "0"+ch.num : ch.num}`}
      </div>

      {/* Realm tag */}
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: ".4rem",
        letterSpacing: "4px", color: cfg.text,
        marginBottom: 6, opacity: 0.7,
      }}>
        {cfg.icon} {ch.realm.toUpperCase()} · {ch.difficulty.toUpperCase()}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: ".82rem", letterSpacing: "2px",
        color: locked ? "rgba(100,80,50,.6)" : "#2a1004",
        marginBottom: 4, fontWeight: 700,
      }}>{ch.title}</div>
      <div style={{
        fontFamily: "'Crimson Text', serif",
        fontSize: ".75rem", fontStyle: "italic",
        color: "rgba(80,55,20,.55)", marginBottom: 12,
      }}>{ch.subtitle}</div>

      {/* Rewards */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{
          background: "rgba(180,130,30,.15)", border: "1px solid rgba(180,130,30,.25)",
          borderRadius: 5, padding: "4px 10px",
          fontFamily: "'Cinzel', serif", fontSize: ".42rem",
          letterSpacing: "1px", color: "rgba(140,100,20,.8)",
        }}>+{ch.cpReward} CP</div>
        <div style={{
          background: "rgba(60,80,160,.12)", border: "1px solid rgba(60,80,160,.2)",
          borderRadius: 5, padding: "4px 10px",
          fontFamily: "'Cinzel', serif", fontSize: ".42rem",
          letterSpacing: "1px", color: "rgba(60,80,160,.8)",
        }}>+{ch.eloBonus} ELO</div>
      </div>

      {/* Lock icon */}
      {locked && (
        <div style={{
          position: "absolute", top: "50%", right: 16,
          transform: "translateY(-50%)",
          opacity: 0.4, fontSize: "1.2rem",
        }}>🔒</div>
      )}
    </div>
  );
}

// ── Challenge detail view ─────────────────────────────────
function ChallengeDetail({ ch, onStart, onBack }) {
  const cfg = REALM_CFG[ch.realm];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px" }}>
      {/* Back */}
      <button onClick={onBack} style={{
        background: "none", border: "none",
        fontFamily: "'Cinzel', serif", fontSize: ".5rem",
        letterSpacing: "3px", color: "rgba(80,55,20,.55)",
        cursor: "pointer", marginBottom: 28, padding: 0,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        ← TOUR CHALLENGES
      </button>

      {/* Realm */}
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:".5rem", letterSpacing:"5px", color:cfg.text, marginBottom:8 }}>
        {cfg.icon} {ch.realm.toUpperCase()} REALM · CHALLENGE {ch.num}
      </div>

      {/* Title */}
      <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"2rem", color:"#2a1004", margin:"0 0 4px", letterSpacing:"3px" }}>
        {ch.title}
      </h2>
      <div style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:".95rem", color:"rgba(80,55,20,.6)", marginBottom:28 }}>
        {ch.subtitle}
      </div>

      {/* Lore */}
      <div style={{
        background:"rgba(0,0,0,.07)", border:`1px solid ${cfg.border}`,
        borderRadius:10, padding:"20px 22px", marginBottom:22,
      }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:".44rem", letterSpacing:"4px", color:cfg.text, marginBottom:10, opacity:.7 }}>
          THE BRIEFING
        </div>
        <p style={{ fontFamily:"'Crimson Text',serif", fontSize:"1rem", color:"rgba(40,22,6,.85)", lineHeight:1.85, margin:0, fontStyle:"italic" }}>
          {ch.lore}
        </p>
      </div>

      {/* Hint */}
      <div style={{
        background:"rgba(180,130,30,.1)", border:"1px solid rgba(180,130,30,.25)",
        borderRadius:8, padding:"14px 18px", marginBottom:28,
        display:"flex", gap:12, alignItems:"flex-start",
      }}>
        <div style={{ fontSize:"1.1rem", flexShrink:0, marginTop:2 }}>⚔</div>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:".44rem", letterSpacing:"3px", color:"rgba(130,90,20,.65)", marginBottom:6 }}>
            STRATEGIST'S COUNSEL
          </div>
          <div style={{ fontFamily:"'Crimson Text',serif", fontSize:".92rem", color:"rgba(60,40,10,.78)", lineHeight:1.7 }}>
            {ch.hint}
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div style={{ display:"flex", gap:12, marginBottom:28 }}>
        {[
          [`${ch.cpReward} CHRONICLE POINTS`, "rgba(180,130,30,.2)", "rgba(130,90,15,.8)"],
          [`+${ch.eloBonus} ELO RATING`, "rgba(60,80,160,.15)", "rgba(40,60,140,.8)"],
          [ch.difficulty.toUpperCase() + " DIFFICULTY", "rgba(0,0,0,.1)", "rgba(60,40,10,.65)"],
        ].map(([label, bg, color]) => (
          <div key={label} style={{
            flex:1, background:bg, border:`1px solid ${color}40`,
            borderRadius:7, padding:"10px 8px", textAlign:"center",
          }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:".42rem", letterSpacing:"1px", color }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Start */}
      <button onClick={onStart} style={{
        width:"100%", padding:"16px 0",
        background:"rgba(80,45,8,.92)",
        border:"1.5px solid rgba(200,150,35,.55)",
        borderRadius:8, cursor:"pointer",
        fontFamily:"'Cinzel',serif", fontSize:".72rem",
        letterSpacing:"5px", color:"#f0d060",
        boxShadow:"0 4px 20px rgba(0,0,0,.35)",
        transition:"all .2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background="rgba(110,62,12,.97)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background="rgba(80,45,8,.92)"; e.currentTarget.style.transform="none"; }}
      >
        {ch.final ? "ENTER THE ETERNAL WAR" : "ACCEPT THE CHALLENGE"}
      </button>
    </div>
  );
}

// ── Main Pro Tour screen ──────────────────────────────────
export default function ProTour({ tourProgress = {}, onStartChallenge, onBack }) {
  const [selected, setSelected] = useState(null);
  const completed = TOUR_CHALLENGES.filter(c => tourProgress[c.id]).length;

  if (selected) {
    return (
      <div style={{ minHeight:"100vh", padding:"40px 0", overflowY:"auto" }}>
        <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse 80% 55% at 20% 10%, #0c0520, transparent 65%), radial-gradient(ellipse 60% 45% at 82% 88%, #1c0438, transparent 60%), #030110", zIndex:-1 }} />
        <ChallengeDetail
          ch={selected}
          onStart={() => onStartChallenge(selected)}
          onBack={() => setSelected(null)}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      color: "#e8dcc8",
      fontFamily: "'Crimson Text', serif",
      overflowY: "auto",
      position: "relative",
    }}>
      <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse 80% 55% at 20% 10%, #0c0520, transparent 65%), radial-gradient(ellipse 60% 45% at 82% 88%, #1c0438, transparent 60%), #030110", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:860, margin:"0 auto", padding:"40px 24px 80px" }}>
        {/* Back */}
        <button onClick={onBack} style={{
          background:"none", border:"none",
          fontFamily:"'Cinzel',serif", fontSize:".5rem", letterSpacing:"3px",
          color:"rgba(180,140,60,.5)", cursor:"pointer", marginBottom:32,
          padding:0, display:"flex", alignItems:"center", gap:8,
        }}>← RETURN TO GAME</button>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:".5rem", letterSpacing:"7px", color:"rgba(180,140,60,.4)", marginBottom:12 }}>
            THE CHRONICLES
          </div>
          <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(2rem, 5vw, 3.2rem)", color:"#d4a843", margin:"0 0 8px", letterSpacing:"5px", textShadow:"0 0 40px rgba(200,160,40,.25)" }}>
            PRO TOUR
          </h1>
          <div style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:"1rem", color:"rgba(200,180,130,.6)", marginBottom:20 }}>
            Eight trials across the three realms of time
          </div>
          {/* Progress bar */}
          <div style={{ display:"flex", alignItems:"center", gap:12, maxWidth:300, margin:"0 auto" }}>
            <div style={{ flex:1, height:4, background:"rgba(180,140,40,.15)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(completed/8)*100}%`, background:"linear-gradient(90deg,#c89030,#f0d060)", transition:"width .6s" }}/>
            </div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:".48rem", color:"rgba(180,140,60,.6)", letterSpacing:"2px", whiteSpace:"nowrap" }}>
              {completed} / 8
            </div>
          </div>
        </div>

        {/* Challenge grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:20 }}>
          {TOUR_CHALLENGES.map((ch, i) => (
            <ChallengeCard
              key={ch.id}
              ch={ch}
              completed={!!tourProgress[ch.id]}
              locked={i > 0 && !tourProgress[TOUR_CHALLENGES[i-1].id]}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Footer lore */}
        {completed === 8 && (
          <div style={{ textAlign:"center", marginTop:48, padding:"28px", background:"rgba(180,140,40,.08)", border:"1px solid rgba(180,140,40,.2)", borderRadius:12 }}>
            <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.2rem", color:"#d4a843", marginBottom:10 }}>
              The Tour is Complete
            </div>
            <div style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", color:"rgba(200,180,130,.7)", fontSize:"1rem" }}>
              Your name has been written into the Chronicles of Three Realms. The war continues — but you have proven yourself a legend.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
