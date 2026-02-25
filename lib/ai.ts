import { GoogleGenerativeAI } from '@google/generative-ai';

// API Keys and config from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || 'google/gemma-3-4b';
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

// Initialize Gemini
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Check if we should use demo mode
const hasAnyValidKey = !!(GEMINI_API_KEY || MOONSHOT_API_KEY || ANTHROPIC_API_KEY || OPENAI_API_KEY);
const FORCE_DEMO_MODE = !hasAnyValidKey && !OPENAI_BASE_URL.includes('localhost');

export const WRITING_ASSISTANT_PROMPT = `Du bist ein Experten-Schreibassistent und kreativer Schreibcoach. Antworte auf Deutsch.`;

export const DEFAULT_PERSONAS = [
  {
    key: 'creative_muse',
    name: 'Kreative Muse',
    description: 'Inspirierend und ideenreich',
    systemPrompt: 'Du bist eine kreative Muse für Autoren. Du bist inspirierend, enthusiastisch und hilfst dabei, kreative Blockaden zu überwinden. Antworte auf Deutsch.',
    icon: 'Sparkles',
    color: 'violet',
    isDefault: true,
  },
  {
    key: 'editor',
    name: 'Lektor',
    description: 'Konkretes Feedback zur Prosa',
    systemPrompt: 'Du bist ein professioneller Lektor. Du gibst präzises, konstruktives Feedback zu Stil, Grammatik, Satzbau und Lesefluss. Antworte auf Deutsch.',
    icon: 'PenTool',
    color: 'blue',
    isDefault: false,
  },
  {
    key: 'critic',
    name: 'Kritiker',
    description: 'Harte, aber faire Kritik',
    systemPrompt: 'Du bist ein erfahrener Literaturkritiker. Du identifizierst Schwächen in der Handlung, Charakteren und dem Erzählen. Antworte auf Deutsch.',
    icon: 'Glasses',
    color: 'red',
    isDefault: false,
  },
  {
    key: 'developmental_editor',
    name: 'Entwicklungsredakteur',
    description: 'Struktur, Arcs, Themen',
    systemPrompt: 'Du bist ein Entwicklungsredakteur. Du konzentrierst dich auf die große Ebene: Story-Struktur, Charakterentwicklung, Themen, Pacing. Antworte auf Deutsch.',
    icon: 'Compass',
    color: 'amber',
    isDefault: false,
  },
  {
    key: 'plot_specialist',
    name: 'Plot-Spezialist',
    description: 'Story-Struktur, Wendepunkte',
    systemPrompt: 'Du bist ein Spezialist für Story-Struktur. Du verstehst 3-Akt-Struktur, Hero\'s Journey, Save the Cat. Antworte auf Deutsch.',
    icon: 'GitBranch',
    color: 'emerald',
    isDefault: false,
  },
];

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// OpenAI-compatible API (works with LM Studio, OpenAI, etc.)
async function callOpenAICompatible(messages: AIMessage[]): Promise<string> {
  const apiKey = OPENAI_API_KEY || 'lm-studio';
  const baseUrl = OPENAI_BASE_URL;
  const model = LM_STUDIO_MODEL;

  console.log('Calling OpenAI-compatible API:', { baseUrl, model });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: { message: errorText } };
    }
    throw new Error(error.error?.message || `API Fehler: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Moonshot AI API
async function callMoonshot(messages: AIMessage[]): Promise<string> {
  if (!MOONSHOT_API_KEY) {
    throw new Error('MOONSHOT_API_KEY nicht konfiguriert');
  }

  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: messages.map(m => ({
        role: m.role === 'system' ? 'system' : m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: { message: errorText } };
    }
    throw new Error(error.error?.message || `Moonshot API Fehler: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Gemini API
async function callGemini(messages: AIMessage[]): Promise<string> {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY nicht konfiguriert');
  }

  const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastError: Error | null = null;

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      let systemPrompt = '';
      const geminiMessages = [];

      for (const msg of messages) {
        if (msg.role === 'system') {
          systemPrompt = msg.content;
        } else if (msg.role === 'user') {
          geminiMessages.push({
            role: 'user',
            parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${msg.content}` : msg.content }]
          });
          systemPrompt = '';
        } else if (msg.role === 'assistant') {
          geminiMessages.push({
            role: 'model',
            parts: [{ text: msg.content }]
          });
        }
      }

      if (geminiMessages.length === 0) return '';

      const chat = model.startChat({
        history: geminiMessages.slice(0, -1).map((m: any) => ({
          role: m.role,
          parts: m.parts
        }))
      });

      const lastMessage = geminiMessages[geminiMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      return result.response.text();
    } catch (error: any) {
      lastError = error;
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('404')) {
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Alle Gemini Modelle fehlgeschlagen');
}

// DEMO MODE: Generate helpful simulated responses
function generateDemoResponse(messages: AIMessage[]): string {
  const userMessage = messages.find(m => m.role === 'user')?.content || '';
  const textMatch = userMessage.match(/TEXT ZUM VERBESSERN:\n([\s\S]+?)(?:\n\nANWEISUNGEN:|$)/);
  const originalText = textMatch ? textMatch[1].trim() : userMessage.substring(0, 500);
  
  return `✨ **KI-Antwort (Demo-Modus):**

Du hast geschrieben:
"${originalText.substring(0, 200)}..."

Ich bin im Demo-Modus, da keine Verbindung zu LM Studio möglich ist.

**Bitte stelle sicher:**
1. LM Studio läuft auf http://localhost:1234
2. Das Modell "google/gemma-3-4b" ist geladen
3. Der Server ist gestartet ("Start Server")

---
💡 **Für echte KI-Antworten:** Starte LM Studio und lade das Modell!`;
}

// Main chat completion function
export async function chatCompletion(messages: AIMessage[]): Promise<string> {
  console.log('Using AI provider:', AI_PROVIDER);
  console.log('OpenAI Base URL:', OPENAI_BASE_URL);
  console.log('Model:', LM_STUDIO_MODEL);

  // Try OpenAI-compatible API first (includes LM Studio)
  if (AI_PROVIDER === 'openai') {
    try {
      return await callOpenAICompatible(messages);
    } catch (error: any) {
      console.error('OpenAI-compatible API Error:', error);
      // If localhost fails, use demo mode
      if (OPENAI_BASE_URL.includes('localhost')) {
        console.log('LM Studio not available, using demo mode');
        return generateDemoResponse(messages);
      }
      throw error;
    }
  }

  // Try other providers
  try {
    if (AI_PROVIDER === 'moonshot' && MOONSHOT_API_KEY) {
      return await callMoonshot(messages);
    }
    if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) {
      return await callGemini(messages);
    }
    
    // Default to demo mode
    return generateDemoResponse(messages);
  } catch (error: any) {
    console.error('AI Error:', error);
    return generateDemoResponse(messages);
  }
}

export async function streamChat(messages: AIMessage[]) {
  const result = await chatCompletion(messages);
  return {
    stream: (async function* () {
      yield { text: () => result };
    })()
  };
}
