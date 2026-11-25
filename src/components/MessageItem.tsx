import React, { useState } from 'react';
import { 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw,
  Sparkles,
  Leaf,
  Code2,
  HeartHandshake,
  PenTool
} from 'lucide-react';
import { Message, Persona } from '../types';
import { MarkdownRenderer } from '../utils/markdownParser';
import { speechService } from '../utils/speech';
import { soundFx } from '../utils/sound';

interface MessageItemProps {
  message: Message;
  persona: Persona;
  onRateMessage: (id: string, rating: 'up' | 'down') => void;
  onRegenerate?: () => void;
  soundEnabled: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  persona,
  onRateMessage,
  onRegenerate,
  soundEnabled,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    if (soundEnabled) soundFx.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechService.speak(message.content, () => setIsSpeaking(false));
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2': return <Code2 size={16} className="text-white" />;
      case 'HeartHandshake': return <HeartHandshake size={16} className="text-white" />;
      case 'PenTool': return <PenTool size={16} className="text-white" />;
      default: return <Leaf size={16} className="text-white" />;
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 group animate-slide-up">
        <div className="flex items-end space-x-2 max-w-[88%] sm:max-w-[78%]">
          <div className="flex flex-col items-end">
            <div className="bg-sage-600 dark:bg-sage-700 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-sm text-sm sm:text-base leading-relaxed break-words">
              {message.content}
            </div>

            <div className="flex items-center space-x-2 mt-1 mr-1 text-[11px] text-sage-500 dark:text-sage-400">
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-sage-800 dark:hover:text-sage-200"
                title="Copy message"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
              <span>{formatTime(message.timestamp)}</span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-sage-300 dark:bg-forest-750 flex items-center justify-center flex-shrink-0 text-sage-800 dark:text-sage-200 text-xs font-semibold shadow-sm">
            <User size={16} />
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start mb-6 group animate-slide-up">
      <div className="flex items-start space-x-3 max-w-[94%] sm:max-w-[85%]">
        {/* Persona Avatar */}
        <div className="w-8 h-8 rounded-xl bg-sage-600 dark:bg-sage-700 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
          {getPersonaIcon(persona.avatarIcon)}
        </div>

        {/* Message bubble card */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold text-sage-900 dark:text-sage-100">{persona.name}</span>
            <span className="text-[10px] text-sage-500 dark:text-sage-400">{formatTime(message.timestamp)}</span>
          </div>

          <div className="bg-white dark:bg-forest-900 border border-sage-200/90 dark:border-forest-800 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs text-sage-900 dark:text-sage-100 transition-colors">
            <MarkdownRenderer content={message.content} />

            {/* Typewriter cursor indicator while streaming */}
            {message.isStreaming && <span className="typing-cursor" />}
          </div>

          {/* Action Toolbar */}
          {!message.isStreaming && (
            <div className="flex items-center space-x-1 sm:space-x-2 mt-2 ml-1 text-sage-500 dark:text-sage-400">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-sage-100 dark:hover:bg-forest-800 hover:text-sage-800 dark:hover:text-sage-200 transition-colors"
                title="Copy full response"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>

              <button
                onClick={handleSpeak}
                className={`p-1.5 rounded-lg hover:bg-sage-100 dark:hover:bg-forest-800 transition-colors ${
                  isSpeaking ? 'text-sage-800 bg-sage-200/70 dark:bg-forest-750 dark:text-white' : 'hover:text-sage-800 dark:hover:text-sage-200'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? <VolumeX size={14} className="text-emerald-600 animate-pulse" /> : <Volume2 size={14} />}
              </button>

              <div className="h-3 w-px bg-sage-200 dark:bg-forest-800 mx-0.5" />

              <button
                onClick={() => {
                  onRateMessage(message.id, 'up');
                  if (soundEnabled) soundFx.playClick();
                }}
                className={`p-1.5 rounded-lg hover:bg-sage-100 dark:hover:bg-forest-800 transition-colors ${
                  message.rating === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'hover:text-sage-800 dark:hover:text-sage-200'
                }`}
                title="Good response"
              >
                <ThumbsUp size={14} />
              </button>

              <button
                onClick={() => {
                  onRateMessage(message.id, 'down');
                  if (soundEnabled) soundFx.playClick();
                }}
                className={`p-1.5 rounded-lg hover:bg-sage-100 dark:hover:bg-forest-800 transition-colors ${
                  message.rating === 'down' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'hover:text-sage-800 dark:hover:text-sage-200'
                }`}
                title="Bad response"
              >
                <ThumbsDown size={14} />
              </button>

              {onRegenerate && (
                <button
                  onClick={() => {
                    onRegenerate();
                    if (soundEnabled) soundFx.playClick();
                  }}
                  className="p-1.5 rounded-lg hover:bg-sage-100 dark:hover:bg-forest-800 hover:text-sage-800 dark:hover:text-sage-200 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
