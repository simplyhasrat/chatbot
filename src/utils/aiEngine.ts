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
   * If Gemini API Key is provided in settings or .env, connects to Google Gemini API.
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

    // Check if Gemini API key is provided via UI settings or .env file
    const envApiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() || '';
    const activeApiKey = settings.apiKey?.trim() || envApiKey;

    if ((settings.apiProvider === 'gemini' || (!settings.apiKey && envApiKey)) && activeApiKey) {
      try {
        await this.streamGeminiResponse(messages, activePersona.systemPrompt, activeApiKey, options);
        return;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to built-in Sage engine:', err);
      }
    }

    // Built-in intelligent response generator
    const replyTemplate = this.generateSmartResponse(query, personaId, messages);
    await this.simulateStream(replyTemplate, settings.streamSpeed, options);
  }

  private async simulateStream(text: string, speedMs: number, options: StreamOptions) {
    if (speedMs <= 0) {
      options.onChunk(text, text);
      options.onComplete(text);
      return;
    }

    const tokens = text.match(/(\s+|\S+)/g) || [text];
    let accumulated = '';

    for (let i = 0; i < tokens.length; i++) {
      if (options.signal?.aborted) {
        break;
      }
      accumulated += tokens[i];
      options.onChunk(tokens[i], accumulated);

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
    const q = query.toLowerCase().trim();

    if (!q) {
      return `Hello! How can I assist your focus today? Feel free to ask a question, request code, or explore an idea.`;
    }

    // Check greetings
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hello') || q.startsWith('hi ') || q === 'who are you') {
      if (personaId === 'sage-code') {
        return `Hello! I'm **Code Artisan**, your engineering partner.

Whether you're architecting scalable systems, crafting clean React components, or hunting down subtle bugs, I'm here with clean idiomatic patterns.

What are you working on today?
- **Component & API Design**
- **Refactoring & Performance Optimization**
- **TypeScript Patterns**
- **Testing & Edge Cases**`;
      }

      if (personaId === 'sage-wellness') {
        return `Welcome. Take a gentle breath in... and let it out softly. 🌿

I am **Zen Sanctuary**, your mindful space for reflection, decompression, and balanced living.

How can I support your balance today?
- *A short 2-minute centering exercise*
- *Unpacking thoughts that feel heavy*
- *Designing restful evening rituals*
- *Setting compassionate boundaries*`;
      }

      if (personaId === 'sage-scribe') {
        return `Warm greetings. I am **Sage Scribe**, your writing and storytelling companion.

I can help you craft compelling essays, executive emails, brand stories, or articulate prose that resonates.

What shall we write together?`;
      }

      return `Warm greetings! I am **Sage Mind**, your companion for thoughtful reflection, strategic clarity, and focused insight.

I'm here to help you unpack complex challenges into clean, structured, and manageable steps.

Where shall our focus begin today?
- **Strategic planning & problem solving**
- **Deep concept synthesis**
- **Creative exploration**
- **Actionable blueprints**`;
    }

    // Math calculation query
    const mathMatch = q.match(/^(?:what is|calculate|solve)?\s*([\d\s+\-*/().^%]+)$/);
    if (mathMatch && mathMatch[1].trim() && /[\d]/.test(mathMatch[1])) {
      try {
        const expression = mathMatch[1].trim();
        // Safe evaluation of basic arithmetic
        if (/^[0-9+\-*/().\s^%]+$/.test(expression)) {
          // eslint-disable-next-line no-eval
          const result = Function(`'use strict'; return (${expression.replace(/\^/g, '**')})`)();
          return `### Calculation Result

The solution to \`${expression}\` is:

# **${result}**

\`\`\`text
${expression} = ${result}
\`\`\`

Need further breakdown or step-by-step mathematical reasoning?`;
        }
      } catch {
        // Fall through
      }
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
      q.includes('component') ||
      personaId === 'sage-code'
    ) {
      return `### Clean Architecture & Solution

Here is a clean, production-grade implementation designed with readability, type safety, and defensive resilience:

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

#### Architectural Highlights:
1. **Memory Safety**: Clean disposal of active timers in the \`useEffect\` cleanup prevents memory leaks.
2. **Strict Type Safety**: Preserves exact TypeScript inferences with generics without fallback \`any\`.
3. **Ergonomic Usage**: Works seamlessly with inputs, resize observers, or autosave triggers.

> *"Simplicity is prerequisite for reliability."* — Edsger W. Dijkstra

Would you like me to tailor this for cancellation tokens or unit test fixtures?`;
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
1. **Inhale gently** through your nose for a slow count of **4**. Feel the cool air expand your ribs.
2. **Hold softly** at the peak of the breath for a count of **4**. Maintain softness, without straining.
3. **Exhale steadily** through your mouth for an extended count of **6**. Notice the quiet grounding in your feet and seat.

> **Mindful Reflection**: *You do not have to solve everything in this single hour. Focus on the singular step right in front of you.*

#### Three Gentle Inquiries for Today:
* What is one obligation you can gracefully decline or postpone?
* Have you nourished your body with hydration and daylight today?
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

Here is a polished draft crafted with natural rhythm, tactful assertiveness, and clarity:

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

Would you like me to adjust the register toward a more formal executive audience or a closer peer group?`;
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
