'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  RotateCcw, 
  CheckCircle2,
  BookOpen,
  Users,
  MapPin,
  Target,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WritingStyleControls, WritingStyle, generateStyleInstructions } from './WritingStyleControls';
import { WritingContextPanel } from './WritingContextPanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'suggestion' | 'feedback' | 'question' | 'idea' | 'continuation';
  timestamp: Date;
}

interface Character {
  id?: string;
  name: string;
  role?: string | null;
  goals?: string | null;
  motivations?: string | null;
}

interface PlotPoint {
  id?: string;
  title: string;
  description?: string;
  act: string;
}

interface WritingTutorProps {
  chapterContent: string;
  chapterTitle: string;
  bookId: string;
  chapterId: string;
  bookContext: {
    genre?: string | null;
    characters: Character[];
    plotPoints: PlotPoint[];
  };
  onApplySuggestion?: (text: string) => void;
}

const suggestionPrompts = [
  'Was passiert als Nächstes?',
  'Wie kann ich mehr Spannung erzeugen?',
  'Hilf mir mit dem Dialog',
  'Beschreibe die Szene detaillierter',
  'Zeige die Gefühle des Charakters',
  'Integriere einen Charakter aus der Welt',
  'Nutze den aktuellen Story-Beat',
];

export function WritingTutor({ 
  chapterContent, 
  chapterTitle, 
  bookId,
  chapterId,
  bookContext, 
  onApplySuggestion 
}: WritingTutorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [style, setStyle] = useState<WritingStyle>({
    length: 'same',
    pace: 'same',
    intensity: 'same',
    showDontTell: 'same',
    dialogueAmount: 'same',
    descriptionLevel: 'balanced',
    povDepth: 'medium',
    toneShift: '',
  });
  const [showContext, setShowContext] = useState(false);
  const [contextData, setContextData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load full context when needed
  const loadFullContext = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}`);
      const book = await response.json();
      setContextData(book);
      setShowContext(true);
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  };

  // Initial greeting with context awareness
  useEffect(() => {
    if (messages.length === 0) {
      const characterNames = bookContext.characters.slice(0, 3).map(c => c.name).join(', ');
      const hasPlotPoints = bookContext.plotPoints.length > 0;
      
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hallo! Ich bin dein KI-Schreibtutor für "${chapterTitle}".${characterNames ? `\n\nIch kenne deine Charaktere: ${characterNames}.` : ''}${hasPlotPoints ? `\n\nIch achte auf deine Story-Struktur.` : ''}\n\nIch kann dir helfen mit:\n• Fortsetzung basierend auf deiner Story-Welt\n• Dialog im Stil deiner Charaktere\n• Beschreibungen passend zum Setting\n• Integration von Welt-Elementen\n\nWas schreibst du als Nächstes?`,
        type: 'suggestion',
        timestamp: new Date(),
      }]);
    }
  }, [chapterTitle, bookContext]);

  const sendMessage = async (content: string, applyStyle: boolean = true) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      // Build comprehensive prompt
      const characterContext = bookContext.characters.map(c => 
        `${c.name}${c.role ? ` (${c.role})` : ''}${c.goals ? ` - Ziel: ${c.goals}` : ''}`
      ).join('; ');

      const plotContext = bookContext.plotPoints.map(p => 
        `${p.title} (${p.act})`
      ).join(', ');

      const styleInstructions = applyStyle ? generateStyleInstructions(style) : '';

      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Du bist ein erfahrener Schreibtutor für das Buch "${chapterTitle}" (${bookContext.genre || 'Fiktion'}).

DEINE AUFGABE:
${content}

KONTEXT DER STORY-WELT:
${characterContext ? `Charaktere: ${characterContext}` : ''}
${plotContext ? `Story-Struktur: ${plotContext}` : ''}

AKTUELLER TEXT (letzte 1000 Zeichen):
"${chapterContent.slice(-1000)}"

${styleInstructions ? `\nSTILANWEISUNGEN:\n${styleInstructions}` : ''}

WICHTIG:
- Berücksichtige die etablierte Welt und Charaktere
- Bleibe konsistent mit dem bisherigen Ton
- Integriere Welt-Elemente natürlich
- Gib konkrete, übernehmbare Textvorschläge`,
          type: 'writing_help',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.result,
          type: 'suggestion',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Tutor error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es erneut.',
        type: 'feedback',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleApply = () => {
    const styleDesc = generateStyleInstructions(style);
    sendMessage(`Wende folgende Stilanpassungen auf den aktuellen Text an:\n${styleDesc}`, false);
  };

  const extractTextToApply = (content: string): string | null => {
    // Try to extract quoted text
    const quoteMatch = content.match(/"([^"]{20,500})"/);
    if (quoteMatch) return quoteMatch[1];
    
    // Look for text after markers like "Hier ist ein Vorschlag:" or similar
    const markerPatterns = [
      /(?:Hier ist|Vorschlag|Textvorschlag|So könnte es klingen):\s*["']?([^"']{20,500})["']?/i,
      /(?:Fortsetzung|Weiter):\s*["']?([^"']{20,500})["']?/i,
    ];
    
    for (const pattern of markerPatterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    
    // If no quotes, return first paragraph if it's short enough
    const firstParagraph = content.split('\n')[0];
    if (firstParagraph.length < 500 && firstParagraph.length > 20) return firstParagraph;
    
    return null;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 border-l">
      {/* Header */}
      <div className="p-3 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">KI-Schreibtutor</h3>
            <p className="text-xs text-slate-500">Kennt deine Welt & Charaktere</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={loadFullContext}
            title="Story-Kontext anzeigen"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => {
              setMessages([]);
              setShowSuggestions(true);
            }}
            title="Chat zurücksetzen"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-3">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-violet-100 text-violet-600' 
                    : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.type && msg.role === 'assistant' && (
                    <Badge variant="outline" className="text-[10px] mb-1">
                      {msg.type === 'suggestion' && <Lightbulb className="h-3 w-3 mr-1 inline" />}
                      {msg.type}
                    </Badge>
                  )}
                  <div className={`inline-block rounded-2xl px-4 py-2 text-sm text-left whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'bg-white border shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {/* Apply button for assistant suggestions */}
                  {msg.role === 'assistant' && onApplySuggestion && extractTextToApply(msg.content) && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => onApplySuggestion(extractTextToApply(msg.content)!)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        In Text übernehmen
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-slate-400"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex gap-1">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 h-2 bg-violet-400 rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-2 h-2 bg-violet-400 rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-2 h-2 bg-violet-400 rounded-full" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Suggestions */}
        {showSuggestions && messages.length < 2 && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 mb-2">Schnell-Vorschläge:</p>
            <div className="flex flex-wrap gap-2">
              {suggestionPrompts.slice(0, 5).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-1.5 bg-white border rounded-full hover:bg-violet-50 hover:border-violet-300 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t bg-white space-y-2">
        <div className="flex items-center gap-2">
          <WritingStyleControls 
            style={style} 
            onChange={setStyle}
            onApply={handleStyleApply}
          />
          <Badge variant="outline" className="text-xs">
            {bookContext.characters.length} Figuren
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Frag den Tutor nach Hilfe..."
            className="min-h-[60px] resize-none"
          />
          <Button 
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="self-end bg-violet-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400">
          Enter zum Senden • Shift+Enter für neue Zeile
        </p>
      </div>

      {/* Context Panel Modal */}
      {showContext && contextData && (
        <WritingContextPanel 
          book={contextData}
          onClose={() => setShowContext(false)}
        />
      )}
    </div>
  );
}
