import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Mic, 
  MicOff, 
  X, 
  Sparkles,
  ArrowUp
} from 'lucide-react';
import { speechService } from '../utils/speech';
import { soundFx } from '../utils/sound';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onStopStreaming?: () => void;
  isStreaming: boolean;
  soundEnabled: boolean;
  suggestedPrompts?: { title: string; prompt: string }[];
  onSelectPrompt?: (prompt: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  soundEnabled,
  suggestedPrompts = [],
  onSelectPrompt,
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    if (soundEnabled) soundFx.playSend();
    onSendMessage(trimmed);
    setText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Avoid triggering during IME composition (e.g. mobile keyboards or non-Latin input)
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!speechService.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please try Chrome, Edge or Safari.');
      return;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        text,
        (updatedFullText) => {
          setText(updatedFullText);
        },
        () => setIsListening(false),
        (err) => {
          console.error('Speech error:', err);
          setIsListening(false);
        }
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4 sm:pb-6">
      {/* Horizontal Prompt suggestions pills (if any) */}
      {suggestedPrompts.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2.5 scrollbar-none no-scrollbar">
          <div className="flex items-center space-x-1.5 text-[11px] font-medium text-sage-500 dark:text-sage-400 pl-1">
            <Sparkles size={12} className="text-sage-500" />
            <span>Try:</span>
          </div>
          {suggestedPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (onSelectPrompt) onSelectPrompt(item.prompt);
                else {
                  setText(item.prompt);
                  textareaRef.current?.focus();
                }
                if (soundEnabled) soundFx.playClick();
              }}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/90 dark:bg-forest-900 border border-sage-200 dark:border-forest-800 text-sage-800 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-forest-800 hover:border-sage-300 dark:hover:border-forest-700 transition-all shadow-xs"
            >
              {item.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Dock */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white dark:bg-forest-900 border border-sage-200/90 dark:border-forest-800 shadow-lg shadow-sage-900/5 focus-within:border-sage-500 dark:focus-within:border-sage-500 focus-within:ring-2 focus-within:ring-sage-500/20 transition-all">
        {/* Listening Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-sage-100/90 dark:bg-forest-800 border-b border-sage-200 dark:border-forest-700 rounded-t-2xl sm:rounded-t-3xl text-xs text-sage-800 dark:text-sage-200">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="font-medium">Listening to your voice... Speak clearly</span>
            </div>
            <button
              onClick={toggleSpeechRecognition}
              className="text-sage-500 hover:text-sage-800 dark:hover:text-white font-semibold text-xs"
            >
              Done
            </button>
          </div>
        )}

        <div className="flex items-end p-2 sm:p-3">
          {/* Voice Input Mic */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl transition-colors ${
              isListening
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                : 'text-sage-500 hover:text-sage-800 hover:bg-sage-100 dark:text-sage-400 dark:hover:text-sage-200 dark:hover:bg-forest-800'
            }`}
            title={isListening ? 'Stop recording' : 'Dictate with voice'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message, ask a question, or explore ideas..."
            className="flex-1 max-h-44 py-2 px-3 bg-transparent text-sm sm:text-base text-sage-950 dark:text-sage-100 placeholder-sage-400 dark:placeholder-sage-500 focus:outline-none resize-none leading-relaxed"
          />

          {/* Action button: Send or Stop */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0 mb-0.5">
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  textareaRef.current?.focus();
                }}
                className="p-2 text-sage-400 hover:text-sage-600 dark:hover:text-sage-200 transition-colors"
                title="Clear input"
              >
                <X size={16} />
              </button>
            )}

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-sm"
                title="Stop generating"
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim()}
                className={`p-2.5 rounded-xl transition-all shadow-sm ${
                  text.trim()
                    ? 'bg-sage-600 hover:bg-sage-700 active:scale-95 text-white shadow-sage-600/20'
                    : 'bg-sage-200 dark:bg-forest-800 text-sage-400 dark:text-forest-600 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-sage-500 dark:text-sage-500 mt-2">
        Sage AI is crafted for calm clarity. Press <kbd className="px-1 py-0.5 rounded bg-sage-200/60 dark:bg-forest-800 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-sage-200/60 dark:bg-forest-800 font-mono text-[10px]">Shift + Enter</kbd> for new line.
      </p>
    </div>
  );
};
