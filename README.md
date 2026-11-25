# 🌿 Sage AI - Clean, Responsive & Mindful Chatbot

An elegant, calm, and responsive AI chatbot application built with **React**, **TypeScript**, and **Tailwind CSS**, featuring an organic **Sage Green** color palette, smooth animations, and rich interactive capabilities.

![Sage Green Theme](https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- **Sage Green Visual Harmony**:
  - Calming sage tones (`#F4F7F4`, `#789F79`, `#5F8260`, `#3D523E`) with smooth transitions and subtle dark forest mode (`#0F1711`, `#162219`).
  - Frosted glass headers, pill input dock, refined typography (Plus Jakarta Sans & JetBrains Mono).
- **Responsive Architecture**:
  - Seamless layout across mobile phones, tablets, and ultra-wide desktops.
  - Slide-out mobile drawer with touch navigation.
- **Interactive AI Companions (4 Personas)**:
  - **Sage Mind**: Calm, thoughtful analysis and strategic clarity.
  - **Code Artisan**: Clean architecture, TypeScript patterns, and code craftsmanship.
  - **Zen Sanctuary**: Mindfulness, grounding breathwork, and evening decompression.
  - **Sage Scribe**: Persuasive writing, executive communication, and eloquent essays.
- **Rich Interaction & Capabilities**:
  - **Typewriter Streaming**: Realistic token streaming with adjustable speed (instant to relaxed).
  - **Voice Dictation (Speech-to-Text)**: Speak naturally into the input dock using the Web Speech API.
  - **Text-to-Speech (Read Aloud)**: High quality speech playback with speech synthesizer.
  - **Web Audio Sound Effects**: Subtle, synthesized organic wooden pops and chimes on message send/receive (zero external assets needed).
  - **Full Markdown & Code Highlighting**: Renders headings, bold text, bulleted lists, blockquotes, and syntax-highlighted code blocks with a 1-click **Copy Code** button.
  - **Conversation Management**: Search conversations, rename sessions, delete chats, or export to Markdown (`.md`).
  - **Local Persistence**: All conversations and user preferences automatically persist in `localStorage`.
  - **Dual Engine**: Use the built-in intelligent engine completely offline, or connect your **Google Gemini API** key in Settings.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```
Creates optimized production assets in `dist/`.

---

## 🎨 Color Palette Reference

| Color Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Sage 50** | `#F4F7F4` | App background (Light) |
| **Sage 100** | `#E7EFE7` | Card backgrounds, hover states |
| **Sage 200** | `#D2E1D2` | Subtle borders, chips |
| **Sage 400** | `#95B796` | Secondary accents, status |
| **Sage 600** | `#5F8260` | Primary brand color, buttons, user bubbles |
| **Sage 700** | `#4B674C` | Button hover states, active indicators |
| **Sage 950** | `#19251A` | High contrast headings & typography |
| **Forest 900** | `#0E1610` | Dark theme surface & panels |
| **Forest 950** | `#090E0B` | Dark theme main background |

---

## 📁 Project Structure

```
chatbot/
├── index.html                 # HTML template with Plus Jakarta Sans & JetBrains Mono
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Custom Sage color palette and animations
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite server and build config
└── src/
    ├── App.tsx                # App root coordinator & state management
    ├── main.tsx               # React DOM entry
    ├── index.css              # Tailwind base, custom scrollbars, animations
    ├── types.ts               # Data types for messages, personas, settings
    ├── components/
    │   ├── Header.tsx         # Top bar with persona dropdown, theme & sound toggles
    │   ├── Sidebar.tsx        # Responsive navigation drawer & session search
    │   ├── ChatArea.tsx       # Message feed & empty welcome state cards
    │   ├── ChatInput.tsx      # Auto-expanding input dock & voice mic button
    │   ├── MessageItem.tsx    # Message cards, TTS, copy & feedback actions
    │   └── SettingsModal.tsx  # Modal for speech, speed, theme & API key
    └── utils/
        ├── aiEngine.ts        # Built-in intelligent engine & Gemini stream adapter
        ├── markdownParser.tsx # Markdown renderer & code block copy utility
        ├── personas.ts        # Persona specifications and preset prompts
        ├── sound.ts           # Web Audio API synthesized audio effects
        ├── speech.ts          # Web Speech API recognition & TTS synthesis
        └── storage.ts         # LocalStorage persistence manager
```

---

## 🛠️ Technologies Used

- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React Icons**
- **Vite 6**
- **Web Audio API** & **Web Speech API**
