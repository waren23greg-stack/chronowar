// ============================================================
//  CHRONOWAR — Pro Tour  (redesigned for dark theme visibility)
// ============================================================
import { useState } from "react";

// ── Realm accent palettes ─────────────────────────────────
const REALM_ACCENT = {
  past:    { col: "#d4943a", glow: "rgba(212,148,58,.35)",   badge: "rgba(212,148,58,.15)", border: "rgba(212,148,58,.35)",  label: "⏳ PAST",    tag: "#e8b96a" },
  present: { col: "#7ab84a", glow: "rgba(122,184,74,.35)",   badge: "rgba(122,184,74,.12)", border: "rgba(122,184,74,.35)",  label: "⚔ PRESENT", tag: "#a8d870" },
  future:  { col: "#9870d8", glow: "rgba(152,112,216,.35)",  badge: "rgba(152,112,216,.12)",border: "rgba(152,112,216,.35)", label: "✧ FUTURE",  tag: "#c0a0f8" },
};

const DIFF_COLOR = {
  easy:   { col: "#6abf70", bg: "rgba(106,191,112,.12)", border: "rgba(106,191,112,.3)" },
  medium: { col: "#d4a040", bg: "rgba(212,160,64,.12)",  border: "rgba(212,160,64,.3)"  },
  hard:   { col: "#d05050", bg: "rgba(208,80,80,.12)",   border: "rgba(208,80,80,.3)"   },
};

// ── Tour challenge definitions ────────────────────────────
export const TOUR_CHALLENGES = [
  {
    id: "echo_of_dawn", num: 1,
    title: "The Echo of Dawn", subtitle: "A kingdom's first breath",
    realm: "past", difficulty: "easy", cpReward: 120, eloBonus: 20,
    lore: "The Luminar Order faces its earliest test — a skirmish in the amber ruins of the Past realm. The Umbral forces are weak, scattered. Victory is expected. But expectation is a fool's shield.",
    hint: "Control the center. Develop your Oracle and Chronoriders early.",
    setup: (boards) => {
      const b = { past: boards.past.map(r=>[...r]), present: boards.present.map(r=>[...r]), future: boards.future.map(r=>[...r]) };
      b.present[0][0]=null; b.present[0][1]=null; b.present[0][5]=null; b.present[1][5]=null;
      return b;
    },
  },
  {
    id: "the_siege", num: 2,
    title: "The Siege of Present", subtitle: "Hold the living realm",
    realm: "present", difficulty: "easy", cpReward: 160, eloBonus: 30,
    lore: "Void Empress Nythera presses her assault on the Present realm. Your forces are outnumbered in the central theatre. You must defend, then counterattack — for if the Present falls, Past and Future follow.",
    hint: "Patience is power. Let them come to you, then strike through their overextension.",
    setup: (boards) => {
      const b = { past: boards.past.map(r=>[...r]), present: boards.present.map(r=>[...r]), future: boards.future.map(r=>[...r]) };
      b.present[4][4]=null; b.present[5][0]=null; b.present[4][5]=null; b.present[3][3]="B_N";
      return b;
    },
  },
  {
    id: "phantom_crossing", num: 3,
    title: "The Phantom Crossing", subtitle: "Time is a battlefield",
    realm: "present", difficulty: "medium", cpReward: 220, eloBonus: 50,
    lore: "The Umbral Conclave deploys their Phase Walkers across all three realms. These spectral warriors slip through your formation like mist through stone. Learn to fight that which cannot be blocked.",
    hint: "Phase Walkers cannot capture the King directly — they must be cornered. Use your own Phase Walker to mirror their tactics.",
    setup: (boards) => {
      const b = { past: boards.past.map(r=>[...r]), present: boards.present.map(r=>[...r]), future: boards.future.map(r=>[...r]) };
      b.past[2][2]="B_X"; b.past[3][3]="B_X"; b.future[2][3]="B_X"; b.future[3][2]="B_X";
      return b;
    },
  },
  {
    id: "oracle_war", num: 4,
    title: "The Oracle War", subtitle: "Wisdom against wisdom",
    realm: "future", difficulty: "medium", cpReward: 280, eloBonus: 70,
    lore: "Lich-Lord Vex'rath sends the Decay Oracles to disrupt your temporal lines. Their orthogonal mastery mirrors your own Sages. This is a war of patience, of geometry, of seeing five moves into a fractured tomorrow.",
    hint: "Open files for your Sages early. The Decay Oracle and your Oracle cancel each other — the one who opens more lines wins.",
    setup: null,
  },
  {
    id: "temporal_storm", num: 5,
    title: "The Temporal Storm", subtitle: "All three realms burn",
    realm: "present", difficulty: "medium", cpReward: 340, eloBonus: 90,
    lore: "A full assault across all three timelines simultaneously. The Umbral Conclave has never struck with such unified ferocity. Your armies are spread thin across Past, Present, and Future. Something will break. Decide what.",
    hint: "Sacrifice the past to save the present. Cross-realm moves are worth triple here — use your 18-crossing budget wisely.",
    setup: null,
  },
  {
    id: "lich_gambit", num: 6,
    title: "The Lich Gambit", subtitle: "Vex'rath plays for eternity",
    realm: "future", difficulty: "hard", cpReward: 420, eloBonus: 120,
    lore: "Lich-Lord Vex'rath himself enters the Future realm, abandoning all pretense. He plays a brutal, tactical game — sacrificing pawns like dust, hunting your Queen across timelines. This is the hardest fight you've faced.",
    hint: "Do not trade Queens early. His endgame is masterful — you must press for checkmate before the position simplifies.",
    setup: (boards) => {
      const b = { past: boards.past.map(r=>[...r]), present: boards.present.map(r=>[...r]), future: boards.future.map(r=>[...r]) };
      b.future[0]=["B_R","B_N",null,"B_Q","B_K",null]; b.future[1]=[null,"B_P","B_B",null,"B_P","B_P"]; b.future[2][1]="B_N";
      return b;
    },
  },
  {
    id: "void_empress", num: 7,
    title: "Nythera Ascendant", subtitle: "The Void Empress unchained",
    realm: "present", difficulty: "hard", cpReward: 520, eloBonus: 150,
    lore: "Void Empress Nythera has achieved Temporal Convergence — her pieces exist simultaneously in all three realms. She is everywhere at once. Your only hope is to collapse the convergence by checkmating her King before she stabilises.",
    hint: "Speed is everything. Trade material freely for tempo. The first check you deliver may be your most important move.",
    setup: null,
  },
  {
    id: "eternal_war", num: 8,
    title: "The Eternal War", subtitle: "The final chronicle",
    realm: "present", difficulty: "hard", cpReward: 800, eloBonus: 250,
    lore: "Both armies at full strength. No mercy, no quarter. The Chronicler has set down their quill — whoever wins this game, their name is written into eternity. This is ChronoWar. This is everything.",
    hint: "There are no hints. The eternal war requires an eternal mind.",
    setup: null, final: true,
  },
];

// ── Lock SVG icon ─────────────────────────────────────────
function LockIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 18 22" fill="none">
      <rect x="1" y="9" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4.5 9V6.5a4.5 4.5 0 0 1 9 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="15" r="1.5" fill="currentColor"/>
    </svg>
  );
}

// ── Challenge card ────────────────────────────────────────
function ChallengeCard({ ch, completed, locked, onSelect }) {
  const [hov, setHov] = useState(false);
  const acc = REALM_ACCENT[ch.realm];
  const diff = DIFF_COLOR[ch.difficulty];

  return (
    <div
      onClick={() => !locked && onSelect(ch)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        background: locked ? "rgba(255,255,255,.03)" : hov ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.055)",
        border: `1.5px solid ${completed ? "rgba(212,168,67,.5)" : locked ? "rgba(255,255,255,.07)" : hov ? acc.border : "rgba(255,255,255,.1)"}`,
        borderRadius: 12, padding: "22px 20px 18px",
        cursor: locked ? "not-allowed" : "pointer",
        transition: "all .2s",
        transform: hov && !locked ? "translateY(-4px)" : "none",
        boxShadow: hov && !locked ? `0 12px 40px rgba(0,0,0,.5), 0 0 28px ${acc.glow}` : completed ? "0 0 18px rgba(212,168,67,.1)" : "none",
        filter: locked ? "saturate(0.4)" : "none",
        overflow: "hidden",
      }}
    >
      {/* Realm color bar top */}
      {!locked && (
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background: completed ? "linear-gradient(90deg,#c89030,#f0d060)" : `linear-gradient(90deg,${acc.col}00,${acc.col},${acc.col}00)`, opacity: hov||completed ? 1 : 0.5, transition:"opacity .2s" }}/>
      )}

      {/* Big number watermark */}
      <div style={{ position:"absolute", top:12, right:14, fontFamily:"'Cinzel Decorative',serif", fontSize:"1.7rem", fontWeight:700, color: completed ? "rgba(212,168,67,.18)" : locked ? "rgba(255,255,255,.05)" : `${acc.col}1e`, lineHeight:1, userSelect:"none" }}>
        {ch.num < 10 ? `0${ch.num}` : ch.num}
      </div>

      {/* Realm + difficulty badges */}
      <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:10 }}>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:".37rem", letterSpacing:"3px", color: locked ? "rgba(255,255,255,.22)" : acc.tag, padding:"2px 8px", background: locked ? "rgba(255,255,255,.04)" : acc.badge, border:`1px solid ${locked ? "rgba(255,255,255,.07)" : acc.border}`, borderRadius:4 }}>{acc.label}</span>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:".37rem", letterSpacing:"2px", color: locked ? "rgba(255,255,255,.18)" : diff.col, padding:"2px 8px", background: locked ? "rgba(255,255,255,.04)" : diff.bg, border:`1px solid ${locked ? "rgba(255,255,255,.06)" : diff.border}`, borderRadius:4 }}>{ch.difficulty.toUpperCase()}</span>
      </div>

      {/* Title */}
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:".78rem", letterSpacing:"1.5px", fontWeight:700, color: locked ? "rgba(255,255,255,.22)" : completed ? "#d4a843" : "#e8dcc8", marginBottom:4, lineHeight:1.3, paddingRight:30 }}>
        {completed && <span style={{ color:"#d4a843", marginRight:6 }}>✓</span>}
        {ch.title}
      </div>
      <div style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:".75rem", color: locked ? "rgba(255,255,255,.15)" : "rgba(200,180,140,.55)", marginBottom:16 }}>{ch.subtitle}</div>

      {/* Rewards + lock */}
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:".39rem", letterSpacing:"1px", color: locked ? "rgba(255,255,255,.18)" : "rgba(212,168,67,.9)", background: locked ? "rgba(255,255,255,.03)" : "rgba(212,168,67,.1)", border:`1px solid ${locked ? "rgba(255,255,255,.07)" : "rgba(212,168,67,.25)"}`, borderRadius:5, padding:"3px 10px" }}>+{ch.cpReward} CP</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:".39rem", letterSpacing:"1px", color: locked ? "rgba(255,255,255,.18)" : "rgba(100,145,235,.9)", background: locked ? "rgba(255,255,255,.03)" : "rgba(80,110,210,.1)", border:`1px solid ${locked ? "rgba(255,255,255,.07)" : "rgba(80,110,210,.25)"}`, borderRadius:5, padding:"3px 10px" }}>+{ch.eloBonus} ELO</div>
        {locked && <div style={{ marginLeft:"auto", color:"rgba(255,255,255,.2)" }}><LockIcon/></div>}
      </div>
    </div>
  );
}

// ── Challenge detail view ─────────────────────────────────
function ChallengeDetail({ ch, onStart, onBack }) {
  const acc = REALM_ACCENT[ch.realm];
  const diff = DIFF_COLOR[ch.difficulty];

  return (
    <div style={{ maxWidth:620, margin:"0 auto", padding:"0 24px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", fontFamily:"'Cinzel',serif", fontSize:".48rem", letterSpacing:"3px", color:"rgba(200,180,140,.4)", cursor:"pointer", marginBottom:32, padding:0, display:"flex", alignItems:"center", gap:8 }}
        onMouseEnter={e=>e.currentTarget.style.color="rgba(200,180,140,.8)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(200,180,140,.4)"}>
        ← ALL CHALLENGES
      </button>

      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:".42rem", letterSpacing:"4px", color:acc.tag, padding:"3px 12px", background:acc.badge, border:`1px solid ${acc.border}`, borderRadius:5 }}>{acc.label}</span>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:".42rem", letterSpacing:"3px", color:diff.col, padding:"3px 12px", background:diff.bg, border:`1px solid ${diff.border}`, borderRadius:5 }}>{ch.difficulty.toUpperCase()}</span>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:".42rem", letterSpacing:"3px", color:"rgba(200,180,140,.35)" }}>CHALLENGE {ch.num} OF 8</span>
      </div>

      <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", color:"#e8dcc8", margin:"0 0 6px", letterSpacing:"3px", textShadow:`0 0 40px ${acc.glow}`, lineHeight:1.2 }}>{ch.title}</h2>
      <div style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:"1.05rem", color:"rgba(200,180,140,.5)", marginBottom:32 }}>{ch.subtitle}</div>

      {/* Lore */}
      <div style={{ background:"rgba(255,255,255,.04)", border:`1px solid ${acc.border}`, borderRadius:12, padding:"22px 24px", marginBottom:18, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, width:4, bottom:0, background:`linear-gradient(180deg,${acc.col}00,${acc.col},${acc.col}00)` }}/>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:".4rem", letterSpacing:"5px", color:acc.tag, marginBottom:12, opacity:.8 }}>THE BRIEFING</div>
        <p style={{ fontFamily:"'Crimson Text',serif", fontSize:"1.05rem", color:"rgba(220,205,175,.9)", lineHeight:1.9, margin:0, fontStyle:"italic" }}>{ch.lore}</p>
      </div>

      {/* Hint */}
      <div style={{ background:"rgba(212,168,67,.07)", border:"1px solid rgba(212,168,67,.2)", borderRadius:10, padding:"16px 20px", marginBottom:28, display:"flex", gap:14, alignItems:"flex-start" }}>
        <div style={{ fontSize:"1rem", flexShrink:0, marginTop:3, opacity:.7 }}>⚔</div>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:".4rem", letterSpacing:"4px", color:"rgba(212,168,67,.55)", marginBottom:8 }}>STRATEGIST'S COUNSEL</div>
          <div style={{ fontFamily:"'Crimson Text',serif", fontSize:".95rem", color:"rgba(220,200,155,.8)", lineHeight:1.75 }}>{ch.hint}</div>
        </div>
      </div>

      {/* Rewards */}
      <div style={{ display:"flex", gap:12, marginBottom:32 }}>
        {[
          [`${ch.cpReward} CP`,"CHRONICLE POINTS","rgba(212,168,67,.1)","rgba(212,168,67,.3)","#d4a843"],
          [`+${ch.eloBonus}`,"ELO RATING","rgba(80,110,200,.1)","rgba(80,110,200,.3)","#8aacf0"],
          [ch.difficulty.toUpperCase(),"DIFFICULTY",diff.bg,diff.border,diff.col],
        ].map(([val,label,bg,border,col])=>(
          <div key={label} style={{ flex:1, background:bg, border:`1px solid ${border}`, borderRadius:10, padding:"14px 8px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:".85rem", color:col, marginBottom:4 }}>{val}</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:".36rem", letterSpacing:"2px", color:"rgba(200,180,140,.4)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button onClick={onStart} style={{ width:"100%", padding:"18px 0", background: ch.final ? "linear-gradient(135deg,rgba(100,20,20,.9),rgba(60,10,10,.95))" : "linear-gradient(135deg,rgba(60,35,8,.95),rgba(90,55,12,.9))", border:`1.5px solid ${ch.final ? "rgba(220,80,80,.4)" : "rgba(212,168,67,.4)"}`, borderRadius:10, cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:".7rem", letterSpacing:"5px", color: ch.final ? "#ff9090" : "#f0d060", boxShadow: ch.final ? "0 4px 30px rgba(200,50,50,.2)" : "0 4px 30px rgba(212,168,67,.15)", transition:"all .2s" }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=ch.final?"0 8px 40px rgba(200,50,50,.35)":"0 8px 40px rgba(212,168,67,.3)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=ch.final?"0 4px 30px rgba(200,50,50,.2)":"0 4px 30px rgba(212,168,67,.15)";}}>
        {ch.final ? "ENTER THE ETERNAL WAR" : "ACCEPT THE CHALLENGE"}
      </button>
    </div>
  );
}

// ── Main Pro Tour screen ──────────────────────────────────
export default function ProTour({ tourProgress = {}, onStartChallenge, onBack }) {
  const [selected, setSelected] = useState(null);
  const completed = TOUR_CHALLENGES.filter(c => tourProgress[c.id]).length;

  const bg = `
    radial-gradient(ellipse 70% 50% at 15% 10%, rgba(80,40,150,.45) 0%, transparent 60%),
    radial-gradient(ellipse 60% 45% at 88% 85%, rgba(150,80,20,.35) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(20,10,50,.5) 0%, transparent 70%),
    #05020f
  `;

  if (selected) {
    return (
      <div style={{ minHeight:"100vh", overflowY:"auto", color:"#e8dcc8", fontFamily:"'Crimson Text',serif" }}>
        <div style={{ position:"fixed", inset:0, background:bg, zIndex:-1 }}/>
        <div style={{ maxWidth:860, margin:"0 auto", padding:"48px 0 80px" }}>
          <ChallengeDetail ch={selected} onStart={() => onStartChallenge(selected)} onBack={() => setSelected(null)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", color:"#e8dcc8", fontFamily:"'Crimson Text',serif", overflowY:"auto", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, background:bg, zIndex:0 }}/>

      <div style={{ position:"relative", zIndex:1, maxWidth:900, margin:"0 auto", padding:"40px 28px 90px" }}>

        {/* Back */}
        <button onClick={onBack} style={{ background:"none", border:"none", fontFamily:"'Cinzel',serif", fontSize:".48rem", letterSpacing:"3px", color:"rgba(200,180,140,.38)", cursor:"pointer", marginBottom:40, padding:0, display:"flex", alignItems:"center", gap:8 }}
          onMouseEnter={e=>e.currentTarget.style.color="rgba(200,180,140,.75)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(200,180,140,.38)"}>
          ← RETURN TO GAME
        </button>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ width:60, height:1, margin:"0 auto 18px", background:"linear-gradient(90deg,transparent,rgba(212,168,67,.5),transparent)" }}/>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:".45rem", letterSpacing:"9px", color:"rgba(212,168,67,.45)", marginBottom:14 }}>THE CHRONICLES</div>
          <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(2.2rem,6vw,3.8rem)", color:"#e8dcc8", margin:"0 0 10px", letterSpacing:"8px", textShadow:"0 0 60px rgba(212,168,67,.3), 0 2px 12px rgba(0,0,0,.8)" }}>PRO TOUR</h1>
          <p style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:"1.05rem", color:"rgba(200,180,140,.55)", marginBottom:28 }}>Eight trials across the three realms of time</p>

          {/* Progress bar */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, width:"100%", maxWidth:340 }}>
              <div style={{ flex:1, height:5, borderRadius:3, background:"rgba(255,255,255,.07)", overflow:"hidden", border:"1px solid rgba(255,255,255,.05)" }}>
                <div style={{ height:"100%", width:`${(completed/8)*100}%`, background:"linear-gradient(90deg,#8060c0,#c89030,#f0d060)", transition:"width .7s cubic-bezier(.4,0,.2,1)", borderRadius:3 }}/>
              </div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:".52rem", letterSpacing:"2px", color:"rgba(212,168,67,.7)", whiteSpace:"nowrap" }}>{completed} / 8</div>
            </div>
            {completed > 0 && <div style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:".78rem", color:"rgba(200,180,140,.38)" }}>{completed===8?"All chronicles complete — legend status achieved":`${8-completed} challenge${8-completed>1?"s":""} remain`}</div>}
          </div>
          <div style={{ width:120, height:1, margin:"28px auto 0", background:"linear-gradient(90deg,transparent,rgba(212,168,67,.25),transparent)" }}/>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:18 }}>
          {TOUR_CHALLENGES.map((ch, i) => (
            <ChallengeCard key={ch.id} ch={ch} completed={!!tourProgress[ch.id]} locked={i>0 && !tourProgress[TOUR_CHALLENGES[i-1].id]} onSelect={setSelected} />
          ))}
        </div>

        {/* All-complete banner */}
        {completed === 8 && (
          <div style={{ textAlign:"center", marginTop:52, padding:"32px 28px", background:"rgba(212,168,67,.06)", border:"1px solid rgba(212,168,67,.2)", borderRadius:14 }}>
            <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.3rem", color:"#d4a843", marginBottom:12, textShadow:"0 0 30px rgba(212,168,67,.4)" }}>The Tour is Complete</div>
            <p style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", color:"rgba(200,180,130,.65)", fontSize:"1.05rem", lineHeight:1.8, margin:0 }}>
              Your name has been written into the Chronicles of Three Realms.<br/>The war continues — but you have proven yourself a legend.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
