'use client';

import { useState, useRef, useEffect } from 'react';
import { Character } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Bot, Sparkles, History, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DecisionSimulatorProps {
  character: Character;
}

interface SimulationMessage {
  id: string;
  type: 'scenario' | 'response' | 'thinking';
  content: string;
  timestamp: Date;
}

const scenarioSuggestions = [
  'Du findest eine Brieftasche mit 1000€ auf der Straße. Was tust du?',
  'Dein bester Freund hat dich belogen. Wie reagierst du?',
  'Du hast die Chance, deinen größten Traum zu verwirklichen, aber dafür musst du jemanden verletzen.',
  'Du stehst vor einer unmöglichen Entscheidung zwischen Familie und Karriere.',
  'Jemand bedroht deine geliebten Menschen. Wie handelst du?',
];

export function DecisionSimulator({ character }: DecisionSimulatorProps) {
  const [scenario, setScenario] = useState('');
  const [messages, setMessages] = useState<SimulationMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showThinking, setShowThinking] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSimulate = async () => {
    if (!scenario.trim()) return;

    const newScenario: SimulationMessage = {
      id: Date.now().toString(),
      type: 'scenario',
      content: scenario,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newScenario]);
    setScenario('');
    setIsSimulating(true);

    try {
      const response = await fetch('/api/characters/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          bookId: character.bookId,
          type: 'decision',
          scenario: newScenario.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add thinking message first if enabled
        if (showThinking) {
          const thinkingMsg: SimulationMessage = {
            id: (Date.now() + 1).toString(),
            type: 'thinking',
            content: generateThinkingProcess(character),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, thinkingMsg]);
        }

        // Add response message
        const responseMsg: SimulationMessage = {
          id: (Date.now() + 2).toString(),
          type: 'response',
          content: data.decision,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, responseMsg]);
      }
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const generateThinkingProcess = (char: Character): string => {
    const factors = [];
    if (char.motivations) factors.push(`Ziele: ${char.motivations}`);
    if (char.flaws) factors.push(`Schwächen: ${char.flaws}`);
    if (char.strengths) factors.push(`Stärken: ${char.strengths}`);
    if (char.background) factors.push(`Vergangenheit prägt Entscheidungen`);
    
    return factors.length > 0 
      ? `${char.name} denkt über diese Faktoren nach:\n${factors.map(f => `• ${f}`).join('\n')}`
      : `${char.name} wägt die Situation basierend auf ihrer Persönlichkeit ab...`;
  };

  const clearHistory = () => {
    setMessages([]);
  };

  return (
    <div className="h-full flex gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {character.portraitUrl ? (
                <img 
                  src={character.portraitUrl} 
                  alt={character.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                character.name?.[0]?.toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-semibold">{character.name}</h3>
              <p className="text-xs text-slate-500">Decision Simulator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={showThinking}
                onChange={(e) => setShowThinking(e.target.checked)}
                className="rounded border-slate-300"
              />
              Zeige Denkprozess
            </label>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <History className="h-4 w-4 mr-2" />
                Verlauf löschen
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-violet-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">
                Was würde {character.name} tun?
              </h4>
              <p className="text-slate-500 max-w-md">
                Stelle eine hypothetische Situation vor und erfahre, wie dieser 
                Charakter basierend auf seiner Persönlichkeit, Zielen und 
                Vergangenheit reagieren würde.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-4 ${
                    msg.type === 'scenario' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                    msg.type === 'scenario' 
                      ? 'bg-slate-400' 
                      : 'bg-gradient-to-br from-violet-500 to-purple-600'
                  }`}>
                    {msg.type === 'scenario' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      character.name?.[0]?.toUpperCase()
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`max-w-[80%] ${
                    msg.type === 'scenario' ? 'text-right' : ''
                  }`}>
                    <div className={`inline-block rounded-2xl px-4 py-3 text-left ${
                      msg.type === 'scenario'
                        ? 'bg-slate-100 text-slate-800'
                        : msg.type === 'thinking'
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                    }`}>
                      {msg.type === 'thinking' && (
                        <div className="flex items-center gap-2 mb-2 text-amber-700 font-medium">
                          <Lightbulb className="h-4 w-4" />
                          Denkprozess
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isSimulating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-slate-400"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                    {character.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="w-2 h-2 bg-violet-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                      className="w-2 h-2 bg-violet-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                      className="w-2 h-2 bg-violet-400 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-slate-50">
          <div className="flex gap-2">
            <Textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSimulate();
                }
              }}
              placeholder={`Beschreibe eine Situation für ${character.name}...`}
              className="flex-1 resize-none min-h-[60px] max-h-[120px]"
            />
            <Button
              onClick={handleSimulate}
              disabled={!scenario.trim() || isSimulating}
              className="self-end bg-gradient-to-r from-violet-600 to-purple-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Suggestions */}
      <div className="w-72 space-y-4">
        <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
          <h4 className="font-semibold text-violet-900 mb-2">Wie es funktioniert</h4>
          <p className="text-sm text-violet-800">
            Die AI simuliert die Entscheidung basierend auf:
          </p>
          <ul className="text-sm text-violet-700 mt-2 space-y-1">
            <li>• Persönlichkeit & Charakterzügen</li>
            <li>• Zielen & Motivationen</li>
            <li>• Ängsten & Schwächen</li>
            <li>• Vergangenheit & Hintergrund</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Szenario-Vorschläge
          </h4>
          <div className="space-y-2">
            {scenarioSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setScenario(suggestion)}
                className="w-full text-left text-sm p-3 rounded-lg hover:bg-violet-50 transition-colors text-slate-600 hover:text-violet-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
          <h4 className="font-semibold text-emerald-900 mb-2">💡 Pro-Tipp</h4>
          <p className="text-sm text-emerald-800">
            Teste den Charakter mit moralischen Dilemmas! Das zeigt wirklich, 
            woran sie wirklich glauben - nicht nur was sie sagen.
          </p>
        </div>
      </div>
    </div>
  );
}
