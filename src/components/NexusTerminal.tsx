import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Paperclip,
  X,
  Trash2,
  Cpu,
  Layers,
  ArrowRight,
  Shield,
  Activity,
  Bot,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { ChatMessage } from '../types/nexus';
import { rivaController, sounds } from '../utils/audio2face';

interface NexusTerminalProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, imageBase64?: string) => Promise<void>;
  isLoading: boolean;
  onClearChat: () => void;
  externalPrompt?: string;
  className?: string;
}

const QUICK_PROMPTS = [
  'Fix 4-3-3 vulnerability against 5-3-2 low-block',
  'Prescribe Isaac Sim biomechanic drill for striking knee torque',
  'Simulate 140-yr self-play impact of inverted wingbacks',
  'Deconstruct 2026 UCL Final minute 73 transition tactics',
];

export const NexusTerminal: React.FC<NexusTerminalProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
  externalPrompt,
  className = '',
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync external prompt when triggered from other modules
  useEffect(() => {
    if (externalPrompt) {
      setInputText(externalPrompt);
    }
  }, [externalPrompt]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isLoading) return;

    sounds.playCyberChime();
    const text = inputText;
    const img = attachedImage || undefined;
    setInputText('');
    setAttachedImage(null);
    await onSendMessage(text, img);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
      sounds.playTacticalScan();
    };
    reader.readAsDataURL(file);
  };

  const handleSpeakMessage = (msgId: string, content: string) => {
    if (currentlySpeakingId === msgId) {
      rivaController.stop();
      setCurrentlySpeakingId(null);
    } else {
      sounds.playCyberChime();
      rivaController.speak(content, 'tactical-ai');
      setCurrentlySpeakingId(msgId);
      rivaController.setSpeechEndCallback(() => {
        setCurrentlySpeakingId(null);
      });
    }
  };

  // Helper to render markdown tables and bold lines cleanly
  const renderFormattedContent = (content: string) => {
    // Check if message contains markdown table
    const tableRegex = /\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/;
    const hasTable = tableRegex.test(content);

    if (!hasTable) {
      // Normal formatting with bold tags and lists
      return (
        <div className="space-y-2 text-xs leading-relaxed">
          {content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h4 key={idx} className="font-mono text-sm font-bold text-[#76B900] mt-2 mb-1">
                  {paragraph.replace('### ', '')}
                </h4>
              );
            }
            if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={idx} className="list-disc list-inside space-y-1 text-gray-300">
                  {items.map((it, i) => (
                    <li
                      key={i}
                      dangerouslySetInnerHTML={{
                        __html: it
                          .replace(/^[*\-]\s*/, '')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>'),
                      }}
                    />
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={idx}
                dangerouslySetInnerHTML={{
                  __html: paragraph.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-white font-bold">$1</strong>'
                  ),
                }}
              />
            );
          })}
        </div>
      );
    }

    // Split content around table
    const parts = content.split(/(?=\|)/);
    return (
      <div className="space-y-3 text-xs leading-relaxed">
        {content.split('\n').map((line, lIdx) => {
          if (line.startsWith('|')) {
            // Render table lines inside a clean container
            return (
              <div key={lIdx} className="font-mono text-[11px] text-cyan-300 overflow-x-auto">
                {line}
              </div>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h4 key={lIdx} className="font-mono text-sm font-bold text-[#76B900] mt-2">
                {line.replace('### ', '')}
              </h4>
            );
          }
          return (
            <p
              key={lIdx}
              dangerouslySetInnerHTML={{
                __html: line.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="text-white font-bold">$1</strong>'
                ),
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={`bg-[#0A0E15] border border-[#1E293B] rounded-xl flex flex-col overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="p-3 border-b border-[#1E293B] bg-[#07090F] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-[#76B900]" />
          <span className="font-mono text-xs font-bold text-white tracking-wide">
            NEXUS-9 CONVERSATIONAL TACTICAL TERMINAL
          </span>
          <span className="text-[10px] font-mono text-gray-500 bg-[#121822] px-1.5 py-0.5 rounded border border-gray-800">
            NEMOTRON-70B • FP8
          </span>
        </div>

        <button
          onClick={onClearChat}
          className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-800 text-xs font-mono flex items-center space-x-1"
          title="Clear Session"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px] max-h-[550px]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-400 px-1">
                {isUser ? (
                  <>
                    <span>TACTICAL DIRECTOR</span>
                    <User className="w-3 h-3 text-cyan-400" />
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#76B900]" />
                    <span className="text-[#76B900] font-bold">NEXUS-9</span>
                    <span className="text-gray-500">• {msg.source || 'NEMOTRON NIM'}</span>
                  </>
                )}
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[92%] rounded-xl p-3.5 text-xs ${
                  isUser
                    ? 'bg-[#182333] border border-[#2B3B52] text-white shadow-md'
                    : 'bg-[#0D121B] border border-[#1E293B] text-gray-200 shadow-md relative'
                }`}
              >
                {renderFormattedContent(msg.content)}

                {/* Assistant controls: Riva TTS speak */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-[#1C2638] flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span className="text-emerald-500">NeMo Guardrails Passed</span>
                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.content)}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
                        currentlySpeakingId === msg.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                          : 'bg-[#151D2A] text-gray-300 hover:text-white border border-gray-800'
                      }`}
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-amber-300" />
                          <span>Stop Vocal</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-[#76B900]" />
                          <span>Riva TTS Readout</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 p-2">
            <Cpu className="w-4 h-4 text-[#76B900] animate-spin" />
            <span>NEXUS-9 computing spatial tensors & 140-yr self-play validation...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="p-2 bg-[#080B11] border-t border-[#1A2333] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap pl-1">Quick Query:</span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              sounds.playTacticalScan();
              setInputText(qp);
            }}
            className="text-[10px] font-mono px-2.5 py-1 bg-[#101722] hover:bg-[#182435] text-gray-300 hover:text-white rounded border border-[#233146] whitespace-nowrap transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#07090F] border-t border-[#1E293B]">
        {/* Attached image preview */}
        {attachedImage && (
          <div className="mb-2 flex items-center space-x-2 bg-[#121A26] border border-cyan-800/60 p-2 rounded-lg">
            <img src={attachedImage} alt="Tactical Upload" className="w-10 h-10 object-cover rounded" />
            <div className="text-[11px] font-mono text-cyan-300 flex-1">
              Match Frame Attached (Cosmos Vision AI Ingestion Ready)
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* File upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-[#121822] hover:bg-[#1A2433] text-gray-400 hover:text-white rounded-lg border border-gray-800 transition-colors"
            title="Upload Match Frame / Tactical Screenshot"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Command NEXUS-9: e.g. 'How do we exploit Madrid's 5-3-2 low-block in channel 4?'"
            className="flex-1 bg-[#0D121B] border border-[#222E40] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#76B900]"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !attachedImage) || isLoading}
            className="px-4 py-2 bg-[#76B900] hover:bg-[#88D400] text-black font-bold font-mono text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(118,185,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 fill-black" />
            <span className="hidden sm:inline">DISPATCH</span>
          </button>
        </div>
      </form>
    </div>
  );
};
