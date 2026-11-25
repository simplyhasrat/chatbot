import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Volume2, 
  Mic, 
  Zap, 
  Key, 
  Trash2, 
  Check, 
  Sparkles,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllChats,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [provider, setProvider] = useState<'builtin' | 'gemini'>(settings.apiProvider || 'builtin');
  const [speed, setSpeed] = useState(settings.streamSpeed);
  const [sound, setSound] = useState(settings.soundEnabled);
  const [speech, setSpeech] = useState(settings.speechOutputEnabled);
  const [theme, setTheme] = useState(settings.theme);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      apiKey,
      apiProvider: provider,
      streamSpeed: speed,
      soundEnabled: sound,
      speechOutputEnabled: speech,
      theme,
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-forest-900 border border-sage-200 dark:border-forest-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sage-200/80 dark:border-forest-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sage-100 dark:bg-forest-800 text-sage-800 dark:text-sage-200">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-sage-950 dark:text-white">Settings & Preferences</h3>
              <p className="text-xs text-sage-600 dark:text-sage-400">Tailor your Sage Chat experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sage-400 hover:text-sage-700 dark:hover:text-white hover:bg-sage-100 dark:hover:bg-forest-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Appearance */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 dark:text-sage-400 mb-2.5">
              Interface Theme
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  theme === 'light'
                    ? 'border-sage-500 bg-sage-50 dark:bg-forest-800 text-sage-950 dark:text-white ring-1 ring-sage-500'
                    : 'border-sage-200 dark:border-forest-700 text-sage-700 dark:text-sage-300'
                }`}
              >
                🌿 Sage Cream (Light)
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  theme === 'dark'
                    ? 'border-sage-500 bg-sage-50 dark:bg-forest-800 text-sage-950 dark:text-white ring-1 ring-sage-500'
                    : 'border-sage-200 dark:border-forest-700 text-sage-700 dark:text-sage-300'
                }`}
              >
                🌲 Deep Forest (Dark)
              </button>
            </div>
          </div>

          {/* Audio & Interaction */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 dark:text-sage-400 mb-2.5">
              Sensory Feedback
            </label>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-sage-900 dark:text-sage-100">Sound Effects</span>
                  <p className="text-xs text-sage-500 dark:text-sage-400">Gentle chimes and typing pops</p>
                </div>
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500 border-sage-300"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-sage-900 dark:text-sage-100">Auto Read-Aloud</span>
                  <p className="text-xs text-sage-500 dark:text-sage-400">Speak assistant answers automatically</p>
                </div>
                <input
                  type="checkbox"
                  checked={speech}
                  onChange={(e) => setSpeech(e.target.checked)}
                  className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500 border-sage-300"
                />
              </label>
            </div>
          </div>

          {/* Streaming Speed Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-sage-500 dark:text-sage-400">
                Streaming Typewriter Speed
              </label>
              <span className="text-xs font-medium text-sage-600 dark:text-sage-300">
                {speed === 0 ? 'Instant' : `${speed}ms / token`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-sage-600"
            />
            <div className="flex justify-between text-[10px] text-sage-400 mt-1">
              <span>Instant (0ms)</span>
              <span>Smooth (15ms)</span>
              <span>Relaxed (50ms)</span>
            </div>
          </div>

          {/* Intelligence Engine */}
          <div className="pt-2 border-t border-sage-200/80 dark:border-forest-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 dark:text-sage-400 mb-2.5">
              Intelligence Engine
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setProvider('builtin')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                    provider === 'builtin'
                      ? 'border-sage-500 bg-sage-50 dark:bg-forest-800 text-sage-900 dark:text-white ring-1 ring-sage-500'
                      : 'border-sage-200 dark:border-forest-700 text-sage-700 dark:text-sage-300'
                  }`}
                >
                  ⚡ Built-in Sage Engine
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('gemini')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                    provider === 'gemini'
                      ? 'border-sage-500 bg-sage-50 dark:bg-forest-800 text-sage-900 dark:text-white ring-1 ring-sage-500'
                      : 'border-sage-200 dark:border-forest-700 text-sage-700 dark:text-sage-300'
                  }`}
                >
                  ✨ Google Gemini API
                </button>
              </div>

              {provider === 'gemini' ? (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-3 text-sage-400" />
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Paste your Google Gemini API key..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-sage-50/70 dark:bg-forest-850 border border-sage-300 dark:border-forest-700 text-sage-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
                    />
                  </div>
                  <p className="text-[11px] text-sage-500">
                    Your key is stored only in your local browser and never sent anywhere else.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-forest-850 p-2.5 rounded-xl border border-sage-200/70 dark:border-forest-800 leading-relaxed">
                  The built-in engine provides intelligent contextual reasoning, code architecture, writing assistance, and mindfulness practices completely offline with zero API key required.
                </p>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-2 border-t border-sage-200/80 dark:border-forest-800">
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete all conversations permanently?')) {
                  onClearAllChats();
                  onClose();
                }
              }}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center space-x-1.5"
            >
              <Trash2 size={13} />
              <span>Clear and delete all conversation history</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-sage-50/70 dark:bg-forest-850 border-t border-sage-200/80 dark:border-forest-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-sage-700 dark:text-sage-300 hover:bg-sage-200/70 dark:hover:bg-forest-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2 text-xs font-medium rounded-xl bg-sage-600 hover:bg-sage-700 text-white transition-all shadow-sm"
          >
            {savedNotice ? (
              <>
                <Check size={14} className="text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
