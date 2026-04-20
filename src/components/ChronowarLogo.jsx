// ============================================================
//  CHRONOWAR — Logo Mark
//  Temporal Crown Emblem — three realms orbiting one sovereign piece
// ============================================================

export default function ChronowarLogo({ size = 200, showText = true, animate = true }) {
  const s = size / 200; // scale factor
  const id = `cw-logo-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg
      width={showText ? size : size}
      height={showText ? size * 1.42 : size}
      viewBox={`0 0 200 ${showText ? 284 : 200}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        {/* Gold gradient */}
        <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f0d878"/>
          <stop offset="30%"  stopColor="#c89030"/>
          <stop offset="60%"  stopColor="#e8c050"/>
          <stop offset="100%" stopColor="#9a6818"/>
          {animate && (
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from="0 100 100" to="360 100 100"
              dur="12s" repeatCount="indefinite"
            />
          )}
        </linearGradient>

        {/* Realm gradients */}
        <radialGradient id={`${id}-past`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8c060" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#9a6010" stopOpacity="0.4"/>
        </radialGradient>
        <radialGradient id={`${id}-present`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#88c848" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#2a6010" stopOpacity="0.4"/>
        </radialGradient>
        <radialGradient id={`${id}-future`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b890f8" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#5020a0" stopOpacity="0.4"/>
        </radialGradient>

        {/* Center glow */}
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#e8c050" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#c89030" stopOpacity="0"/>
        </radialGradient>

        {/* Drop shadow */}
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.6"/>
        </filter>

        {/* Outer glow filter */}
        <filter id={`${id}-glow-f`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Background ambient glow ── */}
      <circle cx="100" cy="100" r="98" fill={`url(#${id}-glow)`} opacity="0.6"/>

      {/* ══════════════════════════════
          OUTER RING — triple-realm arc
         ══════════════════════════════ */}
      {/* Past arc — amber — top-left third */}
      <path d="M 100 8 A 92 92 0 0 0 20.4 54" stroke="#d4943a" strokeWidth="4" strokeLinecap="round" opacity="0.85"/>
      {/* Present arc — green — top-right third */}
      <path d="M 100 8 A 92 92 0 0 1 179.6 54" stroke="#6aab3a" strokeWidth="4" strokeLinecap="round" opacity="0.85"/>
      {/* Future arc — violet — bottom third */}
      <path d="M 20.4 54 A 92 92 0 0 0 179.6 54" stroke="#9060d0" strokeWidth="4" strokeLinecap="round" opacity="0.85"/>

      {/* Outer ring thin base */}
      <circle cx="100" cy="100" r="92" stroke="rgba(200,160,50,.18)" strokeWidth="1"/>

      {/* 12 tick marks around the ring */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const r1 = 88, r2 = i % 3 === 0 ? 78 : 82;
        return (
          <line
            key={i}
            x1={100 + r1 * Math.cos(angle)} y1={100 + r1 * Math.sin(angle)}
            x2={100 + r2 * Math.cos(angle)} y2={100 + r2 * Math.sin(angle)}
            stroke={i % 3 === 0 ? "rgba(200,160,50,.65)" : "rgba(200,160,50,.25)"}
            strokeWidth={i % 3 === 0 ? 1.5 : 1}
          />
        );
      })}

      {/* Three realm diamonds at arc junctions */}
      {/* Top (split point between past & present) */}
      <polygon points="100,4 104,8 100,12 96,8" fill="#e8c050" opacity="0.9"/>
      {/* Bottom-left (past/future) */}
      <polygon points="16.2,57 20.4,54 24.6,57 20.4,60" fill="#d4943a" opacity="0.9"/>
      {/* Bottom-right (present/future) */}
      <polygon points="175.4,57 179.6,54 183.8,57 179.6,60" fill="#9060d0" opacity="0.9"/>

      {/* ══════════════════════════════
          THREE REALM BOARDS
         ══════════════════════════════ */}

      {/* ── PAST board — upper-left ── */}
      <g transform="translate(28, 42) rotate(-12, 24, 24)">
        <rect width="38" height="38" rx="3" fill="rgba(0,0,0,.55)" stroke="#d4943a" strokeWidth="1.2"/>
        {/* 3×3 grid */}
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3), col = i % 3;
          const light = (row + col) % 2 === 0;
          return <rect key={i} x={2 + col * 11.3} y={2 + row * 11.3} width="11" height="11" fill={light ? "rgba(212,148,58,.45)" : "rgba(120,70,15,.55)"} rx="1"/>;
        })}
        {/* Pawn piece on center square */}
        <g transform="translate(14.6, 13)">
          <ellipse cx="4" cy="9.5" rx="4.5" ry="1.5" fill="#d4943a" opacity="0.7"/>
          <rect x="2" y="6" width="4" height="4" rx="1" fill="#e8b84a"/>
          <circle cx="4" cy="4" r="3" fill="#e8b84a"/>
        </g>
        {/* Realm label */}
        <text x="19" y="46" textAnchor="middle" fontFamily="serif" fontSize="5" fill="#d4943a" opacity="0.8" letterSpacing="1">PAST</text>
      </g>

      {/* ── PRESENT board — upper-right ── */}
      <g transform="translate(134, 42) rotate(12, 19, 24)">
        <rect width="38" height="38" rx="3" fill="rgba(0,0,0,.55)" stroke="#6aab3a" strokeWidth="1.2"/>
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3), col = i % 3;
          const light = (row + col) % 2 === 0;
          return <rect key={i} x={2 + col * 11.3} y={2 + row * 11.3} width="11" height="11" fill={light ? "rgba(106,171,58,.45)" : "rgba(30,80,15,.55)"} rx="1"/>;
        })}
        {/* Knight piece on center */}
        <g transform="translate(13.5, 12)">
          <ellipse cx="5" cy="9.5" rx="5" ry="1.5" fill="#6aab3a" opacity="0.7"/>
          <path d="M2,8 C2,4 3,2 5,1 C7,0 9,2 9,4 C9,6 7,7 6,8 Z" fill="#88c848"/>
          <circle cx="5.5" cy="2.5" r="1.5" fill="#88c848"/>
        </g>
        <text x="19" y="46" textAnchor="middle" fontFamily="serif" fontSize="4.5" fill="#6aab3a" opacity="0.8" letterSpacing="0.5">PRESENT</text>
      </g>

      {/* ── FUTURE board — bottom-center ── */}
      <g transform="translate(61, 138)">
        <rect width="38" height="38" rx="3" fill="rgba(0,0,0,.55)" stroke="#9060d0" strokeWidth="1.2"/>
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3), col = i % 3;
          const light = (row + col) % 2 === 0;
          return <rect key={i} x={2 + col * 11.3} y={2 + row * 11.3} width="11" height="11" fill={light ? "rgba(144,96,208,.45)" : "rgba(50,20,100,.55)"} rx="1"/>;
        })}
        {/* Queen piece */}
        <g transform="translate(13, 11)">
          <ellipse cx="5.5" cy="10" rx="5.5" ry="1.8" fill="#9060d0" opacity="0.7"/>
          <path d="M1,9 L2,4 L5.5,7 L9,2 L12.5,7 L10,4 L11,9 Z" fill="#b890f8"/>
          <circle cx="9" cy="2.5" r="1.5" fill="#b890f8"/>
          <circle cx="5.5" cy="1" r="1.8" fill="#c8a8ff"/>
          <circle cx="2" cy="2.5" r="1.5" fill="#b890f8"/>
        </g>
        <text x="19" y="46" textAnchor="middle" fontFamily="serif" fontSize="5" fill="#9060d0" opacity="0.8" letterSpacing="1">FUTURE</text>
      </g>

      {/* ══════════════════════════════
          CONNECTING TRIANGLE LINES
         ══════════════════════════════ */}
      {/* Past to Present */}
      <line x1="66" y1="63" x2="134" y2="63" stroke="rgba(200,160,50,.22)" strokeWidth="1" strokeDasharray="3 3"/>
      {/* Past to Future */}
      <line x1="55" y1="76" x2="76" y2="142" stroke="rgba(200,160,50,.22)" strokeWidth="1" strokeDasharray="3 3"/>
      {/* Present to Future */}
      <line x1="145" y1="76" x2="124" y2="142" stroke="rgba(200,160,50,.22)" strokeWidth="1" strokeDasharray="3 3"/>

      {/* ══════════════════════════════
          CENTER — TEMPORAL CROWN KING
         ══════════════════════════════ */}
      {/* Center platform */}
      <circle cx="100" cy="100" r="28" fill="rgba(0,0,0,.65)" stroke={`url(#${id}-gold)`} strokeWidth="1.5"/>
      <circle cx="100" cy="100" r="24" fill="rgba(20,10,5,.7)"/>

      {/* Crown base arch */}
      <path
        d="M 82 110 L 82 100 L 87 95 L 90 100 L 100 90 L 110 100 L 113 95 L 118 100 L 118 110 Z"
        fill={`url(#${id}-gold)`}
        filter={`url(#${id}-shadow)`}
      />
      {/* Crown top points */}
      <circle cx="100" cy="88" r="4" fill={`url(#${id}-gold)`}/>
      <circle cx="87"  cy="93" r="2.8" fill={`url(#${id}-gold)`}/>
      <circle cx="113" cy="93" r="2.8" fill={`url(#${id}-gold)`}/>
      {/* Crown jewels */}
      <circle cx="100" cy="88" r="1.8" fill="#fff" opacity="0.6"/>
      <circle cx="87"  cy="93" r="1.3" fill="#9060d0" opacity="0.8"/>
      <circle cx="113" cy="93" r="1.3" fill="#6aab3a" opacity="0.8"/>
      {/* Crown band */}
      <rect x="82" y="106" width="36" height="4" rx="1" fill={`url(#${id}-gold)`} opacity="0.85"/>
      {/* Hourglass neck inside crown */}
      <path d="M 92 106 L 100 100 L 108 106" stroke="rgba(255,220,100,.3)" strokeWidth="1" fill="none"/>

      {/* Inner ring accent */}
      <circle cx="100" cy="100" r="28" stroke="rgba(200,160,50,.12)" strokeWidth="6"/>

      {/* Three small realm dots orbiting center */}
      {[
        { angle: -90,  col: "#d4943a" },  // top — past
        { angle:  30,  col: "#6aab3a" },  // bottom-right — present
        { angle: 150,  col: "#9060d0" },  // bottom-left — future
      ].map(({ angle, col }, i) => {
        const rad = angle * Math.PI / 180;
        const r = 34;
        return (
          <circle
            key={i}
            cx={100 + r * Math.cos(rad)}
            cy={100 + r * Math.sin(rad)}
            r="3.5"
            fill={col}
            opacity="0.85"
          />
        );
      })}

      {/* ══════════════════════════════
          TEXT LOCKUP
         ══════════════════════════════ */}
      {showText && (
        <>
          {/* Thin rule above text */}
          <line x1="30" y1="204" x2="170" y2="204" stroke="rgba(200,160,50,.25)" strokeWidth="0.8"/>

          {/* CHRONOWAR wordmark */}
          <text
            x="100" y="224"
            textAnchor="middle"
            fontFamily="'Cinzel Decorative', Georgia, serif"
            fontSize="18"
            fontWeight="bold"
            letterSpacing="6"
            fill={`url(#${id}-gold)`}
            filter={`url(#${id}-shadow)`}
          >
            CHRONOWAR
          </text>

          {/* Ornament dots */}
          <circle cx="44"  cy="237" r="1.5" fill="rgba(200,160,50,.4)"/>
          <circle cx="100" cy="237" r="2"   fill="rgba(200,160,50,.6)"/>
          <circle cx="156" cy="237" r="1.5" fill="rgba(200,160,50,.4)"/>

          {/* Subtitle */}
          <text
            x="100" y="254"
            textAnchor="middle"
            fontFamily="'Cinzel', Georgia, serif"
            fontSize="6.5"
            letterSpacing="4"
            fill="rgba(200,170,100,.5)"
          >
            THE CHRONICLES OF THREE REALMS
          </text>

          {/* Bottom rule */}
          <line x1="50" y1="262" x2="150" y2="262" stroke="rgba(200,160,50,.18)" strokeWidth="0.8"/>
        </>
      )}
    </svg>
  );
}
