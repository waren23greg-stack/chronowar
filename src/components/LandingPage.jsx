// ============================================================
//  CHRONOWAR — Landing Page
// ============================================================
import { useEffect, useState } from "react";

const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 43.37 + 7) % 100, y: (i * 71.11 + 3) % 100,
  sz: i % 9 === 0 ? 2.5 : i % 5 === 0 ? 1.8 : 1,
  dur: 2 + (i % 5), del: (i % 6) * 0.55,
}));

const FACTION_PIECES = [
  { symbol: "♔", name: "Monarch Auris", desc: "Commands from the Present realm" },
  { symbol: "♕", name: "Lady Solenne", desc: "Weaver of Time — slides any direction" },
  { symbol: "♘", name: "Chronorider", desc: "Leaps in an L across time" },
  { symbol: "✦", name: "The Oracle", desc: "Sage — slides orthogonally like a Rook" },
  { symbol: "◈", name: "Phase Walker", desc: "Phases diagonally through allies" },
];

export default function LandingPage({ onPlay }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse 80% 55% at 20% 10%, #0e0535 0%, transparent 65%), radial-gradient(ellipse 60% 45% at 82% 88%, #1c0438 0%, transparent 60%), #040210",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Crimson Text', serif",
      overflow: "hidden", position: "relative",
    }}>
      {/* Stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        {STARS.map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.sz, height: s.sz,
            background: "white", borderRadius: "50%",
            opacity: 0.07,
            animation: `starTwinkle ${s.dur}s ${s.del}s linear infinite`,
          }} />
        ))}
      </div>

      {/* Hero */}
      <div style={{
        textAlign: "center", zIndex: 1, maxWidth: 720,
        padding: "0 24px",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(24px)",
        transition: "opacity .9s ease, transform .9s ease",
      }}>
        {/* Icon */}
        <div style={{
          fontSize: "4rem", marginBottom: 12,
          filter: "drop-shadow(0 0 28px rgba(200,150,40,.7))",
          animation: "landFloat 4s ease-in-out infinite",
        }}>⚔</div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(2.2rem, 7vw, 4rem)",
          letterSpacing: "10px",
          margin: 0,
          background: "linear-gradient(110deg, #c49020 0%, #f0d860 22%, #d4a843 44%, #b040ff 66%, #38d888 82%, #d4a843 100%)",
          backgroundSize: "240% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 7s linear infinite",
          filter: "drop-shadow(0 0 2px rgba(180,130,40,.3))",
        }}>CHRONOWAR</h1>

        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: ".55rem", letterSpacing: "10px",
          color: "rgba(180,130,40,.55)", margin: "8px 0 40px",
          textTransform: "uppercase",
        }}>THE CHRONICLES OF THREE REALMS</p>

        {/* Tagline */}
        <p style={{
          fontSize: "1.22rem", color: "rgba(220,200,165,.88)",
          lineHeight: 1.75, maxWidth: 560, margin: "0 auto 48px",
          fontStyle: "italic",
        }}>
          Two factions. Three realms of time. Every move writes a verse in an epic saga
          narrated by an ancient chronicler. Chess has never been this legendary.
        </p>

        {/* CTA */}
        <button
          onClick={onPlay}
          style={{
            background: "linear-gradient(135deg, rgba(80,45,8,.97), rgba(120,70,12,.97))",
            border: "1px solid rgba(210,165,48,.6)",
            color: "#d4a843",
            padding: "18px 54px",
            fontFamily: "'Cinzel', serif",
            fontSize: ".88rem",
            letterSpacing: "5px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all .24s",
            boxShadow: "0 0 40px rgba(200,155,40,.18), 0 4px 24px rgba(0,0,0,.5)",
            marginBottom: 16,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(110,62,12,.99), rgba(155,90,15,.99))";
            e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 0 60px rgba(200,155,40,.28), 0 8px 32px rgba(0,0,0,.6)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(80,45,8,.97), rgba(120,70,12,.97))";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 0 40px rgba(200,155,40,.18), 0 4px 24px rgba(0,0,0,.5)";
          }}
        >
          ⚔ ENTER THE WAR
        </button>

        <div style={{ fontSize: ".72rem", color: "rgba(100,75,35,.6)", fontFamily: "'Cinzel', serif", letterSpacing: "2px" }}>
          No account needed · Free forever
        </div>
      </div>

      {/* Feature cards */}
      <div style={{
        zIndex: 1, display: "flex", gap: 16, flexWrap: "wrap",
        justifyContent: "center", padding: "48px 24px 0",
        opacity: visible ? 1 : 0,
        transition: "opacity 1.2s .3s ease",
        maxWidth: 860,
      }}>
        {[
          { icon: "🌍", title: "Three Realms", text: "Past, Present & Future — each a separate 6×6 battlefield. Pieces can transcend time itself." },
          { icon: "📖", title: "Living Narrative", text: "Every move generates 2–3 verses of AI epic storytelling. Your game becomes a unique saga." },
          { icon: "🤖", title: "Rival Intelligence", text: "An AI opponent that thinks across all three timelines simultaneously. Three difficulty levels." },
          { icon: "🏆", title: "Battle Chronicle", text: "After checkmate, Claude weaves every move into one legendary story you can share forever." },
        ].map((f, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === i
                ? "rgba(22,12,40,.95)"
                : "rgba(10,5,22,.85)",
              border: `1px solid ${hovered === i ? "rgba(180,110,255,.35)" : "rgba(70,45,100,.2)"}`,
              borderRadius: 10,
              padding: "20px 22px",
              width: 190,
              transition: "all .25s",
              transform: hovered === i ? "translateY(-4px)" : "none",
              boxShadow: hovered === i ? "0 8px 30px rgba(0,0,0,.5)" : "none",
            }}
          >
            <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{f.icon}</div>
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: ".62rem",
              letterSpacing: "3px",
              color: "rgba(195,150,50,.9)",
              marginBottom: 8,
            }}>{f.title.toUpperCase()}</div>
            <div style={{ fontSize: ".88rem", color: "rgba(180,160,130,.75)", lineHeight: 1.65 }}>{f.text}</div>
          </div>
        ))}
      </div>

      {/* Piece showcase */}
      <div style={{
        zIndex: 1, marginTop: 52, display: "flex", gap: 28,
        opacity: visible ? 0.7 : 0, transition: "opacity 1.5s .5s ease",
        flexWrap: "wrap", justifyContent: "center",
        padding: "0 24px 60px",
      }}>
        {FACTION_PIECES.map((p, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "2rem",
              color: "rgba(220,185,80,.6)",
              filter: "drop-shadow(0 0 10px rgba(180,140,40,.4))",
              marginBottom: 4,
            }}>{p.symbol}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".45rem", letterSpacing: "2px", color: "rgba(140,100,30,.55)" }}>
              {p.name.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
