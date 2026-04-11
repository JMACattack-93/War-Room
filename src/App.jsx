import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';

/* --- MASTER DATA ARCHITECTURE (STRICT INTEGRITY) --- */
import { BIG_BOARD } from './player_datav10'; 
import { SCOUT_BOARD } from './scout_board'; 
import { TRAIT_REGISTRY } from './traits';
import { GM_DATA } from './GM_data'; 
import { DRAFT_ORDER } from './draftorder100';
import { TEAM_COLORS } from './team_colors'; 
import { COLLEGE_LOGOS } from './college_data'; 
import { TEAM_WORDMARKS } from './wordmark_data';

const s = {
  surface: '#020406',         
  surfaceLow: '#07090c',      
  surfaceHigh: '#11151c',     
  textMain: '#ffffff',        
  textDim: '#94a3b8',         
  accent: '#3b82f6', 
  terminal: '#39ff14', 
  pikachuYellow: '#facc15',
  electricBlue: '#00eaff'
};

/* --- V69 FUZZY MATCHING ENGINE --- */
const normalize = (name) => {
  if (!name) return "";
  return name.toLowerCase()
    .replace(/\sjr\.?$/g, "")
    .replace(/\siii$/g, "")
    .replace(/\siv$/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
};

/* --- V69 GLOBAL OVERLAY PORTAL --- */
const TraitPortal = ({ text, description, position, active, color }) => {
  if (!active || !position) return null;
  const shouldFlip = position.y < 350;
  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: shouldFlip ? position.y + 65 : position.y - 20, left: position.x,
      transform: `translateX(-50%) ${shouldFlip ? '' : 'translateY(-100%)'}`, width: '340px',
      background: 'rgba(2, 4, 8, 0.99)', border: `2px solid ${color}`, padding: '24px', borderRadius: '20px',
      color: '#fff', boxShadow: `0 40px 100px #000, 0 0 60px ${color}40`, zIndex: 10000000,
      backdropFilter: 'blur(30px)', pointerEvents: 'none', animation: 'modalSlam 0.2s forwards'
    }}>
      <div style={{ color, fontWeight: '1000', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px', fontSize: '17px', borderBottom: `2px solid ${color}40`, paddingBottom: '8px' }}>SYSTEM_DECODE: {text}</div>
      <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#f1f5f9', fontWeight: '600', fontStyle: 'italic' }}>"{description}"</div>
    </div>, document.body
  );
};

/* --- V69 SOVEREIGN-CATHODE GOLD ENGINE --- */
const CathodeSpline = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: -20, overflow: 'visible' }}>
    <filter id="sig-fusion-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <path className="fused-spline spline-main" d="M5,5 Q50,-5 95,5 Q105,50 95,95 Q50,105 5,95 Q-5,50 5,5" filter="url(#sig-fusion-glow)" />
    <path className="fused-spline spline-accent" d="M5,5 Q50,-5 95,5 Q105,50 95,95 Q50,105 5,95 Q-5,50 5,5" filter="url(#sig-fusion-glow)" />
    <style>{`
      @keyframes splineFlow { 0% { stroke-dashoffset: 400; opacity: 0.1; } 50% { opacity: 0.4; } 100% { stroke-dashoffset: 0; opacity: 0.1; } }
      @keyframes popDischarge { 0%, 90%, 100% { filter: brightness(1) opacity(0.3); } 95% { filter: brightness(4) drop-shadow(0 0 15px ${s.electricBlue}); opacity: 1; } }
      .fused-spline { fill: none; stroke-linecap: round; stroke-width: 2px; stroke-dasharray: 100 300; }
      .spline-main { stroke: ${s.pikachuYellow}; animation: splineFlow 4s infinite linear; }
      .spline-accent { stroke: ${s.electricBlue}; stroke-width: 3px; stroke-dasharray: 30 370; animation: splineFlow 2.5s infinite linear reverse, popDischarge 0.8s infinite; }
    `}</style>
  </svg>
);

const GrindingSparkStorm = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} className={`grind-node gn-${i}`}>
        <div style={{ width: '1.5px', height: '1.5px', background: '#fff', borderRadius: '50%' }} />
        <div className="vent-spark vs-1" /><div className="vent-spark vs-2" />
      </div>
    ))}
    <style>{`
      @keyframes perimeterRace { 0% { top: 0%; left: 0%; } 25% { top: 0%; left: 100%; } 50% { top: 100%; left: 100%; } 75% { top: 100%; left: 0%; } 100% { top: 0%; left: 0%; } }
      @keyframes sparkThrow { 0% { transform: translate(0,0) rotate(var(--rot)) scale(1.8); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0); opacity: 0; } }
      .grind-node { position: absolute; width: 1px; height: 1px; animation: perimeterRace 5s infinite linear; }
      .vent-spark { position: absolute; width: 1px; height: 10px; background: linear-gradient(to top, white, ${s.pikachuYellow}); animation: sparkThrow 0.25s infinite ease-out; }
      .vs-1 { --tx: -40px; --ty: -25px; --rot: 35deg; animation-delay: 0.05s; }
      .vs-2 { --tx: 40px; --ty: 25px; --rot: -35deg; animation-delay: 0.15s; }
      .gn-0 { animation-delay: 0s; } .gn-1 { animation-delay: -0.83s; } .gn-2 { animation-delay: -1.66s; } .gn-3 { animation-delay: -2.49s; } .gn-4 { animation-delay: -3.32s; } .gn-5 { animation-delay: -4.15s; }
    `}</style>
  </div>
);

const TraitGem = ({ text, category = 'silver', playerPos = 'ALL', size = 'md', isDossier = false }) => {
  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const gemRef = useRef(null);
  if (!text) return null;
  const traitData = TRAIT_REGISTRY?.[text] || { category, description: 'Evaluation pending...' };
  const cat = (traitData.category || category).toLowerCase();
  
  const themes = {
    gold: { rim: 'linear-gradient(180deg, #fff, #fbbf24 45%, #78350f)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(251,191,36,0.15) 50%, rgba(120,53,15,1) 100%)', glow: '#fbbf24' },
    ruby: { rim: 'linear-gradient(180deg, #ffbaba, #ef4444 45%, #450a0a)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,68,68,0.1) 50%, rgba(69,10,10,1) 100%)', glow: '#ef4444' },
    sapphire: { rim: 'linear-gradient(180deg, #bae6fd, #3b82f6 45%, #082f49)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(59,130,246,0.1) 50%, rgba(8,47,73,1) 100%)', glow: '#3b82f6' },
    emerald: { rim: 'linear-gradient(180deg, #d1fae5, #10b981 45%, #064e3b)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(16,185,129,0.1) 50%, rgba(6,78,59,1) 100%)', glow: '#10b981' },
    silver: { rim: 'linear-gradient(180deg, #fff, #64748b 45%, #0f172a)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(71,85,105,0.1) 50%, rgba(2,6,23,1) 100%)', glow: '#94a3b8' }
  }[cat] || { rim: '#444', gem: '#222', glow: '#666' };

  return (
    <div ref={gemRef} onMouseEnter={() => { const r = gemRef.current.getBoundingClientRect(); setCoords({ x: r.left + r.width/2, y: r.top }); setHovered(true); }} onMouseLeave={() => setHovered(false)}
      style={{ display: 'inline-flex', padding: '5px', background: '#000', borderRadius: '14px', boxShadow: 'inset 4px 4px 10px #000', margin: '5px', position: 'relative', cursor: 'help' }}>
      <TraitPortal text={text} description={traitData.contextual?.[playerPos] || traitData.description} position={coords} active={hovered} color={themes.glow} />
      <div style={{ padding: '2px', background: themes.rim, borderRadius: '8px', boxShadow: hovered ? `0 0 35px ${themes.glow}` : 'none', transition: '0.4s ease', transform: hovered ? 'scale(1.15) rotate(1deg)' : 'scale(1)', position: 'relative', overflow: isDossier && cat === 'gold' ? 'visible' : 'hidden' }}>
        {isDossier && cat === 'gold' && (
          <>
            <div style={{ position: 'absolute', inset: -15, border: '12px solid #facc15', borderRadius: '20px', filter: 'blur(18px)', opacity: 0.4, animation: 'tensionBreathe 3.5s infinite ease-in-out' }} />
            <GrindingSparkStorm /><CathodeSpline />
          </>
        )}
        <div style={{ background: themes.gem, color: cat === 'gold' ? '#000' : '#fff', padding: size === 'xl' ? '12px 28px' : '7px 18px', borderRadius: '6px', fontSize: size === 'xl' ? '16px' : '11px', fontWeight: '1000', textTransform: 'uppercase', letterSpacing: '1.8px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: `inset 0 0 15px rgba(255,255,255,0.45)`, position: 'relative', zIndex: 10 }}>{text}</div>
      </div>
    </div>
  );
};

/* --- V69 DYNAMIC TRAIT LOADER --- 
   This function ensures no traits are missed regardless of category name.
*/
const RenderAllTraits = ({ player, size = 'md', isDossier = false }) => {
  if (!player.traits) return null;
  return Object.entries(player.traits).map(([category, list]) => {
    if (!Array.isArray(list)) return null;
    return list.map(traitName => (
      <TraitGem key={traitName} text={traitName} category={category} playerPos={player.pos} size={size} isDossier={isDossier} />
    ));
  });
};

export default function App() {
  const [appState, setAppState] = useState('LANDING'); 
  const [userTeams, setUserTeams] = useState([]); 
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [draftResults, setDraftResults] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);

  const currentPick = DRAFT_ORDER?.[currentPickIndex] || { teamKey: 'WAS', pick: 1 };
  const isUserOnClock = currentPick && userTeams.includes(currentPick.teamKey);
  const activeDraftTeam = currentPick?.teamKey || 'WAS';
  const teamColor = TEAM_COLORS?.[activeDraftTeam]?.c || s.accent; 
  const teamSecColor = TEAM_COLORS?.[activeDraftTeam]?.sc || '#fff';
  const teamLogo = TEAM_COLORS?.[activeDraftTeam]?.logo || '';
  const activeTeamData = GM_DATA?.[activeDraftTeam] || { n: 'Unknown', needs: {}, outlook: 'Synthesis Pending...' };

  const boardData = useMemo(() => {
    const normalizedScoutKeys = {};
    Object.keys(SCOUT_BOARD).forEach(key => { normalizedScoutKeys[normalize(key)] = SCOUT_BOARD[key]; });
    return BIG_BOARD.map(p => {
      const scoutData = normalizedScoutKeys[normalize(p.name)] || { rank: 999, scout_value: 0 };
      return { ...p, scout_rank: scoutData.rank, scout_value: scoutData.scout_value };
    }).sort((a, b) => a.scout_rank - b.scout_rank);
  }, []);

  const filteredBoard = boardData.filter(p => {
    const isDrafted = Object.values(draftResults).some(dp => dp.name === p.name);
    return !isDrafted && p.name.toLowerCase().includes(search.toLowerCase()) && (filterPos === "ALL" || p.pos === filterPos);
  });

  const calculateFit = (player, teamKey) => {
    if (!player || !teamKey) return { score: 0 };
    const gm = GM_DATA?.[teamKey] || {};
    let score = (gm.needs?.[player.pos] || 0) * 0.45;
    if ((player.traits?.silver || []).some(c => (gm.schemes || []).includes(c))) score += 25;
    if (player.traits?.gold) score += (player.traits.gold.length * 18);
    return { score: Math.min(99, Math.round(score + 10)) };
  };

  const handleDraft = (id) => {
    const p = boardData.find(player => player.id === id);
    if (!p) return;
    setDraftResults(prev => ({ ...prev, [currentPick.pick]: p }));
    setCurrentPickIndex(prev => prev + 1);
    setSelectedId(null);
  };

  useEffect(() => {
    if (isSimulating && currentPick && !isUserOnClock) {
      const timer = setTimeout(() => {
        const available = boardData.filter(p => !Object.values(draftResults).some(dr => dr.name === p.name));
        if (available.length > 0) handleDraft(available[0].id);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [currentPickIndex, isSimulating, isUserOnClock]);

  const selectedPlayer = selectedId !== null ? boardData.find(p => p.id === selectedId) : null;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: s.surface, color: '#fff', fontFamily: 'Lexend, sans-serif', overflow: 'hidden' }}>
      <div style={{ width: '149.25%', height: '149.25%', transform: 'scale(0.67)', transformOrigin: 'top left', background: s.surface }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&family=Inter:wght@400;500;700&display=swap');
          * { box-sizing: border-box; -ms-overflow-style: none; scrollbar-width: none; }
          *::-webkit-scrollbar { display: none; }
          @keyframes superAura { 0%, 100% { border-color: var(--p); box-shadow: 0 0 70px var(--p-40); } 50% { border-color: #fff; box-shadow: 0 0 120px var(--p-60); } }
          @keyframes modalSlam { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes tensionBreathe { 0%, 100% { opacity: 0.25; filter: blur(15px); } 50% { opacity: 0.6; filter: blur(22px); } }
          .player-card { transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid rgba(255,255,255,0.06); position: relative; cursor: pointer; overflow: hidden; }
          .player-card:hover { border-color: rgba(59, 130, 246, 0.6); background: #0c1117 !important; transform: translateX(12px); }
          .talent-tower { background: linear-gradient(180deg, rgba(59, 130, 246, 0.25) 0%, rgba(0,0,0,0.95) 100%); border-left: 2px solid rgba(59, 130, 246, 0.45); }
          .pos-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #8d909e; padding: 12px 20px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 16px; }
          .pos-btn-active { background: ${s.accent}; color: #fff; border-color: #fff; box-shadow: 0 0 25px ${s.accent}60; }
          .team-tile-active { animation: selectGlow 3s infinite; }
          @keyframes selectGlow { 0%, 100% { border-color: var(--tc); box-shadow: 0 0 25px var(--tc-30); } 50% { border-color: #fff; box-shadow: 0 0 50px var(--tc-50); } }
        `}</style>

        {appState === 'LANDING' && (
          <div style={{ height: '100%', width: '100%', padding: '100px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px' }}>
              <div><span style={{ color: s.accent, fontWeight: '1000', letterSpacing: '20px', fontSize: '24px' }}>TACTICAL INTERFACE V69.0</span><h1 style={{ fontSize: '180px', fontWeight: '950', fontStyle: 'italic', color: '#fff', letterSpacing: '-12px', margin: 0, lineHeight: 0.8 }}>WAR ROOM</h1></div>
              <div style={{ display: 'flex', gap: '30px' }}><button onClick={() => setUserTeams(Object.keys(GM_DATA))} style={{ background: 'rgba(255,255,255,0.03)', color: '#fff', padding: '30px 60px', borderRadius: '20px', fontWeight: '1000', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: '24px' }}>SELECT ALL</button><button onClick={() => setAppState('DRAFTING')} style={{ background: s.accent, color: '#fff', padding: '45px 150px', borderRadius: '35px', fontWeight: '1000', border: 'none', cursor: 'pointer', fontSize: '56px', fontStyle: 'italic', boxShadow: `0 0 100px ${s.accent}80` }}>INITIATE</button></div>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '35px' }}>
              {Object.keys(GM_DATA).sort().map(key => (
                <div key={key} onClick={() => setUserTeams(v => v.includes(key) ? v.filter(k => k !== key) : [...v, key])} className={userTeams.includes(key) ? "team-tile-active" : ""} style={{ background: userTeams.includes(key) ? `${TEAM_COLORS[key]?.c}35` : s.surfaceLow, padding: '60px', borderRadius: '55px', border: `4px solid ${userTeams.includes(key) ? TEAM_COLORS[key]?.c : 'transparent'}`, textAlign: 'center', cursor: 'pointer', transition: '0.4s', '--tc': TEAM_COLORS[key]?.c }}><img src={TEAM_COLORS[key]?.logo} style={{ height: '130px', opacity: userTeams.includes(key) ? 1 : 0.2 }} /><div style={{ fontWeight: '1000', marginTop: '25px', textTransform: 'uppercase', fontSize: '24px' }}>{GM_DATA[key]?.n}</div></div>
              ))}
            </div>
          </div>
        )}

        {appState === 'DRAFTING' && selectedId === null && (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr 550px', height: '100%', width: '100%' }}>
            <aside style={{ background: s.surfaceLow, borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto' }}>
              {DRAFT_ORDER.map((p, i) => {
                const drafted = draftResults[p.pick];
                const isActive = i === currentPickIndex;
                return (
                  <div key={i} style={{ height: '140px', display: 'flex', alignItems: 'center', padding: '0 50px', borderRight: isActive ? `20px solid ${TEAM_COLORS[p.teamKey]?.c}` : 'none', background: isActive ? `${TEAM_COLORS[p.teamKey]?.c}15` : 'transparent', opacity: i < currentPickIndex ? 0.35 : 1 }}>
                    <img src={TEAM_COLORS[p.teamKey]?.logo} style={{ height: '80px', marginRight: '30px' }} />
                    <div><div style={{ fontSize: '18px', fontWeight: '1000', color: s.accent }}>{drafted?.pos || 'PICK ' + p.pick}</div><div style={{ fontSize: '24px', fontWeight: '1000', textTransform: 'uppercase', color: '#fff' }}>{drafted?.name || 'ON CLOCK'}</div></div>
                  </div>
                );
              })}
            </aside>
            <main style={{ overflowY: 'auto', padding: '100px 80px', background: s.surface }}>
                <header style={{ marginBottom: '80px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}><h1 style={{ fontSize: '120px', fontWeight: '1000', fontStyle: 'italic', margin: 0, letterSpacing: '-8px' }}>BIG BOARD</h1><div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>{!isUserOnClock && <button onClick={() => setIsSimulating(!isSimulating)} style={{ background: isSimulating ? '#ef4444' : s.terminal, color: '#000', border: 'none', padding: '24px 48px', borderRadius: '15px', fontWeight: '1000', cursor: 'pointer', fontSize: '22px' }}>{isSimulating ? 'PAUSE' : 'AUTO-DRAFT'}</button>}<input placeholder="SEARCH TERMINAL..." style={{ background: s.surfaceHigh, border: 'none', padding: '30px 60px', borderRadius: '25px', color: '#fff', width: '500px', fontWeight: '800', fontSize: '24px', border: '1px solid rgba(255,255,255,0.1)' }} onChange={(e) => setSearch(e.target.value)} /></div></div><div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>{["ALL", "QB", "RB", "WR", "TE", "OT", "iOL", "EDGE", "iDL", "LB", "DB"].map(pos => (<button key={pos} onClick={() => setFilterPos(pos)} className={`pos-btn ${filterPos === pos ? 'pos-btn-active' : ''}`}>{pos}</button>))}</div></header>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                 {filteredBoard.map((p) => {
                   const fit = calculateFit(p, activeDraftTeam);
                   return (
                     <div key={p.id} onClick={() => setSelectedId(p.id)} className="player-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 220px', background: s.surfaceLow, borderRadius: '50px', height: '260px' }}>
                       <div style={{ padding: '50px', position: 'relative', zIndex: 2 }}><img src={COLLEGE_LOGOS[p.school]} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', height: '260px', opacity: 0.15, mixBlendMode: 'overlay', pointerEvents: 'none' }} /><div style={{ fontSize: '28px', fontWeight: '1000', color: s.accent, textTransform: 'uppercase' }}>{p.school}</div><div style={{ fontSize: '42px', fontWeight: '900', color: s.textDim, textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '-10px' }}>{p.name.split(' ')[0]}</div><h2 style={{ fontSize: '120px', fontWeight: '1000', textTransform: 'uppercase', fontStyle: 'italic', color: '#fff', letterSpacing: '-6px', margin: 0, lineHeight: 0.8, textShadow: '0 8px 30px #000' }}>{p.name.split(' ').slice(1).join(' ')}</h2></div>
                       {/* V69 RESTORED TRAIT SCANNER */}
                       <div style={{ padding: '50px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignContent: 'center' }}>
                         <RenderAllTraits player={p} />
                       </div>
                       <div className="talent-tower" style={{ display: 'flex', flexDirection: 'column' }}><div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '14px', color: s.accent, fontWeight: '1000' }}>TALENT</span><span style={{ fontSize: '44px', fontWeight: '1000', color: '#fff' }}>{p.scout_value}</span></div><div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '14px', color: teamSecColor, fontWeight: '1000' }}>NEURAL FIT</span><span style={{ fontSize: '72px', fontWeight: '1000', color: '#fff', textShadow: `0 0 35px ${teamColor}` }}>{fit.score}</span></div></div>
                     </div>
                   );
                 })}
                </div>
            </main>
            <aside style={{ background: s.surfaceLow, borderLeft: '1px solid rgba(255,255,255,0.08)', padding: '70px', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '80px' }}><img src={TEAM_COLORS[activeDraftTeam]?.logo} style={{ height: '220px', filter: `drop-shadow(0 0 80px ${teamColor}80)` }} /><h2 style={{ fontSize: '72px', fontWeight: '1000', fontStyle: 'italic', marginTop: '40px', color: '#fff', textShadow: `0 0 40px ${teamColor}` }}>{activeTeamData.n}</h2><div style={{ color: teamSecColor, fontWeight: '1000', letterSpacing: '18px', fontSize: '22px' }}>COMMAND DOSSIER</div></div>
              <div style={{ background: '#000', border: '2px solid rgba(255,255,255,0.1)', padding: '50px', borderRadius: '40px', marginBottom: '60px' }}><div style={{ fontSize: '16px', color: s.accent, fontWeight: '1000', letterSpacing: '8px', marginBottom: '25px' }}>OUTLOOK_SYNTHESIS</div><p style={{ fontSize: '24px', color: '#fff', lineHeight: 1.8, fontWeight: '600' }}>{activeTeamData.outlook}</p></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>{Object.entries(activeTeamData.needs || {}).sort((a,b) => b[1]-a[1]).slice(0, 6).map(([pos, val]) => (<div key={pos} style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.08)' }}><div style={{ fontSize: '42px', fontWeight: '1000', color: val > 80 ? '#ef4444' : s.terminal }}>{pos}</div><div style={{ fontSize: '18px', opacity: 0.5, fontWeight: '800' }}>PRIORITY: {val}</div></div>))}</div>
            </aside>
          </div>
        )}

        {selectedId !== null && selectedPlayer && (
          <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(50px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedId(null)}>
            <div style={{ width: '94%', height: '950px', background: '#0b0e14', borderRadius: '100px', border: '15px solid transparent', animation: 'superAura 3.5s infinite, modalSlam 0.4s forwards', display: 'grid', gridTemplateColumns: '1.4fr 400px', overflow: 'hidden', position: 'relative', '--p': teamColor, '--p-40': `${teamColor}40`, '--p-60': `${teamColor}60` }} onClick={(e) => e.stopPropagation()}>
                <div style={{ position: 'absolute', top: '80px', right: '480px', fontSize: '140px', fontWeight: '1000', fontFamily: 'JetBrains Mono', color: '#fff', opacity: 0.08, pointerEvents: 'none' }}>{selectedPlayer.pos}</div>
              <div style={{ padding: '120px 100px', position: 'relative', borderRight: '2px solid rgba(255,255,255,0.1)' }}><img src={COLLEGE_LOGOS[selectedPlayer.school]} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '1200px', opacity: 0.05, filter: 'grayscale(100%) brightness(12)' }} /><div style={{ display: 'flex', alignItems: 'center', gap: '50px', marginBottom: '60px', position: 'relative', zIndex: 5 }}><img src={COLLEGE_LOGOS[selectedPlayer.school]} style={{ height: '130px', background: 'rgba(255,255,255,0.08)', padding: '35px', borderRadius: '45px' }} /><div><h2 style={{ fontSize: '130px', fontWeight: '1000', fontStyle: 'italic', margin: 0, lineHeight: 0.75, letterSpacing: '-10px', color: '#fff', textShadow: '0 20px 80px rgba(0,0,0,1)' }}>{selectedPlayer.name.toUpperCase()}</h2><div style={{ fontSize: '38px', fontWeight: '1000', color: s.accent, marginTop: '15px' }}>{selectedPlayer.school.toUpperCase()} <span style={{ opacity: 0.2 }}>/</span> RANK #{selectedPlayer.scout_rank}</div></div></div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '70px', borderRadius: '70px', border: '1px solid rgba(255,255,255,0.15)', marginTop: '50px', position: 'relative', zIndex: 6 }}><div style={{ fontSize: '16px', color: s.accent, fontWeight: '1000', letterSpacing: '10px', marginBottom: '25px' }}>CONSENSUS_SYNTHESIS</div><p style={{ fontSize: '30px', lineHeight: 1.8, color: '#f8fafc', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>{selectedPlayer.summary}</p></div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '60px', position: 'relative', zIndex: 10 }}>
                {/* Dossier Recursive Loader */}
                <RenderAllTraits player={selectedPlayer} size="xl" isDossier={true} />
              </div></div>
              <div style={{ background: 'rgba(0,0,0,0.85)', padding: '100px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '4px solid rgba(255,255,255,0.1)' }}>{isUserOnClock && (<button onClick={() => handleDraft(selectedPlayer.id)} style={{ width: '100%', background: `linear-gradient(135deg, ${teamColor}, #fff)`, padding: '40px', borderRadius: '50px', border: 'none', color: '#000', fontSize: '38px', fontWeight: '1000', fontStyle: 'italic', cursor: 'pointer', boxShadow: `0 30px 80px ${teamColor}80`, textTransform: 'uppercase', marginBottom: '80px' }}>DRAFT PLAYER</button>)}<div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: '22px', color: teamSecColor, fontWeight: '1000', letterSpacing: '20px', marginBottom: '20px' }}>FIT</div><div style={{ fontSize: '240px', fontWeight: '1000', color: '#fff', lineHeight: 0.8, textShadow: `0 0 80px ${teamColor}` }}>{calculateFit(selectedPlayer, activeDraftTeam).score}</div></div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}