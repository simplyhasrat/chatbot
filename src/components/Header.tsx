import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Sparkles, 
  ChevronDown, 
  Download, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Settings,
  Leaf,
  Code2,
  HeartHandshake,
  PenTool
} from 'lucide-react';
import { Persona, AppSettings, Conversation } from '../types';
import { PERSONAS } from '../utils/personas';
import { soundFx } from '../utils/sound';

interface HeaderProps {
  activePersona: Persona;
  onSelectPersona: (persona: Persona) => void;
  conversation: Conversation | null;
  onClearChat: () => void;
  onExportChat: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  isStreaming: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activePersona,
  onSelectPersona,
  conversation,
  onClearChat,
  onExportChat,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onToggleSidebar,
  isStreaming,
}) => {
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPersonaDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2': return <Code2 size={16} className="text-sage-600 dark:text-sage-400" />;
      case 'HeartHandshake': return <HeartHandshake size={16} className="text-sage-600 dark:text-sage-400" />;
      case 'PenTool': return <PenTool size={16} className="text-sage-600 dark:text-sage-400" />;
      default: return <Leaf size={16} className="text-sage-600 dark:text-sage-400" />;
    }
  };

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    onUpdateSettings({ soundEnabled: next });
    if (next) soundFx.playClick();
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
    if (settings.soundEnabled) soundFx.playClick();
  };

  return (
    <header className="h-16 border-b border-sage-200/80 dark:border-forest-800 bg-white/80 dark:bg-forest-900/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Mobile hamburger & Persona Selector */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-sage-700 hover:text-sage-950 hover:bg-sage-100 dark:text-sage-300 dark:hover:text-white dark:hover:bg-forest-800 transition-colors lg:hidden"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Persona Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setPersonaDropdownOpen(!personaDropdownOpen);
              if (settings.soundEnabled) soundFx.playClick();
            }}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-sage-200 dark:border-forest-700 bg-sage-50/70 hover:bg-sage-100 dark:bg-forest-850 dark:hover:bg-forest-800 text-sage-900 dark:text-sage-100 transition-all shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-sage-200/80 dark:bg-forest-700 flex items-center justify-center">
              {getPersonaIcon(activePersona.avatarIcon)}
            </div>
            <div className="text-left flex flex-col">
              <span className="text-xs sm:text-sm font-semibold tracking-tight leading-none text-sage-900 dark:text-white">
                {activePersona.name}
              </span>
              <span className="text-[10px] text-sage-600 dark:text-sage-400 hidden sm:inline leading-tight">
                {activePersona.tagline}
              </span>
            </div>
            <ChevronDown size={14} className={`text-sage-500 transition-transform duration-200 ${personaDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {personaDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-forest-900 border border-sage-200 dark:border-forest-700 shadow-xl py-2 z-50 animate-fade-in">
              <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sage-500 dark:text-sage-400">
                Choose Persona
              </div>
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectPersona(p);
                    setPersonaDropdownOpen(false);
                    if (settings.soundEnabled) soundFx.playClick();
                  }}
                  className={`w-full px-3.5 py-2.5 text-left flex items-start space-x-3 hover:bg-sage-50 dark:hover:bg-forest-800 transition-colors ${
                    activePersona.id === p.id ? 'bg-sage-100/70 dark:bg-forest-800/80' : ''
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-sage-100 dark:bg-forest-700 text-sage-800 dark:text-sage-200 mt-0.5">
                    {getPersonaIcon(p.avatarIcon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-sage-900 dark:text-sage-100">{p.name}</span>
                      {activePersona.id === p.id && (
                        <span className="w-2 h-2 rounded-full bg-sage-500"></span>
                      )}
                    </div>
                    <p className="text-xs text-sage-600 dark:text-sage-400 line-clamp-1">{p.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Status indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sage-100/60 dark:bg-forest-800/60 border border-sage-200/50 dark:border-forest-700/50">
          <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          <span className="text-xs font-medium text-sage-700 dark:text-sage-300">
            {isStreaming ? 'Responding...' : 'Responsive'}
          </span>
        </div>
      </div>

      {/* Right Controls: Actions & Settings */}
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        {conversation && conversation.messages.length > 0 && (
          <>
            <button
              onClick={() => {
                onExportChat();
                if (settings.soundEnabled) soundFx.playClick();
              }}
              className="p-2 rounded-xl text-sage-700 hover:text-sage-900 hover:bg-sage-100 dark:text-sage-300 dark:hover:text-white dark:hover:bg-forest-800 transition-colors"
              title="Export conversation as Markdown"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => {
                if (confirm('Clear current conversation messages?')) {
                  onClearChat();
                  if (settings.soundEnabled) soundFx.playClick();
                }
              }}
              className="p-2 rounded-xl text-sage-700 hover:text-rose-600 hover:bg-rose-50 dark:text-sage-300 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
              title="Clear current conversation"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}

        {/* Sound FX Toggle */}
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-xl text-sage-700 hover:text-sage-950 hover:bg-sage-100 dark:text-sage-300 dark:hover:text-white dark:hover:bg-forest-800 transition-colors"
          title={settings.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-sage-400" />}
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={handleToggleTheme}
          className="p-2 rounded-xl text-sage-700 hover:text-sage-950 hover:bg-sage-100 dark:text-sage-300 dark:hover:text-white dark:hover:bg-forest-800 transition-colors"
          title={settings.theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings button */}
        <button
          onClick={() => {
            onOpenSettings();
            if (settings.soundEnabled) soundFx.playClick();
          }}
          className="p-2 rounded-xl text-sage-700 hover:text-sage-950 hover:bg-sage-100 dark:text-sage-300 dark:hover:text-white dark:hover:bg-forest-800 transition-colors"
          title="App Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
