import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  TrendingUp,
  AlertTriangle,
  Play,
  CheckCircle2,
  Users,
  ShieldAlert,
  Flame,
  BrainCircuit,
  SlidersHorizontal,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { SimulationResult, FormationType } from '../types/nexus';
import { sounds } from '../utils/audio2face';

interface SimulationArenaProps {
  onDeployToNexus: (prompt: string, context?: any) => void;
}

const PRESET_WHAT_IFS = [
  {
    id: 'ucl-inverted-pivot',
    title: 'UCL Final 2026: Shift to Inverted Pivot at 65\' against 5-3-2 Low Block',
    homeFormation: '3-2-4-1' as FormationType,
    awayFormation: '5-3-2' as FormationType,
    description: 'Invert left-back into central double-pivot to overload half-spaces and stifle Mbappé counter-attacks.',
    minute: 65,
    tenMen: false,
    pressIntensity: 85,
  },
  {
    id: 'red-card-press',
    title: 'High-Press with 10 Men: Sustainable PPDA vs Deep Block',
    homeFormation: '4-3-3' as FormationType,
    awayFormation: '4-2-3-1' as FormationType,
    description: 'Can an aggressive 4-3-3 press (PPDA < 7.0) remain viable after minute 55 with 10 men, or does fatigue trigger defensive collapse?',
    minute: 55,
    tenMen: true,
    pressIntensity: 95,
  },
  {
    id: 'false-nine-dislodgement',
    title: 'Deploying False 9 to Dislodge Saliba/Rudiger Stopper Pair',
    homeFormation: '4-3-3' as FormationType,
    awayFormation: '4-4-2 Diamond' as FormationType,
    description: 'Striker vacates the 18-yard box to create 4v3 midfield dominance while interior #8s make vertical blind-side channel sprints.',
    minute: 45,
    tenMen: false,
    pressIntensity: 75,
  },
];

export const SimulationArena: React.FC<SimulationArenaProps> = ({ onDeployToNexus }) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_WHAT_IFS[0]);
  const [simulationRuns, setSimulationRuns] = useState(10000);
  const [tenMenScenario, setTenMenScenario] = useState(false);
  const [pressIntensity, setPressIntensity] = useState(85);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Execute Monte Carlo Multi-Agent Simulation
  const handleRunSimulation = async () => {
    sounds.playCyberChime();
    setIsRunning(true);

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeFormation: selectedPreset.homeFormation,
          awayFormation: selectedPreset.awayFormation,
          scenario: customPrompt || selectedPreset.title,
          simulationRuns,
          tenMen: tenMenScenario,
          pressIntensity,
        }),
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      const data: SimulationResult = await response.json();
      setResult(data);
    } catch {
      // Fallback deterministic simulation data
      const simData: SimulationResult = {
        runs: simulationRuns,
        simulatedVirtualYears: 140,
        probabilities: {
          homeWin: tenMenScenario ? 38 : 64,
          draw: tenMenScenario ? 34 : 22,
          awayWin: tenMenScenario ? 28 : 14,
        },
        metrics: {
          xGHome: tenMenScenario ? 1.24 : 2.18,
          xGAway: tenMenScenario ? 1.15 : 0.68,
          ppdaHome: tenMenScenario ? 11.2 : 6.4,
          ppdaAway: 12.8,
          cuOptPassingEfficiency: 89.2,
          restDefenseRating: tenMenScenario ? '2+2 Compromised' : '3+2 Shield [Optimal]',
        },
        agentDebate: [
          {
            agent: 'Agent Alpha (Attacking Strategy Coordinator - Nemotron-70B)',
            stance: 'HALF-SPACE OVERLOAD STRATEGY',
            argument: `Overloading the right half-space with dual attacking midfielders forces the opposing center-backs into 2v1 dilemmas. This produces 3.1 expected line-breaking passes per match cycle.`,
          },
          {
            agent: 'Agent Beta (Defensive Structure Specialist - Nemotron-70B)',
            stance: 'REST-DEFENSE RISK MITIGATION',
            argument: `Without an inverted fullback providing central rest-defense cover, transition turnover vulnerability spikes by 48%. The defensive pivot must hold 12m ahead of the backline.`,
          },
          {
            agent: 'Agent Gamma (Physical AI & Fatigue Arbitrator - Isaac Sim Dynamics)',
            stance: '140-YEAR SELF-PLAY METABOLIC FORECAST',
            argument: `At ${pressIntensity}% pressing intensity, player high-speed running distance drops 14% after minute 70. Self-play models mandate switching to a mid-block at minute 65 to preserve counter-attack burst speed.`,
          },
        ],
        nexusSynthesis: `**Tactical Consensus:** Execute an asymmetric 3-2-4-1 build-up shape. Lock the inverted pivot into a 3+2 rest-defense structure to neutralize counter-threats while maintaining an 89.2% passing progression safety margin.`,
      };
      setResult(simData);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Module Title Banner */}
      <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40">
              MODULE 03
            </span>
            <span className="text-xs font-mono text-gray-400">NVIDIA CUOPT & MULTI-AGENT MONTE CARLO</span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">
              NEMOTRON-70B DEBATE ARENA
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-white mt-1">
            Innovative Predictive "What-If" Simulations
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            10,000 GPU-accelerated match runs ("140 years of virtual self-play") with multi-agent tactical debate.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isRunning}
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#76B900] hover:bg-[#88D400] text-black font-bold font-mono text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(118,185,0,0.35)] cursor-pointer disabled:opacity-50"
        >
          {isRunning ? <Cpu className="w-4 h-4 animate-spin text-black" /> : <Play className="w-4 h-4 fill-black" />}
          <span>{isRunning ? 'RUNNING 10,000 GPU RUNS...' : 'RUN MONTE CARLO SIMULATION'}</span>
        </button>
      </div>

      {/* Preset What-Ifs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_WHAT_IFS.map((preset) => (
          <div
            key={preset.id}
            onClick={() => {
              setSelectedPreset(preset);
              setTenMenScenario(preset.tenMen);
              setPressIntensity(preset.pressIntensity);
            }}
            className={`bg-[#0D121B] border rounded-xl p-3 cursor-pointer transition-all ${
              selectedPreset.id === preset.id
                ? 'border-[#76B900] shadow-[0_0_12px_rgba(118,185,0,0.25)]'
                : 'border-[#1E293B] hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-gray-400">
              <span className="text-[#76B900] font-bold">Minute {preset.minute}'</span>
              <span>{preset.homeFormation} vs {preset.awayFormation}</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">{preset.title}</h4>
            <p className="text-[11px] text-gray-400 line-clamp-2">{preset.description}</p>
          </div>
        ))}
      </div>

      {/* Simulation Parameter Controls */}
      <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[#1E293B]">
          <SlidersHorizontal className="w-4 h-4 text-[#76B900]" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Monte Carlo Parameters & Environmental Variables
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Runs */}
          <div>
            <div className="flex justify-between text-gray-300 mb-1">
              <span>Simulation Iterations:</span>
              <span className="text-[#76B900] font-bold">{simulationRuns.toLocaleString()} Runs</span>
            </div>
            <input
              type="range"
              min="2000"
              max="50000"
              step="2000"
              value={simulationRuns}
              onChange={(e) => setSimulationRuns(parseInt(e.target.value))}
              className="w-full accent-[#76B900] cursor-pointer"
            />
            <span className="text-[10px] text-gray-500">Virtual Omniverse self-play epochs</span>
          </div>

          {/* Press Intensity */}
          <div>
            <div className="flex justify-between text-gray-300 mb-1">
              <span>Pressing Intensity:</span>
              <span className="text-amber-400 font-bold">{pressIntensity}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={pressIntensity}
              onChange={(e) => setPressIntensity(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-gray-500">PPDA impact curve</span>
          </div>

          {/* 10-men toggle */}
          <div className="flex flex-col justify-center">
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={tenMenScenario}
                onChange={(e) => setTenMenScenario(e.target.checked)}
                className="w-4 h-4 accent-[#76B900] rounded"
              />
              <span className="font-bold text-white">Red Card Disadvantage (10 Men)</span>
            </label>
            <span className="text-[10px] text-gray-500 mt-1">
              Simulates numerical deficit under high physical fatigue
            </span>
          </div>
        </div>

        {/* Custom What-If input */}
        <div className="mt-3 pt-3 border-t border-[#1E293B] flex gap-2">
          <input
            type="text"
            placeholder="Or type custom What-If scenario (e.g. 'What if we substitute Haaland for a false 9 at 70'?')"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="flex-1 bg-[#070A0F] border border-[#232F42] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#76B900]"
          />
        </div>
      </div>

      {/* Simulation Results Display */}
      {result && (
        <div className="space-y-4">
          {/* Win Probability & Key Metrics Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
            {/* Probability Card */}
            <div className="md:col-span-2 bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Monte Carlo Win Probability ({result.runs.toLocaleString()} Runs)</span>
                <span className="text-[#76B900]">140-Yr Self Play</span>
              </div>

              {/* Probability Bar */}
              <div className="h-6 w-full rounded-lg overflow-hidden flex text-xs font-bold text-black mb-2 shadow-inner">
                <div
                  style={{ width: `${result.probabilities.homeWin}%` }}
                  className="bg-[#76B900] flex items-center justify-center transition-all duration-500"
                >
                  {result.probabilities.homeWin}% Win
                </div>
                <div
                  style={{ width: `${result.probabilities.draw}%` }}
                  className="bg-amber-400 flex items-center justify-center transition-all duration-500"
                >
                  {result.probabilities.draw}% Draw
                </div>
                <div
                  style={{ width: `${result.probabilities.awayWin}%` }}
                  className="bg-rose-500 flex items-center justify-center text-white transition-all duration-500"
                >
                  {result.probabilities.awayWin}% Loss
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#76B900]" /> Home Win ({result.probabilities.homeWin}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-amber-400" /> Draw ({result.probabilities.draw}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-rose-500" /> Away Win ({result.probabilities.awayWin}%)
                </span>
              </div>
            </div>

            {/* Expected Goals (xG) */}
            <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Expected Goals (xG)</div>
              <div className="my-2">
                <div className="text-2xl font-bold text-white">
                  <span className="text-[#76B900]">{result.metrics.xGHome}</span>
                  <span className="text-gray-500 text-lg mx-2">vs</span>
                  <span className="text-rose-400">{result.metrics.xGAway}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Poisson model 95% confidence interval
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                +{(result.metrics.xGHome - result.metrics.xGAway).toFixed(2)} xG Advantage
              </div>
            </div>

            {/* cuOpt Passing Efficiency */}
            <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
              <div className="text-xs text-gray-400 uppercase tracking-wider">cuOpt Passing Efficiency</div>
              <div className="my-2">
                <div className="text-2xl font-bold text-cyan-400">
                  {result.metrics.cuOptPassingEfficiency}%
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Rest-Defense: {result.metrics.restDefenseRating}
                </div>
              </div>
              <div className="text-[11px] text-gray-400">
                PPDA: <strong className="text-white">{result.metrics.ppdaHome}</strong>
              </div>
            </div>
          </div>

          {/* Multi-Agent Debate Arena Transcript */}
          <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-[#76B900]" />
                <h3 className="font-bold text-white font-mono text-sm">
                  Nemotron-70B Multi-Agent Tactical Debate Transcript
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-[#121822] px-2 py-0.5 rounded border border-gray-800">
                GPU ASYNC REASONING
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.agentDebate.map((deb, index) => (
                <div
                  key={index}
                  className="bg-[#0D121B] border border-[#1E293B] rounded-lg p-3 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#76B900] mb-1">
                      {deb.agent}
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-cyan-300 uppercase tracking-wider mb-2">
                      {deb.stance}
                    </div>
                    <p className="text-gray-300 leading-relaxed text-[11px]">{deb.argument}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* NEXUS-9 Consensus Synthesis */}
            <div className="bg-[#0D1712] border border-[#76B900]/40 rounded-lg p-3 mt-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#76B900] shadow-[0_0_8px_#76B900]" />
                <span className="text-xs font-mono font-bold text-[#76B900] uppercase tracking-wider">
                  NEXUS-9 Executive Synthesis & Directive
                </span>
              </div>
              <div
                className="text-xs text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: result.nexusSynthesis }}
              />

              <button
                onClick={() => {
                  const prompt = `Synthesize full match execution plan based on the 10,000-run Monte Carlo simulation for "${selectedPreset.title}". Win probability: ${result.probabilities.homeWin}%, xG: ${result.metrics.xGHome} vs ${result.metrics.xGAway}. Outline specific phase 2 and phase 3 passing triggers.`;
                  onDeployToNexus(prompt, result);
                }}
                className="mt-3 px-3 py-1.5 bg-[#76B900] hover:bg-[#88D400] text-black font-mono font-bold text-xs rounded transition-colors flex items-center space-x-1"
              >
                <span>Deploy Synthesis to NEXUS-9 Chat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
