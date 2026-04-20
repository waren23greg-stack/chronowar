// ============================================================
//  CHRONOWAR — Mobile Layout v2
//  Fixed: mute, board centering, spacing, overall polish
// ============================================================
import { useState, useRef, useCallback, useEffect } from "react";
import { REALM_CFG } from "../engine";
import RealmBoard from "./RealmBoard";

const REALMS = ["past", "present", "future"];
const REALM_LABELS = { past: "PAST", present: "PRESENT", future: "FUTURE" };
const REALM_ICONS  = { past: "⏳", present: "⚔", future: "✧" };

const SHEET_PEEK = 68;
const SHEET_HALF = 0.5;
const SHEET_FULL = 0.88;

export default function MobileLayout({
  boards, sel, moves, lastMove, turn, status, moveNum,
  aiThinking, aiTaunt, narrating, displayed, storyLog,
  stats, captured, activeRealm, setActiveRealm,
  handleClick, reset, openChronicle, mode, difficulty,
  setMode, setDifficulty, muted, toggleMute,
  setShowTutorial, setScreen, ensureAudio,
}) {
  const [realmIdx, setRealmIdx] = useState(1);
  const [sheetH,   setSheetH]   = useState(SHEET_PEEK);
  const [dragging, setDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const touchStartX  = useRef(0);
  const touchStartY  = useRef(0);
  const touchStartH  = useRef(SHEET_PEEK);

  const realm  = REALMS[realmIdx];
  const cfg    = REALM_CFG[realm];
  const wTurn  = turn === "white";

  // ── Dynamic square size — fits width AND leaves room for board
  const vw = typeof window !== "undefined" ? window.innerWidth : 390;
  const sqSize = Math.min(58, Math.floor((vw - 28) / 6));
  const boardPx = sqSize * 6;

  useEffect(() => { setActiveRealm(realm); }, [realm, setActiveRealm]);

  // ── Swipe realms ────────────────────────────────────────
  const onTouchStart = useCallback(e => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const onTouchEnd = useCallback(e => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 44 && dy < 55) {
      if (dx < 0) setRealmIdx(i => Math.min(2, i + 1));
      else         setRealmIdx(i => Math.max(0, i - 1));
    }
  }, []);

  // ── Sheet drag ──────────────────────────────────────────
  const onSheetStart = useCallback(e => {
    touchStartY.current = e.touches[0].clientY;
    touchStartH.current = sheetH;
    setDragging(true);
  }, [sheetH]);
  const onSheetMove = useCallback(e => {
    const dy  = touchStartY.current - e.touches[0].clientY;
    const vh  = window.innerHeight;
    const newH = Math.max(SHEET_PEEK, Math.min(vh * SHEET_FULL, touchStartH.current + dy));
    setSheetH(newH);
  }, []);
  const onSheetEnd = useCallback(() => {
    setDragging(false);
    const vh  = window.innerHeight;
    const positions = [SHEET_PEEK, vh * SHEET_HALF, vh * SHEET_FULL];
    const snap = positions.reduce((a, b) => Math.abs(a - sheetH) < Math.abs(b - sheetH) ? a : b);
    setSheetH(snap);
  }, [sheetH]);

  const collapseSheet = () => setSheetH(SHEET_PEEK);
  const expandSheet   = () => setSheetH(window.innerHeight * SHEET_HALF);

  // ── Status ──────────────────────────────────────────────
  const statusLabel =
    status === "checkmate" ? "CHECKMATE" :
    status === "check"     ? "CHECK" :
    status === "stalemate" ? "STALEMATE" :
    status === "draw"      ? "DRAW" :
    aiThinking             ? "THINKING…" :
    `MOVE ${moveNum}`;

  const isAlert = status === "check" || status === "checkmate";

  // ── Mute toggle — boots audio first ─────────────────────
  const handleMute = () => {
    if (ensureAudio) ensureAudio();
    toggleMute();
    setShowMenu(false);
  };

  // ── Menu item button ────────────────────────────────────
  const menuBtn = (label, fn, accent = false) => (
    <button key={label} onClick={fn} style={{
      background: accent ? "rgba(80,50,8,.85)" : "rgba(255,255,255,.22)",
      border: `1px solid ${accent ? "rgba(180,130,30,.5)" : "rgba(120,85,25,.22)"}`,
      borderRadius: 8, padding: "12px 16px",
      fontFamily: "'Cinzel', serif", fontSize: 13,
      letterSpacing: "2px",
      color: accent ? "#e8c840" : "#3a1a04",
      cursor: "pointer", textAlign: "left",
      display: "flex", alignItems: "center", gap: 10,
      transition: "all .15s",
    }}>{label}</button>
  );

  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
      userSelect: "none",
      WebkitUserSelect: "none",
    }}>

      {/* ══ TOP BAR ══════════════════════════════════════ */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px 8px",
        borderBottom: "1px solid rgba(100,70,20,.2)",
        background: "rgba(255,255,255,.05)",
        backdropFilter: "blur(6px)",
        zIndex: 10,
        gap: 10,
      }}>
        {/* Wordmark */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: 15, letterSpacing: 3,
            background: "linear-gradient(110deg,#c89030,#e8c050,#c89030)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", lineHeight: 1.2,
          }}>CHRONOWAR</div>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 9,
            letterSpacing: 3, color: "rgba(100,70,20,.45)",
          }}>THREE REALMS</div>
        </div>

        {/* Status pill */}
        <div style={{
          flex: 1, textAlign: "center",
          fontFamily: "'Cinzel', serif",
          fontSize: 11, letterSpacing: 2,
          color: isAlert ? "#8b1a00" : aiThinking ? "#4a2080" : "rgba(60,38,12,.65)",
          padding: "5px 10px",
          background: isAlert ? "rgba(200,50,20,.12)" : "rgba(255,255,255,.1)",
          borderRadius: 20,
          border: `1px solid ${isAlert ? "rgba(180,50,20,.3)" : "rgba(100,70,20,.18)"}`,
          animation: isAlert ? "blink .85s ease infinite" : "none",
          whiteSpace: "nowrap",
        }}>{statusLabel}</div>

        {/* Mute indicator + hamburger */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          {/* Inline mute tap — instant */}
          <button onClick={handleMute} style={{
            background: muted ? "rgba(120,80,20,.15)" : "transparent",
            border: "none", padding: "4px 6px",
            borderRadius: 6, cursor: "pointer",
            fontSize: 16, lineHeight: 1, color: muted ? "rgba(120,80,20,.5)" : "rgba(100,70,20,.7)",
          }}>
            {muted ? "🔇" : "🔊"}
          </button>
          {/* Hamburger */}
          <button onClick={() => setShowMenu(m => !m)} style={{
            background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(100,70,20,.22)",
            borderRadius: 8, width: 38, height: 38,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 4.5, cursor: "pointer", flexShrink: 0,
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 16, height: 1.5,
                background: "rgba(120,85,25,.75)", borderRadius: 1,
                transform: showMenu && i === 0 ? "rotate(45deg) translateY(6.5px)" :
                           showMenu && i === 2 ? "rotate(-45deg) translateY(-6.5px)" : "none",
                opacity: showMenu && i === 1 ? 0 : 1,
                transition: "all .18s",
              }}/>
            ))}
          </button>
        </div>
      </div>

      {/* ══ DROPDOWN MENU ════════════════════════════════ */}
      {showMenu && <>
        <div onClick={() => setShowMenu(false)} style={{ position:"fixed", inset:0, zIndex:48 }}/>
        <div style={{
          position: "absolute", top: 62, right: 12, zIndex: 50,
          background: "rgba(222,198,142,.98)",
          border: "1px solid rgba(130,90,25,.4)",
          borderRadius: 12,
          padding: "10px",
          boxShadow: "0 10px 40px rgba(0,0,0,.4)",
          display: "flex", flexDirection: "column", gap: 4,
          minWidth: 220,
          animation: "overlayIn .2s ease",
        }}>
          {/* Mode row */}
          <div style={{ padding:"5px 8px 3px", fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"3px", color:"rgba(80,50,15,.5)" }}>MODE</div>
          <div style={{ display:"flex", gap:5, paddingBottom:6 }}>
            {[["vs-ai","VS AI"],["vs-player","2 PLAYER"]].map(([m,l]) => (
              <button key={m} onClick={() => { setMode(m); reset(); setShowMenu(false); }} style={{
                flex:1, padding:"9px 6px",
                background: mode===m ? "rgba(80,50,8,.9)" : "rgba(255,255,255,.35)",
                border: "1px solid rgba(120,85,25,.3)",
                borderRadius:7, fontFamily:"'Cinzel',serif", fontSize:11,
                color: mode===m ? "#e8c840" : "#5a3810", cursor:"pointer", letterSpacing:"1px",
              }}>{l}</button>
            ))}
          </div>
          {/* Difficulty row */}
          {mode === "vs-ai" && <>
            <div style={{ padding:"0 8px 3px", fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"3px", color:"rgba(80,50,15,.5)" }}>DIFFICULTY</div>
            <div style={{ display:"flex", gap:5, paddingBottom:6 }}>
              {[["easy","EASY"],["medium","MED"],["hard","HARD"]].map(([d,l]) => (
                <button key={d} onClick={() => { setDifficulty(d); reset(); setShowMenu(false); }} style={{
                  flex:1, padding:"9px 4px",
                  background: difficulty===d ? "rgba(80,50,8,.9)" : "rgba(255,255,255,.35)",
                  border: "1px solid rgba(120,85,25,.3)",
                  borderRadius:7, fontFamily:"'Cinzel',serif", fontSize:11,
                  color: difficulty===d ? "#e8c840" : "#5a3810", cursor:"pointer",
                }}>{l}</button>
              ))}
            </div>
          </>}
          {/* Divider */}
          <div style={{ height:1, background:"rgba(120,85,25,.18)", margin:"2px 0" }}/>
          {/* Actions */}
          {menuBtn("⚔  PRO TOUR",    () => { setScreen("tour"); setShowMenu(false); })}
          {menuBtn("?  HOW TO PLAY", () => { setShowTutorial(true); setShowMenu(false); })}
          {menuBtn(muted ? "🔊  UNMUTE" : "🔇  MUTE", handleMute)}
          {menuBtn("⌂  HOME",        () => { setScreen("landing"); setShowMenu(false); })}
          {menuBtn("↺  NEW GAME",    () => { reset(); setShowMenu(false); }, true)}
        </div>
      </>}

      {/* ══ REALM TABS ═══════════════════════════════════ */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        padding: "7px 12px 5px",
        gap: 5,
      }}>
        {REALMS.map((r, i) => {
          const rc     = REALM_CFG[r];
          const active = i === realmIdx;
          return (
            <button key={r} onClick={() => setRealmIdx(i)} style={{
              flex: active ? 2 : 1,
              padding: "8px 4px",
              background: active ? "rgba(255,255,255,.24)" : "rgba(255,255,255,.07)",
              border: `1.5px solid ${active ? rc.border : "rgba(100,70,20,.14)"}`,
              borderRadius: 8,
              fontFamily: "'Cinzel', serif",
              fontSize: active ? 11 : 10,
              letterSpacing: 2,
              color: active ? rc.text : "rgba(90,65,20,.4)",
              cursor: "pointer",
              transition: "all .2s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: active ? `0 0 12px ${rc.glow}20` : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 12, opacity: active ? 0.85 : 0.4 }}>{REALM_ICONS[r]}</span>
              {active ? REALM_LABELS[r] : REALM_LABELS[r].slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* ══ TURN INDICATOR ═══════════════════════════════ */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, paddingBottom: 4,
      }}>
        {[
          { label:"LUMINAR", isActive: wTurn && !aiThinking, dot:"#f0e4c0", dstroke:"#7a5a10", glow:"rgba(220,180,60,.6)" },
          { label:"UMBRAL",  isActive:!wTurn && !aiThinking, dot:"#2a2018", dstroke:"#c8a050", glow:"rgba(160,80,220,.5)", right:true },
        ].map(({ label, isActive, dot, dstroke, glow, right }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            {right && <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:2, color:isActive?"rgba(60,30,100,.9)":"rgba(70,50,15,.3)" }}>{label}</span>}
            <div style={{ width:7, height:7, borderRadius:"50%", background:dot, border:`1.5px solid ${dstroke}`, boxShadow:isActive?`0 0 8px ${glow}`:"none", transition:"box-shadow .3s" }}/>
            {!right && <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:2, color:isActive?"rgba(100,70,18,.9)":"rgba(80,55,20,.3)" }}>{label}</span>}
          </div>
        ))}
      </div>

      {/* ══ BOARD (swipeable, fills remaining space) ══════ */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",   // ← was center — no more floating gap
          paddingTop: 8,
          paddingBottom: SHEET_PEEK + 12,
          overflow: "hidden",
          minHeight: 0,
          position: "relative",
        }}
      >
        <RealmBoard
          realm={realm}
          cfg={cfg}
          board={boards[realm]}
          sel={sel}
          moves={moves}
          lastMove={lastMove}
          onClick={handleClick}
          sqSize={sqSize}
        />

        {/* Swipe dots */}
        <div style={{
          display: "flex", gap: 6, marginTop: 12,
        }}>
          {REALMS.map((_, i) => (
            <div key={i} onClick={() => setRealmIdx(i)} style={{
              width: i === realmIdx ? 20 : 7, height: 7,
              borderRadius: 4,
              background: i === realmIdx ? cfg.glow : "rgba(100,70,20,.22)",
              transition: "all .25s", cursor: "pointer",
            }}/>
          ))}
        </div>
      </div>

      {/* ══ BOTTOM SHEET ══════════════════════════════════ */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: sheetH,
        background: "linear-gradient(160deg, #d8c090, #c4a860)",
        borderRadius: "16px 16px 0 0",
        border: "1px solid rgba(140,95,28,.38)",
        borderBottom: "none",
        boxShadow: "0 -4px 28px rgba(0,0,0,.32)",
        display: "flex", flexDirection: "column",
        transition: dragging ? "none" : "height .3s cubic-bezier(.25,.46,.45,.94)",
        zIndex: 20,
        overflow: "hidden",
      }}>
        {/* Drag handle area */}
        <div
          onTouchStart={onSheetStart}
          onTouchMove={onSheetMove}
          onTouchEnd={onSheetEnd}
          style={{ flexShrink:0, padding:"10px 16px 6px", cursor:"grab" }}
        >
          <div style={{ width:36, height:4, background:"rgba(110,75,22,.28)", borderRadius:2, margin:"0 auto 8px" }}/>

          {/* Collapsed one-liner */}
          {sheetH <= SHEET_PEEK + 16 && (
            <div onClick={expandSheet} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"3px", color:"rgba(80,50,15,.5)", flexShrink:0 }}>
                CHRONICLE
              </div>
              <div style={{
                flex:1, fontSize:12, fontStyle:"italic",
                color:"rgba(50,30,8,.6)",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1,
              }}>
                {narrating ? "The Chronicler writes…" : displayed || "Awaiting the first move…"}
              </div>
              <svg width="13" height="13" viewBox="0 0 13 13" style={{ flexShrink:0 }}>
                <path d="M2 8 L6.5 3.5 L11 8" stroke="rgba(100,65,20,.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Expanded content */}
        {sheetH > SHEET_PEEK + 16 && (
          <div style={{ flex:1, overflow:"auto", padding:"0 16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
            {/* Header row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"4px", color:"rgba(80,50,15,.6)" }}>
                THE CHRONICLE
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={openChronicle} style={{
                  background:"rgba(80,50,8,.88)", border:"1px solid rgba(180,130,35,.48)",
                  borderRadius:7, padding:"7px 14px",
                  fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"2px",
                  color:"#e8c840", cursor:"pointer",
                }}>FULL SAGA</button>
                <button onClick={reset} style={{
                  background:"rgba(255,255,255,.22)", border:"1px solid rgba(100,70,20,.28)",
                  borderRadius:7, padding:"7px 12px",
                  fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"2px",
                  color:"rgba(80,50,15,.7)", cursor:"pointer",
                }}>NEW</button>
                <button onClick={collapseSheet} style={{
                  background:"rgba(255,255,255,.18)", border:"1px solid rgba(100,70,20,.2)",
                  borderRadius:7, padding:"7px 10px", cursor:"pointer",
                  display:"flex", alignItems:"center",
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13">
                    <path d="M2 5 L6.5 9.5 L11 5" stroke="rgba(100,65,20,.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Live narration box */}
            <div style={{
              background:"rgba(0,0,0,.07)", border:"1px solid rgba(120,85,25,.18)",
              borderRadius:9, padding:"12px 14px", flexShrink:0,
            }}>
              {narrating ? (
                <div style={{ fontStyle:"italic", fontSize:13, color:"rgba(100,70,25,.65)", animation:"narrBlink 1.5s ease infinite" }}>
                  The Chronicler writes…
                </div>
              ) : (
                <div style={{ fontStyle:"italic", fontSize:14, color:"rgba(45,25,6,.78)", lineHeight:1.72 }}>
                  {displayed || "The war awaits its first verse…"}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              {[
                ["CP",  (stats.cp||0).toLocaleString()],
                ["ELO", stats.elo||1000],
                ["W",   stats.wins||0],
                ["🔥",  stats.streak||0],
              ].map(([l,v]) => (
                <div key={l} style={{
                  flex:1, background:"rgba(0,0,0,.07)",
                  border:"1px solid rgba(120,85,25,.15)",
                  borderRadius:7, padding:"8px 4px", textAlign:"center",
                }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:15, color:"rgba(45,25,6,.82)", fontWeight:600, lineHeight:1 }}>{v}</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"2px", color:"rgba(100,70,25,.45)", marginTop:3 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Saga scroll */}
            {storyLog.length > 0 && (
              <div style={{ flexShrink:0 }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"3px", color:"rgba(80,50,15,.45)", marginBottom:8 }}>SAGA SCROLL</div>
                {storyLog.slice(0, 5).map((e, i) => (
                  <div key={i} style={{
                    padding:"9px 0",
                    borderBottom:"1px solid rgba(100,70,20,.1)",
                    fontSize:13, color:i===0?"rgba(45,25,6,.82)":"rgba(80,55,20,.5)",
                    lineHeight:1.6, fontStyle:"italic",
                  }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:e.side==="white"?"rgba(130,85,20,.7)":"rgba(90,50,140,.7)", letterSpacing:"1px", marginRight:6, fontStyle:"normal" }}>
                      #{e.n}
                    </span>
                    {e.t.length > 110 ? e.t.slice(0, 107)+"…" : e.t}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
