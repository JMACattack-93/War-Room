import React, { useState, useEffect } from 'react';

/* DATA IMPORTS */
import { BIG_BOARD } from './big_board_data';
import { TEAMS } from './team_data';
import { DRAFT_ORDER } from './draftorder100';

const s = {
  surface: '#0f1419',
  surfaceLow: '#171c21',
  surfaceHigh: '#1e242b',
  primary: '#b0c6ff',   
  secondary: '#66dd8b', 
  textMain: '#dee3ea',
  textDim: '#8d909e',
  washPrimary: '#5A1414', // Burgundy
  washSecondary: '#FFB612', // Gold
  brightSapphire: '#3b82f6' // High-Voltage Blue
};

const DraftCard = ({ player, fitScore, rank, isSelected, onSelect, isDrafted, onDraft }) => {
  const getMetallicStyle = (colorCode) => {
    const palette = {
      gold: { border: '#fbbf24', shine: 'rgba(251, 191, 36, 0.2)', text: '#fde68a' },
      red: { border: '#ef4444', shine: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5' },
      purple: { border: '#a855f7', shine: 'rgba(168, 85, 247, 0.2)', text: '#d8b4fe' },
      blue: { border: '#3b82f6', shine: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd' },
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
      fontSize: '18px',
      fontWeight: '950',
      textTransform: 'uppercase',
      fontStyle: 'italic',
      letterSpacing: '1px',
      textAlign: 'center'
    };
  };

  const [firstName, ...lastNameParts] = player.name.split(' ');
  const lastName = lastNameParts.join(' ');

  return (
    <div 
      onClick={() => !isDrafted && onSelect(player.id)}
      style={{ 
        background: s.surfaceLow, 
        minHeight: '320px', 
        width: '100%',
        borderRadius: '44px',
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 1.2fr) 2fr 180px',
        alignItems: 'stretch',
        overflow: 'hidden',
        fontFamily: 'Lexend, sans-serif',
        // AMPLIFIED BURGUNDY GLOW: Multi-layered for depth
        boxShadow: isSelected 
          ? `0 0 40px ${s.washPrimary}, 0 0 120px ${s.washPrimary}40, inset 0 0 30px ${s.washPrimary}50` 
          : '0 30px 80px rgba(0,0,0,0.5)',
        margin: '0 auto 24px auto',
        border: isSelected ? `5px solid ${s.washSecondary}` : '1px solid rgba(255,255,255,0.03)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        transform: isSelected ? 'scale(1.02) translateY(-5px)' : 'scale(1)',
        opacity: isDrafted ? 0.1 : 1,
        zIndex: isSelected ? 50 : 1
      }}>
      
      {/* SELECTION OVERLAY - ZERO BLUR */}
      {isSelected && (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)', // Slightly heavier dimming to make the blue pop
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onDraft(player.id); }}
            style={{
              // BRIGHT SAPPHIRE METALLIC
              background: `linear-gradient(135deg, #fff 0%, ${s.brightSapphire} 25%, #003399 100%)`,
              color: '#fff',
              padding: '28px 72px',
              borderRadius: '24px',
              fontSize: '34px',
              fontWeight: '1000',
              textTransform: 'uppercase',
              fontStyle: 'italic',
              border: `4px solid #fff`,
              boxShadow: `0 0 60px ${s.brightSapphire}, inset 0 0 20px rgba(255,255,255,0.6)`,
              cursor: 'pointer',
              letterSpacing: '4px',
              textShadow: '0 4px 12px rgba(0,0,0,0.6)',
              fontFamily: 'Lexend, sans-serif'
            }}>
            SELECT PROSPECT
          </button>
        </div>
      )}

      {/* IDENTITY */}
      <div style={{ padding: '40px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', left: '-10px', top: '0', fontSize: '240px', fontWeight: '950', 
            color: isSelected ? `${s.washSecondary}15` : 'rgba(255,255,255,0.02)', 
            fontStyle: 'italic', lineHeight: '0.8', pointerEvents: 'none' }}>
          #{rank}
        </div>
        <div style={{ position: 'relative', zIndex: '10' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: isSelected ? s.washSecondary : s.textDim, textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '-5px' }}>{firstName}</div>
          <h2 style={{ fontSize: '72px', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-3px', lineHeight: '0.8', margin: '0 0 24px 0', color: '#fff' }}>{lastName}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ background: isSelected ? s.washPrimary : s.primary, color: isSelected ? '#fff' : '#001945', padding: '10px 24px', borderRadius: '14px', fontSize: '28px', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', border: isSelected ? `2px solid ${s.washSecondary}` : 'none' }}>
              {player.pos}
            </span>
            <span style={{ fontSize: '28px', fontWeight: '800', color: s.textDim, textTransform: 'uppercase', fontStyle: 'italic' }}>/ {player.school}</span>
          </div>
        </div>
      </div>

      {/* MATRIX */}
      <div style={{ padding: '40px', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isSelected ? s.washSecondary : s.primary} strokeWidth="4"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={isSelected ? s.washSecondary : s.primary}/></svg>
          <span style={{ fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', color: isSelected ? s.washSecondary : s.textDim, letterSpacing: '8px' }}>NEURAL MATRIX</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {player.traits.map(t => (<div key={t.l} style={getMetallicStyle(t.c)}>{t.l}</div>))}
        </div>
      </div>

      {/* TOWERS */}
      <div style={{ background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <span style={{ color: s.textDim, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px', opacity: 0.4 }}>TALENT</span>
          <span style={{ color: isSelected ? s.washSecondary : s.primary, fontSize: '85px', fontWeight: '950', fontStyle: 'italic', lineHeight: '1' }}>{Math.round(player.grade)}</span>
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
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [draftResults, setDraftResults] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);

  const currentPick = DRAFT_ORDER[currentPickIndex];
  const isCommandersOnClock = currentPick?.teamKey === "WAS";

  const calculateFit = (player, teamKey) => {
    const teamData = TEAMS[teamKey] || TEAMS.WAS;
    const pKey = player.pos === 'IDL' ? 'DT' : player.pos;
    const needScore = teamData.needs[pKey] || 0;
    const traitMatches = player.traits.filter(t => (teamData.likes[pKey] || []).some(l => l.toLowerCase() === t.l.toLowerCase()));
    return Math.min(99, Math.round((needScore * 0.4) + (player.grade * 0.3) + (traitMatches.length * 10)));
  };

  const handleDraft = (playerId) => {
    const player = BIG_BOARD.find(p => p.id === playerId);
    if (!player) return;
    setDraftResults(prev => ({ ...prev, [currentPick.pick]: player }));
    setCurrentPickIndex(prev => prev + 1);
    setSelectedId(null);
  };

  useEffect(() => {
    if (isSimulating && currentPick && !isCommandersOnClock) {
      const timer = setTimeout(() => {
        const available = BIG_BOARD.filter(p => !Object.values(draftResults).some(dr => dr.id === p.id));
        handleDraft(available[0].id);
      }, 400);
      return () => clearTimeout(timer);
    } else if (isCommandersOnClock) { setIsSimulating(false); }
  }, [currentPickIndex, isSimulating]);

  const filteredBoard = BIG_BOARD.filter(p => 
    !Object.values(draftResults).some(dp => dp.id === p.id) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.pos.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: s.surface, height: '100vh', width: '100vw', display: 'grid', gridTemplateColumns: '1fr 420px', overflow: 'hidden' }}>
      
      <main style={{ overflowY: 'auto', padding: '60px' }}>
        <header style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div>
            <span style={{ color: s.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '10px', fontSize: '14px' }}>Commanders Operations // Ledger</span>
            <h1 style={{ fontSize: '110px', fontWeight: '950', fontStyle: 'italic', letterSpacing: '-6px', color: '#fff', lineHeight: '0.8', marginTop: '10px' }}>BIG BOARD</h1>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <input placeholder="Search Personnel..." style={{ background: s.surfaceLow, border: 'none', padding: '24px 32px', borderRadius: '24px', width: '350px', color: '#fff', outline: 'none', fontWeight: '800' }} onChange={(e) => setSearch(e.target.value)} />
            {!isCommandersOnClock && <button onClick={() => setIsSimulating(true)} style={{ background: s.secondary, color: '#003919', padding: '0 40px', borderRadius: '24px', fontWeight: '950', textTransform: 'uppercase', cursor: 'pointer', border: 'none' }}>Simulate</button>}
          </div>
        </header>

        <div style={{ paddingBottom: '100px' }}>
          {filteredBoard.map((player, idx) => (
            <DraftCard key={player.id} player={player} rank={String(idx + 1).padStart(2, '0')} fitScore={calculateFit(player, "WAS")} isSelected={selectedId === player.id} onSelect={setSelectedId} onDraft={handleDraft} />
          ))}
        </div>
      </main>

      <aside style={{ background: s.surfaceLow, borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ padding: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <h3 style={{ color: s.primary, fontWeight: '950', fontStyle: 'italic', fontSize: '24px', textTransform: 'uppercase' }}>Draft Stream</h3>
          {isCommandersOnClock && <div style={{ background: s.secondary, color: '#003919', padding: '8px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', marginTop: '12px', textAlign: 'center', letterSpacing: '2px' }}>ON THE CLOCK</div>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {DRAFT_ORDER.map((p, i) => {
            const result = draftResults[p.pick];
            const team = TEAMS[p.teamKey] || { n: p.teamKey, c: '#555' };
            const isActive = i === currentPickIndex;
            return (
              <div key={p.pick} style={{ 
                padding: '24px', borderRadius: '28px', marginBottom: '16px', 
                background: isActive ? 'rgba(176,198,255,0.1)' : 'transparent', 
                border: isActive ? `2px solid ${s.primary}` : '1px solid transparent', 
                opacity: i < currentPickIndex ? 0.3 : 1,
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: s.textDim }}>PICK {p.pick}</span>
                  <div style={{ width: '32px', height: '8px', background: team.c, borderRadius: '10px' }} />
                </div>
                <div style={{ fontSize: '20px', fontWeight: '950', color: '#fff', marginTop: '6px', fontStyle: 'italic' }}>{team.n}</div>
                {result && <div style={{ marginTop: '12px', color: s.secondary, fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>{result.name} // {result.pos}</div>}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}