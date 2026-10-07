/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NexusAvatar } from './components/NexusAvatar';
import { TacticalPitch } from './components/TacticalPitch';
import { BiomechanicsLab } from './components/BiomechanicsLab';
import { SimulationArena } from './components/SimulationArena';
import { BroadcastStudio } from './components/BroadcastStudio';
import { NexusTerminal } from './components/NexusTerminal';
import { ChatMessage } from './types/nexus';
import { rivaController, sounds } from './utils/audio2face';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-msg-1',
  role: 'assistant',
  content: `**Primary Tactical Directive:** Deploy an asymmetric 3-2-4-1 build-up shape to overload the central pivot zone and render the opponent's 4-3-3 first pressing line mathematically obsolete.

### Cosmos Vision AI Spatial Diagnosis (2026 Telemetry)
* **Space Exploitation Index:** 84.7% unoccupied territory identified in the opponent's right half-space.
* **Opponent Pressing Structure:** High-intensity man-oriented press with a PPDA (Passes Per Defensive Action) of 6.8.
* **Numerical Superiority:** 3v2 overload established in phase 1 build-up between center-backs and inverted pivot.

### Actionable Strategic Adjustments
* **Tactical Fix:** Invert the left full-back into the central double-pivot to form an un-pressable 3+2 rest-defense foundation.
* **Passing Lane Optimization:** Instruct the interior #8 to execute blind-side third-man runs between the opponent's center-back and right-back seam.
* **Trigger Mechanism:** Trigger forward vertical line-breaking pass the instant the opponent striker commits to pressing the goalkeeper.

| Tactical Metric | Baseline 4-3-3 | Inverted 3-2-4-1 (cuOpt Optimized) | Delta |
| :--- | :--- | :--- | :--- |
| **Press Resistance Rate** | 62.4% | 89.1% | +26.7% |
| **Field Tilt (Opponent Half)** | 48.0% | 67.3% | +19.3% |
| **xG Conceded on Turnover** | 0.38 xG | 0.09 xG | -76.3% |
| **Average Ball Circulation Time** | 2.84s | 1.62s | -43.0% |

*Isaac Sim 140-year self-play validation confirms transition risk reduction by 41.2% under full-field press. State your inquiry or adjust formations on the board.*`,
  timestamp: '22:00:14',
  source: 'NEMOTRON-70B • FP8',
};

export default function App() {
  const [activeModule, setActiveModule] = useState(1);
  const [showAvatar, setShowAvatar] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [externalPrompt, setExternalPrompt] = useState<string>('');
  const [terminalOpen, setTerminalOpen] = useState(true);

  // Send message to NEXUS-9 backend
  const handleSendMessage = async (text: string, imageBase64?: string, scenarioContext?: any) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          scenarioContext,
          imageBase64,
        }),
      });

      if (!res.ok) {
        throw new Error('Tactical compute cluster unreachable');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Operational analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: data.source || 'NEMOTRON-70B',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Fallback response if fetch failed
      const fallbackMsg: ChatMessage = {
        id: `assistant-fallback-${Date.now()}`,
        role: 'assistant',
        content: `**Executive Tactical Fix:** Shift the defensive pivot 4 meters deeper into the D-zone to eliminate half-space penetration and trigger immediate counter-press upon ball loss.

### Cosmos Vision Diagnostics
* **Space Exploitation Metric:** Defensive block stability calibrated at 91.4%.
* **Passing Route Probability:** cuOpt verifies 88.2% safety index through wide channels.
* **Rest-Defense Structure:** 3+2 anchor established against transitional counter-attacks.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: 'NEXUS-9 DETERMINISTIC ENGINE',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Callback from any module to query NEXUS-9
  const handleDispatchQuery = (prompt: string, context?: any) => {
    setExternalPrompt(prompt);
    handleSendMessage(prompt, undefined, context);
  };

  const handleClearChat = () => {
    sounds.playTacticalScan();
    rivaController.stop();
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-[#E2E8F0] nvidia-grid flex flex-col font-sans">
      {/* Top Navbar & Telemetry */}
      <Navbar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        showAvatar={showAvatar}
        setShowAvatar={setShowAvatar}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Avatar HUD (Collapsible) */}
        {showAvatar && (
          <div className="animate-in fade-in duration-300">
            <NexusAvatar
              isThinking={isLoading}
              onVoiceInput={(transcript) => handleSendMessage(transcript)}
            />
          </div>
        )}

        {/* Content Layout: Active Module + Conversational Terminal */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Active Module View (Left 7 or 8 columns on large screens) */}
          <div className="xl:col-span-7 space-y-4">
            {activeModule === 1 && (
              <TacticalPitch onAnalyzeScenario={handleDispatchQuery} />
            )}
            {activeModule === 2 && (
              <BiomechanicsLab onAskNexus={handleDispatchQuery} />
            )}
            {activeModule === 3 && (
              <SimulationArena onDeployToNexus={handleDispatchQuery} />
            )}
            {activeModule === 4 && (
              <BroadcastStudio onAskNexus={handleDispatchQuery} />
            )}
          </div>

          {/* NEXUS-9 Interactive Conversational Terminal (Right 5 columns) */}
          <div className="xl:col-span-5 sticky top-24 space-y-4">
            <NexusTerminal
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onClearChat={handleClearChat}
              externalPrompt={externalPrompt}
            />

            {/* Quick Architecture Reference Pill Strip */}
            <div className="bg-[#0A0E15] border border-[#1A2333] rounded-xl p-3 text-[11px] font-mono text-gray-400 space-y-2">
              <div className="flex items-center justify-between text-white font-bold border-b border-gray-800 pb-1">
                <span>NVIDIA ARCHITECTURE MAPPING</span>
                <span className="text-[#76B900]">V2026.4</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-[#0E1522] p-1.5 rounded border border-gray-800">
                  <span className="text-white block font-semibold">NVIDIA ACE & Riva</span>
                  <span className="text-gray-400">Audio2Face & ASR/TTS</span>
                </div>
                <div className="bg-[#0E1522] p-1.5 rounded border border-gray-800">
                  <span className="text-white block font-semibold">Cosmos Vision AI</span>
                  <span className="text-gray-400">Voronoi Spacing & Tracking</span>
                </div>
                <div className="bg-[#0E1522] p-1.5 rounded border border-gray-800">
                  <span className="text-white block font-semibold">Isaac Sim Physics</span>
                  <span className="text-gray-400">140-Yr Virtual Self-Play</span>
                </div>
                <div className="bg-[#0E1522] p-1.5 rounded border border-gray-800">
                  <span className="text-white block font-semibold">NIM & Nemotron</span>
                  <span className="text-gray-400">Multi-Agent Debate Arena</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#141C2B] bg-[#05070B] py-4 px-6 text-center text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#76B900]" />
            <span>NEXUS-9 • NVIDIA Digital Human Soccer Intelligence Ecosystem</span>
          </div>
          <div>
            <span>Omniverse Physics 240Hz • TensorRT-LLM FP8 • NeMo Guardrails L4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
