// ============================================================
//  CHRONOWAR — User Account System
//  localStorage-based profiles, no backend required
// ============================================================
import { useState, useEffect } from "react";
import { getRank, getNextRank, getProgressToNext } from "./points.jsx";

const ACCOUNTS_KEY = "cw_accounts_v1";
const SESSION_KEY  = "cw_session_v1";

// ── Storage helpers ───────────────────────────────────────
export function getAllAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}"); }
  catch { return {}; }
}
export function saveAllAccounts(acc) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(acc)); } catch {}
}
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}
export function setSession(username) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(username)); } catch {}
}
export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

// ── Account operations ────────────────────────────────────
export function createAccount(username, password) {
  if (!username || username.length < 3) return { error: "Username must be at least 3 characters." };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters." };
  const clean = username.trim().replace(/[^a-zA-Z0-9_]/g, "");
  if (clean.length < 3) return { error: "Use only letters, numbers, and underscores." };
  const accounts = getAllAccounts();
  if (accounts[clean.toLowerCase()]) return { error: "That name is already taken." };
  const profile = {
    username: clean,
    passwordHash: simpleHash(password),
    created: Date.now(),
    lastSeen: Date.now(),
    stats: {
      cp: 0, elo: 1000, gamesPlayed: 0,
      wins: 0, losses: 0, draws: 0,
      totalCaptures: 0, totalCrossRealm: 0, totalChecks: 0,
      streak: 0, bestStreak: 0, fastestWin: null, longestGame: 0,
    },
    tourProgress: {},   // challenge id → completed
    achievements: [],
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    title: "Timewarden",
  };
  accounts[clean.toLowerCase()] = profile;
  saveAllAccounts(accounts);
  setSession(clean.toLowerCase());
  return { ok: true, profile };
}

export function loginAccount(username, password) {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const accounts = getAllAccounts();
  const profile = accounts[clean];
  if (!profile) return { error: "No account found with that name." };
  if (profile.passwordHash !== simpleHash(password)) return { error: "Incorrect password." };
  profile.lastSeen = Date.now();
  accounts[clean] = profile;
  saveAllAccounts(accounts);
  setSession(clean);
  return { ok: true, profile };
}

export function updateAccountStats(username, newStats) {
  const accounts = getAllAccounts();
  const key = username.toLowerCase();
  if (!accounts[key]) return;
  accounts[key].stats = { ...accounts[key].stats, ...newStats };
  accounts[key].lastSeen = Date.now();
  // Update title based on CP
  const rank = getRank(accounts[key].stats.cp);
  accounts[key].title = rank.name;
  saveAllAccounts(accounts);
}

export function getProfile(username) {
  const accounts = getAllAccounts();
  return accounts[username?.toLowerCase()] || null;
}

// Very simple (non-cryptographic) hash for local use only
function simpleHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

const AVATAR_COLORS = [
  "#c89030","#8848c0","#3080a0","#b03030","#308840",
  "#c04080","#6050d0","#c07020","#2090a0","#a04060",
];

// ── Avatar component ──────────────────────────────────────
export function Avatar({ username, color, size = 36 }) {
  const initials = (username || "?").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: color || "#c89030",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel', serif",
      fontSize: size * 0.36,
      fontWeight: 700,
      color: "rgba(255,255,255,.92)",
      flexShrink: 0,
      border: "1.5px solid rgba(255,255,255,.2)",
      boxShadow: `0 0 10px ${color || "#c89030"}44`,
      letterSpacing: "1px",
    }}>{initials}</div>
  );
}

// ── Auth Modal ────────────────────────────────────────────
export function AuthModal({ onLogin, onClose }) {
  const [tab, setTab]         = useState("login");    // login | signup
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 250)); // brief UX pause
    const result = tab === "login"
      ? loginAccount(username, password)
      : createAccount(username, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    onLogin(result.profile);
  };

  const inp = (label, value, onChange, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:".46rem", letterSpacing:"3px", color:"rgba(80,55,20,.65)", marginBottom:6 }}>
        {label}
      </div>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => e.key === "Enter" && submit()}
        style={{
          width:"100%", padding:"10px 14px",
          background:"rgba(255,255,255,.25)",
          border:"1px solid rgba(120,85,25,.35)",
          borderRadius:6,
          fontFamily:"'Crimson Text',serif", fontSize:"1rem",
          color:"#2a1004",
          outline:"none",
          boxSizing:"border-box",
        }}
      />
    </div>
  );

  return (
    <div style={{
      position:"fixed", inset:0,
      background:"rgba(0,0,0,.82)",
      backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:400,
    }}>
      <div style={{
        background:"linear-gradient(155deg, #d8c898, #c4ac70)",
        border:"1.5px solid rgba(130,90,25,.5)",
        borderRadius:14,
        width:"min(440px, 94vw)",
        padding:"32px 32px 28px",
        boxShadow:"0 0 80px rgba(0,0,0,.5), 0 0 0 6px rgba(100,70,15,.1)",
        animation:"overlayIn .4s cubic-bezier(.34,1.56,.64,1)",
      }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"1.4rem", color:"#2a1004", marginBottom:4 }}>
            CHRONOWAR
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:".46rem", letterSpacing:"5px", color:"rgba(80,55,20,.5)" }}>
            YOUR CHRONICLE AWAITS
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display:"flex", border:"1px solid rgba(120,85,25,.3)", borderRadius:8, overflow:"hidden", marginBottom:22 }}>
          {[["login","SIGN IN"],["signup","CREATE ACCOUNT"]].map(([t,l]) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
              flex:1, padding:"9px 0",
              background: tab===t ? "rgba(0,0,0,.14)" : "transparent",
              border:"none", cursor:"pointer",
              fontFamily:"'Cinzel',serif", fontSize:".5rem", letterSpacing:"2px",
              color: tab===t ? "#2a1004" : "rgba(80,55,20,.5)",
            }}>{l}</button>
          ))}
        </div>

        {inp("USERNAME", username, setUsername, "text", "e.g. TemporalKnight")}
        {inp("PASSWORD", password, setPassword, "password", tab==="login" ? "Your password" : "Minimum 6 characters")}

        {error && (
          <div style={{ background:"rgba(180,30,10,.12)", border:"1px solid rgba(180,30,10,.3)", borderRadius:6, padding:"8px 12px", marginBottom:14, fontSize:".82rem", color:"#8b1a00" }}>
            {error}
          </div>
        )}

        <button onClick={submit} disabled={loading} style={{
          width:"100%", padding:"13px 0",
          background: loading ? "rgba(80,50,8,.5)" : "rgba(80,50,8,.9)",
          border:"1px solid rgba(180,130,35,.5)",
          borderRadius:7, cursor: loading ? "wait" : "pointer",
          fontFamily:"'Cinzel',serif", fontSize:".62rem", letterSpacing:"4px",
          color:"#f0d060",
          boxShadow:"0 3px 14px rgba(0,0,0,.3)",
          transition:"all .2s",
          marginBottom:12,
        }}>
          {loading ? "…" : tab === "login" ? "ENTER THE WAR" : "BEGIN YOUR SAGA"}
        </button>

        <button onClick={onClose} style={{
          width:"100%", padding:"8px 0",
          background:"transparent", border:"none",
          cursor:"pointer", fontFamily:"'Cinzel',serif",
          fontSize:".46rem", letterSpacing:"2px",
          color:"rgba(80,55,20,.5)",
        }}>
          CONTINUE AS GUEST
        </button>
      </div>
    </div>
  );
}

// ── Profile panel (in-game header) ───────────────────────
export function ProfileBar({ profile, onLogout, onShowAuth }) {
  const [open, setOpen] = useState(false);
  const rank = profile ? getRank(profile.stats?.cp || 0) : null;
  const prog = profile ? getProgressToNext(profile.stats?.cp || 0) : 0;

  if (!profile) {
    return (
      <button onClick={onShowAuth} style={{
        background:"rgba(255,255,255,.15)",
        border:"1px solid rgba(120,85,25,.3)",
        borderRadius:7, padding:"5px 14px",
        fontFamily:"'Cinzel',serif", fontSize:".5rem",
        letterSpacing:"2px", color:"rgba(80,55,20,.8)",
        cursor:"pointer", transition:"all .2s",
        whiteSpace:"nowrap",
      }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.25)"}
      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.15)"}
      >
        SIGN IN
      </button>
    );
  }

  return (
    <div style={{ position:"relative" }}>
      <button onClick={() => setOpen(o=>!o)} style={{
        display:"flex", alignItems:"center", gap:8,
        background:"rgba(255,255,255,.14)",
        border:"1px solid rgba(120,85,25,.28)",
        borderRadius:8, padding:"4px 10px 4px 6px",
        cursor:"pointer", transition:"all .2s",
      }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.22)"}
      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.14)"}
      >
        <Avatar username={profile.username} color={profile.avatarColor} size={28} />
        <div style={{ textAlign:"left" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:".52rem", letterSpacing:"1px", color:"#2a1004" }}>
            {profile.username}
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:".38rem", letterSpacing:"1px", color:rank?.color, lineHeight:1.2 }}>
            {rank?.icon} {rank?.name}
          </div>
        </div>
      </button>

      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:98 }}/>
          <div style={{
            position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:99,
            background:"rgba(220,195,140,.98)",
            border:"1px solid rgba(120,85,25,.4)",
            borderRadius:10, padding:16, minWidth:220,
            boxShadow:"0 8px 32px rgba(0,0,0,.35)",
            animation:"overlayIn .2s ease",
          }}>
            {/* Stats */}
            <div style={{ marginBottom:12 }}>
              {/* ELO + CP */}
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:".88rem", color:"#2a1004", fontWeight:700 }}>{profile.stats.elo}</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:".38rem", letterSpacing:"2px", color:"rgba(80,55,20,.55)" }}>ELO</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:".88rem", color:"#2a1004", fontWeight:700 }}>{(profile.stats.cp||0).toLocaleString()}</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:".38rem", letterSpacing:"2px", color:"rgba(80,55,20,.55)" }}>CP</div>
                </div>
              </div>
              {/* Rank bar */}
              <div style={{ height:4, background:"rgba(100,70,20,.2)", borderRadius:2, overflow:"hidden", marginBottom:4 }}>
                <div style={{ height:"100%", width:`${prog*100}%`, background:`linear-gradient(90deg,${rank?.color}88,${rank?.color})`, transition:"width .5s" }}/>
              </div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:".38rem", color:"rgba(80,55,20,.5)", letterSpacing:"1px" }}>
                {getNextRank(profile.stats.cp||0) ? `→ ${getNextRank(profile.stats.cp||0).name}` : "MAX RANK"}
              </div>
            </div>
            {/* W/D/L */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:12 }}>
              {[["W",profile.stats.wins,"#2a6020"],["D",profile.stats.draws,"#3a3060"],["L",profile.stats.losses,"#6a1010"]].map(([l,v,c])=>(
                <div key={l} style={{ background:"rgba(0,0,0,.08)", borderRadius:5, padding:"6px 0", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:".75rem", color:c, fontWeight:700 }}>{v||0}</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:".38rem", color:"rgba(80,55,20,.5)", letterSpacing:"1px" }}>{l}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>{ onLogout(); setOpen(false); }} style={{
              width:"100%", padding:"8px 0",
              background:"rgba(0,0,0,.08)", border:"1px solid rgba(100,70,20,.2)",
              borderRadius:6, cursor:"pointer",
              fontFamily:"'Cinzel',serif", fontSize:".48rem", letterSpacing:"2px",
              color:"rgba(80,50,15,.7)",
            }}>SIGN OUT</button>
          </div>
        </>
      )}
    </div>
  );
}
