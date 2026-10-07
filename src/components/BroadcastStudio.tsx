import React, { useState } from 'react';
import {
  Mic2,
  Tv,
  Film,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  Share2,
  CheckCircle,
  Eye,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { rivaController, sounds } from '../utils/audio2face';

interface BroadcastStudioProps {
  onAskNexus: (prompt: string, context?: any) => void;
}

const BROADCAST_SCRIPTS = [
  {
    id: 'ucl-winner',
    title: '90+4\' Dramatic UCL Stoppage-Time Winner',
    tone: 'High-Octane Cinematic Pundit',
    headline: 'INVERTED FULLBACK OVERLOAD CLINCHES EUROPEAN TITLE',
    commentaryText: `**ABSOLUTE TACTICAL PERFECTION IN THE 94TH MINUTE!** Notice how the inverted left-back created the decoy third-man run, completely dismantling the 5-3-2 low-block before the driven strike into the bottom corner.

* **Cosmos Vision Readout:** Opponent cover shadow breached by 0.34 seconds.
* **Ball Exit Speed:** 118.2 km/h with 440 RPM topspin dip over the outstretched goalkeeper glove.
* **Tactical Verdict:** Pure positional mastery engineered on the training pitch!`,
  },
  {
    id: 'halftime-analysis',
    title: 'Half-Time Studio Breakdown: The Half-Space Masterclass',
    tone: 'Analytical Studio Guest',
    headline: 'HOW GUARDIOLA-STYLE ASYMMETRY BROKE THE MID-BLOCK',
    commentaryText: `**The tactical story of this first half is simple:** the away side simply cannot calculate the passing lanes into the right half-space. 

* **Space Exploitation Metric:** 78.4% of high-danger chances originated from channel four.
* **PPDA Compression:** The home team squeezed defensive actions down to 5.8 passes per turnover.
* **Second Half Prediction:** If the away side does not introduce an extra defensive pivot, this match is over as a contest.`,
  },
  {
    id: 'biomechanic-screamer',
    title: 'Post-Match Telestrator: 30-Yard Trivela Breakdown',
    tone: 'Biomechanical Technical Analyst',
    headline: 'THE PHYSICS BEHIND THE 119 KM/H OUTSIDE-OF-BOOT STRIKE',
    commentaryText: `**Look at this 17-point skeletal freeze-frame from the broadcast camera.** 

* **Plant Foot Deceleration:** 1,680 Newtons of ground reaction force stabilized the pelvis.
* **Knee Extension Velocity:** 640 degrees per second of angular uncoiling generated the devastating lateral Magnus curl.
* **Goalkeeper Dilemma:** The ball deviated 1.4 meters horizontally in the final 12 meters of flight. Unstoppable!`,
  },
];

export const BroadcastStudio: React.FC<BroadcastStudioProps> = ({ onAskNexus }) => {
  const [selectedScript, setSelectedScript] = useState(BROADCAST_SCRIPTS[0]);
  const [isVocalizing, setIsVocalizing] = useState(false);
  const [slowMoFrame, setSlowMoFrame] = useState(120); // 0 to 240 FPS
  const [isPlayingSlowMo, setIsPlayingSlowMo] = useState(false);
  const [copied, setCopied] = useState(false);

  // Play comment script using Riva TTS
  const handleVocalizeCommentary = () => {
    if (isVocalizing) {
      rivaController.stop();
      setIsVocalizing(false);
    } else {
      sounds.playCyberChime();
      rivaController.speak(selectedScript.commentaryText, 'commentator');
      setIsVocalizing(true);
      rivaController.setSpeechEndCallback(() => {
        setIsVocalizing(false);
      });
    }
  };

  // Slow-Mo Animation scrubber
  const togglePlaySlowMo = () => {
    if (isPlayingSlowMo) {
      setIsPlayingSlowMo(false);
    } else {
      setIsPlayingSlowMo(true);
      let f = slowMoFrame >= 240 ? 0 : slowMoFrame;
      const interval = setInterval(() => {
        f += 3;
        if (f >= 240) {
          f = 240;
          clearInterval(interval);
          setIsPlayingSlowMo(false);
        }
        setSlowMoFrame(f);
      }, 30);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(selectedScript.commentaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Title Banner */}
      <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40">
              MODULE 04
            </span>
            <span className="text-xs font-mono text-gray-400">RIVA TTS & VIDEO FRAME GENERATION</span>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800">
              HIGH-FIDELITY BROADCAST
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-white mt-1">
            Media & Fan Engagement Hub
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time broadcast scripts, pundit speech synthesis, and 240 FPS optical-flow retroactive slow-motion replays.
          </p>
        </div>

        <button
          onClick={handleVocalizeCommentary}
          className={`flex items-center space-x-2 px-5 py-2.5 font-bold font-mono text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(118,185,0,0.35)] cursor-pointer ${
            isVocalizing
              ? 'bg-amber-400 text-black hover:bg-amber-300'
              : 'bg-[#76B900] hover:bg-[#88D400] text-black'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isVocalizing ? 'STOP RIVA VOCALIZATION' : 'BROADCAST COMMENTARY READOUT'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Broadcast Script Teleprompter */}
        <div className="lg:col-span-7 space-y-3">
          {/* Preset Script Selector */}
          <div className="grid grid-cols-3 gap-2">
            {BROADCAST_SCRIPTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  if (isVocalizing) {
                    rivaController.stop();
                    setIsVocalizing(false);
                  }
                  setSelectedScript(s);
                }}
                className={`p-2.5 text-left rounded-lg border text-xs font-mono transition-all ${
                  selectedScript.id === s.id
                    ? 'bg-[#131B27] border-[#76B900] text-white shadow-[0_0_10px_rgba(118,185,0,0.2)]'
                    : 'bg-[#0A0E15] border-[#1E293B] text-gray-400 hover:text-white'
                }`}
              >
                <div className="font-bold truncate text-[11px] text-white">{s.title}</div>
                <div className="text-[9px] text-[#76B900] mt-0.5">{s.tone}</div>
              </button>
            ))}
          </div>

          {/* Teleprompter Card */}
          <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-4">
              <div className="flex items-center space-x-2">
                <Tv className="w-4 h-4 text-[#76B900]" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  NVIDIA Riva Broadcast Teleprompter
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyScript}
                  className="px-2 py-1 text-[11px] font-mono text-gray-400 hover:text-white bg-[#121822] rounded border border-gray-800 flex items-center space-x-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
            </div>

            {/* Headline Banner */}
            <div className="bg-[#141C2B] border-l-4 border-[#76B900] px-3 py-2 rounded-r mb-4">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                ON-SCREEN CHYRON / LOWER THIRD
              </span>
              <span className="text-xs font-bold font-display text-white tracking-wide">
                {selectedScript.headline}
              </span>
            </div>

            {/* Script Text */}
            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-gray-200 font-sans space-y-2">
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedScript.commentaryText
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#76B900] font-bold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-cyan-300">$1</em>')
                    .replace(/\n\n/g, '<br/><br/>'),
                }}
              />
            </div>

            {/* Action prompt */}
            <div className="mt-5 pt-3 border-t border-[#1E293B] flex justify-end">
              <button
                onClick={() => {
                  const prompt = `Act as an elite football commentator and TV tactical guest for the 2026 UEFA Champions League. Provide an energetic, high-tempo 60-second broadcast monologue dissecting the transition battle between 3-2-4-1 build-up and a 5-3-2 low-block, referencing Cosmos Vision spatial statistics and player velocity vectors.`;
                  onAskNexus(prompt, { script: selectedScript });
                }}
                className="px-3 py-1.5 bg-[#1B2738] hover:bg-[#25364D] text-[#76B900] border border-[#76B900]/40 rounded text-xs font-mono transition-colors flex items-center space-x-1"
              >
                <span>Generate Custom Live Commentary Call</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Retroactive Slow-Motion Frame Generator (240 FPS Simulator) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
              <div className="flex items-center space-x-2">
                <Film className="w-4 h-4 text-[#76B900]" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  240 FPS Video Frame Generation
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800">
                OPTICAL FLOW AI
              </span>
            </div>

            {/* Simulated Frame Screen */}
            <div className="relative aspect-[16/10] bg-[#06080D] rounded-lg border border-[#1E293B] overflow-hidden flex flex-col justify-between p-3">
              {/* Scanline overlay */}
              <div className="absolute inset-0 scanline opacity-25 pointer-events-none" />

              {/* Top HUD */}
              <div className="flex items-center justify-between text-[10px] font-mono z-10">
                <span className="text-white/80 bg-black/70 px-2 py-0.5 rounded backdrop-blur">
                  CAM-01 TACTICAL ISOLATION
                </span>
                <span className="text-[#76B900] bg-black/70 px-2 py-0.5 rounded backdrop-blur">
                  FRAME {slowMoFrame} / 240 ({(slowMoFrame / 240 * 100).toFixed(0)}%)
                </span>
              </div>

              {/* Graphic Center Visualization of Ball Impact */}
              <div className="relative flex-1 flex items-center justify-center my-2">
                {/* Visual optical flow vector lines */}
                <svg className="w-full h-full absolute inset-0">
                  <line
                    x1="20%"
                    y1="70%"
                    x2={`${20 + (slowMoFrame / 240) * 60}%`}
                    y2={`${70 - Math.sin((slowMoFrame / 240) * Math.PI) * 45}%`}
                    stroke="#76B900"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                  />
                  <circle
                    cx={`${20 + (slowMoFrame / 240) * 60}%`}
                    cy={`${70 - Math.sin((slowMoFrame / 240) * Math.PI) * 45}%`}
                    r="8"
                    fill="#FFFFFF"
                    stroke="#76B900"
                    strokeWidth="2"
                  />
                </svg>

                {/* Impact callout */}
                {slowMoFrame > 100 && slowMoFrame < 140 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 border border-[#76B900] px-3 py-1 rounded text-center backdrop-blur">
                    <span className="text-[10px] font-mono text-[#76B900] font-bold block">
                      IMPACT POINT FREEZE
                    </span>
                    <span className="text-[9px] text-gray-300 font-mono">
                      Contact Time: 0.042s • 1,640 N GRF
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Scrubber Overlay */}
              <div className="z-10 bg-black/80 p-2 rounded border border-gray-800">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                  <span>Frame Scrubber</span>
                  <span className="text-white font-bold">{slowMoFrame} / 240 FPS</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="240"
                  value={slowMoFrame}
                  onChange={(e) => setSlowMoFrame(parseInt(e.target.value))}
                  className="w-full accent-[#76B900] cursor-pointer"
                />
              </div>
            </div>

            {/* Scrubber Play Controls */}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={togglePlaySlowMo}
                className="px-3 py-1.5 bg-[#121926] hover:bg-[#1A2538] text-white border border-[#232F42] rounded text-xs font-mono flex items-center space-x-1.5 transition-colors"
              >
                {isPlayingSlowMo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingSlowMo ? 'Pause Scrubber' : 'Play 240 FPS Replay'}</span>
              </button>

              <button
                onClick={() => setSlowMoFrame(0)}
                className="px-2.5 py-1.5 bg-[#0C1018] hover:bg-[#141A26] text-gray-400 text-xs font-mono rounded flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="mt-3 text-[11px] font-mono text-gray-400 leading-relaxed bg-[#070A0F] p-2.5 rounded border border-gray-800">
              <strong className="text-[#76B900]">NVIDIA Video Frame Gen:</strong> Interpolates 17 intermediate sub-frames per broadcast standard 60i video frame via bidirectional optical flow tensors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
