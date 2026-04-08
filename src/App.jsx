import React, { useState, useEffect } from 'react';

/* DATA IMPORTS */
import { BIG_BOARD } from './big_board_data';
import { TEAMS } from './team_data';
import { DRAFT_ORDER } from './draftorder100';
import { TEAM_COLORS } from './team_colors'; 
import { COLLEGE_LOGOS } from './college_data'; 
import { TEAM_WORDMARKS } from './wordmark_data';

const s = {
  surface: '#0f1419',         
  surfaceLow: '#171c21',      
  surfaceHigh: '#1e242b',     
  secondary: '#66dd8b',       
  textMain: '#dee3ea',        
  textDim: '#8d909e',         
  brightSapphire: '#3b82f6'   
};

const DraftCard = ({ player, fitScore, rank, isSelected, onSelect, isDrafted, onDraft, teamColor, teamSecColor, teamLogo }) => {
  const getMetallicStyle = (colorCode) => {
    const palette = {
      gold: { border: '#fbbf24', shine: `${teamColor}40`, text: '#fde68a' }, 
      red: { border: '#ef4444', shine: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5' },
      purple: { border: '#a855f7', shine: 'rgba(168, 85, 247, 0.2)', text: '#d8b4fe' },
      blue: { border: `${teamColor}`, shine: `${teamSecColor}30`, text: '#fff' }, 
      green: { border: '#10b981', shine: 'rgba(16, 185, 129, 0.2)', text: '#6ee7b7' }
    };
    const c = palette[colorCode] || palette.blue;
    return {
      background: `linear-gradient(145deg, ${c.shine} 0%, rgba(0,0,0,0.5) 45%, rgba(255,255,255,0.05) 100%)`,
      border: `1px solid ${c.border}80`,
      boxShadow: `0 4px 15px rgba(0,0,0,0.4), inset 0 0 10px ${c.shine}`,
      color: c.text,
      textShadow: `0 0 8px ${c.border}80`,
      padding: '12px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '950',
      textTransform: 'uppercase',
      fontStyle: 'italic',
      letterSpacing: '1px',
      textAlign: 'center'
    };
  };

  const [firstName, ...lastNameParts] = player.name.split(' ');
  const lastName = lastNameParts.join(' ');
  const collegeLogo = COLLEGE_LOGOS[player.school] || '';

  return (
    <div 
      onClick={() => !isDrafted && onSelect(player.id)}
      style={{ 
        background: s.surfaceLow, 
        minHeight: '340px', 
        width: '100%',
        borderRadius: '44px',
        display: 'grid',
        gridTemplateColumns: '1.6fr 1.1fr 220px',
        alignItems: 'stretch',
        overflow: 'hidden',
        fontFamily: 'Lexend, sans-serif',
        boxShadow: isSelected ? `0 0 40px ${teamColor}, 0 0 120px ${teamColor}40, inset 0 0 30px ${teamColor}50` : '0 30px 80px rgba(0,0,0,0.5)',
        margin: '0 0 24px 0',
        border: isSelected ? `5px solid ${teamSecColor}` : '1px solid rgba(255,255,255,0.03)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        transform: isSelected ? 'scale(1.01) translateY(-5px)' : 'scale(1)',
        opacity: isDrafted ? 0.1 : 1,
        zIndex: isSelected ? 50 : 1
      }}>
      
      {isSelected && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={(e) => { e.stopPropagation(); onDraft(player.id); }} style={{ background: `linear-gradient(135deg, #fff 0%, ${teamColor} 25%, #001945 100%)`, color: '#fff', padding: '28px 72px', borderRadius: '24px', fontSize: '34px', fontWeight: '1000', textTransform: 'uppercase', fontStyle: 'italic', border: `4px solid #fff`, boxShadow: `0 0 60px ${teamColor}`, cursor: 'pointer', letterSpacing: '4px' }}>SELECT PROSPECT</button>
        </div>
      )}

      <div style={{ padding: '40px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <img src={teamLogo} alt="" style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', height: '280px', opacity: isSelected ? 0.35 : 0, filter: isSelected ? 'grayscale(0%) brightness(1.2)' : 'grayscale(100%)', transition: 'all 0.4s ease', pointerEvents: 'none', zIndex: 1 }} />
        <img 
            src={collegeLogo} 
            alt="" 
            style={{ 
                position: 'absolute', 
                right: '12%', 
                top: '50%', 
                transform: `translateY(-50%) scale(${player.school === 'Arkansas' ? 1.6 : 1})`, 
                height: '260px', 
                opacity: isSelected ? 0.08 : 0.30, 
                filter: 'grayscale(100%) brightness(1.7) contrast(1.4)', 
                transition: 'all 0.4s ease', 
                pointerEvents: 'none', 
                zIndex: 1 
            }} 
        />
        <div style={{ position: 'absolute', left: '-10px', top: '0', fontSize: '240px', fontWeight: '950', color: isSelected ? `${teamSecColor}15` : 'rgba(255,255,255,0.02)', fontStyle: 'italic', lineHeight: '0.8', pointerEvents: 'none', zIndex: 2 }}>#{rank}</div>
        <div style={{ position: 'relative', zIndex: '10' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: isSelected ? teamSecColor : s.textDim, textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '-5px' }}>{firstName}</div>
          <h2 style={{ fontSize: '92px', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-4px', lineHeight: '0.8', margin: '0 0 24px 0', color: '#fff', whiteSpace: 'nowrap' }}>{lastName}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ background: isSelected ? teamColor : s.brightSapphire, color: '#fff', padding: '10px 24px', borderRadius: '14px', fontSize: '28px', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', border: isSelected ? `2px solid ${teamSecColor}` : 'none' }}>{player.pos}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '32px', fontWeight: '800', color: s.textDim, textTransform: 'uppercase', fontStyle: 'italic' }}>/ {player.school}</span>
                {collegeLogo && <img src={collegeLogo} style={{ height: '55px', opacity: 0.98, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,1)) brightness(1.4)' }} alt="" />}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.03)', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isSelected ? teamSecColor : s.brightSapphire} strokeWidth="4"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={isSelected ? teamSecColor : s.brightSapphire}/></svg>
          <span style={{ fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', color: isSelected ? teamSecColor : s.textDim, letterSpacing: '8px' }}>NEURAL MATRIX</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {player.traits.map(t => (<div key={t.l} style={getMetallicStyle(t.c)}>{t.l}</div>))}
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <span style={{ color: s.textDim, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px', opacity: 0.4 }}>TALENT</span>
          <span style={{ color: isSelected ? teamSecColor : s.brightSapphire, fontSize: '85px', fontWeight: '950', fontStyle: 'italic', lineHeight: '1' }}>{Math.round(player.grade)}</span>
        </div>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ color: s.secondary, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px' }}>FIT</span>
          <span style={{ color: s.secondary, fontSize: '85px', fontWeight: '950', fontStyle: 'italic', lineHeight: '1' }}>{Math.round(fitScore)}</span>
        </div>
      </div>
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

  const currentPick = DRAFT_ORDER[currentPickIndex];
  const isUserOnClock = currentPick && userTeams.includes(currentPick.teamKey);
  const activeDraftTeam = currentPick ? currentPick.teamKey : (userTeams[0] || 'WAS');
  const activeFitTeam = isUserOnClock ? currentPick.teamKey : (userTeams[0] || 'WAS');
  const teamPrimaryColor = TEAM_COLORS[activeDraftTeam]?.c || '#5A1414'; 
  const teamSecColor = TEAM_COLORS[activeDraftTeam]?.sc || '#FFB612';
  const teamLogo = TEAM_COLORS[activeDraftTeam]?.logo || '';

  const calculateFit = (player, teamKey) => {
    const teamData = TEAMS[teamKey] || TEAMS.WAS;
    const pKey = player.pos === 'IDL' ? 'DT' : player.pos;
    const needScore = teamData.needs[pKey] || 0;
    const teamLikes = teamData.likes[pKey] || [];
    const traitMatches = player.traits.filter(t => teamLikes.some(l => l.toLowerCase() === t.l.toLowerCase()));
    return Math.min(99, Math.round((needScore * 0.4) + (player.grade * 0.3) + (traitMatches.length * 10)));
  };

  const handleDraft = (playerId) => {
    const player = BIG_BOARD.find(p => p.id === playerId);
    if (!player) return;
    setDraftResults(prev => ({ ...prev, [currentPick.pick]: player }));
    setCurrentPickIndex(prev => prev + 1);
    setSelectedId(null);
  };

  const toggleTeamSelection = (teamKey) => {
    setUserTeams(prev => prev.includes(teamKey) ? prev.filter(k => k !== teamKey) : [...prev, teamKey]);
  };

  const handleSelectAll = () => {
    const allKeys = Object.keys(TEAMS);
    setUserTeams(userTeams.length === allKeys.length ? [] : allKeys);
  };

  useEffect(() => {
    if (isSimulating && currentPick && !isUserOnClock) {
      const timer = setTimeout(() => {
        const available = BIG_BOARD.filter(p => !Object.values(draftResults).some(dr => dr.id === p.id));
        handleDraft(available[0].id);
      }, 500);
      return () => clearTimeout(timer);
    } else if (isUserOnClock) { setIsSimulating(false); }
  }, [currentPickIndex, isSimulating, isUserOnClock]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: s.surface, margin: 0, padding: 0 }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: ${s.surface}; overflow: hidden; display: block !important; }
        #root { margin: 0; padding: 0; display: block !important; width: 100vw; height: 100vh; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      {appState === 'LANDING' && (
        <div style={{ height: '100vh', width: '100vw', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <header style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '60px' }}>
            <div>
              <span style={{ color: s.brightSapphire, fontWeight: '950', letterSpacing: '15px', textTransform: 'uppercase', fontSize: '14px' }}>Strategic Assets Command</span>
              <h1 style={{ fontSize: '110px', fontWeight: '950', fontStyle: 'italic', color: '#fff', letterSpacing: '-6px', margin: '5px 0 0 0', lineHeight: '0.8' }}>WAR ROOM</h1>
            </div>
            <button onClick={handleSelectAll} style={{ background: 'rgba(255,255,255,0.03)', border: `2px solid ${s.textDim}`, color: '#fff', padding: '20px 50px', borderRadius: '24px', fontWeight: '950', textTransform: 'uppercase', cursor: 'pointer', fontSize: '16px' }}>
              {userTeams.length === Object.keys(TEAMS).length ? 'Deselect All' : 'Select All Teams'}
            </button>
          </header>
          
          <div style={{ flex: '1', width: '100%', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gridAutoRows: '220px', gap: '24px', paddingBottom: '150px' }}>
            {Object.keys(TEAMS).sort().map(key => {
              const teamColor = TEAM_COLORS[key]?.c || s.surface;
              const isSelected = userTeams.includes(key);
              const wordmark = TEAM_WORDMARKS[key];
              
              return (
                <div key={key} onClick={() => toggleTeamSelection(key)} style={{
                  background: isSelected ? `${teamColor}40` : 'rgba(0,0,0,0.6)',
                  border: `3px solid ${isSelected ? teamColor : 'rgba(255,255,255,0.08)'}`,
                  padding: '35px', borderRadius: '35px', cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: isSelected ? `0 0 60px ${teamColor}60` : 'none', position: 'relative', overflow: 'hidden',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                }}>
                  <img src={TEAM_COLORS[key].logo} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', height: '110px', opacity: isSelected ? 1 : 0.15, filter: isSelected ? 'none' : 'grayscale(100%)', transition: 'all 0.4s ease' }} />
                  <div style={{ height: '10px', width: '40px', background: teamColor, borderRadius: '5px', marginBottom: '15px', position: 'relative', zIndex: 2 }} />
                  
                  {/* WORDMARK - ALWAYS FORCED TO WHITE/SILVER */}
                  <div style={{ height: '32px', marginBottom: '10px', position: 'relative', zIndex: 2 }}>
                    <img 
                        src={wordmark} 
                        alt={key} 
                        style={{ 
                            height: '100%', 
                            // Fixed: Grayscale and Invert are ALWAYS applied, opacity handles selection
                            filter: 'grayscale(1) brightness(2.5) invert(1)', 
                            opacity: isSelected ? 1 : 0.35 
                        }} 
                    />
                  </div>
                  
                  <div style={{ fontSize: '28px', fontWeight: '950', color: isSelected ? '#fff' : s.textDim, fontStyle: 'italic', position: 'relative', zIndex: 2 }}>{TEAMS[key].n}</div>
                </div>
              );
            })}
          </div>

          <footer style={{ position: 'fixed', bottom: 0, left: 0, width: '100vw', background: 'rgba(15,20,25,0.98)', backdropFilter: 'blur(30px)', padding: '40px 60px', borderTop: '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
            <span style={{ color: s.textDim, fontWeight: '900', fontSize: '20px' }}>COMMANDS READY: <span style={{ color: s.brightSapphire, fontSize: '60px', fontStyle: 'italic' }}>{userTeams.length}</span></span>
            <button onClick={() => userTeams.length > 0 && setAppState('DRAFTING')} disabled={userTeams.length === 0} style={{ width: '500px', background: userTeams.length > 0 ? s.brightSapphire : 'rgba(255,255,255,0.05)', color: userTeams.length > 0 ? '#001945' : s.textDim, padding: '30px', borderRadius: '30px', fontSize: '30px', fontWeight: '1000', cursor: 'pointer', border: 'none', textTransform: 'uppercase', fontStyle: 'italic' }}>Initiate Sequence</button>
          </footer>
        </div>
      )}

      {appState === 'DRAFTING' && (
        <div style={{ background: s.surface, height: '100vh', width: '100vw', display: 'grid', gridTemplateColumns: '1fr 480px', overflow: 'hidden' }}>
          <main style={{ overflowY: 'auto', padding: '60px' }}>
            <header style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <div>
                {/* HEADER WORDMARK - ALWAYS FORCED TO WHITE/SILVER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <img 
                        src={TEAM_WORDMARKS[activeDraftTeam]} 
                        style={{ height: '45px', filter: 'grayscale(1) brightness(2.5) invert(1)' }} 
                    />
                    <span style={{ color: teamSecColor, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '8px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                        // COMMAND LEDGER
                    </span>
                </div>
                <h1 style={{ fontSize: '110px', fontWeight: '950', fontStyle: 'italic', letterSpacing: '-6px', color: '#fff', lineHeight: '0.8', marginTop: '15px' }}>BIG BOARD</h1>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <input placeholder="Filter..." style={{ background: s.surfaceLow, border: 'none', padding: '24px 32px', borderRadius: '24px', width: '300px', color: '#fff', outline: 'none', fontWeight: '800' }} onChange={(e) => setSearch(e.target.value)} />
                {!isUserOnClock && (
                  <button onClick={() => setIsSimulating(!isSimulating)} style={{ background: isSimulating ? teamSecColor : s.secondary, color: isSimulating ? '#fff' : '#003919', padding: '0 40px', borderRadius: '24px', fontWeight: '950', textTransform: 'uppercase', cursor: 'pointer', border: 'none' }}>
                    {isSimulating ? 'Pause Stream' : 'Resume Simulation'}
                  </button>
                )}
              </div>
            </header>
            <div style={{ paddingBottom: '150px' }}>
              {BIG_BOARD.filter(p => !Object.values(draftResults).some(dp => dp.id === p.id) && (p.name.toLowerCase().includes(search.toLowerCase()) || p.pos.toLowerCase().includes(search.toLowerCase()))).map((player, idx) => (
                <DraftCard key={player.id} player={player} rank={String(idx + 1).padStart(2, '0')} fitScore={calculateFit(player, activeFitTeam)} isSelected={selectedId === player.id} onSelect={setSelectedId} onDraft={handleDraft} teamColor={teamPrimaryColor} teamSecColor={teamSecColor} teamLogo={teamLogo} />
              ))}
            </div>
          </main>
          
          <aside style={{ background: s.surfaceLow, borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, textAlign: 'center' }}>
               <img src={teamLogo} style={{ height: '100px', marginBottom: '20px', filter: `drop-shadow(0 0 20px ${teamSecColor})` }} />
              <h3 style={{ color: teamSecColor, fontWeight: '950', fontStyle: 'italic', fontSize: '24px', textTransform: 'uppercase', margin: 0 }}>{TEAMS[activeDraftTeam]?.n}</h3>
              {isUserOnClock && <div style={{ background: s.secondary, color: '#003919', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: '1000', marginTop: '15px', textAlign: 'center', letterSpacing: '3px' }}>ON THE CLOCK</div>}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {DRAFT_ORDER.map((p, i) => {
                const result = draftResults[p.pick];
                const teamCol = TEAM_COLORS[p.teamKey]?.c || '#555';
                const isActive = i === currentPickIndex;
                return (
                  <div key={p.pick} style={{ padding: '24px', borderRadius: '28px', marginBottom: '16px', background: isActive ? `${teamCol}15` : 'transparent', border: isActive ? `2px solid ${teamCol}` : '1px solid transparent', opacity: i < currentPickIndex ? 0.3 : 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img src={TEAM_COLORS[p.teamKey]?.logo} style={{ height: '40px', width: '40px', opacity: isActive ? 1 : 0.5 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: s.textDim }}>PICK {p.pick}</span>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '950', color: userTeams.includes(p.teamKey) ? '#fff' : s.textDim, fontStyle: 'italic' }}>{TEAMS[p.teamKey]?.n}</div>
                      {result && <div style={{ marginTop: '5px', color: s.secondary, fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>{result.name} // {result.pos}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}