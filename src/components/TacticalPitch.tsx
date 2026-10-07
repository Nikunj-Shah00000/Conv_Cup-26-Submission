import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  RefreshCw,
  Compass,
  Eye,
  Send,
  Zap,
  Shield,
  Activity,
  PenTool,
  RotateCcw,
  Sliders,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { PlayerNode, FormationType, OverlayMode, TacticalScenario } from '../types/nexus';
import { FORMATION_COORDINATES, TACTICAL_SCENARIOS } from '../utils/tacticalData';
import { sounds } from '../utils/audio2face';

interface TacticalPitchProps {
  onAnalyzeScenario: (prompt: string, context: any) => void;
  selectedScenarioId?: string;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  onAnalyzeScenario,
  selectedScenarioId = 'ucl-2026-final',
}) => {
  const [currentScenario, setCurrentScenario] = useState<TacticalScenario>(
    () => TACTICAL_SCENARIOS.find((s) => s.id === selectedScenarioId) || TACTICAL_SCENARIOS[0]
  );

  const [homeFormation, setHomeFormation] = useState<FormationType>(currentScenario.homeFormation);
  const [awayFormation, setAwayFormation] = useState<FormationType>(currentScenario.awayFormation);
  const [homePlayers, setHomePlayers] = useState<PlayerNode[]>(currentScenario.initialHomePlayers);
  const [awayPlayers, setAwayPlayers] = useState<PlayerNode[]>(currentScenario.initialAwayPlayers);

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerNode | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('voronoi');
  const [showHalfSpaces, setShowHalfSpaces] = useState(true);
  const [telestratorMode, setTelestratorMode] = useState(false);
  const [drawings, setDrawings] = useState<Array<{ startX: number; startY: number; endX: number; endY: number; color: string }>>([]);

  const pitchRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const draggedPlayerIdRef = useRef<string | null>(null);
  const drawingStartRef = useRef<{ x: number; y: number } | null>(null);

  // Update when scenario changes
  const handleScenarioChange = (scenarioId: string) => {
    const sc = TACTICAL_SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return;
    sounds.playTacticalScan();
    setCurrentScenario(sc);
    setHomeFormation(sc.homeFormation);
    setAwayFormation(sc.awayFormation);
    setHomePlayers(sc.initialHomePlayers);
    setAwayPlayers(sc.initialAwayPlayers);
    setSelectedPlayer(null);
    setDrawings([]);
  };

  // Formation Change handler
  const handleFormationChange = (team: 'home' | 'away', newFormation: FormationType) => {
    sounds.playTacticalScan();
    if (team === 'home') {
      setHomeFormation(newFormation);
      const coords = FORMATION_COORDINATES[newFormation].home;
      setHomePlayers(coords.map((p, i) => ({ ...p, id: `home-${i + 1}`, team: 'home' })));
    } else {
      setAwayFormation(newFormation);
      const coords = FORMATION_COORDINATES[newFormation].away;
      setAwayPlayers(coords.map((p, i) => ({ ...p, id: `away-${i + 1}`, team: 'away' })));
    }
  };

  // Dragging handlers for interactive player relocation
  const handleMouseDown = (e: React.MouseEvent, player: PlayerNode) => {
    if (telestratorMode) return;
    e.stopPropagation();
    isDraggingRef.current = true;
    draggedPlayerIdRef.current = player.id;
    setSelectedPlayer(player);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (telestratorMode) {
      // Telestrator drawing logic handled in pitch click
      return;
    }
    if (!isDraggingRef.current || !draggedPlayerIdRef.current || !pitchRef.current) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.max(3, Math.min(97, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));

    const id = draggedPlayerIdRef.current;
    if (id.startsWith('home')) {
      setHomePlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, x: +x.toFixed(1), y: +y.toFixed(1) } : p))
      );
    } else {
      setAwayPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, x: +x.toFixed(1), y: +y.toFixed(1) } : p))
      );
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    draggedPlayerIdRef.current = null;
  };

  // Telestrator click/drag drawing
  const handlePitchMouseDown = (e: React.MouseEvent) => {
    if (!telestratorMode || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    drawingStartRef.current = { x, y };
  };

  const handlePitchMouseUp = (e: React.MouseEvent) => {
    if (!telestratorMode || !drawingStartRef.current || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Add drawn arrow/line if distance is significant
    const dist = Math.hypot(x - drawingStartRef.current.x, y - drawingStartRef.current.y);
    if (dist > 3) {
      setDrawings((prev) => [
        ...prev,
        {
          startX: drawingStartRef.current!.x,
          startY: drawingStartRef.current!.y,
          endX: x,
          endY: y,
          color: '#76B900',
        },
      ]);
    }
    drawingStartRef.current = null;
  };

  // Compute Cosmos Vision pitch control dominance %
  const calculateDominance = () => {
    let homeCenterMass = homePlayers.reduce((acc, p) => acc + p.x, 0) / homePlayers.length;
    let awayCenterMass = awayPlayers.reduce((acc, p) => acc + (100 - p.x), 0) / awayPlayers.length;
    const total = homeCenterMass + awayCenterMass;
    const homePercent = Math.min(85, Math.max(25, Math.round((homeCenterMass / total) * 100)));
    return {
      home: homePercent,
      away: 100 - homePercent,
      homeDefensiveLine: Math.min(...homePlayers.filter((p) => p.role.includes('CB')).map((p) => p.x)),
      awayDefensiveLine: Math.max(...awayPlayers.filter((p) => p.role.includes('CB')).map((p) => p.x)),
    };
  };

  const metrics = calculateDominance();

  // Send formation to NEXUS-9 for Cosmos Vision Diagnosis
  const handleTriggerDiagnosis = () => {
    sounds.playCyberChime();
    const context = {
      scenario: currentScenario.title,
      competition: currentScenario.competition,
      minute: currentScenario.minute,
      homeTeam: currentScenario.homeTeam,
      awayTeam: currentScenario.awayTeam,
      homeFormation,
      awayFormation,
      metrics: {
        pitchControlHomePct: metrics.home,
        pitchControlAwayPct: metrics.away,
        homeDefensiveLineX: metrics.homeDefensiveLine,
        awayDefensiveLineX: metrics.awayDefensiveLine,
      },
      playerPositions: {
        homeCount: homePlayers.length,
        awayCount: awayPlayers.length,
      },
    };

    const prompt = `Deconstruct the match state for ${currentScenario.title} (${currentScenario.competition}, Minute ${currentScenario.minute}). Home team (${currentScenario.homeTeam}) is in a ${homeFormation} facing ${currentScenario.awayTeam}'s ${awayFormation}. Identify low-block or pressing vulnerabilities, compute space ownership in the half-spaces via Cosmos Vision AI, and prescribe a high-impact tactical shift with PPDA metrics.`;

    onAnalyzeScenario(prompt, context);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40">
              MODULE 01
            </span>
            <span className="text-xs font-mono text-gray-400">COSMOS VISION AI & CUOPT ROUTING</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800">
              2026 TACTICAL ENGINE
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-white mt-1 flex items-center gap-2">
            Real-Time Tactical & Match Analysis
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Interactive FIFA 105x68m spatial board with Voronoi pitch dominance, cover shadows, and cuOpt passing vectors.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={handleTriggerDiagnosis}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#76B900] hover:bg-[#88D400] text-black font-bold font-mono text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(118,185,0,0.35)] cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-black" />
          <span>RUN COSMOS TACTICAL DIAGNOSIS</span>
        </button>
      </div>

      {/* Scenario & Formation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Scenario Selector */}
        <div className="bg-[#0D121B] border border-[#1E293B] rounded-xl p-3">
          <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5 flex items-center justify-between">
            <span>Match Scenario (2026)</span>
            <Compass className="w-3.5 h-3.5 text-[#76B900]" />
          </label>
          <select
            value={currentScenario.id}
            onChange={(e) => handleScenarioChange(e.target.value)}
            className="w-full bg-[#080B10] text-xs font-mono text-white border border-[#2A374A] rounded-lg p-2 focus:outline-none focus:border-[#76B900]"
          >
            {TACTICAL_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.minute}')
              </option>
            ))}
          </select>
          <div className="mt-2 text-[11px] text-gray-400 line-clamp-2">
            {currentScenario.matchContext}
          </div>
        </div>

        {/* Home Formation */}
        <div className="bg-[#0D121B] border border-[#1E293B] rounded-xl p-3">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#76B900] block mb-1.5 flex items-center justify-between">
            <span>{currentScenario.homeTeam} Formation</span>
            <Shield className="w-3.5 h-3.5 text-[#76B900]" />
          </label>
          <select
            value={homeFormation}
            onChange={(e) => handleFormationChange('home', e.target.value as FormationType)}
            className="w-full bg-[#080B10] text-xs font-mono text-white border border-[#2A374A] rounded-lg p-2 focus:outline-none focus:border-[#76B900]"
          >
            {Object.keys(FORMATION_COORDINATES).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Control Index: <strong className="text-[#76B900]">{metrics.home}%</strong></span>
            <span>Line Height: <strong>{metrics.homeDefensiveLine.toFixed(1)}m</strong></span>
          </div>
        </div>

        {/* Away Formation */}
        <div className="bg-[#0D121B] border border-[#1E293B] rounded-xl p-3">
          <label className="text-[11px] font-mono uppercase tracking-wider text-rose-400 block mb-1.5 flex items-center justify-between">
            <span>{currentScenario.awayTeam} Formation</span>
            <Shield className="w-3.5 h-3.5 text-rose-400" />
          </label>
          <select
            value={awayFormation}
            onChange={(e) => handleFormationChange('away', e.target.value as FormationType)}
            className="w-full bg-[#080B10] text-xs font-mono text-white border border-[#2A374A] rounded-lg p-2 focus:outline-none focus:border-rose-400"
          >
            {Object.keys(FORMATION_COORDINATES).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Control Index: <strong className="text-rose-400">{metrics.away}%</strong></span>
            <span>Line Height: <strong>{(100 - metrics.awayDefensiveLine).toFixed(1)}m</strong></span>
          </div>
        </div>
      </div>

      {/* Layer Toggles & Telestrator Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#090D14] border border-[#1E293B] rounded-lg p-2 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-[11px] uppercase mr-1">Overlays:</span>
          {(['voronoi', 'passing-lanes', 'pressing-heat', 'compactness', 'none'] as OverlayMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                sounds.playTacticalScan();
                setOverlayMode(mode);
              }}
              className={`px-2.5 py-1 rounded text-[11px] capitalize transition-all ${
                overlayMode === mode
                  ? 'bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/50 font-bold'
                  : 'bg-[#121822] text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHalfSpaces(!showHalfSpaces)}
            className={`px-2 py-1 rounded text-[11px] border transition-colors ${
              showHalfSpaces
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                : 'bg-[#121822] text-gray-400 border-gray-800'
            }`}
          >
            Half-Spaces Grid
          </button>

          <button
            onClick={() => setTelestratorMode(!telestratorMode)}
            className={`px-2 py-1 rounded text-[11px] border flex items-center space-x-1 transition-colors ${
              telestratorMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                : 'bg-[#121822] text-gray-400 border-gray-800'
            }`}
          >
            <PenTool className="w-3 h-3" />
            <span>{telestratorMode ? 'Drawing On' : 'Telestrator'}</span>
          </button>

          {drawings.length > 0 && (
            <button
              onClick={() => setDrawings([])}
              className="px-2 py-1 rounded text-[11px] bg-red-950/40 text-red-300 border border-red-800 hover:bg-red-900/60"
            >
              <RotateCcw className="w-3 h-3 inline mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Pitch Board */}
      <div
        ref={pitchRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handlePitchMouseDown}
        className={`relative w-full aspect-[16/10] bg-[#0c1b12] rounded-xl border-2 border-[#1E3A24] overflow-hidden select-none shadow-2xl tactical-pitch-grid ${
          telestratorMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Pitch grass striping effect */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 ${i % 2 === 0 ? 'bg-black/40' : 'bg-transparent'}`}
            />
          ))}
        </div>

        {/* Pitch White Markings SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/40 fill-none" strokeWidth="1.5">
          {/* Pitch Outer Boundary */}
          <rect x="3%" y="4%" width="94%" height="92%" />

          {/* Halfway Line */}
          <line x1="50%" y1="4%" x2="50%" y2="96%" />

          {/* Center Circle */}
          <circle cx="50%" cy="50%" r="9.15%" />
          <circle cx="50%" cy="50%" r="0.8%" className="fill-white/60" />

          {/* Left Penalty Box (Home) */}
          <rect x="3%" y="22%" width="16.5%" height="56%" />
          {/* Left 6-Yard Box */}
          <rect x="3%" y="36%" width="5.5%" height="28%" />
          {/* Left Penalty Spot */}
          <circle cx="14%" cy="50%" r="0.6%" className="fill-white/60" />
          {/* Left Penalty Arc */}
          <path d="M 19.5% 42% A 9.15% 9.15% 0 0 1 19.5% 58%" />

          {/* Right Penalty Box (Away) */}
          <rect x="80.5%" y="22%" width="16.5%" height="56%" />
          {/* Right 6-Yard Box */}
          <rect x="91.5%" y="36%" width="5.5%" height="28%" />
          {/* Right Penalty Spot */}
          <circle cx="86%" cy="50%" r="0.6%" className="fill-white/60" />
          {/* Right Penalty Arc */}
          <path d="M 80.5% 42% A 9.15% 9.15% 0 0 0 80.5% 58%" />

          {/* Corner Arcs */}
          <path d="M 3% 6% A 2% 2% 0 0 0 5% 4%" />
          <path d="M 3% 94% A 2% 2% 0 0 1 5% 96%" />
          <path d="M 97% 6% A 2% 2% 0 0 1 95% 4%" />
          <path d="M 97% 94% A 2% 2% 0 0 0 95% 96%" />
        </svg>

        {/* Half-Spaces Overlay (Guardiola 5-Lane Tactical Pitch Grid) */}
        {showHalfSpaces && (
          <div className="absolute inset-0 pointer-events-none flex flex-col opacity-25">
            <div className="h-[20%] w-full border-b border-dashed border-cyan-400 bg-cyan-900/10 flex items-center pl-4">
              <span className="text-[10px] font-mono text-cyan-300">Left Wing Flank</span>
            </div>
            <div className="h-[20%] w-full border-b border-dashed border-cyan-400 bg-cyan-500/10 flex items-center pl-4">
              <span className="text-[10px] font-mono text-cyan-300 font-bold">LEFT HALF-SPACE (Channel 2)</span>
            </div>
            <div className="h-[20%] w-full border-b border-dashed border-cyan-400 bg-transparent flex items-center pl-4">
              <span className="text-[10px] font-mono text-cyan-300">Central Corridor</span>
            </div>
            <div className="h-[20%] w-full border-b border-dashed border-cyan-400 bg-cyan-500/10 flex items-center pl-4">
              <span className="text-[10px] font-mono text-cyan-300 font-bold">RIGHT HALF-SPACE (Channel 4)</span>
            </div>
            <div className="h-[20%] w-full bg-cyan-900/10 flex items-center pl-4">
              <span className="text-[10px] font-mono text-cyan-300">Right Wing Flank</span>
            </div>
          </div>
        )}

        {/* Dynamic Overlay Modes */}
        {overlayMode === 'voronoi' && (
          <div className="absolute inset-0 pointer-events-none opacity-30">
            {/* Visual pitch control representation */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, rgba(118, 185, 0, 0.4) 0%, rgba(118, 185, 0, 0.15) ${metrics.home}%, rgba(239, 68, 68, 0.15) ${metrics.home}%, rgba(239, 68, 68, 0.4) 100%)`,
              }}
            />
          </div>
        )}

        {overlayMode === 'compactness' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Home Backline line */}
            <line
              x1={`${metrics.homeDefensiveLine}%`}
              y1="10%"
              x2={`${metrics.homeDefensiveLine}%`}
              y2="90%"
              stroke="#76B900"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
            <text x={`${metrics.homeDefensiveLine + 1}%`} y="15%" fill="#76B900" fontSize="11" fontFamily="monospace">
              Home Rest-Defense Line: {metrics.homeDefensiveLine.toFixed(1)}m
            </text>

            {/* Away Backline line */}
            <line
              x1={`${metrics.awayDefensiveLine}%`}
              y1="10%"
              x2={`${metrics.awayDefensiveLine}%`}
              y2="90%"
              stroke="#EF4444"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
            <text x={`${metrics.awayDefensiveLine - 22}%`} y="15%" fill="#EF4444" fontSize="11" fontFamily="monospace">
              Away Low-Block Line: {(100 - metrics.awayDefensiveLine).toFixed(1)}m
            </text>
          </svg>
        )}

        {overlayMode === 'passing-lanes' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* CuOpt Passing Vectors between nearby home teammates */}
            {homePlayers.map((p1, i) =>
              homePlayers.slice(i + 1).map((p2, j) => {
                const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                if (dist > 10 && dist < 32) {
                  const safetyPct = Math.round(100 - dist * 1.4);
                  return (
                    <g key={`pass-${p1.id}-${p2.id}`}>
                      <line
                        x1={`${p1.x}%`}
                        y1={`${p1.y}%`}
                        x2={`${p2.x}%`}
                        y2={`${p2.y}%`}
                        stroke="rgba(118, 185, 0, 0.4)"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                      />
                      <circle
                        cx={`${(p1.x + p2.x) / 2}%`}
                        cy={`${(p1.y + p2.y) / 2}%`}
                        r="2"
                        fill="#76B900"
                      />
                    </g>
                  );
                }
                return null;
              })
            )}
          </svg>
        )}

        {overlayMode === 'pressing-heat' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Pressing cones projecting from defending players */}
            {awayPlayers.map((p) => {
              if (p.x < 65) {
                return (
                  <path
                    key={`cone-${p.id}`}
                    d={`M ${p.x}% ${p.y}% L ${p.x - 14}% ${p.y - 12}% L ${p.x - 14}% ${p.y + 12}% Z`}
                    fill="rgba(239, 68, 68, 0.15)"
                    stroke="rgba(239, 68, 68, 0.4)"
                    strokeWidth="1"
                  />
                );
              }
              return null;
            })}
          </svg>
        )}

        {/* Telestrator Drawn Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#76B900" />
            </marker>
          </defs>
          {drawings.map((d, index) => (
            <line
              key={index}
              x1={`${d.startX}%`}
              y1={`${d.startY}%`}
              x2={`${d.endX}%`}
              y2={`${d.endY}%`}
              stroke={d.color}
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
            />
          ))}
        </svg>

        {/* Home Players (NVIDIA Neon Cyan / Green) */}
        {homePlayers.map((p) => {
          const isSelected = selectedPlayer?.id === p.id;
          return (
            <div
              key={p.id}
              onMouseDown={(e) => handleMouseDown(e, p)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform hover:scale-125 z-10"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs text-black border-2 transition-all ${
                  isSelected
                    ? 'bg-white border-[#76B900] shadow-[0_0_15px_#76B900] scale-110'
                    : 'bg-[#76B900] border-black/80 shadow-[0_2px_8px_rgba(0,0,0,0.6)]'
                }`}
              >
                {p.number}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 whitespace-nowrap pointer-events-none">
                <span className="text-[9px] font-mono text-white/90 bg-black/80 px-1 py-0.2 rounded border border-[#76B900]/40">
                  {p.name.split(' ')[0]}
                </span>
              </div>
            </div>
          );
        })}

        {/* Away Players (Crimson Red / Coral) */}
        {awayPlayers.map((p) => {
          const isSelected = selectedPlayer?.id === p.id;
          return (
            <div
              key={p.id}
              onMouseDown={(e) => handleMouseDown(e, p)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform hover:scale-125 z-10"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs text-white border-2 transition-all ${
                  isSelected
                    ? 'bg-white text-black border-red-500 shadow-[0_0_15px_#EF4444] scale-110'
                    : 'bg-[#EF4444] border-black/80 shadow-[0_2px_8px_rgba(0,0,0,0.6)]'
                }`}
              >
                {p.number}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 whitespace-nowrap pointer-events-none">
                <span className="text-[9px] font-mono text-white/90 bg-black/80 px-1 py-0.2 rounded border border-red-500/40">
                  {p.name.split(' ')[0]}
                </span>
              </div>
            </div>
          );
        })}

        {/* On-Pitch HUD Floating Legend */}
        <div className="absolute bottom-2 left-3 bg-[#080C14]/90 border border-gray-800 rounded px-2.5 py-1 text-[10px] font-mono text-gray-300 flex items-center space-x-3 backdrop-blur pointer-events-none">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#76B900] inline-block" />
            <span>{currentScenario.homeTeam}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" />
            <span>{currentScenario.awayTeam}</span>
          </div>
          <div className="text-gray-400">
            Drag tokens to adjust coordinates
          </div>
        </div>
      </div>

      {/* Selected Player Inspector Card */}
      {selectedPlayer && (
        <div className="bg-[#0D121B] border border-[#1E293B] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                selectedPlayer.team === 'home' ? 'bg-[#76B900] text-black' : 'bg-[#EF4444] text-white'
              }`}
            >
              {selectedPlayer.number}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{selectedPlayer.name}</div>
              <div className="text-gray-400 text-[11px]">{selectedPlayer.role} • Team: {selectedPlayer.team.toUpperCase()}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-300">
            <div>
              <span className="text-gray-500 block text-[10px]">COORDINATE X</span>
              <span className="text-[#76B900] font-bold">{selectedPlayer.x}%</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">COORDINATE Y</span>
              <span className="text-[#76B900] font-bold">{selectedPlayer.y}%</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">STATUS</span>
              <span className="text-emerald-400">TRACKED (120 FPS)</span>
            </div>
          </div>

          <button
            onClick={() => {
              const prompt = `Analyze positioning for ${selectedPlayer.name} (${selectedPlayer.role}) located at X:${selectedPlayer.x}%, Y:${selectedPlayer.y}%. What are their immediate passing routes and defensive pressing triggers against ${awayFormation}?`;
              onAnalyzeScenario(prompt, { player: selectedPlayer, homeFormation, awayFormation });
            }}
            className="px-3 py-1.5 bg-[#1B2738] hover:bg-[#25364D] text-[#76B900] border border-[#76B900]/40 rounded text-xs transition-colors flex items-center space-x-1"
          >
            <span>Ask NEXUS-9 About Player</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
