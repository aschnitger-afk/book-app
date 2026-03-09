'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  GitBranch, BookOpen, Plus, ChevronRight, ChevronDown, 
  Target, Layers, CheckCircle2, Circle, Save,
  Edit3, LayoutGrid, List, ArrowRight, Sparkles, PenTool,
  Lightbulb, StickyNote, Film, User, BookMarked, Grid3X3,
  Clock, Wand2, MoreHorizontal, Trash2, X, Users, MapPin,
  Globe, Info, MousePointer2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { PLOT_STRUCTURES, PLOT_GLOSSARY } from '@/lib/plot/structures';
import { IdeaBoard } from '@/components/plot/IdeaBoard';
import { WritingTutor } from '@/components/writing/WritingTutor';
import { ScenePingPongV2 } from '@/components/writing/ScenePingPongV2';
import { VersionHistory } from '@/components/shared/VersionHistory';
import { TextEditorToolbar } from '@/components/writing/TextEditorToolbar';

// Types
interface StoryBeat {
  id: string;
  name: string;
  description: string;
  act: 'act1' | 'act2a' | 'act2b' | 'act3';
  content?: string;
  order: number;
  tensionLevel?: number;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  plotPointId: string | null;
  wordCount: number;
  status: 'draft' | 'writing' | 'completed';
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
  povCharacter: string | null;
  setting: string | null;
  timeline: string | null;
  aiAnalysis: string | null;
  suggestions: string | null;
  isScreenplayFormat: boolean;
  sceneHeading: string | null;
  sceneDescription: string | null;
}

// Act Configuration
const ACT_CONFIG = {
  act1: { 
    label: 'Akt 1', 
    color: 'bg-blue-500', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200', 
    text: 'text-blue-700', 
    desc: 'Setup',
    fullDesc: 'Einführung: Welt, Charaktere, Status Quo, Call to Adventure'
  },
  act2a: { 
    label: 'Akt 2a', 
    color: 'bg-amber-500', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200', 
    text: 'text-amber-700', 
    desc: 'Konfrontation',
    fullDesc: 'Steigende Aktion: Protagonist reagiert, neue Welt, erste Hindernisse'
  },
  act2b: { 
    label: 'Akt 2b', 
    color: 'bg-orange-500', 
    bg: 'bg-orange-50', 
    border: 'border-orange-200', 
    text: 'text-orange-700', 
    desc: 'Krise',
    fullDesc: 'Point of No Return: Tiefpunkt, größte Herausforderung, Selbstzweifel'
  },
  act3: { 
    label: 'Akt 3', 
    color: 'bg-green-500', 
    bg: 'bg-green-50', 
    border: 'border-green-200', 
    text: 'text-green-700', 
    desc: 'Resolution',
    fullDesc: 'Auflösung: Finale, Konfrontation, neue Ordnung'
  },
};

// Structure Selection View
function StructureSelection({ 
  onSelect, 
  currentStructure 
}: { 
  onSelect: (structure: any) => void;
  currentStructure: string | null;
}) {
  return (
    <div className="h-full overflow-auto p-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Wähle deine Story-Struktur</h2>
          <p className="text-slate-600">
            Die Struktur wird das Gerüst deiner Geschichte. Du kannst sie später jederzeit anpassen.
          </p>
        </div>

        <div className="grid gap-4">
          {PLOT_STRUCTURES.map((structure) => (
            <motion.div
              key={structure.id}
              whileHover={{ scale: 1.01 }}
              className={cn(
                "bg-white rounded-xl border-2 p-6 cursor-pointer transition-all",
                currentStructure === structure.id
                  ? "border-violet-500 ring-2 ring-violet-200"
                  : "border-slate-200 hover:border-violet-300"
              )}
              onClick={() => onSelect(structure)}
            >
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{structure.name}</h3>
                    <Badge variant="outline" className={cn(
                      structure.complexity === 'Einfach' && "border-green-300 text-green-700 bg-green-50",
                      structure.complexity === 'Mittel' && "border-amber-300 text-amber-700 bg-amber-50",
                      structure.complexity === 'Komplex' && "border-red-300 text-red-700 bg-red-50",
                    )}>
                      {structure.complexity}
                    </Badge>
                  </div>
                  
                  <p className="text-slate-600 mb-4">{structure.description}</p>
                  
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-slate-700">{structure.detailedDescription}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {structure.idealFor.slice(0, 3).map((use, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="w-48 shrink-0 border-l pl-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <List className="h-4 w-4" />
                      <span>{structure.beats.length} Story-Beats</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{structure.acts} Akte</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant={currentStructure === structure.id ? "default" : "outline"}>
                    {currentStructure === structure.id ? 'Ausgewählt' : 'Auswählen'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tension Curve Visualization
function TensionCurve({ beats }: { beats: StoryBeat[] }) {
  const width = 700;
  const height = 100;
  const padding = { top: 10, right: 20, bottom: 20, left: 30 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  if (beats.length < 2) return null;

  const points = beats.map((beat, index) => ({
    x: padding.left + (index / (beats.length - 1)) * graphWidth,
    y: padding.top + graphHeight - ((beat.tensionLevel || 50) / 100) * graphHeight,
    beat,
  }));

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

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-4 w-4 text-violet-500" />
        <span className="text-sm font-medium">Spannungsbogen</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-3xl">
        <defs>
          <linearGradient id="tensionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {[0, 50, 100].map(level => (
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
        
        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
        
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="5"
            fill="white"
            stroke={ACT_CONFIG[p.beat.act].color.replace('bg-', '#').replace('500', '')}
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}

// Story Beat Card with Chapters
function StoryBeatCard({
  beat,
  chapters,
  currentChapter,
  onSelectChapter,
  onAddChapter,
  expanded,
  onToggle
}: {
  beat: StoryBeat;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onSelectChapter: (chapter: Chapter) => void;
  onAddChapter: (beatId: string) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const config = ACT_CONFIG[beat.act];
  const beatChapters = chapters.filter(c => c.plotPointId === beat.id);
  const writtenChapters = beatChapters.filter(c => c.content?.length > 100).length;
  const progress = beatChapters.length > 0 ? (writtenChapters / beatChapters.length) * 100 : 0;

  return (
    <div className={cn("rounded-xl border-2 overflow-hidden transition-all", config.border)}>
      <button
        onClick={onToggle}
        className={cn("w-full p-4 text-left", config.bg)}
      >
        <div className="flex items-start gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0", config.color)}>
            {beat.order}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn("font-bold", config.text)}>{beat.name}</h4>
              <Badge className={cn("text-[10px]", config.color, "text-white")}>
                {config.label}
              </Badge>
            </div>
            
            {/* Beat Description - More prominent */}
            <div className="bg-white/60 rounded p-2 mb-2">
              <p className="text-sm text-slate-700">{beat.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all", config.color)}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-slate-600 shrink-0 font-medium">
                {writtenChapters}/{beatChapters.length} Kapitel
              </span>
            </div>
          </div>

          <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform shrink-0", expanded && "rotate-180")} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-white"
          >
            <div className="p-4 pl-16">
              {beatChapters.length === 0 ? (
                <div className="text-center py-4 border-2 border-dashed rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-500 mb-1">
                    <strong>Noch keine Kapitel</strong> für diesen Story-Beat
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    Ein Beat kann ein oder mehrere Kapitel enthalten
                  </p>
                  <Button size="sm" variant="outline" onClick={() => onAddChapter(beat.id)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Erstes Kapitel schreiben
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {beatChapters.map((chapter, idx) => (
                    <div
                      key={chapter.id}
                      onClick={() => onSelectChapter(chapter)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                        currentChapter?.id === chapter.id
                          ? "bg-violet-50 ring-2 ring-violet-300"
                          : "bg-slate-50 hover:bg-slate-100"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                        chapter.content?.length > 100
                          ? "bg-green-100 text-green-600"
                          : "bg-slate-200 text-slate-500"
                      )}>
                        {chapter.content?.length > 100 ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{chapter.title}</p>
                        <p className="text-xs text-slate-400">{chapter.wordCount || 0} Wörter</p>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => onAddChapter(beat.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Weiteres Kapitel zu diesem Beat
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Act Section Component
function ActSection({
  act,
  beats,
  chapters,
  currentChapter,
  onSelectChapter,
  onAddChapter,
  expandedBeats,
  onToggleBeat
}: {
  act: 'act1' | 'act2a' | 'act2b' | 'act3';
  beats: StoryBeat[];
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onSelectChapter: (chapter: Chapter) => void;
  onAddChapter: (beatId: string) => void;
  expandedBeats: Set<string>;
  onToggleBeat: (id: string) => void;
}) {
  const config = ACT_CONFIG[act];
  const actBeats = beats.filter(b => b.act === act);
  const totalChapters = actBeats.reduce((sum, beat) => 
    sum + chapters.filter(c => c.plotPointId === beat.id).length, 0
  );

  if (actBeats.length === 0) return null;

  return (
    <div className="mb-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "sticky top-0 z-10 px-3 py-2 rounded-lg mb-3 flex items-center justify-between cursor-help",
              config.bg,
              config.border,
              "border"
            )}>
              <div className="flex items-center gap-2">
                <span className={cn("w-3 h-3 rounded-full", config.color)} />
                <h3 className={cn("font-bold text-sm", config.text)}>
                  {config.label} — {config.desc}
                </h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {actBeats.length} Beats • {totalChapters} Kapitel
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-sm">
            <p className="font-medium mb-1">{config.label}: {config.desc}</p>
            <p className="text-xs text-slate-500">{config.fullDesc}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="space-y-3 pl-2">
        {actBeats.map(beat => (
          <StoryBeatCard
            key={beat.id}
            beat={beat}
            chapters={chapters}
            currentChapter={currentChapter}
            onSelectChapter={onSelectChapter}
            onAddChapter={onAddChapter}
            expanded={expandedBeats.has(beat.id)}
            onToggle={() => onToggleBeat(beat.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Main Component
export function StoryPhase() {
  const params = useParams();
  const bookId = params.id as string;
  const { currentBook, setCurrentBook, characters, setCharacters, researchNotes, setResearchNotes } = useAppStore();
  
  const [view, setView] = useState<'structure' | 'board' | 'writing'>('writing');
  const [selectedStructure, setSelectedStructure] = useState<any>(null);
  const [beats, setBeats] = useState<StoryBeat[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [expandedBeats, setExpandedBeats] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'pingpong' | 'classic'>('classic');
  const [activeTab, setActiveTab] = useState<'tutor' | 'characters' | 'world'>('tutor');
  const [showGuide, setShowGuide] = useState(true);

  // Load data
  useEffect(() => {
    if (bookId) loadData();
  }, [bookId]);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/books/${bookId}`);
      const book = await res.json();
      setCurrentBook(book);
      setChapters(book.chapters || []);
      setCharacters(book.characters || []);
      setResearchNotes(book.researchNotes || []);

      if (book.plotStructure) {
        try {
          const parsed = JSON.parse(book.plotStructure);
          setSelectedStructure(PLOT_STRUCTURES.find(s => s.id === parsed.plotStructure) || null);
          setBeats(parsed.beats?.map((b: any, i: number) => ({ ...b, order: i + 1 })) || []);
          
          // Expand first act by default
          if (parsed.beats) {
            const firstActBeats = parsed.beats
              .filter((b: any) => b.act === 'act1')
              .map((b: any) => b.id);
            setExpandedBeats(new Set(firstActBeats));
          }
        } catch (e) {
          console.error('Failed to parse plot structure:', e);
        }
      }
    } catch (error) {
      console.error('Failed to load:', error);
    }
  };

  const selectStructure = async (structure: any) => {
    const newBeats = structure.beats.map((beat: any, index: number) => ({
      ...beat,
      id: `beat-${Date.now()}-${index}`,
      order: index + 1,
    }));

    setSelectedStructure(structure);
    setBeats(newBeats);
    
    await fetch('/api/plot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId,
        plotStructure: structure.id,
        beats: newBeats,
      }),
    });

    const firstActBeats = newBeats.filter((b: StoryBeat) => b.act === 'act1').map((b: StoryBeat) => b.id);
    setExpandedBeats(new Set(firstActBeats));
    setView('writing');
  };

  const addChapter = async (beatId: string) => {
    const beatChapters = chapters.filter(c => c.plotPointId === beatId);
    const beat = beats.find(b => b.id === beatId);
    
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          title: `Kapitel ${chapters.length + 1}${beat ? ` — ${beat.name}` : ''}`,
          plotPointId: beatId,
          order: chapters.length,
        }),
      });
      
      const newChapter = await res.json();
      setChapters(prev => [...prev, newChapter]);
      setCurrentChapter(newChapter);
      setExpandedBeats(prev => new Set([...prev, beatId]));
    } catch (error) {
      console.error('Failed to add chapter:', error);
    }
  };

  const saveChapter = async (id: string, content: string, title: string) => {
    try {
      await fetch(`/api/chapters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          wordCount: content.split(/\s+/).filter((w: string) => w.length > 0).length,
        }),
      });
      
      setChapters(prev => prev.map(c => 
        c.id === id ? { ...c, content, title, wordCount: content.split(/\s+/).filter((w: string) => w.length > 0).length } : c
      ));

      // Trigger auto-snapshot after save
      await fetch('/api/auto-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: id,
          type: 'auto',
        }),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const toggleBeat = (id: string) => {
    setExpandedBeats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const buildContext = () => ({
    genre: currentBook?.genre,
    characters: characters.map(c => ({
      name: c.name,
      role: c.role,
      goals: c.storyGoal || c.goals,
      motivations: c.motivations,
    })),
    plotPoints: beats.map(b => ({
      title: b.name,
      description: b.description,
      act: b.act,
    })),
  });

  const totalWords = chapters.reduce((sum, c) => sum + (c.wordCount || 0), 0);
  const completedChapters = chapters.filter(c => c.content?.length > 100).length;

  // Views
  if (view === 'structure' || (!selectedStructure && view === 'writing')) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Story-Struktur wählen</h1>
            <p className="text-slate-500 text-sm">Wähle eine bewährte Struktur für deine Geschichte</p>
          </div>
          {selectedStructure && (
            <Button variant="outline" onClick={() => setView('writing')}>
              Zurück zur Übersicht
            </Button>
          )}
        </div>
        <StructureSelection 
          onSelect={selectStructure} 
          currentStructure={selectedStructure?.id || null} 
        />
      </div>
    );
  }

  if (view === 'board') {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ideen-Board</h1>
            <p className="text-slate-500 text-sm">Sammle Ideen und ordne sie später der Story-Struktur zu</p>
          </div>
          <Button variant="outline" onClick={() => setView('writing')}>
            Zurück zur Story
          </Button>
        </div>
        <div className="flex-1">
          <IdeaBoard onIntegrateIntoPlot={() => {
            loadData();
            setView('writing');
          }} />
        </div>
      </div>
    );
  }

  const currentBeat = currentChapter ? beats.find(b => b.id === currentChapter.plotPointId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Story & Schreiben</h1>
            <p className="text-slate-500 text-sm mt-1">
              {selectedStructure?.name} • {beats.length} Beats • {chapters.length} Kapitel • {totalWords.toLocaleString()} Wörter
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setView('structure')}>
              <Grid3X3 className="h-4 w-4 mr-2" />
              Struktur ändern
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView('board')}>
              <StickyNote className="h-4 w-4 mr-2" />
              Ideen-Board
            </Button>
          </div>
        </div>
      </div>

      {/* Tension Curve */}
      {beats.length > 0 && <TensionCurve beats={beats} />}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Story Structure - NOW WITH BETTER SCROLLING */}
        <div className="w-80 border-r bg-slate-50 flex flex-col h-full">
          <div className="p-4 border-b bg-white shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-violet-600" />
                Story-Struktur
              </h2>
              <Badge variant="secondary" className="text-xs">
                {completedChapters}/{chapters.length} geschrieben
              </Badge>
            </div>
          </div>
          
          {/* Guide */}
          {showGuide && (
            <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shrink-0 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium">
                    Wie funktioniert die Story-Struktur?
                  </p>
                </div>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* What are Beats */}
              <div className="bg-white/70 rounded p-3">
                <p className="text-xs text-blue-800 font-medium mb-1">Was sind Story-Beats?</p>
                <p className="text-xs text-blue-700">
                  Story-Beats sind die <strong>großen Stationen</strong> deiner Geschichte (z.B. „Der Brief kommt an" oder „Die Konfrontation"). 
                  Sie bilden das Gerüst deines Plots. Jedem Beat kannst du <strong>ein oder mehrere Kapitel</strong> zuordnen.
                </p>
              </div>

              {/* Color Legend */}
              <div className="space-y-1.5">
                <p className="text-xs text-blue-800 font-medium">Die 4 Akte:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-blue-900"><strong>Akt 1:</strong> Setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-amber-900"><strong>Akt 2a:</strong> Konfrontation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-orange-900"><strong>Akt 2b:</strong> Krise</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-green-900"><strong>Akt 3:</strong> Auflösung</span>
                  </div>
                </div>
              </div>

              {/* How to use */}
              <div className="bg-white/70 rounded p-3">
                <p className="text-xs text-blue-800 font-medium mb-1">So gehst du vor:</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Klicke auf einen <strong>Story-Beat</strong>, um ihn zu erweitern</li>
                  <li>Klicke auf <strong>„Erstes Kapitel"</strong>, um zu schreiben</li>
                  <li>Dein Kapitel ist automatisch diesem Beat zugeordnet</li>
                  <li>Der Fortschrittsbalken zeigt, wie viele Kapitel geschrieben sind</li>
                </ol>
              </div>
            </div>
          )}
          
          {/* Scrollable Beats List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {(['act1', 'act2a', 'act2b', 'act3'] as const).map(act => (
                <ActSection
                  key={act}
                  act={act}
                  beats={beats}
                  chapters={chapters}
                  currentChapter={currentChapter}
                  onSelectChapter={setCurrentChapter}
                  onAddChapter={addChapter}
                  expandedBeats={expandedBeats}
                  onToggleBeat={toggleBeat}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center: Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-white h-full">
          {currentChapter ? (
            <>
              {/* Editor Header */}
              <div className="border-b px-6 py-4 bg-slate-50 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {currentBeat && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <GitBranch className="h-3 w-3" />
                        <span>Story-Beat: {currentBeat.name}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>Kapitel</span>
                      </div>
                    )}
                    <Input
                      value={currentChapter.title}
                      onChange={(e) => setCurrentChapter({ ...currentChapter, title: e.target.value })}
                      className="border-0 bg-transparent font-bold text-xl focus-visible:ring-0 px-0"
                    />
                    {currentBeat && (
                      <p className="text-sm text-slate-500 mt-1">
                        <strong>Ziel dieses Story-Beats:</strong> {currentBeat.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <VersionHistory
                      chapterId={currentChapter.id}
                      bookId={bookId}
                      currentContent={currentChapter.content}
                      currentTitle={currentChapter.title}
                      currentWordCount={currentChapter.wordCount || 0}
                      onRestore={(content, title) => {
                        setCurrentChapter({ ...currentChapter, content, title });
                        loadData();
                      }}
                      onSave={() => saveChapter(currentChapter.id, currentChapter.content, currentChapter.title)}
                    />
                    <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                      <button
                        onClick={() => setViewMode('pingpong')}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5",
                          viewMode === 'pingpong' ? 'bg-violet-100 text-violet-700' : 'text-slate-600'
                        )}
                      >
                        <Target className="h-4 w-4" />
                        Szene-für-Szene
                      </button>
                      <button
                        onClick={() => setViewMode('classic')}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5",
                          viewMode === 'classic' ? 'bg-violet-100 text-violet-700' : 'text-slate-600'
                        )}
                      >
                        <Edit3 className="h-4 w-4" />
                        Frei
                      </button>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => saveChapter(currentChapter.id, currentChapter.content, currentChapter.title)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Speichern
                    </Button>
                  </div>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Text Toolbar */}
                <div className="px-6 py-2 border-b bg-white">
                  <TextEditorToolbar
                    content={currentChapter.content}
                    onApply={(newContent) => {
                      setCurrentChapter({ ...currentChapter, content: newContent });
                    }}
                    disabled={false}
                  />
                </div>
                
                {/* Text Area */}
                <div className="flex-1 overflow-hidden">
                  {viewMode === 'pingpong' ? (
                    <ScenePingPongV2 
                      chapter={currentChapter} 
                      bookId={bookId}
                    />
                  ) : (
                    <div className="h-full p-6">
                      <textarea
                        value={currentChapter.content}
                        onChange={(e) => setCurrentChapter({ ...currentChapter, content: e.target.value })}
                        className="w-full h-full resize-none border-0 focus:outline-none focus:ring-0 font-serif text-lg leading-relaxed"
                        placeholder="Beginne zu schreiben..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Stats */}
              <div className="border-t px-6 py-3 flex items-center justify-between text-sm text-slate-500 bg-slate-50 shrink-0">
                <span>{(currentChapter.content || '').split(/\s+/).filter(w => w.length > 0).length} Wörter</span>
                <span>{(currentChapter.content || '').length} Zeichen</span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <PenTool className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Wähle ein Kapitel
                </h3>
                <p className="text-slate-500 mb-4">
                  Klicke links auf einen Story-Beat, um ihn zu erweitern. 
                  Dann wähle ein Kapitel oder erstelle ein neues.
                </p>
                {beats.length > 0 && (
                  <Button onClick={() => addChapter(beats[0].id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Erstes Kapitel schreiben
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Assistant & Context */}
        {currentChapter && (
          <div className="w-80 border-l bg-slate-50 flex flex-col h-full">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b bg-white px-2 h-10 shrink-0">
                <TabsTrigger value="tutor" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  KI-Tutor
                </TabsTrigger>
                <TabsTrigger value="characters" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Figuren
                </TabsTrigger>
                <TabsTrigger value="world" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Welt
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="tutor" className="m-0 h-full">
                  <WritingTutor
                    chapterContent={currentChapter.content}
                    chapterTitle={currentChapter.title}
                    bookId={bookId}
                    chapterId={currentChapter.id}
                    bookContext={buildContext()}
                    onApplySuggestion={(text) => {
                      setCurrentChapter({ ...currentChapter, content: currentChapter.content + '\n\n' + text });
                    }}
                  />
                </TabsContent>

                <TabsContent value="characters" className="m-0 p-3 h-full overflow-y-auto">
                  <div className="space-y-2">
                    {characters.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Noch keine Charaktere</p>
                      </div>
                    ) : (
                      characters.map((char) => (
                        <div key={char.id} className="bg-white rounded-lg border p-3">
                          <p className="font-medium text-sm">{char.name}</p>
                          {char.role && <p className="text-xs text-slate-500">{char.role}</p>}
                          {char.storyGoal && (
                            <p className="text-xs text-slate-600 mt-1">Ziel: {char.storyGoal}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="world" className="m-0 p-3 h-full overflow-y-auto">
                  {researchNotes?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Noch keine Recherche-Notizen</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {researchNotes?.map((note) => (
                        <div key={note.id} className="bg-white rounded-lg border p-3">
                          <p className="font-medium text-sm">{note.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-3">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
