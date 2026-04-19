// ============================================================
//  CHRONOWAR — Mobile Layout
//  Realm tabs + swipe navigation + bottom sheet chronicle
// ============================================================
import { useState, useRef, useCallback, useEffect } from "react";
import { REALM_CFG, SYMBOLS } from "../engine";
import RealmBoard from "./RealmBoard";

// ── Realm order for swipe ─────────────────────────────────
const REALMS = ["past", "present", "future"];
const REALM_LABELS = { past: "PAST", present: "PRESENT", future: "FUTURE" };
const REALM_ICONS  = { past: "⏳", present: "⚔", future: "✧" };

// ── Bottom sheet heights ──────────────────────────────────
const SHEET_PEEK   = 72;   // collapsed — shows one line of chronicle
const SHEET_HALF   = 0.52; // fraction of viewport
const SHEET_FULL   = 0.88;

export default function MobileLayout({
  boards, sel, moves, lastMove, turn, status, moveNum,
  aiThinking, aiTaunt, narrating, displayed, storyLog,
  stats, lastAward, captured, activeRealm, setActiveRealm,
  handleClick, reset, openChronicle, mode, difficulty,
  setMode, setDifficulty, muted, toggleMute,
  setShowTutorial, setScreen,
  onShowOver, showOver,
}) {
  const [realmIdx, setRealmIdx]     = useState(1); // start on present
  const [sheetH, setSheetH]         = useState(SHEET_PEEK);
  const [dragging, setDragging]     = useState(false);
  const [showMenu, setShowMenu]     = useState(false);

  const touchStartX   = useRef(0);
  const touchStartY   = useRef(0);
  const touchStartH   = useRef(SHEET_PEEK);
  const sheetRef      = useRef(null);
  const swipeRef      = useRef(null);

  const realm    = REALMS[realmIdx];
  const cfg      = REALM_CFG[realm];
  const sqSize   = Math.min(56, Math.floor((window.innerWidth - 40) / 6));
  const wTurn    = turn === "white";

  // Keep activeRealm synced
  useEffect(() => { setActiveRealm(realm); }, [realm, setActiveRealm]);

  // ── Swipe between realms ──────────────────────────────
  const onBoardTouchStart = useCallback(e => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onBoardTouchEnd = useCallback(e => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 48 && dy < 60) {
      if (dx < 0) setRealmIdx(i => Math.min(2, i + 1));
      else         setRealmIdx(i => Math.max(0, i - 1));
    }
  }, []);

  // ── Bottom sheet drag ─────────────────────────────────
  const onSheetTouchStart = useCallback(e => {
    touchStartY.current = e.touches[0].clientY;
    touchStartH.current = sheetH;
    setDragging(true);
  }, [sheetH]);

  const onSheetTouchMove = useCallback(e => {
    const dy = touchStartY.current - e.touches[0].clientY;
    const vh = window.innerHeight;
    const newH = Math.max(SHEET_PEEK, Math.min(vh * SHEET_FULL, touchStartH.current + dy));
    setSheetH(newH);
  }, []);

  const onSheetTouchEnd = useCallback(() => {
    setDragging(false);
    const vh = window.innerHeight;
    const half = vh * SHEET_HALF;
    const full = vh * SHEET_FULL;
    // Snap to closest position
    const positions = [SHEET_PEEK, half, full];
    const closest = positions.reduce((a, b) => Math.abs(a - sheetH) < Math.abs(b - sheetH) ? a : b);
    setSheetH(closest);
  }, [sheetH]);

  const expandSheet  = () => setSheetH(window.innerHeight * SHEET_HALF);
  const collapseSheet = () => setSheetH(SHEET_PEEK);
  const fullSheet    = () => setSheetH(window.innerHeight * SHEET_FULL);

  // ── Status label ─────────────────────────────────────
  const statusLabel =
    status === "checkmate" ? "CHECKMATE" :
    status === "check"     ? "CHECK" :
    status === "stalemate" ? "STALEMATE" :
    aiThinking             ? "THINKING…" :
    `MOVE ${moveNum}`;

  const statusColor =
    status === "checkmate" ? "#8b1a00" :
    status === "check"     ? "#8b3a00" :
    status === "stalemate" ? "#3a1870" :
    aiThinking             ? "#5a3080" :
    "rgba(60,35,10,.7)";

  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
      userSelect: "none",
    }}>

      {/* ── TOP BAR ──────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px 8px",
        borderBottom: "1px solid rgba(100,70,20,.25)",
        background: "rgba(255,255,255,.06)",
        backdropFilter: "blur(4px)",
        zIndex: 10,
      }}>
        {/* Title */}
        <div>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: ".95rem",
            letterSpacing: "4px",
            background: "linear-gradient(110deg,#c89030,#e8c050,#c89030)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>CHRONOWAR</div>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: "10px",
            letterSpacing: "3px", color: "rgba(100,70,20,.5)",
          }}>THREE REALMS</div>
        </div>

        {/* Status pill */}
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "13px", letterSpacing: "2px",
          color: statusColor,
          padding: "4px 12px",
          background: "rgba(255,255,255,.12)",
          borderRadius: 20,
          border: `1px solid ${status === "check" || status === "checkmate" ? "rgba(180,60,20,.35)" : "rgba(100,70,20,.2)"}`,
          animation: status === "check" || status === "checkmate" ? "blink .85s ease infinite" : "none",
        }}>{statusLabel}</div>

        {/* Menu button */}
        <button
          onClick={() => setShowMenu(m => !m)}
          style={{
            background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(100,70,20,.25)",
            borderRadius: 8,
            width: 38, height: 38,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 5, cursor: "pointer",
          }}
        >
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 16, height: 1.5,
              background: "rgba(120,85,25,.8)",
              borderRadius: 1,
              transform: showMenu && i === 0 ? "rotate(45deg) translateY(6px)" :
                         showMenu && i === 2 ? "rotate(-45deg) translateY(-6px)" : "none",
              opacity: showMenu && i === 1 ? 0 : 1,
              transition: "all .2s",
            }}/>
          ))}
        </button>
      </div>

      {/* ── DROPDOWN MENU ────────────────────────────── */}
      {showMenu && (
        <div style={{
          position: "absolute", top: 62, right: 12, zIndex: 50,
          background: "rgba(220,195,140,.97)",
          border: "1px solid rgba(120,85,25,.4)",
          borderRadius: 10,
          padding: "8px",
          boxShadow: "0 8px 32px rgba(0,0,0,.35)",
          display: "flex", flexDirection: "column", gap: 2,
          minWidth: 200,
          animation: "overlayIn .2s ease",
        }}>
          {/* Mode */}
          <div style={{ padding:"6px 10px", fontFamily:"'Cinzel',serif", fontSize:"11px", letterSpacing:"3px", color:"rgba(80,50,15,.5)" }}>MODE</div>
          <div style={{ display:"flex", gap:4, padding:"0 6px 6px" }}>
            {[["vs-ai","vs AI"],["vs-player","2 Player"]].map(([m,l]) => (
              <button key={m} onClick={() => { setMode(m); reset(); setShowMenu(false); }} style={{
                flex:1, padding:"7px 4px",
                background: mode===m ? "rgba(80,50,8,.85)" : "rgba(255,255,255,.3)",
                border: "1px solid rgba(120,85,25,.35)",
                borderRadius:6, fontFamily:"'Cinzel',serif", fontSize:"12px",
                color: mode===m ? "#e0b840" : "#5a3810", cursor:"pointer",
              }}>{l}</button>
            ))}
          </div>
          {/* Difficulty */}
          {mode === "vs-ai" && <>
            <div style={{ padding:"4px 10px", fontFamily:"'Cinzel',serif", fontSize:"11px", letterSpacing:"3px", color:"rgba(80,50,15,.5)" }}>DIFFICULTY</div>
            <div style={{ display:"flex", gap:4, padding:"0 6px 6px" }}>
              {[["easy","EASY"],["medium","MED"],["hard","HARD"]].map(([d,l]) => (
                <button key={d} onClick={() => { setDifficulty(d); reset(); setShowMenu(false); }} style={{
                  flex:1, padding:"7px 4px",
                  background: difficulty===d ? "rgba(80,50,8,.85)" : "rgba(255,255,255,.3)",
                  border: "1px solid rgba(120,85,25,.35)",
                  borderRadius:6, fontFamily:"'Cinzel',serif", fontSize:"12px",
                  color: difficulty===d ? "#e0b840" : "#5a3810", cursor:"pointer",
                }}>{l}</button>
              ))}
            </div>
          </>}
          {/* Actions */}
          {[
            ["TUTORIAL", () => { setShowTutorial(true); setShowMenu(false); }],
            [muted ? "UNMUTE" : "MUTE",    () => { toggleMute(); setShowMenu(false); }],
            ["HOME",     () => { setScreen("landing"); setShowMenu(false); }],
            ["NEW GAME", () => { reset(); setShowMenu(false); }],
          ].map(([label, fn]) => (
            <button key={label} onClick={fn} style={{
              background:"rgba(255,255,255,.2)", border:"1px solid rgba(120,85,25,.25)",
              borderRadius:6, padding:"9px 14px", fontFamily:"'Cinzel',serif",
              fontSize:"13px", letterSpacing:"2px", color:"#3a1a04",
              cursor:"pointer", textAlign:"left",
            }}>{label}</button>
          ))}
        </div>
      )}
      {showMenu && <div onClick={() => setShowMenu(false)} style={{ position:"fixed", inset:0, zIndex:49 }}/>}

      {/* ── REALM TABS ───────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        padding: "8px 14px",
        gap: 6,
        background: "rgba(255,255,255,.04)",
      }}>
        {REALMS.map((r, i) => {
          const rcfg = REALM_CFG[r];
          const active = i === realmIdx;
          return (
            <button key={r} onClick={() => setRealmIdx(i)} style={{
              flex: active ? 1.8 : 1,
              padding: "7px 4px",
              background: active ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.06)",
              border: `1.5px solid ${active ? rcfg.border : "rgba(100,70,20,.15)"}`,
              borderRadius: 8,
              fontFamily: "'Cinzel', serif",
              fontSize: active ? "13px" : "11px",
              letterSpacing: "2px",
              color: active ? rcfg.text : "rgba(90,65,20,.45)",
              cursor: "pointer",
              transition: "all .22s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: active ? `0 0 14px ${rcfg.glow}22` : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
              <span style={{ fontSize: ".7rem", opacity: active ? 0.8 : 0.4 }}>{REALM_ICONS[r]}</span>
              {active ? REALM_LABELS[r] : REALM_LABELS[r].slice(0,3)}
            </button>
          );
        })}
      </div>

      {/* ── TURN INDICATOR ───────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "4px 14px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "2px",
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#f0e4c0",
            border: "1.5px solid #7a5a10",
            boxShadow: wTurn && !aiThinking ? "0 0 8px rgba(220,180,60,.6)" : "none",
            transition: "box-shadow .3s",
          }}/>
          <span style={{ color: wTurn && !aiThinking ? "rgba(100,70,18,.9)" : "rgba(80,55,20,.35)" }}>
            LUMINAR
          </span>
        </div>
        <div style={{ width:20, height:1, background:"rgba(100,70,20,.2)" }}/>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "2px",
        }}>
          <span style={{ color: !wTurn && !aiThinking ? "rgba(60,30,100,.9)" : "rgba(70,50,15,.35)" }}>
            UMBRAL
          </span>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#2a2018",
            border: "1.5px solid #c8a050",
            boxShadow: !wTurn && !aiThinking ? "0 0 8px rgba(160,80,220,.5)" : "none",
            transition: "box-shadow .3s",
          }}/>
        </div>
      </div>

      {/* ── BOARD AREA (swipeable) ────────────────────── */}
      <div
        ref={swipeRef}
        onTouchStart={onBoardTouchStart}
        onTouchEnd={onBoardTouchEnd}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 10px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div style={{
          transition: dragging ? "none" : "transform .28s cubic-bezier(.25,.46,.45,.94)",
        }}>
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
        </div>

        {/* Swipe hint dots */}
        <div style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
        }}>
          {REALMS.map((_, i) => (
            <div key={i} onClick={() => setRealmIdx(i)} style={{
              width: i === realmIdx ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === realmIdx ? cfg.glow : "rgba(100,70,20,.25)",
              transition: "all .25s",
              cursor: "pointer",
            }}/>
          ))}
        </div>
      </div>

      {/* ── BOTTOM SHEET ─────────────────────────────── */}
      <div
        ref={sheetRef}
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: sheetH,
          background: "linear-gradient(165deg, #d4bb88, #c0a860)",
          borderRadius: "16px 16px 0 0",
          border: "1px solid rgba(130,90,25,.4)",
          borderBottom: "none",
          boxShadow: "0 -4px 32px rgba(0,0,0,.35)",
          display: "flex",
          flexDirection: "column",
          transition: dragging ? "none" : "height .32s cubic-bezier(.25,.46,.45,.94)",
          zIndex: 20,
        }}
      >
        {/* Drag handle */}
        <div
          onTouchStart={onSheetTouchStart}
          onTouchMove={onSheetTouchMove}
          onTouchEnd={onSheetTouchEnd}
          style={{
            flexShrink: 0,
            padding: "10px 14px 6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            cursor: "grab",
          }}
        >
          <div style={{
            width: 36, height: 4,
            background: "rgba(100,70,20,.3)",
            borderRadius: 2,
          }}/>
          {/* Collapsed view — latest narration snippet */}
          {sheetH <= SHEET_PEEK + 20 && (
            <div
              onClick={expandSheet}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "11px", letterSpacing: "3px",
                color: "rgba(80,50,15,.55)",
                flexShrink: 0,
              }}>CHRONICLE</div>
              <div style={{
                flex: 1,
                fontSize: ".78rem",
                fontStyle: "italic",
                color: "rgba(60,35,10,.65)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}>
                {narrating ? "The Chronicler writes…" : displayed || "Awaiting the first move…"}
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink:0 }}>
                <path d="M2 9 L7 4 L12 9" stroke="rgba(100,65,20,.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Sheet content (shown when expanded) */}
        {sheetH > SHEET_PEEK + 20 && (
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column", padding:"0 16px 16px" }}>

            {/* Sheet header */}
            <div style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              marginBottom: 12, flexShrink: 0,
            }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"13px", letterSpacing:"4px", color:"rgba(80,50,15,.65)" }}>
                THE CHRONICLE
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={openChronicle} style={{
                  background:"rgba(80,50,8,.85)", border:"1px solid rgba(180,130,35,.5)",
                  borderRadius:6, padding:"6px 14px",
                  fontFamily:"'Cinzel',serif", fontSize:"11px", letterSpacing:"2px",
                  color:"#e0b840", cursor:"pointer",
                }}>FULL SAGA</button>
                <button onClick={reset} style={{
                  background:"rgba(255,255,255,.2)", border:"1px solid rgba(100,70,20,.3)",
                  borderRadius:6, padding:"6px 12px",
                  fontFamily:"'Cinzel',serif", fontSize:"11px", letterSpacing:"2px",
                  color:"rgba(80,50,15,.75)", cursor:"pointer",
                }}>NEW</button>
                <button onClick={collapseSheet} style={{
                  background:"rgba(255,255,255,.15)", border:"1px solid rgba(100,70,20,.25)",
                  borderRadius:6, padding:"6px 10px", color:"rgba(80,50,15,.6)",
                  cursor:"pointer", fontSize:"1rem", lineHeight:1,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <path d="M2 5 L7 10 L12 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column", gap:12 }}>
              {/* Live narration */}
              <div style={{
                background:"rgba(0,0,0,.08)",
                border:"1px solid rgba(120,85,25,.2)",
                borderRadius:8, padding:"12px 14px",
                flexShrink: 0,
              }}>
                {narrating ? (
                  <div style={{ fontStyle:"italic", fontSize:".82rem", color:"rgba(100,70,25,.7)", animation:"narrBlink 1.5s ease infinite" }}>
                    The Chronicler writes across eternity…
                  </div>
                ) : (
                  <div style={{ fontStyle:"italic", fontSize:".88rem", color:"rgba(50,28,8,.8)", lineHeight:1.75 }}>
                    {displayed || "The war awaits its first verse…"}
                  </div>
                )}
              </div>

              {/* Points */}
              <div style={{
                display:"flex", gap:8, flexShrink:0,
              }}>
                {[
                  ["CP", stats.cp.toLocaleString()],
                  ["ELO", stats.elo],
                  ["W", stats.wins],
                  ["STREAK", `${stats.streak}🔥`],
                ].map(([l,v]) => (
                  <div key={l} style={{
                    flex:1, background:"rgba(0,0,0,.08)",
                    border:"1px solid rgba(120,85,25,.18)",
                    borderRadius:6, padding:"8px 6px", textAlign:"center",
                  }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:".7rem", color:"rgba(50,28,8,.8)", fontWeight:600 }}>{v}</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"10px", letterSpacing:"2px", color:"rgba(100,70,25,.5)", marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Saga scroll */}
              {storyLog.length > 0 && (
                <div style={{ flexShrink:0 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"11px", letterSpacing:"3px", color:"rgba(80,50,15,.5)", marginBottom:8 }}>
                    SAGA SCROLL
                  </div>
                  {storyLog.slice(0, 6).map((e, i) => (
                    <div key={i} style={{
                      padding:"8px 0",
                      borderBottom:"1px solid rgba(100,70,20,.12)",
                      fontSize:".76rem",
                      color: i===0 ? "rgba(50,28,8,.85)" : "rgba(80,55,20,.55)",
                      lineHeight:1.55,
                      fontStyle:"italic",
                    }}>
                      <span style={{
                        fontFamily:"'Cinzel',serif", fontSize:".4rem",
                        color: e.side==="white" ? "rgba(130,85,20,.75)" : "rgba(90,50,140,.75)",
                        letterSpacing:"1px", marginRight:6, fontStyle:"normal",
                      }}>#{e.n}</span>
                      {e.t.length > 100 ? e.t.slice(0,97)+"…" : e.t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
