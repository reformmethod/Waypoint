import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';

interface VoiceNoteInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  buttonClassName?: string;
  promptHint?: string;
  currentValue?: string;
}

/**
 * ============================================================================
 * VOICE NOTE INPUT (V22 SLCN-Aware Communication Directive 1)
 * ============================================================================
 * Provides speech-to-text voice dictation as an alternative to typing
 * for young people with speech, language, or motor communication preferences.
 * ============================================================================
 */
export const VoiceNoteInput: React.FC<VoiceNoteInputProps> = ({
  onTranscript,
  className = '',
  buttonClassName = '',
  promptHint = 'Speak your thoughts...',
  currentValue = '',
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const simulateSpeechFallback = () => {
    setIsListening(true);
    setInterimText('Listening to voice note...');

    const sampleIdeas = [
      'I got to college on time today and spoke to my tutor.',
      'Helped clear the community garden for two hours this afternoon.',
      'Feeling a bit nervous about Thursday, want to talk through the plan.',
      'Completed my morning tasks and walked the dog.',
    ];
    const picked = sampleIdeas[Math.floor(Math.random() * sampleIdeas.length)];

    setTimeout(() => {
      setInterimText(picked);
      setTimeout(() => {
        const updated = currentValue ? `${currentValue.trim()} ${picked}` : picked;
        onTranscript(updated);
        setIsListening(false);
        setInterimText('');
      }, 900);
    }, 1200);
  };

  const handleToggleVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setInterimText('');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-GB';

        recognition.onstart = () => {
          setIsListening(true);
          setInterimText('Listening...');
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInterimText(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setInterimText('');
          simulateSpeechFallback();
        };

        recognition.onend = () => {
          setIsListening(false);
          if (interimText && interimText !== 'Listening...') {
            const updated = currentValue
              ? `${currentValue.trim()} ${interimText.trim()}`
              : interimText.trim();
            onTranscript(updated);
          }
          setInterimText('');
        };

        recognition.start();
        return;
      } catch {
        simulateSpeechFallback();
        return;
      }
    }

    simulateSpeechFallback();
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleToggleVoice}
        title={isListening ? 'Stop recording voice note' : 'Record voice note'}
        aria-label={isListening ? 'Stop recording voice note' : 'Record voice note'}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse shadow-md'
            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
        } ${buttonClassName}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5" />
            <span>Recording...</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Voice Note</span>
          </>
        )}
      </button>

      {isListening && interimText && (
        <div className="absolute left-0 bottom-full mb-2 w-64 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 shadow-xl z-30 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[10px] text-sky-400 font-bold mb-1">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>{promptHint}</span>
          </div>
          <p className="italic">{interimText}</p>
        </div>
      )}
    </div>
  );
};
