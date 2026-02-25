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
import { PLOT_STRUCTURES, PlotStructure, PlotBeat, PLOT_GLOSSARY } from '@/lib/plot/structures';
import { 
  CheckCircle2, BookOpen, Layers, ChevronRight, ChevronLeft, 
  Sparkles, Save, Wand2, AlertCircle, Target, Lightbulb,
  LayoutGrid, Clock, TrendingUp, FileText, HelpCircle, Info,
  Activity, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type WizardStep = 'intro' | 'structure' | 'timeline' | 'detail' | 'review';

interface BeatState extends PlotBeat {
  id: string;
  content: string;
  chapterTitle: string;
}

// Glossary Tooltip Component
function GlossaryTerm({ term, showIcon = true }: { term: string; showIcon?: boolean }) {
  const glossaryEntry = PLOT_GLOSSARY[term];
  
  if (!glossaryEntry) {
    return <span>{term}</span>;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 border-b border-dotted border-violet-400 cursor-help text-violet-700 font-medium">
            {term}
            {showIcon && <HelpCircle className="h-3 w-3 text-violet-400" />}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <div className="space-y-2">
            <p className="font-semibold text-sm">{glossaryEntry.short}</p>
            <p className="text-xs text-slate-300">{glossaryEntry.full}</p>
            {glossaryEntry.example && (
              <p className="text-xs text-violet-300 italic">{glossaryEntry.example}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Tension Curve Visualization Component
function TensionCurve({ beats, selectedIndex }: { beats: BeatState[]; selectedIndex: number }) {
  if (!beats.length) return null;

  const width = 800;
  const height = 120;
  const padding = { top: 20, right: 30, bottom: 30, left: 30 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Generate points for the curve
  const points = beats.map((beat, index) => {
    const x = padding.left + (index / (beats.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - ((beat.tensionLevel || 50) / 100) * graphHeight;
    return { x, y, beat, index };
  });

  // Create smooth curve path using bezier curves
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const cp1x = current.x + (next.x - current.x) / 3;
    const cp1y = current.y;
    const cp2x = current.x + 2 * (next.x - current.x) / 3;
    const cp2y = next.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  // Area under the curve (for gradient fill)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Gradient for the curve */}
          <linearGradient id="tensionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
          </linearGradient>
          {/* Gradient for the line */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Background grid lines */}
        {[0, 25, 50, 75, 100].map(level => (
          <line
            key={level}
            x1={padding.left}
            y1={padding.top + graphHeight - (level / 100) * graphHeight}
            x2={width - padding.right}
            y2={padding.top + graphHeight - (level / 100) * graphHeight}
            stroke="#e2e8f0"
            strokeDasharray="4,4"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 50, 100].map(level => (
          <text
            key={level}
            x={padding.left - 8}
            y={padding.top + graphHeight - (level / 100) * graphHeight + 4}
            textAnchor="end"
            fontSize="10"
            fill="#94a3b8"
          >
            {level}%
          </text>
        ))}

        {/* Area under curve */}
        <path d={areaD} fill="url(#tensionGradient)" />

        {/* The curve line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map(({ x, y, beat, index }) => {
          const isSelected = index === selectedIndex;
          const isAct1 = beat.act === 'act1';
          const isAct2 = beat.act === 'act2a' || beat.act === 'act2b';
          const color = isAct1 ? '#3b82f6' : isAct2 ? '#f59e0b' : '#22c55e';
          
          return (
            <g key={index}>
              {/* Outer ring for selected */}
              {isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  opacity="0.3"
                />
              )}
              {/* Main point */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 6 : 4}
                fill={color}
                stroke="white"
                strokeWidth={isSelected ? 3 : 2}
                className="transition-all duration-200"
              />
              {/* Beat number */}
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight={isSelected ? 'bold' : 'normal'}
                fill={isSelected ? color : '#64748b'}
              >
                {index + 1}
              </text>
            </g>
          );
        })}

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 2}
          textAnchor="middle"
          fontSize="11"
          fill="#64748b"
        >
          Story-Verlauf →
        </text>

        {/* Legend */}
        <g transform={`translate(${width - 120}, 10)`}>
          <circle cx="0" cy="0" r="4" fill="#3b82f6" />
          <text x="10" y="4" fontSize="10" fill="#64748b">Akt 1</text>
          <circle cx="50" cy="0" r="4" fill="#f59e0b" />
          <text x="60" y="4" fontSize="10" fill="#64748b">Akt 2</text>
        </g>
      </svg>
    </div>
  );
}

export function PlottingPhase() {
  const { currentBook, setCurrentBook } = useAppStore();
  
  // Wizard state
  const [step, setStep] = useState<WizardStep>('intro');
  const [selectedStructure, setSelectedStructure] = useState<PlotStructure | null>(null);
  const [beats, setBeats] = useState<BeatState[]>([]);
  const [selectedBeatIndex, setSelectedBeatIndex] = useState<number>(0);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);

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

          {/* Feature preview */}
          <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-violet-900 mb-1">Mit Spannungsbogen-Visualisierung</h4>
                  <p className="text-sm text-violet-700">
                    Sieh auf einen Blick, wie sich die Spannung über deine Kapitel verteilt. 
                    Optimiere den Rhythmus deiner Geschichte mit der visuellen Kurve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Wähle deine Plot-Struktur</h2>
                <p className="text-slate-600">Diese Struktur wird das Gerüst deiner Geschichte</p>
              </div>
              <Dialog open={showGlossary} onOpenChange={setShowGlossary}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Fachbegriffe-Glossar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Plotting-Fachbegriffe erklärt</DialogTitle>
                    <DialogDescription>
                      Wichtige Begriffe aus der Geschichtentheorie, die du bei der Strukturierung begegnen wirst.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {Object.entries(PLOT_GLOSSARY).map(([term, info]) => (
                      <div key={term} className="p-3 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-violet-700">{term}</h4>
                        <p className="text-sm text-slate-600 mt-1">{info.short}</p>
                        <p className="text-sm text-slate-700 mt-2">{info.full}</p>
                        {info.example && (
                          <p className="text-xs text-slate-500 mt-2 italic">{info.example}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {PLOT_STRUCTURES.map((structure) => (
              <Card
                key={structure.id}
                onClick={() => selectStructure(structure)}
                className="cursor-pointer hover:border-violet-400 hover:shadow-lg transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Left: Main info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{structure.name}</h3>
                          <p className="text-slate-600 mt-1">{structure.description}</p>
                        </div>
                        <Badge variant="outline" className={cn(
                          "ml-4 shrink-0",
                          structure.complexity === 'Einfach' && "border-green-300 text-green-700 bg-green-50",
                          structure.complexity === 'Mittel' && "border-amber-300 text-amber-700 bg-amber-50",
                          structure.complexity === 'Komplex' && "border-red-300 text-red-700 bg-red-50",
                        )}>
                          {structure.complexity}
                        </Badge>
                      </div>
                      
                      {/* Detailed description */}
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700 whitespace-pre-line">{structure.detailedDescription}</p>
                      </div>

                      {/* Pros & Cons */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Stärken
                          </p>
                          <ul className="space-y-1">
                            {structure.pros.slice(0, 3).map((pro, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                <span className="text-green-500 mt-0.5">+</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Herausforderungen
                          </p>
                          <ul className="space-y-1">
                            {structure.cons.slice(0, 2).map((con, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                <span className="text-amber-500 mt-0.5">~</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Ideal for */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-xs text-slate-500">Ideal für:</span>
                        {structure.idealFor.map((use, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="w-48 shrink-0 border-l pl-6 flex flex-col justify-center">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <LayoutGrid className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{structure.beats.length} Story-Beats</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{structure.acts} Akte</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{structure.complexity}</span>
                        </div>
                      </div>
                      
                      <Button className="mt-6 w-full" size="sm">
                        Auswählen
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
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
    <TooltipProvider>
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
              <h2 className="text-xl font-bold flex items-center gap-2">
                {currentBeat?.name}
                {currentBeat?.glossary && currentBeat.glossary.length > 0 && (
                  <span className="text-sm font-normal text-slate-500">
                    (siehe: {currentBeat.glossary.map((g, i) => (
                      <span key={g}>
                        <GlossaryTerm term={g} showIcon={false} />
                        {i < (currentBeat.glossary?.length || 0) - 1 && ', '}
                      </span>
                    ))})
                  </span>
                )}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep('structure')}>
                Struktur ändern
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <BookOpen className="h-4 w-4" />
                    Glossar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Fachbegriffe erklärt</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {Object.entries(PLOT_GLOSSARY).map(([term, info]) => (
                      <div key={term} className="p-3 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-violet-700">{term}</h4>
                        <p className="text-sm text-slate-600">{info.short}</p>
                        <p className="text-sm text-slate-700 mt-1">{info.full}</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
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

        {/* Tension Curve Visualization */}
        <div className="bg-slate-50 border-b">
          <div className="max-w-6xl mx-auto p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-500" />
                Spannungsbogen über die Story
              </h3>
              <span className="text-xs text-slate-500">
                Klicke auf die Punkte, um Beats auszuwählen
              </span>
            </div>
            <TensionCurve beats={beats} selectedIndex={selectedBeatIndex} />
          </div>
        </div>

        {/* Timeline Navigation */}
        <div className="bg-white border-b p-4">
          <div className="max-w-6xl mx-auto">
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2 min-w-max">
                {beats.map((beat, i) => {
                  const isActive = i === selectedBeatIndex;
                  const isFilled = beat.content.length > 20;
                  const tension = beat.tensionLevel || 50;
                  
                  return (
                    <button
                      key={beat.id}
                      onClick={() => setSelectedBeatIndex(i)}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-lg border-2 min-w-[140px] transition-all",
                        isActive 
                          ? "border-violet-500 bg-white shadow-lg" 
                          : "border-transparent hover:border-slate-300",
                        beat.act === 'act1' ? "bg-blue-50/50" :
                        beat.act === 'act2a' || beat.act === 'act2b' ? "bg-amber-50/50" :
                        "bg-green-50/50"
                      )}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-slate-500">{i + 1}</span>
                        {/* Tension indicator */}
                        <div 
                          className={cn(
                            "w-2 h-2 rounded-full",
                            tension < 30 ? "bg-green-400" :
                            tension < 60 ? "bg-amber-400" :
                            tension < 85 ? "bg-orange-400" :
                            "bg-red-500"
                          )}
                          title={`Spannung: ${tension}%`}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-medium text-center line-clamp-2",
                        isActive ? "text-violet-700" : "text-slate-700"
                      )}>
                        {beat.name}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        {isFilled && (
                          <span className="text-[10px] text-green-600">✓</span>
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px] px-1 py-0 h-4",
                            beat.act === 'act1' ? "border-blue-300 text-blue-600" :
                            beat.act === 'act2a' || beat.act === 'act2b' ? "border-amber-300 text-amber-600" :
                            "border-green-300 text-green-600"
                          )}
                        >
                          {beat.act === 'act1' ? 'Akt 1' :
                           beat.act === 'act2a' || beat.act === 'act2b' ? 'Akt 2' :
                           'Akt 3'}
                        </Badge>
                      </div>
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
                        <span className="text-xs text-slate-500">Spannungslevel</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all",
                                (currentBeat.tensionLevel || 0) < 30 ? "bg-green-400" :
                                (currentBeat.tensionLevel || 0) < 60 ? "bg-amber-400" :
                                (currentBeat.tensionLevel || 0) < 85 ? "bg-orange-400" :
                                "bg-red-500"
                              )}
                              style={{ width: `${currentBeat.tensionLevel || 50}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{currentBeat.tensionLevel || 50}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Beschreibung</span>
                        <p className="text-sm">{currentBeat.description}</p>
                      </div>
                      
                      {/* Glossary terms for this beat */}
                      {currentBeat.glossary && currentBeat.glossary.length > 0 && (
                        <div className="p-3 bg-violet-50 rounded border border-violet-200">
                          <span className="text-xs text-violet-700 font-medium flex items-center gap-1 mb-2">
                            <BookOpen className="h-3 w-3" />
                            Fachbegriffe in diesem Beat
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {currentBeat.glossary.map(term => (
                              <GlossaryTerm key={term} term={term} />
                            ))}
                          </div>
                        </div>
                      )}

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
    </TooltipProvider>
  );
}
