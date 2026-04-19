// ============================================================
//  CHRONOWAR — Landing Page v2
//  Cinematic. No emoji. Designed to make you want to play.
// ============================================================
import { useEffect, useState, useRef } from "react";
import { King, Queen, Knight, Sage, PhaseWalker } from "../pieces";

// ── Tiny SVG icons (no emoji) ─────────────────────────────
const Icon = {
  realms: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="10" width="10" height="10" rx="1" stroke="#c89030" strokeWidth="1.2" opacity=".6"/>
      <rect x="11" y="6" width="10" height="14" rx="1" stroke="#c89030" strokeWidth="1.5"/>
      <rect x="20" y="10" width="10" height="10" rx="1" stroke="#c89030" strokeWidth="1.2" opacity=".6"/>
      <line x1="12" y1="13" x2="20" y2="13" stroke="#c89030" strokeWidth=".8" strokeDasharray="2 2" opacity=".5"/>
    </svg>
  ),
  quill: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M6 26 C8 18 18 8 28 4 C24 10 18 16 10 28 Z" stroke="#c89030" strokeWidth="1.2" fill="none"/>
      <path d="M10 28 L6 26" stroke="#c89030" strokeWidth="1.2"/>
      <line x1="6" y1="26" x2="14" y2="22" stroke="#c89030" strokeWidth=".8" opacity=".5"/>
    </svg>
  ),
  mind: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="14" r="8" stroke="#c89030" strokeWidth="1.2"/>
      <path d="M12 14 L16 10 L20 14 L16 22" stroke="#c89030" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <circle cx="16" cy="14" r="2" fill="#c89030" opacity=".5"/>
    </svg>
  ),
  scroll: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="5" width="20" height="22" rx="2" stroke="#c89030" strokeWidth="1.2"/>
      <line x1="10" y1="11" x2="22" y2="11" stroke="#c89030" strokeWidth=".9" opacity=".6"/>
      <line x1="10" y1="15" x2="22" y2="15" stroke="#c89030" strokeWidth=".9" opacity=".6"/>
      <line x1="10" y1="19" x2="18" y2="19" stroke="#c89030" strokeWidth=".9" opacity=".6"/>
      <path d="M6 5 C6 3 4 3 4 5 L4 25 C4 27 6 27 6 27" stroke="#c89030" strokeWidth="1.2" fill="none"/>
    </svg>
  ),
};

// ── Mini animated board (realm preview) ──────────────────
function RealmPreview({ colors, label, sub, delay = 0 }) {
  const [lit, setLit] = useState(-1);
  useEffect(() => {
    const t = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        setLit(i++ % 36);
        if (i > 50) clearInterval(iv);
      }, 90);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        display: "inline-grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 1,
        border: `1px solid ${colors.border}`,
        padding: 2,
        borderRadius: 4,
        background: "rgba(0,0,0,.4)",
        boxShadow: `0 0 24px ${colors.glow}22, 0 0 60px ${colors.glow}0a`,
      }}>
        {Array.from({ length: 36 }, (_, i) => {
          const row = Math.floor(i / 6), col = i % 6;
          const isLight = (row + col) % 2 === 0;
          const isLit   = lit === i;
          return (
            <div key={i} style={{
              width: 18, height: 18,
              background: isLit
                ? colors.glow
                : isLight ? colors.light : colors.dark,
              transition: "background .18s",
              borderRadius: 1,
            }} />
          );
        })}
      </div>
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: ".5rem", letterSpacing: "4px",
        color: colors.text,
        marginTop: 8, marginBottom: 2,
      }}>{label}</div>
      <div style={{
        fontSize: ".75rem", color: "rgba(200,180,150,.45)",
        fontStyle: "italic",
      }}>{sub}</div>
    </div>
  );
}

// ── Animated separator ────────────────────────────────────
function Ornament() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"0 auto", width: "min(480px, 80%)" }}>
      <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(180,130,40,.35))" }}/>
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" fill="#c89030" opacity=".7"/>
      </svg>
      <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(180,130,40,.35),transparent)" }}/>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export default function LandingPage({ onPlay }) {
  const [phase, setPhase] = useState(0); // 0=hidden 1=hero 2=all
  const [hovBtn, setHovBtn] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: [
        "radial-gradient(ellipse 100% 60% at 50% 0%, #0c0520 0%, transparent 70%)",
        "radial-gradient(ellipse 70% 50% at 10% 60%, #0a0318 0%, transparent 60%)",
        "radial-gradient(ellipse 60% 40% at 90% 80%, #100428 0%, transparent 55%)",
        "#030110",
      ].join(", "),
      color: "#e8dcc8",
      fontFamily: "'Crimson Text', serif",
      overflowX: "hidden",
      position: "relative",
    }}>

      {/* ── Particle field ── */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        {Array.from({ length: 55 }, (_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 47.3 + 11) % 100}%`,
            top:  `${(i * 83.1 + 7)  % 100}%`,
            width:  i % 11 === 0 ? 2 : i % 5 === 0 ? 1.5 : 1,
            height: i % 11 === 0 ? 2 : i % 5 === 0 ? 1.5 : 1,
            borderRadius: "50%",
            background: i % 7 === 0 ? "#c89030" : "white",
            opacity: i % 7 === 0 ? 0.12 : 0.05,
            animation: `starTwinkle ${2.5 + (i % 4) * 0.8}s ${(i % 6) * 0.4}s linear infinite`,
          }} />
        ))}
      </div>

      {/* ══════════════════════════════════════════
          HERO
         ══════════════════════════════════════════ */}
      <section ref={heroRef} style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px 80px",
        textAlign: "center",
      }}>
        {/* Top rule */}
        <div style={{
          position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)",
          width: "min(600px,80%)", height: 1,
          background: "linear-gradient(90deg,transparent,rgba(180,130,40,.3),transparent)",
        }} />

        {/* Eyebrow */}
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: ".5rem", letterSpacing: "8px",
          color: "rgba(180,130,40,.5)",
          marginBottom: 28,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "none" : "translateY(8px)",
          transition: "opacity .8s ease, transform .8s ease",
        }}>
          THE CHRONICLES OF THREE REALMS
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(3rem, 9vw, 6.5rem)",
          letterSpacing: "clamp(6px, 2vw, 18px)",
          margin: "0 0 4px",
          lineHeight: 1,
          background: "linear-gradient(165deg, #f0d878 0%, #c89030 30%, #e8c050 55%, #9a6818 80%, #c89030 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 6s linear infinite",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "none" : "translateY(16px)",
          transition: "opacity .9s .1s ease, transform .9s .1s ease",
        }}>
          CHRONOWAR
        </h1>

        {/* Subtitle rule */}
        <div style={{
          width: 120, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(200,144,48,.55),transparent)",
          margin: "18px auto 24px",
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 1s .3s ease",
        }}/>

        {/* Body copy */}
        <p style={{
          fontSize: "clamp(1.1rem, 2.2vw, 1.45rem)",
          lineHeight: 1.85,
          color: "rgba(228,208,172,.82)",
          maxWidth: 580,
          margin: "0 auto 48px",
          fontStyle: "italic",
          fontWeight: 400,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "none" : "translateY(12px)",
          transition: "opacity 1s .25s ease, transform 1s .25s ease",
        }}>
          Two ancient orders wage war across Past, Present, and Future.
          Every move you make is written into myth by an eternal chronicler.
          This is chess. This is legend.
        </p>

        {/* CTA */}
        <button
          onClick={onPlay}
          onMouseEnter={() => setHovBtn(true)}
          onMouseLeave={() => setHovBtn(false)}
          style={{
            position: "relative",
            background: hovBtn
              ? "rgba(200,144,48,.18)"
              : "rgba(180,124,32,.10)",
            border: `1.5px solid rgba(200,148,40,${hovBtn ? ".7" : ".45"})`,
            color: hovBtn ? "#f0d060" : "#d4a843",
            padding: "20px 64px",
            fontFamily: "'Cinzel', serif",
            fontSize: ".82rem",
            letterSpacing: "6px",
            borderRadius: 3,
            cursor: "pointer",
            transition: "all .28s ease",
            transform: hovBtn ? "translateY(-3px)" : "none",
            boxShadow: hovBtn
              ? "0 0 48px rgba(200,148,40,.2), 0 12px 40px rgba(0,0,0,.5), inset 0 0 30px rgba(200,148,40,.06)"
              : "0 4px 24px rgba(0,0,0,.4)",
            letterSpacing: "7px",
            opacity: phase >= 1 ? 1 : 0,
            marginBottom: 16,
          }}
        >
          ENTER THE WAR
          {/* Animated corner accents */}
          {["tl","tr","bl","br"].map(p => (
            <span key={p} style={{
              position: "absolute",
              width: 8, height: 8,
              borderColor: "rgba(200,148,40,.6)",
              borderStyle: "solid",
              borderWidth: 0,
              ...(p[0]==="t" ? { top: -1 } : { bottom: -1 }),
              ...(p[1]==="l" ? { left: -1, borderLeftWidth: 1.5, borderTopWidth: p[0]==="t" ? 1.5 : 0, borderBottomWidth: p[0]==="b" ? 1.5 : 0 }
                             : { right: -1, borderRightWidth: 1.5, borderTopWidth: p[0]==="t" ? 1.5 : 0, borderBottomWidth: p[0]==="b" ? 1.5 : 0 }),
            }} />
          ))}
        </button>

        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: "11px",
          letterSpacing: "4px", color: "rgba(130,100,45,.45)",
          opacity: phase >= 2 ? 1 : 0, transition: "opacity 1s .6s ease",
        }}>
          FREE TO PLAY  ·  NO ACCOUNT  ·  PLAY IN BROWSER
        </div>

        {/* Scroll cue */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          opacity: phase >= 2 ? 0.4 : 0,
          transition: "opacity 1.2s 1s ease",
          animation: "landFloat 2.8s ease-in-out infinite",
        }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"10px", letterSpacing:"4px", color:"rgba(180,130,40,.6)" }}>DISCOVER</div>
          <svg width="14" height="20" viewBox="0 0 14 20">
            <path d="M7 1 L7 15 M3 11 L7 15 L11 11" stroke="rgba(200,148,40,.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          THREE REALMS PREVIEW
         ══════════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "80px 24px",
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: phase >= 2 ? 1 : 0,
        transition: "opacity 1.4s .4s ease",
      }}>
        <Ornament />
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: ".52rem", letterSpacing: "6px",
          color: "rgba(180,130,40,.45)",
          margin: "32px 0 10px",
        }}>THE THREE REALMS OF TIME</div>
        <p style={{
          fontSize: "1.08rem", color: "rgba(210,188,150,.65)",
          maxWidth: 480, textAlign: "center", lineHeight: 1.8,
          marginBottom: 40, fontStyle: "italic",
        }}>
          Three simultaneous battlefields. One war.
        </p>

        <div style={{ display:"flex", gap:40, flexWrap:"wrap", justifyContent:"center" }}>
          <RealmPreview delay={200}
            label="PAST ECHOES" sub="Where strategies were born"
            colors={{ light:"#c8b070", dark:"#7a5220", glow:"#e8a820", text:"rgba(210,160,60,.8)", border:"rgba(180,120,30,.4)" }}
          />
          <RealmPreview delay={500}
            label="THE LIVING WAR" sub="The eternal battleground"
            colors={{ light:"#90b878", dark:"#3a6828", glow:"#60c840", text:"rgba(120,200,80,.8)", border:"rgba(50,140,40,.4)" }}
          />
          <RealmPreview delay={800}
            label="FATE'S SHADOW" sub="Destiny yet unwritten"
            colors={{ light:"#9080c8", dark:"#401870", glow:"#9840e8", text:"rgba(180,120,255,.8)", border:"rgba(120,60,200,.4)" }}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — Editorial layout
         ══════════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        maxWidth: 900, margin: "0 auto",
        padding: "40px 32px 80px",
        opacity: phase >= 2 ? 1 : 0,
        transition: "opacity 1.4s .6s ease",
      }}>
        <Ornament />

        {[
          {
            num: "I",
            icon: Icon.quill,
            title: "Every Move Becomes Myth",
            body: "Each move you make is sent to Claude — an AI that writes 2–3 sentences of epic mythic prose in real time. Your game isn't a sequence of moves. It's a war chronicle, written verse by verse, that no one else will ever play.",
          },
          {
            num: "II",
            icon: Icon.mind,
            title: "An Opponent That Thinks Across Time",
            body: "The AI opponent runs minimax search across all three boards simultaneously. It understands that a sacrifice in the Past can decide the Future. Three difficulty levels — from tactical to genuinely hard.",
          },
          {
            num: "III",
            icon: Icon.realms,
            title: "Chess Rules. Broken by Time.",
            body: "All standard chess movement applies — but Kings can cross realms. Pawns that reach the far rank can transcend into an adjacent timeline. The Phase Walker slides through allied pieces as though they don't exist.",
          },
          {
            num: "IV",
            icon: Icon.scroll,
            title: "Your Chronicle. Yours Forever.",
            body: "After checkmate, Claude writes the entire war as one flowing epic — opening, climax, epilogue. Then export a parchment image card, share it on X or Instagram, or keep it as your own piece of legend.",
          },
        ].map((f, i) => (
          <div key={i} style={{
            display: "flex",
            gap: 36,
            alignItems: "flex-start",
            padding: "42px 0",
            borderBottom: i < 3 ? "1px solid rgba(180,130,40,.1)" : "none",
          }}>
            {/* Left — number + icon */}
            <div style={{ flexShrink: 0, width: 72, textAlign: "center" }}>
              <div style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "1.6rem",
                color: "rgba(180,130,40,.2)",
                lineHeight: 1,
                marginBottom: 10,
              }}>{f.num}</div>
              {f.icon}
            </div>
            {/* Right — text */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: ".75rem",
                letterSpacing: "4px",
                color: "rgba(210,165,65,.85)",
                marginBottom: 12,
                fontWeight: 700,
              }}>{f.title.toUpperCase()}</div>
              <p style={{
                fontSize: "1.05rem",
                color: "rgba(210,190,155,.75)",
                lineHeight: 1.85,
                margin: 0,
              }}>{f.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════════
          PIECE SHOWCASE — real SVG pieces
         ══════════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "40px 24px 80px",
        textAlign: "center",
        opacity: phase >= 2 ? 1 : 0,
        transition: "opacity 1.4s .8s ease",
      }}>
        <Ornament />
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: ".5rem", letterSpacing: "6px",
          color: "rgba(180,130,40,.4)",
          margin: "32px 0 40px",
        }}>THE LUMINAR ORDER</div>

        <div style={{ display:"flex", gap:28, justifyContent:"center", flexWrap:"wrap", marginBottom: 12 }}>
          {[
            { C: King,       name: "Monarch Auris" },
            { C: Queen,      name: "Lady Solenne" },
            { C: Knight,     name: "Chronorider" },
            { C: Sage,       name: "The Oracle" },
            { C: PhaseWalker,name: "Phase Walker" },
          ].map(({ C, name }, i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{
                padding: "14px 14px 10px",
                background: "rgba(180,130,30,.05)",
                border: "1px solid rgba(180,130,30,.12)",
                borderRadius: 6,
                marginBottom: 8,
                transition: "all .22s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(180,130,30,.12)"; e.currentTarget.style.borderColor="rgba(200,155,40,.28)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(180,130,30,.05)"; e.currentTarget.style.borderColor="rgba(180,130,30,.12)"; }}
              >
                <C size={54} isWhite={true} />
              </div>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: ".4rem", letterSpacing: "2px",
                color: "rgba(180,140,60,.5)",
              }}>{name.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
         ══════════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "60px 24px 100px",
        textAlign: "center",
        opacity: phase >= 2 ? 1 : 0,
        transition: "opacity 1.4s 1s ease",
      }}>
        {/* Decorative top rule */}
        <div style={{
          width: "min(640px,85%)", height: 1, margin: "0 auto 56px",
          background: "linear-gradient(90deg,transparent,rgba(180,130,40,.3),rgba(100,60,180,.2),transparent)",
        }}/>

        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(1rem, 3vw, 1.6rem)",
          color: "rgba(200,168,80,.7)",
          letterSpacing: "4px",
          marginBottom: 18,
        }}>
          The war begins when you move first.
        </div>
        <p style={{
          fontSize: "1rem", color: "rgba(190,165,125,.5)",
          marginBottom: 40, fontStyle: "italic",
        }}>
          Every game is different. Every chronicle is yours alone.
        </p>

        <button
          onClick={onPlay}
          style={{
            background: "rgba(180,124,32,.12)",
            border: "1.5px solid rgba(200,148,40,.5)",
            color: "#d4a843",
            padding: "20px 80px",
            fontFamily: "'Cinzel', serif",
            fontSize: ".82rem",
            letterSpacing: "7px",
            borderRadius: 3,
            cursor: "pointer",
            transition: "all .28s ease",
            boxShadow: "0 0 40px rgba(180,130,40,.12)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(200,144,48,.2)";
            e.currentTarget.style.borderColor = "rgba(200,148,40,.75)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 60px rgba(180,130,40,.22)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(180,124,32,.12)";
            e.currentTarget.style.borderColor = "rgba(200,148,40,.5)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 0 40px rgba(180,130,40,.12)";
          }}
        >
          ENTER THE WAR
        </button>
      </section>

    </div>
  );
}
