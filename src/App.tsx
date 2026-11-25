import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, Persona, AppSettings } from './types';
import { PERSONAS } from './utils/personas';
import { Storage } from './utils/storage';
import { aiEngine } from './utils/aiEngine';
import { soundFx } from './utils/sound';
import { speechService } from './utils/speech';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // Initialize conversations with at least one active conversation
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = Storage.getConversations();
    if (saved && saved.length > 0) return saved;
    const initialConv: Conversation = {
      id: `conv_${Date.now()}_initial`,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      personaId: PERSONAS[0].id,
    };
    return [initialConv];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    const savedId = Storage.getActiveId();
    if (savedId) return savedId;
    return `conv_${Date.now()}_initial`;
  });

  const [settings, setSettings] = useState<AppSettings>(() => Storage.getSettings());
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0] || null;

  // Sync active ID if current becomes invalid
  useEffect(() => {
    if (conversations.length > 0 && !conversations.some((c) => c.id === activeId)) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  // Sync dark/light theme including system preferences
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      const isDark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  // Persist settings
  useEffect(() => {
    Storage.saveSettings(settings);
  }, [settings]);

  // Persist conversations
  useEffect(() => {
    Storage.saveConversations(conversations);
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    Storage.saveActiveId(activeId);
  }, [activeId]);

  // Sync active persona when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      const match = PERSONAS.find((p) => p.id === activeConversation.personaId);
      if (match) setActivePersona(match);
    }
  }, [activeConversation?.personaId]);

  // Create new conversation
  const handleNewConversation = useCallback((persona?: Persona) => {
    const p = persona || activePersona;
    // If the currently active conversation is already empty, just switch to it and update persona
    if (activeConversation && activeConversation.messages.length === 0) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversation.id ? { ...c, personaId: p.id } : c))
      );
      setActivePersona(p);
      return activeConversation;
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      personaId: p.id,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setActivePersona(p);
    return newConv;
  }, [activeConversation, activePersona]);

  // Change persona for active conversation
  const handleSelectPersona = (persona: Persona) => {
    setActivePersona(persona);
    if (activeConversation) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversation.id ? { ...c, personaId: persona.id } : c))
      );
    }
  };

  // Stop active streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    let targetConv = activeConversation;
    if (!targetConv) {
      targetConv = handleNewConversation();
    }

    const currentConvId = targetConv.id;
    const userMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = `msg_asst_${Date.now()}`;
    const initialAssistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const isFirstMessage = targetConv.messages.length === 0;
    const newTitle = isFirstMessage
      ? text.slice(0, 32).trim() + (text.length > 32 ? '...' : '')
      : targetConv.title;

    const updatedMessages = [...targetConv.messages, userMessage];

    // Optimistically update conversation state
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConvId
          ? {
              ...c,
              title: newTitle,
              updatedAt: Date.now(),
              messages: [...updatedMessages, initialAssistantMessage],
            }
          : c
      )
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      await aiEngine.generateResponse(
        [...updatedMessages],
        targetConv.personaId,
        settings,
        {
          signal: abortControllerRef.current.signal,
          onChunk: (_chunk, fullText) => {
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id !== currentConvId) return c;
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: fullText, isStreaming: true }
                      : m
                  ),
                };
              })
            );
          },
          onComplete: (fullText) => {
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id !== currentConvId) return c;
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: fullText, isStreaming: false }
                      : m
                  ),
                };
              })
            );

            setIsStreaming(false);
            abortControllerRef.current = null;

            if (settings.soundEnabled) soundFx.playReceive();
            if (settings.speechOutputEnabled) speechService.speak(fullText);
          },
        }
      );
    } catch (err) {
      console.error('Error in AI response:', err);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = async () => {
    if (!activeConversation || activeConversation.messages.length < 2 || isStreaming) return;

    const currentConvId = activeConversation.id;
    const lastMessage = activeConversation.messages[activeConversation.messages.length - 1];
    if (lastMessage.role !== 'assistant') return;

    const trimmedMessages = activeConversation.messages.slice(0, -1);
    const lastUserQuery = trimmedMessages[trimmedMessages.length - 1];
    if (!lastUserQuery || lastUserQuery.role !== 'user') return;

    const assistantPlaceholderId = `msg_asst_${Date.now()}`;
    const newAssistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConvId
          ? {
              ...c,
              messages: [...trimmedMessages, newAssistantMessage],
            }
          : c
      )
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      await aiEngine.generateResponse(
        trimmedMessages,
        activeConversation.personaId,
        settings,
        {
          signal: abortControllerRef.current.signal,
          onChunk: (_chunk, fullText) => {
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id !== currentConvId) return c;
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: fullText, isStreaming: true }
                      : m
                  ),
                };
              })
            );
          },
          onComplete: (fullText) => {
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id !== currentConvId) return c;
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: fullText, isStreaming: false }
                      : m
                  ),
                };
              })
            );
            setIsStreaming(false);
            abortControllerRef.current = null;
            if (settings.soundEnabled) soundFx.playReceive();
          },
        }
      );
    } catch (err) {
      console.error('Error during regenerate:', err);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Rate message (thumbs up/down)
  const handleRateMessage = (id: string, rating: 'up' | 'down') => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c;
        return {
          ...c,
          messages: c.messages.map((m) => (m.id === id ? { ...m, rating } : m)),
        };
      })
    );
  };

  // Clear current chat messages
  const handleClearChat = () => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, messages: [] } : c))
    );
  };

  // Export current chat as Markdown
  const handleExportChat = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;

    let md = `# ${activeConversation.title}\n`;
    md += `*Generated with Sage AI on ${new Date().toLocaleString()}*\n\n---\n\n`;

    activeConversation.messages.forEach((m) => {
      const author = m.role === 'user' ? 'You' : activePersona.name;
      md += `### ${author} (${new Date(m.timestamp).toLocaleTimeString()})\n\n`;
      md += `${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeConversation.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    if (updated.length === 0) {
      // Always keep at least one fresh conversation
      const freshConv: Conversation = {
        id: `conv_${Date.now()}_fresh`,
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        personaId: activePersona.id,
      };
      setConversations([freshConv]);
      setActiveId(freshConv.id);
    } else {
      setConversations(updated);
      if (activeId === id) {
        setActiveId(updated[0].id);
      }
    }
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Clear all chats
  const handleClearAllChats = () => {
    Storage.clearAllData();
    const freshConv: Conversation = {
      id: `conv_${Date.now()}_fresh`,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      personaId: activePersona.id,
    };
    setConversations([freshConv]);
    setActiveId(freshConv.id);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-sage-50 text-sage-950 dark:bg-forest-950 dark:text-sage-100 font-sans transition-colors duration-200">
      {/* Collapsible Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => setActiveId(id)}
        onNewConversation={() => handleNewConversation()}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
      />

      {/* Main Chat Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          activePersona={activePersona}
          onSelectPersona={handleSelectPersona}
          conversation={activeConversation}
          onClearChat={handleClearChat}
          onExportChat={handleExportChat}
          settings={settings}
          onUpdateSettings={(newPartial) => setSettings((prev) => ({ ...prev, ...newPartial }))}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isStreaming={isStreaming}
        />

        {/* Scrollable Conversation Viewport */}
        <ChatArea
          messages={activeConversation?.messages || []}
          activePersona={activePersona}
          isStreaming={isStreaming}
          onRateMessage={handleRateMessage}
          onRegenerate={handleRegenerate}
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          soundEnabled={settings.soundEnabled}
        />

        {/* Bottom Input Dock */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopStreaming={handleStopStreaming}
          isStreaming={isStreaming}
          soundEnabled={settings.soundEnabled}
          suggestedPrompts={
            activeConversation && activeConversation.messages.length > 0
              ? activePersona.suggestedPrompts.slice(0, 3)
              : undefined
          }
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
        />
      </div>

      {/* Preferences & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
        onClearAllChats={handleClearAllChats}
      />
    </div>
  );
};
