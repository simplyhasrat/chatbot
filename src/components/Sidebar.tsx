import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search, 
  X, 
  Sparkles, 
  Sliders, 
  Check, 
  Edit2, 
  ChevronRight,
  Leaf
} from 'lucide-react';
import { Conversation, AppSettings } from '../types';
import { soundFx } from '../utils/sound';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  settings: AppSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onClose,
  onOpenSettings,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-forest-950/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 sm:w-80 bg-sage-50/95 dark:bg-forest-900 border-r border-sage-200/80 dark:border-forest-800 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Area */}
        <div className="p-4 flex items-center justify-between border-b border-sage-200/60 dark:border-forest-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-600 dark:bg-sage-700 flex items-center justify-center text-white shadow-md shadow-sage-600/20">
              <Leaf size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-sage-950 dark:text-white tracking-tight flex items-center gap-1.5">
                Sage Chat <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-sage-200 text-sage-800 dark:bg-forest-750 dark:text-sage-200">v1.0</span>
              </h1>
              <p className="text-[11px] text-sage-600 dark:text-sage-400">Mindful, clean & responsive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sage-500 hover:text-sage-800 hover:bg-sage-200 dark:text-sage-400 dark:hover:text-white dark:hover:bg-forest-800 lg:hidden"
            title="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewConversation();
              if (settings.soundEnabled) soundFx.playClick();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-sage-600 hover:bg-sage-700 active:scale-[0.99] text-white font-medium text-sm transition-all shadow-sm hover:shadow-md hover:shadow-sage-600/20"
          >
            <Plus size={18} />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-sage-400 dark:text-sage-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-white dark:bg-forest-850 border border-sage-200 dark:border-forest-700 text-sage-900 dark:text-sage-100 placeholder-sage-400 dark:placeholder-sage-500 focus:outline-none focus:ring-1 focus:ring-sage-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-sage-400 hover:text-sage-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-sage-500 dark:text-sage-400">
            Recent Chats
          </div>

          {filteredConversations.length === 0 ? (
            <div className="py-8 text-center px-4">
              <MessageSquare size={28} className="mx-auto text-sage-300 dark:text-forest-700 mb-2 stroke-[1.5]" />
              <p className="text-xs text-sage-600 dark:text-sage-400 font-medium">No conversations found</p>
              <p className="text-[11px] text-sage-500 dark:text-sage-500 mt-0.5">Start a new chat to begin</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeId;
              const isEditing = conv.id === editingId;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectConversation(conv.id);
                      if (settings.soundEnabled) soundFx.playClick();
                      if (window.innerWidth < 1024) onClose();
                    }
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition-all ${
                    isActive
                      ? 'bg-sage-200/90 dark:bg-forest-800 text-sage-950 dark:text-white font-medium shadow-sm'
                      : 'text-sage-700 dark:text-sage-300 hover:bg-sage-100/80 dark:hover:bg-forest-850'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                    <MessageSquare size={16} className={isActive ? 'text-sage-700 dark:text-sage-300 flex-shrink-0' : 'text-sage-400 flex-shrink-0'} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        autoFocus
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => saveRename(conv.id)}
                        onKeyDown={(e) => handleKeyDown(e, conv.id)}
                        className="w-full bg-white dark:bg-forest-900 border border-sage-400 px-1.5 py-0.5 rounded text-xs text-sage-950 dark:text-white focus:outline-none"
                      />
                    ) : (
                      <span className="truncate text-xs leading-normal">{conv.title}</span>
                    )}
                  </div>

                  {/* Action buttons (Rename & Delete) */}
                  {!isEditing && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startRename(conv, e)}
                        className="p-1 rounded text-sage-500 hover:text-sage-800 dark:hover:text-white hover:bg-sage-200/60 dark:hover:bg-forest-700"
                        title="Rename Chat"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this conversation?')) {
                            onDeleteConversation(conv.id);
                            if (settings.soundEnabled) soundFx.playClick();
                          }
                        }}
                        className="p-1 rounded text-sage-500 hover:text-rose-600 hover:bg-rose-100/70 dark:hover:bg-rose-950/40"
                        title="Delete Chat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <button
                      onClick={() => saveRename(conv.id)}
                      className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Settings Link */}
        <div className="p-3 border-t border-sage-200/80 dark:border-forest-800 space-y-1">
          <button
            onClick={() => {
              onOpenSettings();
              if (settings.soundEnabled) soundFx.playClick();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-sage-700 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-forest-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Sliders size={16} className="text-sage-500" />
              <span>Preferences & Model</span>
            </div>
            <ChevronRight size={14} className="text-sage-400" />
          </button>
        </div>
      </aside>
    </>
  );
};
