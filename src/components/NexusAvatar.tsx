import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Activity, Cpu, Sparkles, Mic, MicOff } from 'lucide-react';
import { AudioBlendshapes } from '../types/nexus';
import { rivaController, sounds } from '../utils/audio2face';

interface NexusAvatarProps {
  isThinking?: boolean;
  onVoiceInput?: (transcript: string) => void;
  className?: string;
}

export const NexusAvatar: React.FC<NexusAvatarProps> = ({
  isThinking = false,
  onVoiceInput,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [blendshapes, setBlendshapes] = useState<AudioBlendshapes>({
    jawOpen: 0,
    mouthPucker: 0,
    browInnerUp: 0.1,
    eyeBlinkLeft: 0,
    eyeBlinkRight: 0,
    smileLeft: 0.15,
    smileRight: 0.15,
    cheekPuff: 0,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceVoiceType, setVoiceVoiceType] = useState<'tactical-ai' | 'commentator'>('tactical-ai');
  const [muted, setMuted] = useState(false);

  // Hook into Riva audio controller
  useEffect(() => {
    rivaController.setBlendshapeCallback((shapes) => {
      setBlendshapes(shapes);
    });

    rivaController.setSpeechEndCallback(() => {
      setIsSpeaking(false);
    });

    const checkSpeaking = () => {
      setIsSpeaking(rivaController.getIsSpeaking());
    };
    const timer = setInterval(checkSpeaking, 150);
    return () => clearInterval(timer);
  }, []);

  // Web Speech API Voice Recognition (Riva ASR simulation)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your query.');
      return;
    }

    try {
      sounds.playCyberChime();
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onVoiceInput && transcript) {
          onVoiceInput(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Canvas drawing for NVIDIA ACE 3D Face Wireframe & Hologram Mesh
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 - 6;

      angle += isThinking ? 0.05 : 0.02;

      // Outer cyber rings
      ctx.save();
      ctx.strokeStyle = isThinking ? 'rgba(118, 185, 0, 0.8)' : 'rgba(118, 185, 0, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, 64, angle, angle + Math.PI * 1.6);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 220, 130, 0.4)';
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, 72, -angle * 0.8, -angle * 0.8 + Math.PI * 1.4);
      ctx.stroke();
      ctx.restore();

      // Facial wireframe mesh points driven by blendshapes
      const jawYOffset = blendshapes.jawOpen * 14;
      const puckerOffset = blendshapes.mouthPucker * 8;
      const browYOffset = -blendshapes.browInnerUp * 6;
      const blinkScaleL = 1 - blendshapes.eyeBlinkLeft * 0.9;
      const blinkScaleR = 1 - blendshapes.eyeBlinkRight * 0.9;

      // Cybernetic Head contour
      ctx.strokeStyle = isThinking ? '#76B900' : '#4E7A00';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Forehead
      ctx.moveTo(cx - 28, cy - 35);
      ctx.quadraticCurveTo(cx, cy - 45 + browYOffset * 0.5, cx + 28, cy - 35);
      // Right cheek
      ctx.lineTo(cx + 34, cy - 6);
      ctx.lineTo(cx + 26, cy + 24);
      // Chin
      ctx.lineTo(cx + 12, cy + 38 + jawYOffset);
      ctx.lineTo(cx - 12, cy + 38 + jawYOffset);
      // Left cheek
      ctx.lineTo(cx - 26, cy + 24);
      ctx.lineTo(cx - 34, cy - 6);
      ctx.closePath();
      ctx.stroke();

      // Holographic interior fill with soft radial glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 60);
      grad.addColorStop(0, isSpeaking ? 'rgba(118, 185, 0, 0.25)' : 'rgba(118, 185, 0, 0.08)');
      grad.addColorStop(1, 'rgba(7, 9, 14, 0.95)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Eyes (Cyber HUD Visor / Retinas)
      const eyeY = cy - 10;
      // Left eye
      ctx.fillStyle = '#76B900';
      ctx.beginPath();
      ctx.ellipse(cx - 15, eyeY, 6, 4 * blinkScaleL, 0, 0, Math.PI * 2);
      ctx.fill();
      // Left pupil
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - 15, eyeY, 1.8 * blinkScaleL, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.fillStyle = '#76B900';
      ctx.beginPath();
      ctx.ellipse(cx + 15, eyeY, 6, 4 * blinkScaleR, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right pupil
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx + 15, eyeY, 1.8 * blinkScaleR, 0, Math.PI * 2);
      ctx.fill();

      // Brow line
      ctx.strokeStyle = '#76B900';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 22, eyeY - 8 + browYOffset);
      ctx.lineTo(cx - 8, eyeY - 7 + browYOffset * 1.2);
      ctx.moveTo(cx + 8, eyeY - 7 + browYOffset * 1.2);
      ctx.lineTo(cx + 22, eyeY - 8 + browYOffset);
      ctx.stroke();

      // Nose bridge
      ctx.strokeStyle = 'rgba(118, 185, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, eyeY - 3);
      ctx.lineTo(cx, cy + 6);
      ctx.lineTo(cx + 4, cy + 9);
      ctx.stroke();

      // Mouth & Audio2Face dynamic lips
      ctx.strokeStyle = '#76B900';
      ctx.lineWidth = 2;
      const mouthY = cy + 20 + jawYOffset * 0.4;
      const mouthWidth = Math.max(8, 20 - puckerOffset);

      ctx.beginPath();
      ctx.moveTo(cx - mouthWidth / 2, mouthY);
      if (blendshapes.jawOpen > 0.08) {
        ctx.quadraticCurveTo(cx, mouthY + jawYOffset * 0.9, cx + mouthWidth / 2, mouthY);
        ctx.quadraticCurveTo(cx, mouthY - jawYOffset * 0.3, cx - mouthWidth / 2, mouthY);
        ctx.fillStyle = 'rgba(118, 185, 0, 0.4)';
        ctx.fill();
      } else {
        ctx.quadraticCurveTo(cx, mouthY + (blendshapes.smileLeft + blendshapes.smileRight) * 3, cx + mouthWidth / 2, mouthY);
      }
      ctx.stroke();

      // Audio waveform equalizer when speaking
      if (isSpeaking) {
        ctx.strokeStyle = '#76B900';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const bars = 9;
        const barSpacing = 4;
        const startX = cx - (bars * barSpacing) / 2;
        for (let i = 0; i < bars; i++) {
          const barH = (Math.sin(angle * 4 + i) * 0.5 + 0.5) * 16 * (blendshapes.jawOpen + 0.2);
          ctx.moveTo(startX + i * barSpacing, cy + 54 - barH);
          ctx.lineTo(startX + i * barSpacing, cy + 54 + barH);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [blendshapes, isSpeaking, isThinking]);

  return (
    <div className={`bg-[#0A0E15]/90 border border-[#1E293B] hover:border-[#76B900]/40 transition-all rounded-xl p-4 backdrop-blur-md relative overflow-hidden ${className}`}>
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-3 border-b border-[#1E293B]/70 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#76B900] shadow-[0_0_8px_#76B900] animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-wider text-[#76B900]">
            NVIDIA ACE AUDIO2FACE
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-gray-400 bg-[#121722] px-2 py-0.5 rounded border border-gray-800">
            {isSpeaking ? 'RIVA TTS ACTIVE' : isThinking ? 'NEMOTRON REASONING' : 'READY [FP8]'}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Hologram Avatar Canvas */}
        <div className="relative flex-shrink-0">
          <canvas
            ref={canvasRef}
            width={160}
            height={160}
            className="w-36 h-36 rounded-xl bg-[#06080D] border border-[#1A2333] shadow-inner"
          />
          {/* Status badge */}
          <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
            <span className="text-[9px] font-mono tracking-widest text-[#76B900] bg-black/70 px-2 py-0.5 rounded backdrop-blur">
              {isThinking ? 'PROCESSING...' : isSpeaking ? 'VOCALIZING' : 'ACE MESH READY'}
            </span>
          </div>
        </div>

        {/* Live Blendshape Telemetry Bars */}
        <div className="flex-1 w-full space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex justify-between items-center">
            <span>Audio2Face Blendshape Weights</span>
            <span className="text-[#76B900]">{isSpeaking ? '120 FPS' : 'Idle'}</span>
          </div>

          <div className="space-y-1.5 font-mono text-[10px]">
            <div>
              <div className="flex justify-between text-gray-300 mb-0.5">
                <span>JawOpen</span>
                <span className="text-[#76B900]">{blendshapes.jawOpen.toFixed(3)}</span>
              </div>
              <div className="w-full bg-[#141A24] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#76B900] h-full transition-all duration-75"
                  style={{ width: `${Math.round(blendshapes.jawOpen * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-0.5">
                <span>MouthPucker</span>
                <span className="text-cyan-400">{blendshapes.mouthPucker.toFixed(3)}</span>
              </div>
              <div className="w-full bg-[#141A24] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-75"
                  style={{ width: `${Math.round(blendshapes.mouthPucker * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-0.5">
                <span>BrowInnerUp</span>
                <span className="text-amber-400">{blendshapes.browInnerUp.toFixed(3)}</span>
              </div>
              <div className="w-full bg-[#141A24] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-75"
                  style={{ width: `${Math.round(blendshapes.browInnerUp * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-0.5">
                <span>Smile (Bilat)</span>
                <span className="text-emerald-400">{blendshapes.smileLeft.toFixed(3)}</span>
              </div>
              <div className="w-full bg-[#141A24] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-75"
                  style={{ width: `${Math.round(blendshapes.smileLeft * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls: Audio synthesis & ASR Mic input */}
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-[#1E293B]">
            <button
              onClick={() => {
                if (isSpeaking) {
                  rivaController.stop();
                  setIsSpeaking(false);
                } else {
                  rivaController.speak(
                    "NEXUS-9 tactical core initialized. Omniverse physical simulation and Cosmos Vision tracking operational. Ready for match deconstruction.",
                    voiceVoiceType
                  );
                  setIsSpeaking(true);
                }
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded flex items-center space-x-1.5 transition-colors ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30 hover:bg-[#76B900]/25'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Halt Voice' : 'Test Riva TTS'}</span>
            </button>

            {/* Mic input button for Riva ASR */}
            <button
              onClick={toggleListening}
              className={`px-2.5 py-1 text-xs font-mono rounded flex items-center space-x-1.5 transition-colors ${
                isListening
                  ? 'bg-red-500/20 text-red-300 border border-red-500 animate-pulse'
                  : 'bg-[#182232] text-gray-300 border border-gray-700 hover:border-gray-500'
              }`}
              title="Voice Query via Web Speech / Riva ASR"
            >
              {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isListening ? 'Listening...' : 'Riva Voice Mic'}</span>
            </button>

            {/* Voice persona selector */}
            <select
              value={voiceVoiceType}
              onChange={(e) => setVoiceVoiceType(e.target.value as any)}
              className="bg-[#121824] text-xs font-mono text-gray-300 border border-gray-800 rounded px-2 py-1 focus:outline-none focus:border-[#76B900]"
            >
              <option value="tactical-ai">ACE Tactical Voice</option>
              <option value="commentator">Broadcast Pundit Mode</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
