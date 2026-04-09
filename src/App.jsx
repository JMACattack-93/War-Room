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
      background: `linear-gradient(180deg, rgba(255,255,255,0.1) 0%, ${c.shine} 15%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.9) 100%)`,
      border: `1px solid ${c.border}`,
      color: c.text,
      padding: size === 'xl' ? '10px 18px' : size === 'sm' ? '5px 10px' : '8px 20px', 
      borderRadius: '50px', 
      fontFamily: 'Open Sans, sans-serif',
      fontSize: size === 'xl' ? '13px' : size === 'sm' ? '10px' : '12px', 
      fontWeight: '900', 
      textTransform: 'uppercase',
      letterSpacing: '1px', 
      boxShadow: `0 4px 15px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.2)`,
      textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap'
    }}>
      {text}
    </div>
  );
};

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

  const calculateFit = (player, teamKey) => {
    if (!player || !teamKey) return { score: 0, reasons: [] };
    const teamData = GM_DATA?.[teamKey] || { needs: {}, likes: [] };
    const pKey = player.pos === 'IDL' ? 'DT' : player.pos;
    const needScore = teamData?.needs?.[pKey] || 0;
    const teamLikes = Array.isArray(teamData?.likes) ? teamData.likes : [];
    const matchedTraits = player.traits.filter(t => teamLikes.some(like => like.toLowerCase() === t.l.toLowerCase()));
    const score = Math.min(99, Math.round((needScore * 0.4) + (player.grade * 0.3) + (matchedTraits.length * 12)));
    const reasons = [];
    if (needScore > 85) reasons.push("CRITICAL REQUIREMENT");
    if (player.grade > 88) reasons.push("ELITE GRADE");
    if (matchedTraits.length > 1) reasons.push("SCHEME SYNERGY");
    return { score, reasons };
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

  const getAffinityColor = (trait) => {
    const t = trait.toLowerCase();
    if (t.includes('speed') || t.includes('length') || t.includes('power') || t.includes('motor') || t.includes('physical')) return 'red';
    if (t.includes('iq') || t.includes('character') || t.includes('leader') || t.includes('captain')) return 'gold';
    if (t.includes('grit') || t.includes('blue chip') || t.includes('heisman')) return 'purple';
    return 'cyan';
  };

  useEffect(() => {
    if (isSimulating && currentPick && !isUserOnClock) {
      const timer = setTimeout(() => {
        const available = BIG_BOARD.filter(p => !Object.values(draftResults).some(dr => dr.id === p.id));
        if (available[0]) handleDraft(available[0].id);
      }, 700);
      return () => clearTimeout(timer);
    } else if (isUserOnClock) { setIsSimulating(false); }
  }, [currentPickIndex, isSimulating, isUserOnClock]);

  const selectedPlayer = BIG_BOARD.find(p => p.id === selectedId);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: s.surface, color: '#fff', fontFamily: 'Lexend, sans-serif', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap');
        html, body, #root { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: #0a0c0f; position: fixed; left: 0; top: 0; }
        * { box-sizing: border-box; scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { width: 0; height: 0; display: none; }
        @keyframes superAura { 
          0%, 100% { border-color: var(--p); box-shadow: 0 0 40px var(--p-40), 0 0 100px var(--p-20); } 
          50% { border-color: var(--s); box-shadow: 0 0 70px var(--s-60), 0 0 140px var(--s-40); } 
        }
        @keyframes scanPulse { 0% { box-shadow: 0 0 0 0px ${s.terminalGreen}40; } 100% { box-shadow: 0 0 0 40px ${s.terminalGreen}00; } }
        @keyframes modalSlam { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes ultraPulse { 0%, 100% { box-shadow: 0 0 20px var(--team-color-40); border-color: var(--team-color); } 50% { box-shadow: 0 0 60px var(--team-color-80); border-color: #fff; } }
        @keyframes slideInfo { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .jolt-active { animation: joltSlam 0.2s ease-out; }
      `}</style>

      {appState === 'LANDING' && (
        <div style={{ height: '100vh', width: '100vw', padding: '60px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
            <div>
              <span style={{ color: s.brightSapphire, fontWeight: '900', letterSpacing: '10px', fontSize: '14px' }}>TACTICAL INTERFACE v3.4</span>
              <h1 style={{ fontSize: '110px', fontWeight: '950', fontStyle: 'italic', color: '#fff', letterSpacing: '-6px', margin: 0, lineHeight: 0.8 }}>WAR ROOM</h1>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={handleSelectAll} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '15px 40px', borderRadius: '15px', fontWeight: '1000', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>{userTeams.length === Object.keys(GM_DATA).length ? 'DESELECT ALL' : 'SELECT ALL TEAMS'}</button>
                <button onClick={() => setAppState('DRAFTING')} style={{ background: s.brightSapphire, color: '#fff', padding: '25px 80px', borderRadius: '20px', fontWeight: '1000', border: 'none', cursor: 'pointer', fontSize: '28px', fontStyle: 'italic', boxShadow: `0 0 60px ${s.brightSapphire}60` }}>INITIATE</button>
            </div>
          </header>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', paddingBottom: '100px' }}>
            {Object.keys(GM_DATA).sort().map(key => {
              const isSelected = userTeams.includes(key);
              const teamC = TEAM_COLORS[key]?.c || '#555';
              return (
                <div key={key} onClick={() => setUserTeams(prev => isSelected ? prev.filter(k => k !== key) : [...prev, key])} style={{ background: isSelected ? `${teamC}35` : s.surfaceLow, padding: '35px', borderRadius: '35px', border: `4px solid ${isSelected ? teamC : 'transparent'}`, textAlign: 'center', cursor: 'pointer', animation: isSelected ? 'ultraPulse 2s infinite' : 'none', '--team-color': teamC, '--team-color-40': `${teamC}40`, '--team-color-80': `${teamC}80` }}>
                  <img src={TEAM_COLORS[key]?.logo} style={{ height: '75px', opacity: isSelected ? 1 : 0.2 }} alt="" />
                  <div style={{ fontWeight: '1000', marginTop: '10px', textTransform: 'uppercase' }}>{GM_DATA[key]?.n}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {appState === 'DRAFTING' && (
        <div className={jolt ? "jolt-active" : ""} style={{ display: 'grid', gridTemplateColumns: '240px 1fr 340px', height: '100vh', width: '100vw' }}>
          
          <aside style={{ background: s.surfaceLow, borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto' }}>
            {DRAFT_ORDER.map((p, i) => {
              const draftedPlayer = draftResults[p.pick];
              const isActive = i === currentPickIndex;
              const teamCol = TEAM_COLORS?.[p.teamKey]?.c || '#555';
              return (
                <div key={i} style={{ height: '95px', display: 'flex', alignItems: 'center', padding: '0 20px', borderRight: isActive ? `6px solid ${teamCol}` : 'none', background: isActive ? `${teamCol}15` : 'transparent', opacity: i < currentPickIndex ? 0.4 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-5px', top: '-10px', fontSize: '18px', fontWeight: '1000', color: 'rgba(255,255,255,0.1)' }}>{p.pick}</span>
                      <img src={TEAM_COLORS?.[p.teamKey]?.logo} style={{ height: '45px' }} alt="" />
                    </div>
                    {draftedPlayer && (
                      <div style={{ display: 'flex', flexDirection: 'column', animation: 'slideInfo 0.4s forwards' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: s.brightSapphire }}>{draftedPlayer.pos}</span>
                        <span style={{ fontSize: '13px', fontWeight: '1000', color: '#fff', whiteSpace: 'nowrap' }}>{draftedPlayer.name.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </aside>

          <main style={{ overflowY: 'auto', padding: '40px 30px', background: s.surface }}>
             <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '70px', fontWeight: '950', fontStyle: 'italic', letterSpacing: '-4px' }}>BOARD</h1>
                <input placeholder="SEARCH..." style={{ background: s.surfaceLow, border: 'none', padding: '15px 25px', borderRadius: '15px', color: '#fff', width: '300px', fontWeight: '800' }} onChange={(e) => setSearch(e.target.value)} />
             </header>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {BIG_BOARD.filter(p => !Object.values(draftResults).some(dp => dp.id === p.id) && p.name.toLowerCase().includes(search.toLowerCase())).map((player) => {
                const fit = calculateFit(player, activeDraftTeam);
                const [firstName, ...lastNameParts] = player.name.split(' ');
                const lastName = lastNameParts.join(' ');
                return (
                  <div key={player.id} onClick={() => setSelectedId(player.id)} style={{ background: s.surfaceLow, borderRadius: '25px', display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 180px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ padding: '30px', position: 'relative' }}>
                      <div style={{ fontSize: '50px', fontWeight: '1000', color: s.brightSapphire, fontStyle: 'italic', position: 'absolute', left: '20px', top: '10px', opacity: 0.85 }}>{player.pos}</div>
                      {/* SHIFTED LOGO TO RIGHT: 120px */}
                      <img src={COLLEGE_LOGOS[player.school]} style={{ position: 'absolute', right: '120px', height: '180px', opacity: 0.15, filter: 'grayscale(100%) invert(1)' }} alt="" />
                      <div style={{ position: 'relative', zIndex: 2, marginTop: '30px' }}>
                        <div style={{ fontSize: '20px', fontWeight: '1000', color: s.softTerminalGreen, textTransform: 'uppercase', letterSpacing: '2px' }}>{player.school}</div>
                        {/* RESTORED FIRST NAME */}
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '-10px', marginTop: '10px' }}>{firstName}</div>
                        <h2 style={{ fontSize: '100px', fontWeight: '1000', textTransform: 'uppercase', fontStyle: 'italic', color: '#fff', letterSpacing: '-6px', margin: 0, lineHeight: 0.8 }}>{lastName}</h2>
                      </div>
                    </div>
                    <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>{player.traits.map(t => (<TraitBadge key={t.l} text={t.l} colorCode={t.c} />))}</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                           <span style={{ fontSize: '10px', color: s.textDim, fontWeight: '1000' }}>TALENT</span>
                           <span style={{ fontSize: '32px', fontWeight: '1000', color: s.brightSapphire }}>{Math.round(player.grade)}</span>
                        </div>
                        <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '10px', color: s.textDim, fontWeight: '1000' }}>NEURAL FIT</span>
                            <span style={{ fontSize: '48px', fontWeight: '1000', color: s.terminalGreen }}>{fit.score}</span>
                        </div>
                    </div>
                  </div>
                );
              })}
             </div>
          </main>

          {/* SUPER-AURA DOSSIER MODAL v3.4 */}
          {selectedId && (
            <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(circle at center, ${teamPrimaryColor}60 0%, #05070a 100%)`, backdropFilter: 'blur(60px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }} onClick={() => setSelectedId(null)}>
              <div style={{ 
                  width: '100%', maxWidth: '1200px', background: 'linear-gradient(145deg, #1a1f24 0%, #0d1117 100%)', 
                  borderRadius: '30px', border: '5px solid transparent', 
                  animation: 'superAura 3s infinite ease-in-out, modalSlam 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  display: 'grid', gridTemplateColumns: '1fr 420px', overflow: 'hidden',
                  '--p': teamPrimaryColor, '--p-40': `${teamPrimaryColor}40`, '--p-20': `${teamPrimaryColor}20`,
                  '--s': teamSecColor, '--s-60': `${teamSecColor}60`, '--s-40': `${teamSecColor}40`
              }} onClick={(e) => e.stopPropagation()}>
                
                <div style={{ padding: '40px 60px', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                    <img src={COLLEGE_LOGOS[selectedPlayer.school]} style={{ position: 'absolute', top: '50%', left: '40%', transform: 'translate(-50%, -50%)', height: '600px', opacity: 0.04, filter: 'grayscale(100%) brightness(3)', pointerEvents: 'none' }} alt="" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '30px', position: 'relative', zIndex: 2 }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 0 40px ${teamPrimaryColor}40` }}>
                            <img src={COLLEGE_LOGOS[selectedPlayer.school]} style={{ height: '90px' }} alt="" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '5px' }}>
                              <span style={{ background: s.softTerminalGreen, color: '#000', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '1000' }}>{selectedPlayer.school.toUpperCase()}</span>
                              <span style={{ color: teamSecColor, fontSize: '11px', fontWeight: '800', fontFamily: 'JetBrains Mono' }}>ACCESS_ID: BB_0{selectedPlayer.id}</span>
                            </div>
                            <h2 style={{ fontSize: '100px', fontWeight: '1000', fontStyle: 'italic', margin: 0, lineHeight: 0.75, letterSpacing: '-6px', color: '#fff' }}>{selectedPlayer.name.toUpperCase()}</h2>
                            <div style={{ fontSize: '22px', fontWeight: '900', color: s.brightSapphire, marginTop: '10px' }}>{selectedPlayer.pos} <span style={{ opacity: 0.2 }}>/</span> #64 BIG BOARD</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '10px', color: s.textDim, fontWeight: '1000', marginBottom: '10px', letterSpacing: '4px' }}>NFL_COMP_MATRIX</div>
                                <div style={{ borderLeft: `8px solid ${teamPrimaryColor}`, paddingLeft: '20px', fontSize: '34px', fontWeight: '1000', fontStyle: 'italic', color: '#fff' }}>
                                    {selectedPlayer.pos === 'WR' ? 'AJ BROWN' : selectedPlayer.pos === 'OT' ? 'TRENT WILLIAMS' : 'NICK BOSA'}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 2px 20px #000' }}>
                                <div style={{ fontSize: '10px', color: s.softTerminalGreen, fontWeight: '1000', marginBottom: '12px', letterSpacing: '3px' }}>PHYSICAL_READOUT</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontFamily: 'JetBrains Mono' }}>
                                    <div><div style={{ fontSize: '10px', opacity: 0.4 }}>HT/WT</div><div style={{ fontSize: '22px', fontWeight: '900' }}>6'4 / 315</div></div>
                                    <div><div style={{ fontSize: '10px', opacity: 0.4 }}>ARMS/HND</div><div style={{ fontSize: '22px', fontWeight: '900' }}>34" / 10"</div></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '10px', color: s.textDim, fontWeight: '1000', marginBottom: '15px', letterSpacing: '4px' }}>TRAIT_EVALUATION</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{selectedPlayer.traits.map(t => <TraitBadge key={t.l} text={t.l} colorCode={t.c} size="xl" />)}</div>
                        </div>
                    </div>
                    {isUserOnClock && (
                        <button onClick={() => handleDraft(selectedPlayer.id)} style={{ width: '100%', marginTop: '40px', background: `linear-gradient(135deg, ${teamPrimaryColor} 0%, ${teamSecColor} 100%)`, padding: '28px', borderRadius: '20px', border: 'none', color: '#000', fontSize: '26px', fontWeight: '1000', fontStyle: 'italic', cursor: 'pointer', letterSpacing: '4px', boxShadow: `0 15px 50px ${teamPrimaryColor}60` }}>CONFIRM DRAFT PICK</button>
                    )}
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', animation: 'scanPulse 3s infinite' }} />
                    <img src={teamLogo} style={{ height: '150px', marginBottom: '30px', filter: `drop-shadow(0 0 30px ${teamPrimaryColor}60)`, position: 'relative' }} alt="" />
                    <div style={{ fontSize: '12px', color: teamSecColor, fontWeight: '1000', letterSpacing: '10px', marginBottom: '10px' }}>NEURAL_FIT</div>
                    <div style={{ fontSize: '180px', fontWeight: '1000', color: s.terminalGreen, lineHeight: 0.8 }}>{calculateFit(selectedPlayer, activeDraftTeam).score}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px', width: '100%' }}>
                        {calculateFit(selectedPlayer, activeDraftTeam).reasons.map(r => (
                            <div key={r} style={{ background: 'rgba(57, 255, 20, 0.05)', border: `1px solid ${s.terminalGreen}20`, padding: '12px', borderRadius: '10px', color: s.terminalGreen, fontSize: '13px', fontWeight: '900', textAlign: 'center' }}>SCAN: {r}</div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          )}

          <aside style={{ background: s.surfaceLow, borderLeft: '1px solid rgba(255,255,255,0.08)', padding: '25px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
                 <img src={teamLogo} style={{ height: '110px' }} alt="" />
              <h2 style={{ fontSize: '24px', fontWeight: '1000', fontStyle: 'italic', marginTop: '15px', textTransform: 'uppercase' }}>{activeTeamData?.n}</h2>
              <div style={{ color: teamSecColor, fontWeight: '1000', letterSpacing: '4px', fontSize: '10px' }}>COMMAND DOSSIER</div>
            </div>
            <div style={{ margin: '15px 0', textAlign: 'center' }}>
               <TraitBadge text={activeTeamData.window} colorCode={getWindowColor(activeTeamData.window)} size="xl" />
               <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '18px', borderRadius: '12px', marginTop: '15px' }}>
                   <div style={{ fontSize: '13px', color: s.textMain, lineHeight: 1.5, fontWeight: '600' }}>{activeTeamData.outlook}</div>
               </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {activeTeamData?.needs && Object.entries(activeTeamData.needs).sort((a,b) => b[1]-a[1]).slice(0, 6).map(([pos, val]) => (
                        <div key={pos} style={{ fontSize: '22px', fontWeight: '1000', color: getNeedColor(val) }}>{pos}<span style={{ fontSize: '11px', opacity: 0.4, color: '#fff' }}> {val}</span></div>
                  ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                {Array.isArray(activeTeamData?.likes) && activeTeamData.likes.slice(0,8).map((trait, i) => (
                    <TraitBadge key={i} text={trait} colorCode={getAffinityColor(trait)} size="sm" />
                ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}