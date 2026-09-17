import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface SpeakableTextProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  rate?: number; // Default 0.88 for SLCN accessibility
  showText?: boolean;
}

/**
 * ============================================================================
 * SPEAKABLE TEXT COMPONENT (V22 SLCN-Aware Accessibility Directive 1)
 * ============================================================================
 * Enables calm, clear text-to-speech for body copy, grounding cards, support
 * plans, and AI chat replies to support Speech, Language and Communication Needs.
 * ============================================================================
 */
export const SpeakableText: React.FC<SpeakableTextProps> = ({
  text,
  children,
  className = '',
  buttonClassName = '',
  rate = 0.88,
  showText = true,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isSupported || typeof window === 'undefined') return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const plainText = text.replace(/[*_#`[\]()]/g, '').trim();
    if (!plainText) return;

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-GB';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {showText && (children || <span>{text}</span>)}
      {isSupported && (
        <button
          type="button"
          onClick={handleToggleSpeech}
          title={isSpeaking ? 'Stop speaking' : 'Read aloud (Text-to-speech)'}
          aria-label={isSpeaking ? 'Stop reading aloud' : 'Read text aloud'}
          className={`inline-flex items-center justify-center p-1 rounded-lg transition-colors shrink-0 ${
            isSpeaking
              ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40 animate-pulse'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          } ${buttonClassName}`}
        >
          {isSpeaking ? (
            <VolumeX className="w-3.5 h-3.5 text-sky-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </span>
  );
};
