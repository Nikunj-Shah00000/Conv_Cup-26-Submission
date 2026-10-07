import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Radio,
  Eye,
  Tv,
  Users,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  activeModule: number;
  setActiveModule: (mod: number) => void;
  showAvatar: boolean;
  setShowAvatar: (show: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  setActiveModule,
  showAvatar,
  setShowAvatar,
}) => {
  const [latency, setLatency] = useState(12.4);

  // Subtle real-time jitter simulation for TensorRT-LLM TTFT
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(+(11.8 + Math.random() * 1.2).toFixed(1));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const modules = [
    { id: 1, name: 'Tactical Analysis', sub: 'Cosmos Vision & cuOpt', icon: Compass },
    { id: 2, name: 'Virtual Biomechanics', sub: 'Isaac Sim Physical AI', icon: Activity },
    { id: 3, name: 'Predictive Simulations', sub: 'Nemotron Debate', icon: Cpu },
    { id: 4, name: 'Broadcast Studio', sub: 'Riva Media Hub', icon: Tv },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#07090E]/95 border-b border-[#1A2333] backdrop-blur-md">
      {/* Top Telemetry Strip */}
      <div className="bg-[#05060A] px-4 py-1.5 border-b border-[#121824] flex flex-wrap items-center justify-between text-[10px] font-mono text-gray-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#76B900] shadow-[0_0_6px_#76B900] animate-pulse" />
            <strong className="text-white">NVIDIA ECOSYSTEM:</strong>
            <span className="text-[#76B900]">ONLINE</span>
          </span>
          <span className="hidden md:inline text-gray-600">|</span>
          <span className="hidden md:inline">COMPUTE: <strong>BLACKWELL B200 TENSOR CORE</strong></span>
          <span className="hidden md:inline text-gray-600">|</span>
          <span className="hidden md:inline">PRECISION: <strong className="text-cyan-400">FP8 TENSORRT-LLM</strong></span>
        </div>

        <div className="flex items-center space-x-3">
          <span>
            TTFT: <strong className="text-[#76B900]">{latency} ms</strong>
          </span>
          <span className="text-gray-600">|</span>
          <span>
            PHYSICS: <strong className="text-emerald-400">240 HZ</strong>
          </span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center space-x-1 text-blue-400">
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">NeMo Guardrails Active</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          {/* Futuristic NVIDIA style emblem */}
          <div className="w-10 h-10 rounded-lg bg-[#0E1520] border-2 border-[#76B900] flex items-center justify-center shadow-[0_0_15px_rgba(118,185,0,0.4)]">
            <span className="font-display font-extrabold text-[#76B900] text-lg tracking-tighter">
              N9
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-black text-lg text-white tracking-wide">
                NEXUS-9
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40 font-bold">
                PRO 2026
              </span>
            </div>
            <p className="text-[11px] font-mono text-gray-400 tracking-tight">
              NVIDIA-Powered Intelligent AI Soccer Agent
            </p>
          </div>
        </div>

        {/* Module Tab Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-[#0C111A] p-1 rounded-xl border border-[#1A2435] overflow-x-auto max-w-full">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`px-3 py-2 rounded-lg font-mono text-xs flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#76B900] text-black font-bold shadow-[0_0_12px_rgba(118,185,0,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#141C2A]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className="leading-tight">{m.name}</div>
                  <div className={`text-[9px] hidden sm:block ${isActive ? 'text-black/80' : 'text-gray-500'}`}>
                    {m.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Avatar HUD Toggle */}
        <div className="hidden lg:flex items-center space-x-2">
          <button
            onClick={() => setShowAvatar(!showAvatar)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center space-x-1.5 ${
              showAvatar
                ? 'bg-[#76B900]/15 text-[#76B900] border-[#76B900]/40'
                : 'bg-[#0E1522] text-gray-400 border-gray-800 hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${showAvatar ? 'animate-pulse text-[#76B900]' : ''}`} />
            <span>{showAvatar ? 'Audio2Face HUD On' : 'Audio2Face HUD Off'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
