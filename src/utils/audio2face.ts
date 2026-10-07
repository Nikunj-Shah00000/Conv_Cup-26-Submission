import { AudioBlendshapes } from '../types/nexus';

// Web Audio synthesizer for futuristic NVIDIA sound cues
class SoundEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  // High-tech NVIDIA boot/ready chime
  playCyberChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.28);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio context may be restricted before user interaction
    }
  }

  // Tactical scanning pulse
  playTacticalScan() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.15);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }
}

export const sounds = new SoundEngine();

export class RivaAudioController {
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private blendshapeInterval: any = null;
  private onBlendshapesUpdate: ((shapes: AudioBlendshapes) => void) | null = null;
  private onSpeechEnd: (() => void) | null = null;

  constructor() {}

  setBlendshapeCallback(cb: (shapes: AudioBlendshapes) => void) {
    this.onBlendshapesUpdate = cb;
  }

  setSpeechEndCallback(cb: () => void) {
    this.onSpeechEnd = cb;
  }

  speak(text: string, voiceType: 'tactical-ai' | 'commentator' = 'tactical-ai') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    this.stop();

    // Clean markdown syntax for speech
    const cleanText = text
      .replace(/[*#_`~\[\]]/g, '')
      .replace(/\|.*?\|/g, '') // remove markdown tables
      .replace(/\n\s*\n/g, '. ')
      .trim();

    if (!cleanText) return;

    sounds.playCyberChime();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    // Pick suitable english voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (
        voiceType === 'commentator' ? (v.name.includes('UK') || v.name.includes('British') || v.name.includes('Male')) : (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Alex'))
      )
    ) || voices.find(v => v.lang.startsWith('en')) || null;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = voiceType === 'commentator' ? 1.15 : 1.05;
    utterance.pitch = voiceType === 'commentator' ? 1.0 : 0.95;

    this.isSpeaking = true;
    this.startBlendshapeAnimation();

    utterance.onend = () => {
      this.isSpeaking = false;
      this.stopBlendshapeAnimation();
      if (this.onSpeechEnd) this.onSpeechEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.stopBlendshapeAnimation();
      if (this.onSpeechEnd) this.onSpeechEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.stopBlendshapeAnimation();
    if (this.onSpeechEnd) this.onSpeechEnd();
  }

  getIsSpeaking() {
    return this.isSpeaking;
  }

  private startBlendshapeAnimation() {
    let tick = 0;
    this.blendshapeInterval = setInterval(() => {
      if (!this.isSpeaking) {
        this.stopBlendshapeAnimation();
        return;
      }
      tick++;
      // Simulate realistic speech blendshapes driven by phonemes
      const jaw = Math.min(1, Math.max(0, Math.sin(tick * 0.4) * 0.5 + Math.random() * 0.4 + 0.1));
      const pucker = Math.min(1, Math.max(0, Math.cos(tick * 0.3) * 0.4 + 0.2));
      const brow = Math.sin(tick * 0.1) * 0.3 + 0.2;
      const blink = Math.random() > 0.92 ? 0.9 : 0.05;
      const smile = Math.min(0.5, Math.max(0.1, 0.2 + Math.sin(tick * 0.05) * 0.15));

      if (this.onBlendshapesUpdate) {
        this.onBlendshapesUpdate({
          jawOpen: +jaw.toFixed(3),
          mouthPucker: +pucker.toFixed(3),
          browInnerUp: +brow.toFixed(3),
          eyeBlinkLeft: +blink.toFixed(3),
          eyeBlinkRight: +blink.toFixed(3),
          smileLeft: +smile.toFixed(3),
          smileRight: +smile.toFixed(3),
          cheekPuff: +(Math.random() * 0.15).toFixed(3)
        });
      }
    }, 60);
  }

  private stopBlendshapeAnimation() {
    if (this.blendshapeInterval) {
      clearInterval(this.blendshapeInterval);
      this.blendshapeInterval = null;
    }
    if (this.onBlendshapesUpdate) {
      this.onBlendshapesUpdate({
        jawOpen: 0,
        mouthPucker: 0,
        browInnerUp: 0.1,
        eyeBlinkLeft: 0,
        eyeBlinkRight: 0,
        smileLeft: 0.15,
        smileRight: 0.15,
        cheekPuff: 0
      });
    }
  }
}

export const rivaController = new RivaAudioController();
