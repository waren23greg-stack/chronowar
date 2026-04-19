// ============================================================
//  CHRONOWAR — Chronicle Card Generator
//  Renders a 1200×675 (16:9) canvas card, exports PNG
//  Instagram: square 1080×1080, X: 1200×675
// ============================================================
import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";

const GAME_URL = "https://chronowar.vercel.app";
const W = 1200, H = 675;          // 16:9 — X / Twitter card
const W_SQ = 1080, H_SQ = 1080;   // Square — Instagram

// ── Colour palette painted on canvas ─────────────────────
const P = {
  parchment:  "#d4bc84",
  parchDark:  "#b8985a",
  inkDark:    "#1e0e04",
  inkMid:     "#3a1e08",
  inkLight:   "#6a3c10",
  gold:       "#c08020",
  goldLight:  "#e8c050",
  white:      "#f8eedc",
  luminar:    "#8a5010",
  umbral:     "#3a1870",
  redAccent:  "#8b1a00",
};

// ── Utility painters ─────────────────────────────────────
function measureWrap(ctx, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function paintWrapped(ctx, text, x, y, maxW, lineH, align = "center") {
  const lines = measureWrap(ctx, text, maxW);
  ctx.textAlign = align;
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
  return lines.length * lineH;
}

function paintParchment(ctx, w, h) {
  // Base warm parchment gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0,   "#ddc888");
  bg.addColorStop(0.3, "#cdb060");
  bg.addColorStop(0.7, "#c8a850");
  bg.addColorStop(1,   "#b89040");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle vignette
  const vig = ctx.createRadialGradient(w/2, h/2, h*0.25, w/2, h/2, h*0.85);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Random age spots
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const sx = (i * 137.5) % w;
    const sy = (i * 97.3 + 40) % h;
    const sr = 4 + (i % 5) * 6;
    const spot = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    spot.addColorStop(0, "rgba(80,40,0,0.10)");
    spot.addColorStop(1, "rgba(80,40,0,0)");
    ctx.fillStyle = spot;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Horizontal ruled lines (like aged paper)
  ctx.save();
  ctx.strokeStyle = "rgba(100,65,10,0.10)";
  ctx.lineWidth = 0.8;
  for (let y = 60; y < h; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();
}

function paintBorder(ctx, w, h) {
  const m = 18; // margin
  // Outer burn edge
  ctx.save();
  ctx.strokeStyle = "rgba(60,30,5,0.55)";
  ctx.lineWidth = 6;
  ctx.strokeRect(m, m, w - m*2, h - m*2);

  // Inner double line
  ctx.strokeStyle = "rgba(130,80,15,0.45)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(m + 8, m + 8, w - (m+8)*2, h - (m+8)*2);
  ctx.strokeRect(m + 12, m + 12, w - (m+12)*2, h - (m+12)*2);

  // Corner ornaments
  const corners = [[m+2,m+2],[w-m-2,m+2],[m+2,h-m-2],[w-m-2,h-m-2]];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = P.gold;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = P.inkDark;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  ctx.restore();
}

function paintDivider(ctx, y, w, xPad) {
  ctx.save();
  ctx.strokeStyle = "rgba(100,65,15,0.45)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(xPad, y); ctx.lineTo(w - xPad, y); ctx.stroke();
  ctx.setLineDash([]);
  // Diamond centre
  ctx.fillStyle = P.gold;
  ctx.save();
  ctx.translate(w / 2, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();
  ctx.restore();
}

// ── Main card painter ────────────────────────────────────
async function paintCard(canvas, data, square = false) {
  const cw = square ? W_SQ : W;
  const ch = square ? H_SQ : H;
  canvas.width  = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  const xPad = 50;

  paintParchment(ctx, cw, ch);
  paintBorder(ctx, cw, ch);

  let yc = 44; // vertical cursor

  // ── HEADER — CHRONOWAR ───────────────────────────────
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `bold ${square ? 28 : 22}px "Cinzel Decorative", serif`;
  ctx.fillStyle = P.inkDark;
  ctx.letterSpacing = "8px";
  ctx.fillText("⚔  CHRONOWAR  ⚔", cw / 2, yc + 28);

  ctx.font = `${square ? 11 : 10}px "Cinzel", serif`;
  ctx.fillStyle = P.inkLight;
  ctx.fillText("THE CHRONICLES OF THREE REALMS", cw / 2, yc + 48);
  ctx.restore();

  yc += square ? 72 : 65;
  paintDivider(ctx, yc, cw, xPad);
  yc += 24;

  // ── SAGA TITLE ────────────────────────────────────────
  ctx.save();
  ctx.textAlign = "center";
  const titleSize = square
    ? Math.min(52, Math.floor(920 / (data.title.length * 0.55)))
    : Math.min(44, Math.floor(800 / (data.title.length * 0.55)));
  ctx.font = `bold ${titleSize}px "Cinzel Decorative", serif`;
  ctx.fillStyle = P.inkDark;
  const titleLines = measureWrap(ctx, data.title, cw - xPad * 2 - (square ? 0 : 180));
  titleLines.forEach((l, i) => {
    ctx.fillText(l, cw / 2, yc + 20 + i * (titleSize + 8));
  });
  yc += titleLines.length * (titleSize + 8) + 12;
  ctx.restore();

  // Winner banner
  const winnerBg  = data.winner === "Luminar Order" ? "rgba(180,130,40,.22)" : "rgba(80,40,160,.18)";
  const winnerClr = data.winner === "Luminar Order" ? P.luminar : P.umbral;
  const bannerW   = square ? 340 : 300;
  const bannerX   = (cw - bannerW) / 2;
  ctx.save();
  ctx.fillStyle = winnerBg;
  ctx.beginPath();
  ctx.roundRect(bannerX, yc, bannerW, 34, 17);
  ctx.fill();
  ctx.strokeStyle = winnerClr + "88";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = `bold 12px "Cinzel", serif`;
  ctx.fillStyle = winnerClr;
  ctx.textAlign = "center";
  ctx.fillText(`VICTORY · ${data.winner.toUpperCase()} · ${data.moveCount} MOVES`, cw / 2, yc + 22);
  ctx.restore();
  yc += 48;

  paintDivider(ctx, yc, cw, xPad);
  yc += 20;

  // ── KEY MOMENTS ───────────────────────────────────────
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `bold ${square ? 11 : 10}px "Cinzel", serif`;
  ctx.fillStyle = P.inkLight;
  ctx.fillText("KEY MOMENTS", cw / 2, yc + 14);
  ctx.restore();
  yc += 26;

  const maxMoments = square ? 4 : 3;
  const moments    = data.moments.slice(0, maxMoments);
  const momH       = square ? (ch - yc - 110) / maxMoments : (ch - yc - 110) / maxMoments;
  const qrSpace    = square ? 0 : 170; // right-side QR zone (landscape only)
  const momW       = cw - xPad * 2 - qrSpace - 20;

  moments.forEach((m, i) => {
    const my = yc + i * (momH);
    // Quote mark
    ctx.save();
    ctx.font = `bold ${square ? 30 : 26}px "Crimson Text", serif`;
    ctx.fillStyle = "rgba(130,80,15,0.2)";
    ctx.textAlign = "left";
    ctx.fillText("\u201C", xPad, my + 28);
    // Verse text
    ctx.font = `italic ${square ? 15 : 13}px "Crimson Text", serif`;
    ctx.fillStyle = P.inkMid;
    const snippet = m.length > 130 ? m.slice(0, 127) + "…" : m;
    paintWrapped(ctx, snippet, xPad + 22, my + 14, momW - 22, 18, "left");
    // Move tag
    ctx.font = `${square ? 10 : 9}px "Cinzel", serif`;
    ctx.fillStyle = P.gold;
    ctx.textAlign = "left";
    ctx.fillText(`VERSE ${i + 1}`, xPad + 22, my + 2);
    ctx.restore();
    // Thin separator between moments
    if (i < moments.length - 1) {
      ctx.save();
      ctx.strokeStyle = "rgba(100,65,15,0.18)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(xPad + 20, my + momH - 4);
      ctx.lineTo(xPad + momW - 10, my + momH - 4);
      ctx.stroke();
      ctx.restore();
    }
  });
  yc = ch - 80;

  // ── BOTTOM STATS BAR ─────────────────────────────────
  paintDivider(ctx, yc, cw, xPad);
  yc += 14;

  const stats = [
    ["CAPTURES", data.captures],
    ["CROSS-REALM", data.crossRealm],
    ["CHECKS", data.checks],
    ["CP EARNED", data.cpEarned],
  ];
  const statW   = (cw - xPad * 2 - qrSpace - 10) / stats.length;
  stats.forEach(([label, val], i) => {
    const sx = xPad + i * statW + statW / 2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `bold 16px "Cinzel", serif`;
    ctx.fillStyle = P.inkDark;
    ctx.fillText(String(val ?? 0), sx, yc + 22);
    ctx.font = `9px "Cinzel", serif`;
    ctx.fillStyle = P.inkLight;
    ctx.fillText(label, sx, yc + 34);
    ctx.restore();
  });

  // URL tag bottom
  ctx.save();
  ctx.textAlign = square ? "center" : "left";
  ctx.font = `bold 11px "Cinzel", serif`;
  ctx.fillStyle = "rgba(80,50,15,0.55)";
  ctx.fillText("chronowar.vercel.app", square ? cw/2 : xPad, ch - 24);
  ctx.restore();

  // ── QR CODE (landscape right column) ─────────────────
  if (!square) {
    try {
      const qrDataUrl = await QRCode.toDataURL(GAME_URL, {
        width: 130, margin: 1,
        color: { dark: "#2a1004", light: "#d4bc84" },
      });
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const qx = cw - xPad - 130;
          const qy = (ch - 130) / 2 + 10;
          // Parchment backing
          ctx.save();
          ctx.fillStyle = "rgba(200,170,80,0.3)";
          ctx.beginPath();
          ctx.roundRect(qx - 8, qy - 8, 146, 146, 6);
          ctx.fill();
          ctx.strokeStyle = "rgba(120,80,20,0.35)";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
          ctx.drawImage(img, qx, qy, 130, 130);
          // "Scan to play" label
          ctx.save();
          ctx.textAlign = "center";
          ctx.font = `bold 9px "Cinzel", serif`;
          ctx.fillStyle = P.inkLight;
          ctx.fillText("SCAN TO PLAY", qx + 65, qy + 148);
          ctx.restore();
          resolve();
        };
        img.src = qrDataUrl;
      });
    } catch {}
  }
}

// ── React component ───────────────────────────────────────
export default function ChronicleCardModal({ data, onClose }) {
  const canvasRef    = useRef(null);
  const sqCanvasRef  = useRef(null);
  const [mode, setMode]         = useState("wide");   // "wide" | "square"
  const [rendering, setRendering] = useState(true);
  const [shared, setShared]     = useState(false);

  const activeRef = mode === "wide" ? canvasRef : sqCanvasRef;

  const render = useCallback(async () => {
    setRendering(true);
    try {
      if (canvasRef.current)   await paintCard(canvasRef.current,   data, false);
      if (sqCanvasRef.current) await paintCard(sqCanvasRef.current, data, true);
    } finally {
      setRendering(false);
    }
  }, [data]);

  useEffect(() => { render(); }, [render]);

  const download = () => {
    const canvas = activeRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chronowar-${data.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const shareCard = async () => {
    const canvas = activeRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async blob => {
        const file = new File([blob], "chronowar-chronicle.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: data.title,
            text: `⚔ ${data.title} — A ChronoWar battle across three realms of time.\n\n${GAME_URL}`,
          });
          setShared(true);
        } else {
          // Fallback — copy URL + open X
          await navigator.clipboard.writeText(
            `⚔ ${data.title} — A ChronoWar battle across three realms of time.\n\nPlay free at ${GAME_URL}`
          );
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `⚔ ${data.title} — A ChronoWar saga across three realms of time. Play free at ${GAME_URL} #ChronoWar #Chess`
            )}`,
            "_blank"
          );
        }
      }, "image/png");
    } catch {}
  };

  const btn = (label, onClick, accent = false) => (
    <button onClick={onClick} style={{
      background: accent ? "rgba(80,45,8,.9)" : "rgba(255,255,255,.18)",
      border: `1px solid ${accent ? "rgba(200,155,46,.6)" : "rgba(100,70,25,.35)"}`,
      color: accent ? "#f0d060" : "#3a1a04",
      padding: "9px 20px",
      fontFamily: "'Cinzel', serif",
      fontSize: ".6rem",
      letterSpacing: "2px",
      borderRadius: 6,
      cursor: "pointer",
      transition: "all .18s",
      boxShadow: accent ? "0 2px 12px rgba(0,0,0,.3)" : "none",
    }}
    onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.15)"}
    onMouseLeave={e => e.currentTarget.style.filter = "none"}
    >{label}</button>
  );

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.9)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 300,
    }} onClick={onClose}>
      <div style={{
        background: "linear-gradient(155deg, #d8c898, #c4ac70)",
        border: "1.5px solid rgba(130,90,25,.5)",
        borderRadius: 14,
        width: "min(880px, 96vw)",
        maxHeight: "94vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 0 100px rgba(0,0,0,.6), 0 0 0 6px rgba(100,70,20,.12)",
        animation: "overlayIn .4s cubic-bezier(.34,1.56,.64,1)",
        overflow: "hidden",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: "18px 24px 14px",
          borderBottom: "1px solid rgba(120,80,20,.25)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(0,0,0,.06)",
        }}>
          <div>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1rem", color: "#2a1004", marginBottom: 2 }}>
              Chronicle Card
            </div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".48rem", letterSpacing: "3px", color: "rgba(80,50,15,.6)" }}>
              SHAREABLE · DOWNLOADABLE · LEGENDARY
            </div>
          </div>
          {/* Format toggle */}
          <div style={{ display: "flex", border: "1px solid rgba(100,65,20,.3)", borderRadius: 6, overflow: "hidden" }}>
            {[["wide","16:9  X/Twitter"],["square","1:1  Instagram"]].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                background: mode === m ? "rgba(0,0,0,.14)" : "transparent",
                border: "none",
                color: mode === m ? "#2a1004" : "rgba(80,55,20,.6)",
                padding: "6px 14px",
                fontFamily: "'Cinzel', serif",
                fontSize: ".5rem",
                letterSpacing: "1px",
                cursor: "pointer",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Canvas preview */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
          {rendering && (
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".7rem", color: "rgba(80,50,15,.7)", letterSpacing: "3px", animation: "narrBlink 1.4s ease infinite" }}>
              ✦ Painting the chronicle…
            </div>
          )}
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef}   style={{ maxWidth: "100%", borderRadius: 6, boxShadow: "0 4px 24px rgba(0,0,0,.45)", display: mode === "wide"   && !rendering ? "block" : "none" }} />
            <canvas ref={sqCanvasRef} style={{ maxWidth: "min(480px,100%)", borderRadius: 6, boxShadow: "0 4px 24px rgba(0,0,0,.45)", display: mode === "square" && !rendering ? "block" : "none" }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid rgba(120,80,20,.2)",
          display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center",
          flexWrap: "wrap",
          background: "rgba(0,0,0,.04)",
        }}>
          <span style={{ flex: 1, fontFamily: "'Crimson Text', serif", fontStyle: "italic", fontSize: ".82rem", color: "rgba(80,50,15,.7)" }}>
            {shared ? "✓ Shared to your device!" : "Download or share your chronicle"}
          </span>
          {btn("✕ CLOSE", onClose)}
          {btn("⬇ DOWNLOAD PNG", download)}
          {btn("↗ SHARE / POST", shareCard, true)}
        </div>
      </div>
    </div>
  );
}
