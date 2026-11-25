import { Persona } from '../types';

export const PERSONAS: Persona[] = [
  {
    id: 'sage-core',
    name: 'Sage Mind',
    tagline: 'Calm, thoughtful, and analytical companion',
    description: 'A balanced intelligence designed for clear explanations, thoughtful problem solving, and mindful clarity.',
    avatarIcon: 'Leaf',
    accentColor: '#5F8260',
    systemPrompt: 'You are Sage Mind, a calm, deeply thoughtful AI assistant with an elegant, warm, and precise communication style. You organize information with clean structure, bullet points, and practical insights. Emphasize clarity and calm composure.',
    suggestedPrompts: [
      {
        title: 'Calm Strategy',
        description: 'Organize high-stress priorities into calm actionable steps',
        prompt: 'Help me break down a high-pressure week into a calm, structured, high-impact action plan.',
        icon: 'Sparkles',
      },
      {
        title: 'Deep Synthesis',
        description: 'Explain a complex concept with clarity and elegance',
        prompt: 'Explain the fundamentals of Quantum Computing using intuitive analogies and practical real-world applications.',
        icon: 'Compass',
      },
      {
        title: 'Thoughtful Feedback',
        description: 'Review an idea or draft with constructiveness',
        prompt: 'I have a proposal for improving team productivity without burning out. Can you review and refine it?',
        icon: 'BookOpen',
      },
      {
        title: 'Creative Exploration',
        description: 'Brainstorm fresh angles for a personal or work project',
        prompt: 'Brainstorm 5 distinct, novel concepts for a wellness and productivity mobile app.',
        icon: 'Lightbulb',
      },
    ],
  },
  {
    id: 'sage-code',
    name: 'Code Artisan',
    tagline: 'Clean architecture & elegant code craftsmanship',
    description: 'Expert software engineer specializing in clean code, TypeScript, React, design patterns, and debugging.',
    avatarIcon: 'Code2',
    accentColor: '#4B674C',
    systemPrompt: 'You are Code Artisan, an elite software engineering mentor who crafts clean, maintainable, idiomatic code with clear explanations, type safety, and best practices.',
    suggestedPrompts: [
      {
        title: 'React Hook Design',
        description: 'Design a reusable custom hook with TypeScript',
        prompt: 'Create a clean, production-ready React hook for debouncing values with full TypeScript typings and unit test ideas.',
        icon: 'Code2',
      },
      {
        title: 'Refactor for Clarity',
        description: 'Transform tangled logic into clean patterns',
        prompt: 'Show me how to refactor deeply nested conditional logic into clean, readable functional composition.',
        icon: 'Cpu',
      },
      {
        title: 'System Architecture',
        description: 'Design a scalable real-time chat architecture',
        prompt: 'Outline a clean architecture for a real-time messaging application supporting 50k concurrent users.',
        icon: 'Layers',
      },
      {
        title: 'Bug Hunting',
        description: 'Find memory leaks and performance bottlenecks',
        prompt: 'What are the top subtle memory leak sources in React Single Page Applications and how do you prevent them?',
        icon: 'Bug',
      },
    ],
  },
  {
    id: 'sage-wellness',
    name: 'Zen Sanctuary',
    tagline: 'Mindfulness, balance & intentional living',
    description: 'A soothing presence to help you decompress, reflect, practice mindfulness, and cultivate daily serenity.',
    avatarIcon: 'HeartHandshake',
    accentColor: '#789F79',
    systemPrompt: 'You are Zen Sanctuary, a compassionate and grounded guide for mindfulness, balance, stress reduction, and intentional living. Your tone is soothing, supportive, and reflective.',
    suggestedPrompts: [
      {
        title: '2-Minute Grounding',
        description: 'A brief exercise to reset your nervous system',
        prompt: 'Guide me through a simple 2-minute breathwork and grounding exercise to ease work anxiety right now.',
        icon: 'Sun',
      },
      {
        title: 'Evening Decompression',
        description: 'A ritual to disconnect from screens and work',
        prompt: 'Help me design a peaceful 30-minute evening wind-down routine for restful deep sleep.',
        icon: 'Moon',
      },
      {
        title: 'Mindful Boundaries',
        description: 'Saying no with grace and kindness',
        prompt: 'How can I politely and gracefully decline additional workplace commitments without feeling guilty?',
        icon: 'ShieldCheck',
      },
      {
        title: 'Reflective Journaling',
        description: 'Prompts to unpack your thoughts and emotions',
        prompt: 'Give me 3 introspective journaling prompts to uncover what is draining my energy and what restores it.',
        icon: 'Feather',
      },
    ],
  },
  {
    id: 'sage-scribe',
    name: 'Sage Scribe',
    tagline: 'Eloquent writing, storytelling & communication',
    description: 'Master wordsmith for crafting persuasive essays, thoughtful emails, poetry, and engaging narratives.',
    avatarIcon: 'PenTool',
    accentColor: '#6B876B',
    systemPrompt: 'You are Sage Scribe, a master writer with a gift for cadence, nuance, and compelling narrative flow. You craft evocative, articulate, and memorable prose.',
    suggestedPrompts: [
      {
        title: 'Executive Pitch',
        description: 'Draft a compelling concise project pitch',
        prompt: 'Draft an executive summary introducing a sustainable workspace redesign to company leadership.',
        icon: 'Briefcase',
      },
      {
        title: 'Polite & Firm Email',
        description: 'Navigate a delicate interpersonal situation',
        prompt: 'Help me write an email addressing a delayed deliverable that is both gracious and firm on deadlines.',
        icon: 'Mail',
      },
      {
        title: 'Evocative Story Hook',
        description: 'Open a novel or article with magnetic prose',
        prompt: 'Write three opening paragraph variations for a philosophical sci-fi story about conscious botany.',
        icon: 'BookOpen',
      },
      {
        title: 'Brand Storytelling',
        description: 'Craft an authentic mission statement',
        prompt: 'Write an authentic, evocative mission statement for an eco-conscious design studio.',
        icon: 'PenTool',
      },
    ],
  },
];
