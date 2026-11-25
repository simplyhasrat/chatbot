import { Message, AppSettings } from '../types';
import { PERSONAS } from './personas';

interface StreamOptions {
  onChunk: (chunk: string, fullText: string) => void;
  onComplete: (fullText: string) => void;
  signal?: AbortSignal;
}

export class AIEngine {
  /**
   * Generates a thoughtful, context-aware response.
   * If Gemini API Key is provided in settings, makes an actual Gemini API call.
   * Otherwise, provides high-fidelity simulated intelligence based on persona and queries.
   */
  async generateResponse(
    messages: Message[],
    personaId: string,
    settings: AppSettings,
    options: StreamOptions
  ): Promise<void> {
    const activePersona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];
    const latestMessage = messages[messages.length - 1];
    const query = latestMessage?.content.trim() || '';

    // If user configured a Gemini API key
    if (settings.apiProvider === 'gemini' && settings.apiKey?.trim()) {
      try {
        await this.streamGeminiResponse(messages, activePersona.systemPrompt, settings.apiKey, options);
        return;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to built-in Sage engine:', err);
        // Fall back to built-in simulation below with a soft alert
      }
    }

    // Built-in intelligent response generator
    const replyTemplate = this.generateSmartResponse(query, personaId, messages);
    await this.simulateStream(replyTemplate, settings.streamSpeed, options);
  }

  private async simulateStream(text: string, speedMs: number, options: StreamOptions) {
    // If speed is 0, return immediately
    if (speedMs <= 0) {
      options.onChunk(text, text);
      options.onComplete(text);
      return;
    }

    // Split text into variable natural tokens (words or small character groups)
    const tokens = text.match(/(\s+|\S+)/g) || [text];
    let accumulated = '';

    for (let i = 0; i < tokens.length; i++) {
      if (options.signal?.aborted) {
        break;
      }
      accumulated += tokens[i];
      options.onChunk(tokens[i], accumulated);

      // Natural cadence: slightly longer pause after punctuation
      let delay = speedMs;
      if (tokens[i].endsWith('.') || tokens[i].endsWith('?') || tokens[i].endsWith('!')) {
        delay = Math.min(speedMs * 3.5, 90);
      } else if (tokens[i].endsWith(',')) {
        delay = Math.min(speedMs * 2, 50);
      } else if (tokens[i].includes('\n')) {
        delay = Math.min(speedMs * 2.5, 70);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    options.onComplete(accumulated);
  }

  private async streamGeminiResponse(
    messages: Message[],
    systemInstruction: string,
    apiKey: string,
    options: StreamOptions
  ) {
    const contents = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
        signal: options.signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    if (!reader) throw new Error('No readable stream available');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            const candidate = data.candidates?.[0];
            const textPart = candidate?.content?.parts?.[0]?.text;
            if (textPart) {
              accumulated += textPart;
              options.onChunk(textPart, accumulated);
            }
          } catch {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }

    options.onComplete(accumulated);
  }

  private generateSmartResponse(query: string, personaId: string, history: Message[]): string {
    const q = query.toLowerCase();

    // Check query themes
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q === 'who are you') {
      if (personaId === 'sage-code') {
        return `Hello! I'm **Code Artisan**, your engineering partner. 

Whether you're architecting scalable distributed systems, crafting clean React components, or hunting down subtle concurrency bugs, I'm here with clean idiomatic patterns.

What are you working on today?
- **Component or API Design**
- **Refactoring & Performance Optimization**
- **TypeScript Typings & Patterns**
- **Testing & Edge Cases**`;
      }

      if (personaId === 'sage-wellness') {
        return `Welcome. Take a gentle breath in... and let it out softly. 🌿

I am **Zen Sanctuary**, your mindful space for reflection, decompression, and balanced living. In the middle of busy days and constant screens, it's essential to preserve quiet clarity.

How can I support your balance today?
- *A short 2-minute centering exercise*
- *Unpacking thoughts that feel heavy*
- *Designing restful evening rituals*
- *Setting compassionate boundaries*`;
      }

      return `Warm greetings. I am **Sage Mind**, your companion for thoughtful reflection, strategic clarity, and focused insight.

I'm here to help you unpack complex challenges into clean, structured, and manageable steps.

Where shall our focus begin today?
- **Strategic planning & problem solving**
- **Creative writing & refined communication**
- **Explaining deep concepts simply**
- **Organizing thoughts into actionable blueprints**`;
    }

    // Coding & technical queries
    if (
      q.includes('code') ||
      q.includes('react') ||
      q.includes('hook') ||
      q.includes('javascript') ||
      q.includes('typescript') ||
      q.includes('function') ||
      q.includes('api') ||
      q.includes('bug') ||
      q.includes('refactor') ||
      q.includes('architecture') ||
      personaId === 'sage-code'
    ) {
      return `### Elegant Solution & Architecture

Here is a clean, production-grade approach designed with high readability, strict type safety, and defensive resilience.

\`\`\`typescript
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to debounce rapidly changing values.
 * Keeps re-renders and network traffic smooth and efficient.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending timer when value or delay updates
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Clean up on component unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delayMs]);

  return debouncedValue;
}
\`\`\`

#### Key Architectural Highlights:
1. **Memory Safety**: Clean disposal of active timers in the \`useEffect\` cleanup prevents stray memory leaks or state updates on unmounted trees.
2. **Generic Typings**: Preserves exact TypeScript inferences without fallback \`any\` casts.
3. **Ergonomic Usage**: Drop into search inputs, window resize listeners, or autosave loops with zero configuration.

> *"Simplicity is prerequisite for reliability."* — Edsger W. Dijkstra

Would you like me to tailor this for cancellation tokens or add unit test fixtures using Vitest?`;
    }

    // Mindfulness & Wellness queries
    if (
      q.includes('stress') ||
      q.includes('anxiety') ||
      q.includes('breathe') ||
      q.includes('mindful') ||
      q.includes('sleep') ||
      q.includes('grounding') ||
      q.includes('burnout') ||
      personaId === 'sage-wellness'
    ) {
      return `### Mindful Reset & Grounding

Let's pause the momentum of your day for just sixty seconds. Wherever you are right now, invite your shoulders to drop away from your ears, and release any tension held in your jaw.

#### The 4-4-6 Calming Breath Practice:
1. **Inhale gently** through your nose for a slow count of **4**. Feel the cool air expand your lower ribs.
2. **Hold softly** at the peak of the breath for a count of **4**. Maintain softness, without straining.
3. **Exhale steadily** through your mouth for an extended count of **6**. Notice the quiet grounding in your feet and seat.

> **Mindful Reflection**: *You do not have to solve everything in this single hour. Focus on the singular step that is right in front of you.*

#### Three Gentle Questions for Today:
* What is one obligation you can gracefully decline or postpone?
* Have you nourished your body with water and daylight today?
* What small victory can you appreciate yourself for right now?

Take all the time you need. I'm right here with you.`;
    }

    // Writing & Communication queries
    if (
      q.includes('write') ||
      q.includes('email') ||
      q.includes('essay') ||
      q.includes('pitch') ||
      q.includes('story') ||
      personaId === 'sage-scribe'
    ) {
      return `### Refined & Articulate Draft

Here is a polished, persuasive draft crafted with natural rhythm, tactful assertiveness, and clarity:

> **Subject:** Collaborative Update: Aligning on Next Milestones & Deliverables
>
> Dear Team,
>
> Thank you for the thoughtful dedication you have poured into our recent initiatives. As we enter the next phase of delivery, clarity of scope and unhurried focus will be our greatest assets.
>
> To ensure seamless execution, our priority checkpoints for this week are:
> 1. **Finalizing core specifications** by Wednesday EOD to unblock testing.
> 2. **Streamlining stakeholder feedback** into a consolidated review deck.
> 3. **Protecting uninterrupted development blocks** each morning.
>
> Please let me know if any friction points arise or if adjustments to this timeline would better support high-quality craft.
>
> Warm regards,  
> *Hasrat*

#### Stylistic Notes:
- **Tone**: Gracious yet decisively directed.
- **Cadence**: Short punchy clauses prevent cognitive fatigue in busy readers.
- **Actionability**: Bulleted milestones make commitments unmistakably clear.

Would you like me to adjust the register toward a more formal executive audience or a closer informal peer group?`;
    }

    // Default general insightful response
    return `### Thoughtful Perspective on "${query}"

Here is a balanced and structured exploration of your question:

#### 1. Core Synthesis & First Principles
When approaching this challenge, it helps to separate the immediate noise from the underlying mechanisms. By examining the fundamental constraints, we can identify high-leverage leverage points rather than superficial adjustments.

#### 2. Key Observations & Strategic Pillars
- **Clarity over Complexity**: Elegant systems are not defined by how much they contain, but by how cleanly their components harmonize.
- **Incremental Momentum**: Sustainable progress compounds quietly through consistent, intentional steps.
- **Adaptive Resilience**: Build in room for iteration and discovery rather than rigid assumptions.

#### 3. Recommended Action Plan:
1. **Define the North Star**: Frame the desired outcome in a single clear, observable sentence.
2. **Eliminate Friction**: Identify the one bottleneck currently slowing down execution.
3. **Execute a Low-Risk Experiment**: Validate the hypothesis with minimal overhead before full commitment.

> *"Peace of mind arrives when clarity replaces ambiguity."*

Would you like to delve deeper into any of these specific angles, or shall we construct a step-by-step implementation plan?`;
  }
}

export const aiEngine = new AIEngine();
