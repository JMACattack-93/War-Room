import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';

/* --- MASTER DATA ARCHITECTURE --- */
import { BIG_BOARD } from './player_datav10'; 
import { SCOUT_BOARD } from './scout_board'; 
import { TRAIT_REGISTRY } from './traits';
import { GM_DATA } from './GM_data'; 
import { DRAFT_ORDER } from './draftorder100';
import { TEAM_COLORS } from './team_colors'; 
import { COLLEGE_LOGOS } from './college_data';

const s = {
  surface: '#020406', surfaceLow: '#07090c', surfaceHigh: '#11151c',
  textMain: '#ffffff', textDim: '#94a3b8', accent: '#3b82f6',
  terminal: '#39ff14', pikachuYellow: '#facc15', electricBlue: '#00eaff'
};

const normalize = (n) => n ? n.toLowerCase().replace(/\sjr\.?$/g,"").replace(/[^a-z0-9]/g,"").trim() : "";

/* --- V79 TACTICAL OVERLAY --- */
const TraitPortalMobile = ({ text, active, color }) => {
  if (!active) return null;
  const traitData = TRAIT_REGISTRY?.[text] || { description: "Tactical data pending..." };
  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
      width: '88%', background: 'rgba(2, 4, 8, 0.98)', border: `3px solid ${color}`,
      borderRadius: '24px', padding: '28px', zIndex: 10000000, color: '#fff',
      boxShadow: `0 0 100px ${color}70`, backdropFilter: 'blur(30px)', animation: 'modalSlam 0.1s forwards'
    }}>
      <div style={{ color, fontWeight: '1000', fontSize: '18px', marginBottom: '12px', borderBottom: `2px solid ${color}30`, paddingBottom: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>DECODING: {text}</div>
      <div style={{ fontSize: '15px', fontStyle: 'italic', lineHeight: '1.7', color: '#f8fafc', fontWeight: '500' }}>"{traitData.description}"</div>
    </div>, document.body
  );
};

/* --- VISUAL ENGINES --- */
const CathodeSpline = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: -18, overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}>
    <filter id="sig-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <path className="fused-spline spline-main" d="M5,5 Q50,-5 95,5 Q105,50 95,95 Q50,105 5,95 Q-5,50 5,5" filter="url(#sig-glow)" />
    <path className="fused-spline spline-accent" d="M5,5 Q50,-5 95,5 Q105,50 95,95 Q50,105 5,95 Q-5,50 5,5" filter="url(#sig-glow)" />
  </svg>
);

const TraitGem = ({ text, category = 'silver', size = 'md', isDossier = false }) => {
  const [active, setActive] = useState(false);
  if (!text) return null;
  const cat = (TRAIT_REGISTRY?.[text]?.category || category).toLowerCase();
  const themes = {
    gold: { rim: 'linear-gradient(180deg, #fff, #fbbf24 45%, #78350f)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(251,191,36,0.1) 50%, rgba(120,53,15,1) 100%)', glow: '#fbbf24' },
    ruby: { rim: 'linear-gradient(180deg, #ffbaba, #ef4444 45%, #450a0a)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,68,68,0.1) 50%, rgba(69,10,10,1) 100%)', glow: '#ef4444' },
    sapphire: { rim: 'linear-gradient(180deg, #bae6fd, #3b82f6 45%, #082f49)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(59,130,246,0.1) 50%, rgba(8,47,73,1) 100%)', glow: '#3b82f6' },
    emerald: { rim: 'linear-gradient(180deg, #d1fae5, #10b981 45%, #064e3b)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(16,185,129,0.1) 50%, rgba(6,78,59,1) 100%)', glow: '#10b981' },
    silver: { rim: 'linear-gradient(180deg, #fff, #64748b 45%, #0f172a)', gem: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(71,85,105,0.1) 50%, rgba(2,6,23,1) 100%)', glow: '#94a3b8' }
  }[cat] || { rim: 'linear-gradient(180deg, #444, #222)', gem: '#222', glow: '#666' };

  return (
    <div onTouchStart={() => setActive(true)} onTouchEnd={() => setActive(false)}
      style={{ display: 'inline-flex', padding: '4px', background: '#000', borderRadius: '12px', margin: '4px', position: 'relative' }}>
      <TraitPortalMobile text={text} active={active} color={themes.glow} />
      <div style={{ padding: '2px', background: themes.rim, borderRadius: '6px', position: 'relative', overflow: isDossier && cat === 'gold' ? 'visible' : 'hidden' }}>
        {cat === 'gold' && <CathodeSpline />}
        <div style={{ background: themes.gem, color: cat === 'gold' ? '#000' : '#fff', padding: size === 'xl' ? '12px 24px' : '6px 14px', borderRadius: '4px', fontSize: size === 'xl' ? '13px' : '10px', fontWeight: '1000', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.4)', position: 'relative', zIndex: 10 }}>{text}</div>
      </div>
    </div>
  );
};

const CATEGORY_MAP = {
  S: { n: "Skill", c: "#10b981", bg: "rgba(16,185,129,0.05)" },
  P: { n: "Physical", c: "#fbbf24", bg: "rgba(251,191,36,0.05)" },
  M: { n: "Mental", c: "#3b82f6", bg: "rgba(59,130,246,0.05)" },
  T: { n: "Tactical", c: "#94a3b8", bg: "rgba(148,163,184,0.05)" }
};

const RenderAllTraitsMobile = ({ player }) => {
  if (!player.traits) return null;
  const grouped = { S: [], P: [], M: [], T: [] };
  Object.values(player.traits).flat().forEach(traitName => {
    const registryData = TRAIT_REGISTRY?.[traitName];
    const group = registryData?.group || 'T';
    if (grouped[group]) grouped[group].push(traitName);
  });
  return Object.entries(grouped).map(([key, list]) => {
    if (list.length === 0) return null;
    const meta = CATEGORY_MAP[key];
    return (
      <div key={key} style={{ background: meta.bg, padding: '25px', borderRadius: '25px', marginBottom: '15px', border: `1px solid ${meta.c}30` }}>
        <div style={{ fontSize: '12px', color: meta.c, fontWeight: '1000', letterSpacing: '5px', marginBottom: '15px', textTransform: 'uppercase' }}>{meta.n}_CAPACITY</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {list.map(t => <TraitGem key={t} text={t} category={TRAIT_REGISTRY?.[t]?.category || 'silver'} size="xl" isDossier={true} />)}
        </div>
      </div>
    );
  });
};

export default function AppMobile() {
  const [appState, setAppState] = useState('LANDING'); 
  const [userTeams, setUserTeams] = useState([]); 
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [draftResults, setDraftResults] = useState({});
  const [activePane, setActivePane] = useState(0);
  const swipeRef = useRef(null);

  const currentPick = DRAFT_ORDER?.[currentPickIndex] || { teamKey: 'WAS', pick: 1 };
  const teamColor = TEAM_COLORS?.[currentPick.teamKey]?.c || s.accent;
  const teamSecColor = TEAM_COLORS?.[currentPick.teamKey]?.sc || '#fff';
  const activeTeamData = GM_DATA?.[currentPick.teamKey] || { n: 'Unknown', needs: {} };

  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;
    const handleScroll = () => {
      const index = Math.round(el.scrollLeft / el.offsetWidth);
      setActivePane(index);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [selectedId]);

  const boardData = useMemo(() => {
    const normScout = {};
    Object.keys(SCOUT_BOARD).forEach(k => normScout[normalize(k)] = SCOUT_BOARD[k]);
    return BIG_BOARD.map(p => {
      const sd = normScout[normalize(p.name)] || { rank: 999, scout_value: 0 };
      return { ...p, scout_rank: sd.rank, scout_value: sd.scout_value };
    }).sort((a, b) => a.scout_rank - b.scout_rank);
  }, []);

  const filteredBoard = boardData.filter(p => {
    const isDrafted = Object.values(draftResults).some(dp => dp.name === p.name);
    return !isDrafted && (p.name || "").toLowerCase().includes(search.toLowerCase()) && (filterPos === "ALL" || p.pos === filterPos);
  });

  const selectedPlayer = selectedId !== null ? boardData.find(p => p.id === selectedId) : null;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: s.surface, color: '#fff', fontFamily: 'Lexend, sans-serif', overflow: 'hidden' }}>
      <style>{`
        body { margin: 0; width: 100vw; height: 100vh; overflow: hidden; background: #000; }
        * { box-sizing: border-box; -ms-overflow-style: none; scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;800&display=swap');
        @keyframes modalSlam { from { transform: translate(-50%, -10%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes selectGlow { 0%, 100% { border-color: var(--tc); box-shadow: 0 0 20px var(--tc-40); } 50% { border-color: #fff; box-shadow: 0 0 50px var(--tc-80); } }
        @keyframes initiateGlow { 0%, 100% { box-shadow: 0 0 40px ${s.accent}50; } 50% { box-shadow: 0 0 80px ${s.accent}; } }
        @keyframes splineFlow { 0% { stroke-dashoffset: 400; opacity: 0.1; } 100% { stroke-dashoffset: 0; opacity: 0.1; } }
        .fused-spline { fill: none; stroke-width: 2px; stroke-dasharray: 100 300; }
        .spline-main { stroke: ${s.pikachuYellow}; animation: splineFlow 4s infinite linear; }
        .spline-accent { stroke: ${s.electricBlue}; animation: splineFlow 2.5s infinite linear reverse; }
        .swipe-container { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; height: 100%; -webkit-overflow-scrolling: touch; }
        .swipe-pane { min-width: 100%; scroll-snap-align: start; height: 100%; overflow-y: auto; padding: 0 30px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.15); transition: 0.3s; }
        .dot-active { background: #fff; width: 30px; border-radius: 6px; box-shadow: 0 0 15px #fff; }
        .pos-tab { padding: 10px 20px; background: rgba(255,255,255,0.05); border-radius: 12px; font-size: 11px; fontWeight: 900; color: #64748b; border: 1px solid transparent; flex-shrink: 0; }
        .pos-tab-active { background: ${s.accent}; color: #fff; border-color: #fff; }
      `}</style>

      {appState === 'LANDING' && (
        <div style={{ height: '100%', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ margin: '50px 0 25px' }}>
            <h1 style={{ fontStyle: 'italic', fontWeight: '950', fontSize: '72px', margin: 0, lineHeight: 0.8, letterSpacing: '-4px' }}>WAR ROOM</h1>
            <p style={{ letterSpacing: '6px', opacity: 0.4, fontSize: '13px', fontWeight: '1000', marginTop: '12px' }}>COMMAND_INTERFACE_V3</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <button onClick={() => setUserTeams(Object.keys(GM_DATA))} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '18px', borderRadius: '18px', fontWeight: '1000', fontSize: '14px' }}>SELECT ALL</button>
            <button onClick={() => setUserTeams([])} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '18px', borderRadius: '18px', fontWeight: '1000', fontSize: '14px' }}>CLEAR</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', paddingBottom: '180px' }}>
            {Object.keys(GM_DATA).sort().map(key => (
              <div key={key} onClick={() => setUserTeams(v => v.includes(key) ? v.filter(k => k !== key) : [...v, key])}
                style={{ background: '#07090c', border: `3px solid ${userTeams.includes(key) ? TEAM_COLORS[key]?.c : 'rgba(255,255,255,0.05)'}`, borderRadius: '28px', padding: '35px', textAlign: 'center', transition: '0.2s', animation: userTeams.includes(key) ? 'selectGlow 2s infinite' : 'none', '--tc': TEAM_COLORS[key]?.c, '--tc-40': `${TEAM_COLORS[key]?.c}40`, '--tc-80': `${TEAM_COLORS[key]?.c}80` }}>
                <img src={TEAM_COLORS[key]?.logo} style={{ height: '70px' }} />
              </div>
            ))}
          </div>
          <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: '30px', background: 'linear-gradient(to top, #020406 90%, transparent)', zIndex: 100 }}><button onClick={() => setAppState('DRAFTING')} style={{ width: '100%', padding: '22px', background: s.accent, borderRadius: '25px', color: '#fff', fontSize: '24px', fontWeight: '1000', border: 'none', fontStyle: 'italic', animation: 'initiateGlow 3s infinite' }}>INITIATE</button></div>
        </div>
      )}

      {appState === 'DRAFTING' && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100vw' }}>
          <header style={{ height: '90px', background: s.surfaceHigh, borderBottom: `4px solid ${teamColor}`, display: 'flex', alignItems: 'center', padding: '0 25px' }}>
            <img src={TEAM_COLORS[currentPick.teamKey]?.logo} style={{ height: '55px' }} />
            <div style={{ marginLeft: '20px' }}><div style={{ fontSize: '12px', color: teamColor, fontWeight: '1000', letterSpacing: '1px' }}>COMMAND_DOSSIER</div><div style={{ fontSize: '26px', fontWeight: '950', fontStyle: 'italic' }}>PICK {currentPick.pick}</div></div>
          </header>

          <div style={{ padding: '20px 20px 10px', background: s.surfaceLow }}>
            <input placeholder="SEARCH TERMINAL..." style={{ width: '100%', background: s.surfaceHigh, border: '1px solid rgba(255,255,255,0.1)', padding: '20px 30px', borderRadius: '20px', color: '#fff', fontSize: '16px', fontWeight: '800', marginBottom: '15px' }} onChange={(e) => setSearch(e.target.value)} />
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {["ALL", "QB", "RB", "WR", "TE", "OT", "iOL", "EDGE", "iDL", "LB", "DB"].map(pos => (
                <div key={pos} onClick={() => setFilterPos(pos)} className={`pos-tab ${filterPos === pos ? 'pos-tab-active' : ''}`}>{pos}</div>
              ))}
            </div>
          </div>

          <main style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 140px' }}>
            {filteredBoard.map(p => (
              <div key={p.id} onClick={() => setSelectedId(p.id)} style={{ position: 'relative', background: '#07090c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '30px', padding: '24px', marginBottom: '18px', overflow: 'hidden' }}>
                <img src={COLLEGE_LOGOS[p.school]} style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', height: '120px', opacity: 0.1, filter: 'grayscale(1)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}><span style={{ background: s.accent, color: '#fff', padding: '4px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '1000' }}>{p.pos}</span><span style={{ fontSize: '12px', opacity: 0.5, fontWeight: '900' }}>{p.school}</span></div>
                    <div style={{ fontSize: '30px', fontWeight: '1000', fontStyle: 'italic', letterSpacing: '-1.5px', lineHeight: 0.9, color: '#fff', textShadow: '0 2px 10px #000' }}>{p.name.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: '48px', fontWeight: '1000', color: s.terminal, lineHeight: 0.9 }}>{p.scout_value}</div><div style={{ fontSize: '11px', opacity: 0.4, fontWeight: '1000' }}>VALUE</div></div>
                </div>
              </div>
            ))}
          </main>
        </div>
      )}

      {selectedId !== null && selectedPlayer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(40px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }} onClick={() => setSelectedId(null)}>
          <div style={{ width: '100%', height: '92%', background: '#0b0e14', borderTopLeftRadius: '55px', borderTopRightRadius: '55px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '30px 0 20px', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '10px', margin: '0 auto 25px' }} />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>{[0,1,2].map(i => <div key={i} className={`dot ${activePane === i ? 'dot-active' : ''}`} />)}</div>
            </div>
            
            <div ref={swipeRef} className="swipe-container">
              <div className="swipe-pane">
                <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '45px' }}>
                  <div style={{ color: s.accent, fontWeight: '1000', fontSize: '16px', letterSpacing: '4px' }}>{selectedPlayer.school.toUpperCase()} <span style={{ opacity: 0.2 }}>//</span> RANK #{selectedPlayer.scout_rank}</div>
                  <h2 style={{ fontSize: '68px', fontWeight: '1000', fontStyle: 'italic', margin: 0, letterSpacing: '-4px', lineHeight: 0.8, color: '#fff' }}>{selectedPlayer.name.toUpperCase()}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '50px' }}>
                   <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}><div style={{ opacity: 0.4, fontSize: '13px', fontWeight: '1000' }}>MEASURABLES</div><div style={{ fontSize: '26px', fontWeight: '1000', marginTop: '8px' }}>{selectedPlayer.measurables?.height || '6\'4"'} / {selectedPlayer.measurables?.weight || '230'}</div></div>
                   <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}><div style={{ opacity: 0.4, fontSize: '13px', fontWeight: '1000' }}>NEURAL_FIT</div><div style={{ fontSize: '38px', fontWeight: '1000', color: s.terminal }}>94</div></div>
                </div>
                <h3 style={{ fontSize: '15px', color: s.accent, letterSpacing: '6px', marginBottom: '25px', fontWeight: '1000' }}>CORE_ABILITIES</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>{selectedPlayer.traits?.gold?.map(t => <TraitGem key={t} text={t} category="gold" size="xl" isDossier={true} />)}</div>
              </div>

              <div className="swipe-pane">
                <h3 style={{ fontSize: '15px', color: s.accent, letterSpacing: '6px', margin: '40px 0 25px', fontWeight: '1000' }}>TRAIT_SPECTRUM_ANALYSIS</h3>
                <RenderAllTraitsMobile player={selectedPlayer} />
              </div>

              <div className="swipe-pane">
                <h3 style={{ fontSize: '14px', color: s.accent, letterSpacing: '6px', margin: '40px 0 25px', fontWeight: '1000' }}>SCOUT_SYNTHESIS</h3>
                <p style={{ fontSize: '20px', lineHeight: 1.8, color: '#f1f5f9', fontWeight: '500', fontFamily: 'JetBrains Mono, monospace', background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>{selectedPlayer.summary || "Tactical evaluation data pending..."}</p>
              </div>
            </div>

            <div style={{ padding: '45px 35px', background: s.surfaceHigh, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
               <button onClick={() => { setDraftResults(prev => ({ ...prev, [currentPick.pick]: selectedPlayer })); setCurrentPickIndex(v => v + 1); setSelectedId(null); }}
                 style={{ width: '100%', padding: '35px', background: teamColor, borderRadius: '35px', color: teamSecColor, fontSize: '30px', fontWeight: '1000', border: 'none', fontStyle: 'italic', boxShadow: `0 0 120px ${teamColor}` }}>DRAFT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}