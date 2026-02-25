'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Lightbulb, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'suggestion' | 'feedback' | 'question' | 'idea';
  timestamp: Date;
}

interface WritingTutorProps {
  chapterContent: string;
  chapterTitle: string;
  bookContext: any;
  onApplySuggestion?: (text: string) => void;
}

const suggestionPrompts = [
  'Was passiert als Nächstes?',
  'Wie kann ich mehr Spannung erzeugen?',
  'Hilf mir mit dem Dialog',
  'Beschreibe die Szene detaillierter',
  'Zeige die Gefühle des Charakters',
];

export function WritingTutor({ chapterContent, chapterTitle, bookContext, onApplySuggestion }: WritingTutorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hallo! Ich bin dein KI-Schreibtutor für "${chapterTitle}".\n\nIch kann dir helfen mit:\n• Ideen für die nächste Szene\n• Dialog-Vorschläge\n• Beschreibungen\n• Charakter-Entwicklung\n• Plot-Twists\n\nWas möchtest du als Nächstes schreiben?`,
        type: 'suggestion',
        timestamp: new Date(),
      }]);
    }
  }, [chapterTitle]);

  const sendMessage = async (content: string) => {
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
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Du bist ein erfahrener Schreibtutor und hilfst einem Autoren beim Verfassen seines Romans.

AKTUELLES KAPITEL: "${chapterTitle}"
KONTEXT DES BUCHS:
${JSON.stringify(bookContext, null, 2)}

BISHERIGER TEXT:
"${chapterContent.substring(-2000)}"

ANFRAGE DES AUTORS:
"${content}"

Gib konkrete, praktische Hilfestellung. Wenn möglich, schlage konkrete Formulierungen vor, die der Autor übernehmen kann.`,
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

  const extractTextToApply = (content: string): string | null => {
    // Try to extract quoted text or the main suggestion
    const quoteMatch = content.match(/"([^"]+)"/);
    if (quoteMatch) return quoteMatch[1];
    
    // If no quotes, return first paragraph if it's short enough
    const firstParagraph = content.split('\n')[0];
    if (firstParagraph.length < 500) return firstParagraph;
    
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
            <p className="text-xs text-slate-500">Dein persönlicher Schreibassistent</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setMessages([]);
            setShowSuggestions(true);
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
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
                  {msg.role === 'assistant' && onApplySuggestion && (
                    <div className="mt-2">
                      {extractTextToApply(msg.content) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => onApplySuggestion(extractTextToApply(msg.content)!)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          In Text übernehmen
                        </Button>
                      )}
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
              {suggestionPrompts.map((prompt) => (
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

      {/* Input */}
      <div className="p-3 border-t bg-white">
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
        <p className="text-xs text-slate-400 mt-2">
          Drücke Enter zum Senden, Shift+Enter für neue Zeile
        </p>
      </div>
    </div>
  );
}
