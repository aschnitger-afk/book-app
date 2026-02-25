'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AIFeedbackButton } from '@/components/shared/AIFeedbackButton';
import { PLOT_STRUCTURES, PlotStructure, PlotBeat } from '@/lib/plot/structures';
import { 
  CheckCircle2, BookOpen, Layers, ChevronRight, ChevronLeft, 
  Sparkles, Save, Wand2, AlertCircle, Target, Lightbulb,
  LayoutGrid, Clock, TrendingUp, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

type WizardStep = 'intro' | 'structure' | 'timeline' | 'detail' | 'review';

interface BeatState extends PlotBeat {
  id: string;
  content: string;
  chapterTitle: string;
}

export function PlotPhase() {
  const { currentBook, setCurrentBook } = useAppStore();
  
  // Wizard state
  const [step, setStep] = useState<WizardStep>('intro');
  const [selectedStructure, setSelectedStructure] = useState<PlotStructure | null>(null);
  const [beats, setBeats] = useState<BeatState[]>([]);
  const [selectedBeatIndex, setSelectedBeatIndex] = useState<number>(0);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved data
  useEffect(() => {
    loadData();
  }, [currentBook?.id]);

  const loadData = async () => {
    if (!currentBook?.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/plot?bookId=${currentBook.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.plotStructure) {
          const structure = PLOT_STRUCTURES.find(s => s.id === data.plotStructure);
          if (structure) {
            setSelectedStructure(structure);
            const savedBeats = data.beats || [];
            const loadedBeats = structure.beats.map((beat: PlotBeat, index: number) => ({
              ...beat,
              id: `beat-${index}`,
              content: savedBeats[index]?.content || '',
              chapterTitle: savedBeats[index]?.chapterTitle || `Kapitel ${index + 1}`,
            }));
            setBeats(loadedBeats);
            setStep('timeline');
          }
        }
      }
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  // Generate AI suggestion for beat
  const generateBeatSuggestion = async (beatIndex: number) => {
    if (!currentBook || !selectedStructure) return;
    
    setIsGenerating(true);
    const beat = beats[beatIndex];
    
    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Als Plotting-Experte: Entwickle eine konkrete Szene für den Story-Beat "${beat.name}".

BUCH-INFO:
- Titel: ${currentBook.title}
- Genre: ${currentBook.genre || 'Nicht angegeben'}
- Prämisse: ${currentBook.description || 'Nicht angegeben'}

STRUKTUR: ${selectedStructure.name}
AKT: ${beat.act}
BEAT: ${beat.name}
BESCHREIBUNG: ${beat.description}

AUFGABE:
Beschreibe konkret:
1. Wo findet die Szene statt?
2. Welche Charaktere sind beteiligt?
3. Was genau passiert?
4. Was ist das Ergebnis?

Schreibe 2-3 Absätze, die direkt in das Kapitel übernommen werden können.`,
          type: 'brainstorm',
          persona: 'plot_specialist',
          bookId: currentBook?.id,
        }),
      });

      const data = await response.json();
      setAiSuggestion(data.result || '');
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Select structure and generate beats
  const selectStructure = async (structure: PlotStructure) => {
    setSelectedStructure(structure);
    
    const newBeats = structure.beats.map((beat, index) => ({
      ...beat,
      id: `beat-${Date.now()}-${index}`,
      content: '',
      chapterTitle: `Kapitel ${index + 1}`,
    }));
    
    setBeats(newBeats);
    
    // Auto-save
    if (currentBook?.id) {
      await fetch('/api/plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: currentBook.id,
          plotStructure: structure.id,
          beats: newBeats,
        }),
      });
      setCurrentBook({ ...currentBook, plotStructure: structure.id });
    }
    
    setStep('timeline');
  };

  // Update beat
  const updateBeat = (index: number, updates: Partial<BeatState>) => {
    setBeats(prev => prev.map((b, i) => i === index ? { ...b, ...updates } : b));
  };

  // Save all
  const savePlot = async () => {
    if (!currentBook || !selectedStructure) return;
    
    await fetch('/api/plot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId: currentBook.id,
        plotStructure: selectedStructure.id,
        beats,
      }),
    });
  };

  // Complete phase
  const completePhase = async () => {
    if (!currentBook) return;
    await savePlot();
    await fetch(`/api/books/${currentBook.id}/phase`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase: 'plotting', completed: true }),
    });
    setCurrentBook({ ...currentBook, plottingCompleted: true });
    setStep('review');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // INTRO STEP
  if (step === 'intro') {
    return (
      <div className="h-full overflow-auto p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="h-10 w-10 text-violet-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Plot-Struktur entwickeln</h1>
            <p className="text-lg text-slate-600">
              In dieser Phase planst du die Struktur deiner Geschichte Kapitel für Kapitel.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">1. Struktur wählen</h3>
              <p className="text-sm text-slate-600">Wähle aus bewährten Story-Strukturen wie Hero's Journey oder Save the Cat</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-1">2. Beats planen</h3>
              <p className="text-sm text-slate-600">Entwickle jeden Story-Beat mit KI-Unterstützung und konkreten Szenen</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <LayoutGrid className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">3. Übersicht erhalten</h3>
              <p className="text-sm text-slate-600">Behalte den Überblick über deine gesamte Story-Struktur</p>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => setStep('structure')} className="px-8">
              Loslegen
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // STRUCTURE SELECTION STEP
  if (step === 'structure') {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setStep('intro')} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" /> Zurück
            </Button>
            <h2 className="text-2xl font-bold">Wähle deine Plot-Struktur</h2>
            <p className="text-slate-600">Diese Struktur wird das Gerüst deiner Geschichte</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLOT_STRUCTURES.map((structure) => (
              <Card
                key={structure.id}
                onClick={() => selectStructure(structure)}
                className="cursor-pointer hover:border-violet-400 hover:shadow-lg transition-all"
              >
                <CardContent className="p-5">
                  <h3 className="font-semibold text-lg">{structure.name}</h3>
                  <p className="text-slate-600 text-sm mt-1">{structure.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {structure.bestFor.map(g => (
                      <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded text-sm">
                    <p className="font-medium text-slate-700">Was macht diese Struktur?</p>
                    <p className="text-slate-600 mt-1">{structure.explanation}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <LayoutGrid className="h-4 w-4" />
                      {structure.beats.length} Beats
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {structure.acts} Akte
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {structure.complexity}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TIMELINE STEP
  const currentBeat = beats[selectedBeatIndex];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {selectedStructure?.name}
              </Badge>
              <span className="text-sm text-slate-500">
                {selectedBeatIndex + 1} / {beats.length}
              </span>
            </div>
            <h2 className="text-xl font-bold">{currentBeat?.name}</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setStep('structure')}>
              Struktur ändern
            </Button>
            <Button size="sm" onClick={savePlot}>
              <Save className="h-4 w-4 mr-1" />
              Speichern
            </Button>
            <Button size="sm" className="bg-green-600" onClick={completePhase}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Fertig
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Navigation */}
      <div className="bg-slate-50 border-b p-4">
        <div className="max-w-6xl mx-auto">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2 min-w-max">
              {beats.map((beat, i) => {
                const isActive = i === selectedBeatIndex;
                const isFilled = beat.content.length > 20;
                
                return (
                  <button
                    key={beat.id}
                    onClick={() => setSelectedBeatIndex(i)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg border-2 min-w-[120px] transition-all",
                      isActive 
                        ? "border-violet-500 bg-white shadow-lg" 
                        : "border-transparent hover:border-slate-300",
                      beat.act === 'act1' ? "bg-blue-50" :
                      beat.act === 'act2a' || beat.act === 'act2b' ? "bg-amber-50" :
                      "bg-green-50"
                    )}
                  >
                    <span className="text-xs text-slate-500 mb-1">{i + 1}</span>
                    <span className={cn(
                      "text-xs font-medium text-center line-clamp-2",
                      isActive ? "text-violet-700" : "text-slate-700"
                    )}>
                      {beat.name}
                    </span>
                    {isFilled && (
                      <span className="text-[10px] text-green-600 mt-1">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {currentBeat && (
            <div className="grid grid-cols-3 gap-6">
              {/* Left: Beat Info */}
              <div className="col-span-1 space-y-4">
                <Card className={cn(
                  "border-l-4",
                  currentBeat.act === 'act1' ? "border-l-blue-500" :
                  currentBeat.act === 'act2a' || currentBeat.act === 'act2b' ? "border-l-amber-500" :
                  "border-l-green-500"
                )}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Beat-Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-500">Akt</span>
                      <p className="text-sm font-medium">
                        {currentBeat.act === 'act1' ? 'Akt 1: Setup' :
                         currentBeat.act === 'act2a' ? 'Akt 2a: Konfrontation' :
                         currentBeat.act === 'act2b' ? 'Akt 2b: Krise' :
                         'Akt 3: Resolution'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Beschreibung</span>
                      <p className="text-sm">{currentBeat.description}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded border border-amber-200">
                      <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        Was muss passieren?
                      </span>
                      <p className="text-xs text-amber-700 mt-1">
                        Dieser Beat sollte die Geschichte vorantreiben und den Helden näher an sein Ziel bringen (oder weiter davon entfernen).
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Suggestion */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      KI-Vorschlag
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aiSuggestion ? (
                      <div className="space-y-3">
                        <div className="text-sm bg-slate-50 p-3 rounded max-h-40 overflow-y-auto">
                          {aiSuggestion}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            updateBeat(selectedBeatIndex, { 
                              content: currentBeat.content + '\n\n' + aiSuggestion 
                            });
                            setAiSuggestion('');
                          }}
                        >
                          Übernehmen
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => generateBeatSuggestion(selectedBeatIndex)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? 'Denkt nach...' : 'Vorschlag generieren'}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedBeatIndex(Math.max(0, selectedBeatIndex - 1))}
                    disabled={selectedBeatIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Zurück
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedBeatIndex(Math.min(beats.length - 1, selectedBeatIndex + 1))}
                    disabled={selectedBeatIndex === beats.length - 1}
                  >
                    Weiter
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Right: Editor */}
              <div className="col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Kapitel planen</CardTitle>
                    <CardDescription>
                      Beschreibe detailliert, was in diesem Beat passiert
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Kapiteltitel (optional)
                      </label>
                      <Input
                        value={currentBeat.chapterTitle}
                        onChange={(e) => updateBeat(selectedBeatIndex, { chapterTitle: e.target.value })}
                        placeholder="z.B. Die Entdeckung"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Szene beschreiben
                      </label>
                      <Textarea
                        value={currentBeat.content}
                        onChange={(e) => updateBeat(selectedBeatIndex, { content: e.target.value })}
                        placeholder={`Was passiert in "${currentBeat.name}"?

- Wer ist beteiligt?
- Wo findet es statt?
- Was ist das konkrete Ereignis?
- Was ist das Ergebnis?`}
                        rows={15}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <FileText className="h-4 w-4" />
                      <span>{currentBeat.content.length} Zeichen</span>
                      {currentBeat.content.length > 100 && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          Ausgefüllt
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
