import React, { useState, useEffect } from 'react';

/* DATA IMPORTS */
import { BIG_BOARD } from './big_board_data';
import { GM_DATA } from './GM_data'; 
import { DRAFT_ORDER } from './draftorder100';
import { TEAM_COLORS } from './team_colors'; 
import { COLLEGE_LOGOS } from './college_data'; 
import { TEAM_WORDMARKS } from './wordmark_data';

const s = {
  surface: '#0a0c0f',         
  surfaceLow: '#111418',      
  surfaceHigh: '#1a1f24',     
  secondary: '#66dd8b',       
  textMain: '#dee3ea',        
  textDim: '#8d909e',         
  brightSapphire: '#3b82f6',
  terminalGreen: '#39ff14', 
  softTerminalGreen: '#3e9c5a',
  needCritical: '#ef4444', 
  needHigh: '#f97316',     
  needModerate: '#fbbf24', 
  needGood: '#10b981',
  fallingPurple: '#a855f7',
  qbCyan: '#22d3ee'      
};

/* -------------------------------------------------------------------------- */
/* THE HIGH-CHROME PILL COMPONENT                                             */
/* -------------------------------------------------------------------------- */

const TraitBadge = ({ text, colorCode, customColor = null, size = 'md' }) => {
  const palette = {
    gold: { border: '#fbbf24', shine: 'rgba(251, 191, 36, 0.45)', text: '#fde68a' }, 
    blue: { border: '#3b82f6', shine: 'rgba(59, 130, 246, 0.4)', text: '#fff' }, 
    green: { border: '#10b981', shine: 'rgba(16, 185, 129, 0.45)', text: '#6ee7b7' },
    red: { border: '#ef4444', shine: 'rgba(239, 68, 68, 0.45)', text: '#fca5a5' },
    purple: { border: '#a855f7', shine: 'rgba(168, 85, 247, 0.45)', text: '#d8b4fe' },
    cyan: { border: '#22d3ee', shine: 'rgba(34, 211, 238, 0.45)', text: '#fff' }
  };
  
  const c = customColor ? { border: customColor, shine: `${customColor}40`, text: '#fff' } : (palette[colorCode?.toLowerCase()] || palette.blue);

  return (
    <div style={{
      background: `linear-gradient(180deg, rgba(255,255,255,0.15) 0%, ${c.shine} 15%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)`,
      border: `1px solid ${c.border}`,
      color: c.text,
      padding: size === 'xl' ? '10px 18px' : size === 'sm' ? '5px 10px' : '8px 20px', 
      borderRadius: '50px', 
      fontFamily: 'Open Sans, sans-serif',
      fontSize: size === 'xl' ? '13px' : size === 'sm' ? '10px' : '12px', 
      fontWeight: '900', 
      textTransform: 'uppercase',
      letterSpacing: '1px', 
      boxShadow: `0 4px 15px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.3)`,
      textShadow: `0 1px 2px rgba(0,0,0,0.8)`,
      textAlign: 'center',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap'
    }}>
      {text}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN APP                                                                   */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [appState, setAppState] = useState('LANDING'); 
  const [userTeams, setUserTeams] = useState([]); 
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [draftResults, setDraftResults] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [jolt, setJolt] = useState(false);

  const currentPick = DRAFT_ORDER?.[currentPickIndex] || { teamKey: 'WAS', pick: 1 };
  const isUserOnClock = currentPick && userTeams.includes(currentPick.teamKey);
  const activeDraftTeam = currentPick?.teamKey || 'WAS';
  
  const teamPrimaryColor = TEAM_COLORS?.[activeDraftTeam]?.c || '#5A1414'; 
  const teamSecColor = TEAM_COLORS?.[activeDraftTeam]?.sc || '#FFB612';
  const teamLogo = TEAM_COLORS?.[activeDraftTeam]?.logo || '';
  const activeTeamData = GM_DATA?.[activeDraftTeam] || { n: 'Unknown', needs: {}, likes: [], outlook: 'Calibrating...', window: 'CHASING' };

  const getAffinityColor = (trait) => {
    const t = trait.toLowerCase();
    if (t.includes('speed') || t.includes('length') || t.includes('power') || t.includes('motor') || t.includes('physical') || t.includes('trench')) return 'red';
    if (t.includes('iq') || t.includes('character') || t.includes('leader') || t.includes('captain') || t.includes('smart') || t.includes('processing')) return 'gold';
    if (t.includes('grit') || t.includes('blue chip') || t.includes('heisman') || t.includes('raven') || t.includes('alpha')) return 'purple';
    if (t.includes('versat') || t.includes('ceiling') || t.includes('visit') || t.includes('developmental') || t.includes('special')) return 'cyan';
    return 'blue';
  };

  const calculateFit = (player, teamKey) => {
    if (!player || !teamKey) return 0;
    const teamData = GM_DATA?.[teamKey] || { needs: {}, likes: [] };
    const pKey = player.pos === 'IDL' ? 'DT' : player.pos;
    const needScore = teamData?.needs?.[pKey] || 0;
    const teamLikes = Array.isArray(teamData?.likes) ? teamData.likes : [];
    const affinityBonus = player.traits.filter(t => 
      teamLikes.some(like => like.toLowerCase() === t.l.toLowerCase())
    ).length * 12;
    return Math.min(99, Math.round((needScore * 0.4) + (player.grade * 0.3) + affinityBonus));
  };

  const handleDraft = (playerId) => {
    const player = BIG_BOARD.find(p => p.id === playerId);
    if (!player) return;
    setJolt(true);
    setTimeout(() => setJolt(false), 200);
    setDraftResults(prev => ({ ...prev, [currentPick.pick]: player }));
    setCurrentPickIndex(prev => prev + 1);
    setSelectedId(null);
  };

  const handleSelectAll = () => {
    const allKeys = Object.keys(GM_DATA);
    setUserTeams(userTeams.length === allKeys.length ? [] : allKeys);
  };

  const getNeedColor = (val) => {
    if (val >= 90) return s.needCritical; 
    if (val >= 75) return s.needHigh;
    if (val >= 60) return s.needModerate;
    return s.needGood; 
  }

  const getWindowColor = (win) => {
    switch(win) {
        case 'CONTENDER': return 'gold';
        case 'CHASING': return 'blue';
        case 'REBUILDING': return 'green';
        case 'FALLING': return 'purple';
        case 'QB WINDOW': return 'cyan';
        default: return 'blue';
    }
  }

  useEffect(() => {
    if (isSimulating && currentPick && !isUserOnClock) {
      const timer = setTimeout(() => {
        const available = BIG_BOARD.filter(p => !Object.values(draftResults).some(dr => dr.id === p.id));
        if (available[0]) handleDraft(available[0].id);
      }, 700);
      return () => clearTimeout(timer);
    } else if (isUserOnClock) { setIsSimulating(false); }
  }, [currentPickIndex, isSimulating, isUserOnClock]);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: s.surface, color: '#fff', fontFamily: 'Lexend, sans-serif', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@700&display=swap');
        html, body, #root { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: #0a0c0f; position: fixed; left: 0; top: 0; }
        * { box-sizing: border-box; }
        @keyframes scoreGlowPulse { 0%, 100% { text-shadow: 0 0 12px var(--p-glow); opacity: 0.7; } 50% { text-shadow: 0 0 28px var(--p-glow); opacity: 1; } }
        @keyframes auraBreath { 0%, 100% { opacity: 0.4; filter: blur(12px); } 50% { opacity: 0.9; filter: blur(25px); } }
        @keyframes joltSlam { 0% { transform: scale(1); } 10% { transform: scale(0.98); filter: brightness(1.1); } 100% { transform: scale(1); } }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 30px ${s.brightSapphire}40; border-color: ${s.brightSapphire}80; } 50% { box-shadow: 0 0 60px ${s.brightSapphire}80; border-color: #fff; } }
        @keyframes ultraPulse { 0%, 100% { box-shadow: 0 0 20px var(--team-color-40); border-color: var(--team-color); } 50% { box-shadow: 0 0 60px var(--team-color-80); border-color: #fff; } }
        @keyframes slideInfo { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .jolt-active { animation: joltSlam 0.2s ease-out; }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>

      {/* LANDING VIEW */}
      {appState === 'LANDING' && (
        <div style={{ height: '100vh', width: '100vw', padding: '60px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
            <div>
              <span style={{ color: s.brightSapphire, fontWeight: '900', letterSpacing: '10px', fontSize: '14px' }}>TACTICAL INTERFACE v2.9</span>
              <h1 style={{ fontSize: '110px', fontWeight: '950', fontStyle: 'italic', color: '#fff', letterSpacing: '-6px', margin: 0, lineHeight: 0.8 }}>WAR ROOM</h1>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={handleSelectAll} style={{ 
                    background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '15px 40px', borderRadius: '15px', 
                    fontWeight: '1000', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                    animation: 'glowPulse 4s infinite'
                }}>
                  {userTeams.length === Object.keys(GM_DATA).length ? 'DESELECT ALL' : 'SELECT ALL TEAMS'}
                </button>
                <button onClick={() => setAppState('DRAFTING')} style={{ 
                    background: s.brightSapphire, color: '#fff', padding: '25px 80px', borderRadius: '20px', 
                    fontWeight: '1000', border: 'none', cursor: 'pointer', fontSize: '28px', fontStyle: 'italic', 
                    boxShadow: `0 0 60px ${s.brightSapphire}60` 
                }}>INITIATE</button>
            </div>
          </header>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', paddingBottom: '100px' }}>
            {Object.keys(GM_DATA).sort().map(key => {
              const isSelected = userTeams.includes(key);
              const teamC = TEAM_COLORS[key]?.c || '#555';
              return (
                <div key={key} onClick={() => setUserTeams(prev => isSelected ? prev.filter(k => k !== key) : [...prev, key])} style={{ 
                    background: isSelected ? `${teamC}35` : s.surfaceLow, 
                    padding: '35px', borderRadius: '35px', 
                    border: `4px solid ${isSelected ? teamC : 'transparent'}`, 
                    textAlign: 'center', cursor: 'pointer', transition: '0.3s',
                    animation: isSelected ? 'ultraPulse 2s infinite' : 'none',
                    '--team-color': teamC,
                    '--team-color-40': `${teamC}40`,
                    '--team-color-80': `${teamC}80`
                }}>
                  <img src={TEAM_COLORS[key]?.logo} style={{ height: '75px', opacity: isSelected ? 1 : 0.2 }} alt="" />
                  <div style={{ fontWeight: '1000', marginTop: '10px', textTransform: 'uppercase' }}>{GM_DATA[key]?.n}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DRAFTING VIEW */}
      {appState === 'DRAFTING' && (
        <div className={jolt ? "jolt-active" : ""} style={{ display: 'grid', gridTemplateColumns: '240px 1fr 340px', height: '100vh', width: '100vw' }}>
          
          {/* ZONE 1: EXPANDED TICKER RAIL (240px) */}
          <aside style={{ background: s.surfaceLow, borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto' }}>
            {DRAFT_ORDER.map((p, i) => {
              const draftedPlayer = draftResults[p.pick];
              const isActive = i === currentPickIndex;
              const teamCol = TEAM_COLORS?.[p.teamKey]?.c || '#555';
              return (
                <div key={i} style={{ 
                  height: '95px', display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative', 
                  borderRight: isActive ? `6px solid ${teamCol}` : 'none', 
                  background: isActive ? `${teamCol}15` : 'transparent', 
                  opacity: i < currentPickIndex ? 0.4 : 1 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-5px', top: '-10px', fontSize: '18px', fontWeight: '1000', color: 'rgba(255,255,255,0.1)' }}>{p.pick}</span>
                      <img src={TEAM_COLORS?.[p.teamKey]?.logo} style={{ height: '45px', zIndex: 1 }} alt="" />
                    </div>
                    {draftedPlayer ? (
                      <div style={{ display: 'flex', flexDirection: 'column', animation: 'slideInfo 0.4s ease-out forwards' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: s.brightSapphire }}>{draftedPlayer.pos}</span>
                        <span style={{ fontSize: '13px', fontWeight: '1000', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{draftedPlayer.name.toUpperCase()}</span>
                      </div>
                    ) : isActive ? (
                      <div style={{ fontSize: '12px', fontWeight: '1000', color: teamCol, letterSpacing: '1px', animation: 'auraBreath 2s infinite' }}>ON THE CLOCK</div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </aside>

          {/* ZONE 2: BIG BOARD (1fr) */}
          <main style={{ overflowY: 'auto', padding: '40px 30px', background: s.surface }}>
             <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '70px', fontWeight: '950', fontStyle: 'italic', letterSpacing: '-4px' }}>BOARD</h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <input placeholder="SEARCH..." style={{ background: s.surfaceLow, border: 'none', padding: '15px 25px', borderRadius: '15px', color: '#fff', width: '300px', fontWeight: '800' }} onChange={(e) => setSearch(e.target.value)} />
                  {!isUserOnClock && (
                    <button onClick={() => setIsSimulating(!isSimulating)} style={{ background: isSimulating ? teamSecColor : s.secondary, color: '#000', padding: '0 30px', borderRadius: '15px', fontWeight: '1000', border: 'none', cursor: 'pointer' }}>
                      {isSimulating ? 'PAUSE' : 'SIM'}
                    </button>
                  )}
                </div>
             </header>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {BIG_BOARD.filter(p => !Object.values(draftResults).some(dp => dp.id === p.id) && p.name.toLowerCase().includes(search.toLowerCase())).map((player) => {
                const isSelected = selectedId === player.id;
                const cLogo = COLLEGE_LOGOS[player.school];
                const [firstName, ...lastNameParts] = player.name.split(' ');
                const lastName = lastNameParts.join(' ');
                
                return (
                  <div key={player.id} onClick={() => setSelectedId(isSelected ? null : player.id)} style={{ 
                    background: s.surfaceLow, borderRadius: '25px', display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 180px', 
                    border: isSelected ? `5px solid ${teamSecColor}` : '1px solid rgba(255,255,255,0.05)', 
                    position: 'relative', cursor: 'pointer', overflow: 'hidden',
                    boxShadow: isSelected ? `0 0 80px ${teamPrimaryColor}40, 0 0 30px ${teamPrimaryColor}30` : 'none',
                    transition: '0.3s'
                  }}>
                    
                    <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                      <div style={{ fontSize: '50px', fontWeight: '1000', color: s.brightSapphire, fontStyle: 'italic', position: 'absolute', left: '20px', top: '10px', opacity: 0.85 }}>{player.pos}</div>
                      {cLogo && <img src={cLogo} style={{ position: 'absolute', right: '230px', top: '50%', transform: 'translateY(-50%)', height: '180px', opacity: 0.20, filter: 'grayscale(100%) invert(1)', pointerEvents: 'none' }} alt="" />}
                      {isSelected && <img src={teamLogo} style={{ position: 'absolute', right: '230px', top: '50%', transform: 'translateY(-50%) scale(1.1)', height: '180px', opacity: 0.35, pointerEvents: 'none', filter: `drop-shadow(0 0 25px ${teamPrimaryColor})` }} alt="" />}
                      
                      <div style={{ position: 'relative', zIndex: 2, marginTop: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '1000', color: s.softTerminalGreen, textTransform: 'uppercase', letterSpacing: '2px' }}>{player.school}</span>
                          {cLogo && <img src={cLogo} style={{ height: '30px', filter: 'brightness(1.5)' }} alt="" />}
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '-10px', marginTop: '10px' }}>{firstName}</div>
                        <h2 style={{ fontSize: '100px', fontWeight: '1000', textTransform: 'uppercase', fontStyle: 'italic', color: '#fff', letterSpacing: '-6px', margin: 0, lineHeight: 0.8 }}>{lastName}</h2>
                      </div>
                    </div>

                    <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', zIndex: 2 }}>
                        {player.traits.map(t => (<TraitBadge key={t.l} text={t.l} colorCode={t.c} />))}
                    </div>

                    <div style={{ background: 'transparent', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', '--p-glow': s.brightSapphire, animation: isSelected ? 'scoreGlowPulse 2s infinite' : 'none' }}>
                        <span style={{ fontSize: '10px', color: s.textDim, fontWeight: '1000' }}>TALENT</span>
                        <span style={{ fontSize: '36px', fontWeight: '1000', color: s.brightSapphire, textShadow: `0 0 10px ${s.brightSapphire}80` }}>{Math.round(player.grade)}</span>
                      </div>
                      <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '--p-glow': s.terminalGreen, animation: isSelected ? 'scoreGlowPulse 2s infinite' : 'none' }}>
                        <span style={{ fontSize: '10px', color: s.textDim, fontWeight: '1000' }}>NEURAL FIT</span>
                        <span style={{ fontSize: '58px', fontWeight: '1000', color: s.terminalGreen, textShadow: `0 0 15px ${s.terminalGreen}80` }}>{calculateFit(player, activeDraftTeam)}</span>
                      </div>
                    </div>

                    {/* MECHANICAL LOCK: DRAFT PROSPECT OVERLAY */}
                    {isSelected && isUserOnClock && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                         <button onClick={(e) => { e.stopPropagation(); handleDraft(player.id); }} style={{ 
                             background: `linear-gradient(135deg, ${teamPrimaryColor} 0%, #000 100%)`, 
                             color: '#fff', padding: '20px 80px', borderRadius: '15px', fontWeight: '1000', 
                             border: `3px solid ${teamSecColor}`, cursor: 'pointer', fontSize: '26px', 
                             fontStyle: 'italic', boxShadow: `0 0 60px ${teamPrimaryColor}`, letterSpacing: '2px' 
                         }}>DRAFT PROSPECT</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>

          {/* ZONE 3: SLIMMED COMMAND DOSSIER (340px) */}
          <aside style={{ 
            background: s.surfaceLow, borderLeft: '1px solid rgba(255,255,255,0.08)', padding: '25px', overflow: 'hidden', 
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                 <div style={{ position: 'absolute', inset: -20, background: teamPrimaryColor, filter: 'blur(40px)', opacity: 0.3 }} />
                 <img src={teamLogo} style={{ height: '110px', position: 'relative', filter: `drop-shadow(0 0 20px ${teamPrimaryColor}60)` }} alt="" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '1000', fontStyle: 'italic', marginTop: '15px', textTransform: 'uppercase', letterSpacing: '-1px' }}>{activeTeamData?.n}</h2>
              <div style={{ color: teamSecColor, fontWeight: '1000', letterSpacing: '4px', fontSize: '10px' }}>COMMAND DOSSIER</div>
            </div>

            {/* STRATEGY TICKER - SLIM TERMINAL */}
            <div style={{ margin: '15px 0', textAlign: 'center' }}>
               <div style={{ fontSize: '12px', color: s.textDim, fontWeight: '1000', marginBottom: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>Strategic Outlook</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                    <TraitBadge text={activeTeamData.window} colorCode={getWindowColor(activeTeamData.window)} size="xl" />
                    <div style={{ 
                        background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', 
                        padding: '18px', borderRadius: '12px', width: '100%', position: 'relative', boxShadow: 'inset 0 0 20px #000'
                    }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,255,255,0.01) 50%, transparent 50%)', backgroundSize: '100% 4px' }} />
                        <div style={{ fontSize: '13px', color: s.textMain, lineHeight: 1.5, fontWeight: '600', position: 'relative' }}>{activeTeamData.outlook}</div>
                    </div>
               </div>
            </div>

            {/* SLIM SEVERITY TICKERS (2x3 GRID) */}
            <div>
               <div style={{ fontSize: '10px', color: s.textDim, fontWeight: '1000', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Top Requirements</div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {activeTeamData?.needs && Object.entries(activeTeamData.needs).sort((a,b) => b[1]-a[1]).slice(0, 6).map(([pos, val]) => {
                    const col = getNeedColor(val);
                    return (
                        <div key={pos} style={{ fontSize: '22px', fontWeight: '1000', color: col, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            {pos}<span style={{ fontSize: '11px', opacity: 0.4, color: '#fff' }}>{val}</span>
                        </div>
                    );
                  })}
               </div>
            </div>

            {/* SLIM METALLIC AFFINITIES (DNA CODED) */}
            <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '10px', color: s.textDim, fontWeight: '1000', marginBottom: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Strategic Affinities</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {Array.isArray(activeTeamData?.likes) && activeTeamData.likes.slice(0,8).map((trait, i) => (
                        <TraitBadge key={i} text={trait} colorCode={getAffinityColor(trait)} size="sm" />
                    ))}
                </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}