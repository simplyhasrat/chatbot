import React, { useRef, useEffect, useState } from 'react';
import { 
  Leaf, 
  Sparkles, 
  ArrowDown, 
  Compass, 
  Lightbulb, 
  BookOpen, 
  Code2, 
  HeartHandshake, 
  PenTool,
  Cpu,
  Layers,
  Bug,
  Sun,
  Moon,
  ShieldCheck,
  Feather,
  Briefcase,
  Mail
} from 'lucide-react';
import { Message, Persona } from '../types';
import { MessageItem } from './MessageItem';

interface ChatAreaProps {
  messages: Message[];
  activePersona: Persona;
  isStreaming: boolean;
  onRateMessage: (id: string, rating: 'up' | 'down') => void;
  onRegenerate: () => void;
  onSelectPrompt: (prompt: string) => void;
  soundEnabled: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  activePersona,
  isStreaming,
  onRateMessage,
  onRegenerate,
  onSelectPrompt,
  soundEnabled,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll to bottom on new messages or streaming
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Handle scroll listener to show "Scroll to bottom" button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPromptIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Compass': return <Compass size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'BookOpen': return <BookOpen size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Lightbulb': return <Lightbulb size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Code2': return <Code2 size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Cpu': return <Cpu size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Layers': return <Layers size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Bug': return <Bug size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Sun': return <Sun size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Moon': return <Moon size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'ShieldCheck': return <ShieldCheck size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Feather': return <Feather size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Briefcase': return <Briefcase size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'Mail': return <Mail size={18} className="text-sage-600 dark:text-sage-400" />;
      case 'PenTool': return <PenTool size={18} className="text-sage-600 dark:text-sage-400" />;
      default: return <Leaf size={18} className="text-sage-600 dark:text-sage-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 relative"
    >
      <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-between">
        {/* Empty State / Welcome Screen */}
        {messages.length === 0 ? (
          <div className="my-auto py-8 text-center animate-fade-in max-w-2xl mx-auto">
            {/* Sage Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sage-100 dark:bg-forest-800 border border-sage-200 dark:border-forest-700 text-xs font-semibold text-sage-800 dark:text-sage-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse"></span>
              <span>Intelligent & Tranquil Workspace</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold text-sage-950 dark:text-white tracking-tight mb-3">
              How can I support your focus today?
            </h2>
            <p className="text-sm sm:text-base text-sage-600 dark:text-sage-300 max-w-lg mx-auto mb-8 leading-relaxed">
              {activePersona.description}
            </p>

            {/* Suggested Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {activePersona.suggestedPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="group p-4 rounded-2xl bg-white dark:bg-forest-900 border border-sage-200/80 dark:border-forest-800 hover:border-sage-400 dark:hover:border-sage-600 hover:shadow-md hover:shadow-sage-900/5 transition-all text-left flex flex-col justify-between"
                >
                  <div className="flex items-center space-x-2.5 mb-2">
                    <div className="p-2 rounded-xl bg-sage-50 dark:bg-forest-800 group-hover:bg-sage-100 dark:group-hover:bg-forest-750 transition-colors">
                      {getPromptIcon(item.icon)}
                    </div>
                    <span className="text-sm font-semibold text-sage-900 dark:text-sage-100 group-hover:text-sage-700 dark:group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-sage-600 dark:text-sage-400 leading-relaxed">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="space-y-2 pb-6">
            {messages.map((msg, idx) => (
              <MessageItem
                key={msg.id}
                message={msg}
                persona={activePersona}
                onRateMessage={onRateMessage}
                onRegenerate={idx === messages.length - 1 && msg.role === 'assistant' ? onRegenerate : undefined}
                soundEnabled={soundEnabled}
              />
            ))}

            {/* Typing indicator when assistant is thinking prior to stream */}
            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-center space-x-3 mb-6 animate-slide-up">
                <div className="w-8 h-8 rounded-xl bg-sage-600 dark:bg-sage-700 flex items-center justify-center text-white shadow-sm">
                  <Leaf size={16} />
                </div>
                <div className="bg-white dark:bg-forest-900 border border-sage-200 dark:border-forest-800 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center space-x-1.5 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-sage-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-sage-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-sage-600 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 sm:right-10 p-2.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-900/20 active:scale-95 transition-all z-20"
          title="Scroll to latest message"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
};
