'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ChevronDown, ChevronUp, MessageSquare, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PlottingAssistantProps {
  currentBeat?: {
    name: string;
    description: string;
    act: string;
    content?: string;
  };
  structureName?: string;
  onApplySuggestion?: (suggestion: string) => void;
}

const beatTips: Record<string, string[]> = {
  'Gewöhnliche Welt': [
    'Zeige den Helden in seiner Komfortzone, bevor alles sich ändert',
    'Etabliere, was der Held verlieren kann',
    'Zeige die "Lücke" zwischen dem aktuellen Leben und dem potenziellen',
  ],
  'Call to Adventure': [
    'Ein Ereignis stellt die gewohnte Ordnung in Frage',
    'Der Held wird vor eine Wahl gestellt',
    'Es gibt kein Zurück mehr zum alten Leben',
  ],
  'Die Hölle': [
    'Der tiefste Punkt der Geschichte',
    'Alle Hoffnung scheint verloren',
    'Der Held muss sich entscheiden: Aufgeben oder kämpfen?',
  ],
  'Climax': [
    'Die größte Konfrontation',
    'Alle Handlungsstränge kommen zusammen',
    'Der Held nutzt alles, was er gelernt hat',
  ],
  'default': [
    'Was muss der Held in diesem Moment lernen oder erkennen?',
    'Welche äußeren und innernen Konflikte treten hier auf?',
    'Wie verändert sich der Held durch dieses Ereignis?',
  ],
};

const chapterGoals: Record<string, string> = {
  'act1': 'Dieses Kapitel sollte den Leser in die Welt einführen und ihn für den Helden gewinnen.',
  'act2a': 'Hier geht es um das Erkunden der neuen Welt und erste kleinere Konflikte.',
  'act2b': 'Die Schwierigkeiten häufen sich, der Held trifft auf größere Widerstände.',
  'act3': 'Die Konfrontation eskaliert zum finale Höhepunkt.',
};

export function PlottingAssistant({ currentBeat, structureName, onApplySuggestion }: PlottingAssistantProps) {
  const { currentBook } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const getTips = () => {
    if (!currentBeat) return beatTips.default;
    return beatTips[currentBeat.name] || beatTips.default;
  };

  const getChapterGoal = () => {
    if (!currentBeat) return '';
    return chapterGoals[currentBeat.act] || '';
  };

  const getAISuggestion = async () => {
    if (!currentBeat) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Als Plotting-Experte: Gib mir konkrete Tipps für den Story-Beat "${currentBeat.name}" in einer ${structureName || ''} Struktur.

Beschreibung des Beats: ${currentBeat.description}

Aktueller Inhalt: ${currentBeat.content || '(noch leer)'}

Bitte gib:
1. Was sollte in diesem Kapitel unbedingt passieren?
2. Welche emotionale Reaktion sollte der Leser haben?
3. Ein konkretes Beispiel für eine Szene
4. Einen Satz, den ich direkt übernehmen kann`,
          type: 'brainstorm',
          persona: 'plot_specialist',
          bookId: currentBook?.id,
        }),
      });

      const data = await response.json();
      setAiSuggestion(data.result || '');
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentBeat) {
    return (
      <Card className="bg-slate-50">
        <CardContent className="p-6 text-center text-slate-500">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Wähle einen Beat aus, um Tipps zu erhalten</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
      <CardHeader className="pb-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Plotting-Assistent
          </CardTitle>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Chapter Goal */}
          <div className="p-3 bg-white rounded border border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-1">Ziel dieses Akts:</p>
            <p className="text-sm text-amber-700">{getChapterGoal()}</p>
          </div>

          {/* Tips for this beat */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Tipps für "{currentBeat.name}":
            </p>
            <ul className="space-y-2">
              {getTips().map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Suggestion */}
          <div className="pt-2 border-t border-amber-200">
            <Button
              variant="outline"
              size="sm"
              onClick={getAISuggestion}
              disabled={isLoading}
              className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {isLoading ? (
                <><Sparkles className="h-4 w-4 mr-2 animate-spin" /> Denke nach...</>
              ) : (
                <><MessageSquare className="h-4 w-4 mr-2" /> KI-Tipp erhalten</>
              )}
            </Button>

            {aiSuggestion && (
              <div className="mt-3 p-3 bg-white rounded border border-amber-200">
                <ScrollArea className="max-h-[200px]">
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">
                    {aiSuggestion}
                  </div>
                </ScrollArea>
                {onApplySuggestion && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => onApplySuggestion(aiSuggestion)}
                  >
                    Als Inhalt übernehmen
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
