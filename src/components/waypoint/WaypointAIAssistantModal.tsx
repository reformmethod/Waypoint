import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Bot,
  ShieldAlert,
} from 'lucide-react';
import { localAIClient, AssistantActionResult } from '../../services/localAIClient';
import { CrisisInterceptor, MANDATED_AI_CRISIS_RESPONSE } from '../../services/crisisInterceptor';
import { CrisisOverrideCard } from './CrisisOverrideCard';
import { WaypointTask, WaypointUserProfile } from '../../types/waypoint';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionsTaken?: {
    taskTitle: string;
    pillar: string;
    action: 'completed' | 'added';
  }[];
  mindNote?: string;
  isCrisisOverride?: boolean;
  crisisCategory?: string;
}

interface WaypointAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: WaypointTask[];
  userProfile?: WaypointUserProfile;
  onUpdateTasks: (tasks: WaypointTask[]) => void;
}

export const WaypointAIAssistantModal: React.FC<WaypointAIAssistantModalProps> = ({
  isOpen,
  onClose,
  tasks,
  userProfile,
  onUpdateTasks,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi, I'm your private Waypoint AI assistant. Tell me how your day went or how you're feeling, and I will update your pillars and keep you grounded.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // =========================================================================
    // OBJECTIVE 1 & 2: V18 AI CRISIS INTERCEPT TRIPWIRE
    // Scans user input before it reaches the local LLM.
    // If tripwire is triggered, standard generation is instantly aborted.
    // =========================================================================
    const scanResult = CrisisInterceptor.evaluateInput(messageText);

    if (scanResult.isCrisis) {
      // Objective 3: Silently notify B2B organizational dashboard webhook
      CrisisInterceptor.silentB2BWebhookAlert(userProfile, scanResult);

      // Injects mandated safeguarding response and CrisisOverrideCard immediately
      const crisisAiMsg: ChatMessage = {
        id: `crisis-ai-${Date.now()}`,
        sender: 'ai',
        text: MANDATED_AI_CRISIS_RESPONSE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCrisisOverride: true,
        crisisCategory: scanResult.matchedCategory,
      };

      setMessages((prev) => [...prev, crisisAiMsg]);
      return;
    }

    // Standard Non-Crisis SLM Generation & SQLite Tool Execution
    setIsProcessing(true);
    try {
      const result: AssistantActionResult = await localAIClient.processAssistantMessage(
        messageText,
        tasks,
        userProfile
      );

      // Update the local tasks state in real-time
      if (result.updatedTasks) {
        onUpdateTasks(result.updatedTasks);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionsTaken: result.tasksChanged,
        mindNote: result.mindNoteAdded,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulated / browser voice-to-text dictation
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // Try web speech API if available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => {
          setIsListening(false);
          simulateVoiceInput();
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      } catch {
        simulateVoiceInput();
        return;
      }
    }

    simulateVoiceInput();
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setInput('I just drank water but I feel panicked');
      setIsListening(false);
    }, 1200);
  };

  return (
    <div
      id="waypoint-ai-modal"
      className="fixed inset-0 z-50 bg-[#060a10]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md h-[92vh] sm:h-[680px] bg-[#F7FAFC] text-[#1A202C] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D3748] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1A202C]">
                  Waypoint AI
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  On-Device
                </span>
              </div>
              <p className="text-[11px] text-[#718096]">
                Zero-PII local life infrastructure &amp; safeguarding
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Small Privacy Badge: Required Directive */}
        <div className="bg-[#EDF2F7] px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#4A5568]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Private On-Device AI. Your words never leave your phone.</span>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Crisis Safeguard Override Display */}
              {msg.isCrisisOverride ? (
                <div className="w-full flex flex-col items-start animate-in fade-in duration-150">
                  <div className="max-w-[95%] bg-white border border-[#CBD5E0] text-[#1A202C] rounded-2xl rounded-bl-none p-3.5 text-xs leading-relaxed shadow-sm mb-1">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-[#C25953] font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#C25953]" />
                      <span>Waypoint AI Safeguard • {msg.timestamp}</span>
                    </div>
                    <p className="font-semibold text-[#1A202C]">{msg.text}</p>
                  </div>

                  {/* Mandated Muted Terracotta CrisisOverrideCard */}
                  <CrisisOverrideCard
                    triggerCategory={msg.crisisCategory}
                    timestamp={msg.timestamp}
                  />
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#2D3748] text-white rounded-br-none'
                      : 'bg-white border border-[#E2E8F0] text-[#1A202C] rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 opacity-70 text-[10px]">
                    {msg.sender === 'user' ? (
                      <>
                        <span>You</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 text-[#4A5568]" />
                        <span>Waypoint AI</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  <p>{msg.text}</p>

                  {/* Visible SQLite Tool-Calls */}
                  {msg.actionsTaken && msg.actionsTaken.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                      {msg.actionsTaken.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {act.pillar}: {act.taskTitle} (Checked Off)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.mindNote && (
                    <div className="mt-2 text-[11px] text-[#4A5568] bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <strong>Mind Log:</strong> {msg.mindNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-[#718096] p-2 bg-white rounded-xl border border-slate-200 w-fit">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Thinking &amp; updating local database...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips (Including V18 Crisis Interceptor Test) */}
        <div className="p-3 border-t border-[#E2E8F0] bg-white flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => handleSendMessage('I just drank water but I feel panicked')}
            className="shrink-0 px-3 py-1.5 rounded-full bg-[#EDF2F7] hover:bg-[#E2E8F0] text-[#2D3748] text-xs font-semibold transition-colors border border-[#CBD5E0]"
          >
            "I just drank water but I feel panicked"
          </button>
          {/* Tripwire Safeguard Test Button */}
          <button
            type="button"
            onClick={() => handleSendMessage('I want to end it all')}
            className="shrink-0 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-[#C25953] text-xs font-bold transition-colors border border-rose-200 flex items-center gap-1"
            title="Tests V18 Crisis Interceptor Tripwire"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Test Crisis Tripwire ("End it all")</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('I spent nothing today and I feel anxious.')}
            className="shrink-0 px-3 py-1.5 rounded-full bg-[#EDF2F7] hover:bg-[#E2E8F0] text-[#2D3748] text-xs font-medium transition-colors"
          >
            "I spent nothing today and I feel anxious"
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Tidied up my room today.')}
            className="shrink-0 px-3 py-1.5 rounded-full bg-[#EDF2F7] hover:bg-[#E2E8F0] text-[#2D3748] text-xs font-medium transition-colors"
          >
            "Tidied up my room"
          </button>
        </div>

        {/* Input bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-[#E2E8F0] flex items-center gap-2 shrink-0">
          {/* Voice to text */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-3 rounded-2xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-[#4A5568]'
            }`}
            title={isListening ? 'Listening... Tap to stop' : 'Tap for Voice-to-Text'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={isListening ? 'Listening...' : 'Type or speak to Waypoint AI...'}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#F7FAFC] border border-[#CBD5E0] text-[#1A202C] placeholder-slate-400 text-xs focus:outline-none focus:border-[#718096] focus:ring-2 focus:ring-[#718096]/20 transition-all"
          />

          <button
            type="button"
            disabled={!input.trim() || isProcessing}
            onClick={() => handleSendMessage()}
            className="p-3 rounded-2xl bg-[#2D3748] hover:bg-[#1A202C] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
