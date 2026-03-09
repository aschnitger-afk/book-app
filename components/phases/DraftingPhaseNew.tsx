'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Save, Sparkles, FileText, Users, MapPin, 
  Loader2, Plus, BookOpen, ChevronRight, Target, Edit3,
  LayoutGrid, GitBranch, CheckCircle2, Clock,
  Lightbulb, User, Film, AlertCircle, ArrowRight,
  ChevronDown, ChevronUp, FolderTree, Layers
} from 'lucide-react';
import { useAppStore, Chapter, Character, ResearchNote } from '@/lib/store';
import { ScenePingPongV2 } from '@/components/writing/ScenePingPongV2';
import { WritingTutor } from '@/components/writing/WritingTutor';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Plot Point with Chapters Card
function PlotPointCard({ 
  plotPoint, 
  chapters,
  currentChapter,
  onChapterSelect,
  expanded,
  onToggle
}: { 
  plotPoint: any;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const linkedChapters = chapters.filter(c => c.plotPointId === plotPoint.id);
  const isCompleted = plotPoint.content?.length > 50;
  
  const actColors = {
    act1: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    act2a: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    act2b: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
    act3: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  };

  const colors = actColors[plotPoint.act as keyof typeof actColors] || actColors.act1;

  return (
    <div className={cn("rounded-xl border-2 overflow-hidden", colors.border, colors.bg)}>
      {/* Plot Point Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/50 transition-colors"
      >
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          isCompleted ? "bg-green-100 text-green-600" : "bg-white text-slate-400"
        )}>
          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <GitBranch className="h-4 w-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn("font-semibold", colors.text)}>{plotPoint.name || plotPoint.title}</h4>
            <Badge className={cn("text-[10px]", colors.badge)}>
              {plotPoint.act === 'act1' ? 'Akt 1' : 
               plotPoint.act === 'act2a' ? 'Akt 2a' : 
               plotPoint.act === 'act2b' ? 'Akt 2b' : 'Akt 3'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plotPoint.description}</p>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {linkedChapters.length} Kapitel
            </span>
            {linkedChapters.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {linkedChapters.filter(c => c.content?.length > 100).length} geschrieben
              </span>
            )}
          </div>
        </div>

        <ChevronDown className={cn(
          "h-5 w-5 text-slate-400 transition-transform shrink-0",
          expanded && "rotate-180"
        )} />
      </button>

      {/* Chapters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-15">
              {linkedChapters.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2 pl-11">
                  Noch keine Kapitel zugeordnet
                </div>
              ) : (
                <div className="space-y-1 pl-11">
                  {linkedChapters.map((chapter, idx) => (
                    <button
                      key={chapter.id}
                      onClick={() => onChapterSelect(chapter)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                        currentChapter?.id === chapter.id
                          ? "bg-white shadow-sm ring-1 ring-violet-300"
                          : "hover:bg-white/50"
                      )}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-medium">
                        {idx + 1}
                      </span>
                      <span className="flex-1 truncate">{chapter.title}</span>
                      {chapter.content?.length > 100 && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Unassigned Chapters Section
function UnassignedChapters({ 
  chapters, 
  plotPoints,
  currentChapter, 
  onChapterSelect,
  onAssign
}: { 
  chapters: Chapter[];
  plotPoints: any[];
  currentChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
  onAssign: (chapterId: string, plotPointId: string) => void;
}) {
  const unassigned = chapters.filter(c => !c.plotPointId);
  const [isOpen, setIsOpen] = useState(true);

  if (unassigned.length === 0) return null;

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-700">Nicht zugeordnete Kapitel</span>
          <Badge variant="secondary" className="text-xs">{unassigned.length}</Badge>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {unassigned.map((chapter, idx) => (
                <div 
                  key={chapter.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg bg-white border",
                    currentChapter?.id === chapter.id 
                      ? "border-violet-300 shadow-sm" 
                      : "border-slate-200"
                  )}
                >
                  <button
                    onClick={() => onChapterSelect(chapter)}
                    className="flex-1 flex items-center gap-2 text-left"
                  >
                    <span className="text-xs text-slate-400">#{chapters.indexOf(chapter) + 1}</span>
                    <span className="text-sm">{chapter.title}</span>
                  </button>
                  
                  {/* Assign Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        onAssign(chapter.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-xs border rounded px-2 py-1 bg-slate-50"
                    value=""
                  >
                    <option value="">Zuordnen zu...</option>
                    {plotPoints.map(pp => (
                      <option key={pp.id} value={pp.id}>{pp.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick Stats Component
function WritingStats({ chapters, plotPoints }: { chapters: Chapter[]; plotPoints: any[] }) {
  const writtenChapters = chapters.filter(c => c.content?.length > 100).length;
  const completedPlotPoints = plotPoints.filter(pp => pp.content?.length > 50).length;
  const totalWords = chapters.reduce((sum, c) => sum + (c.wordCount || 0), 0);

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
        <div className="text-2xl font-bold text-violet-700">{chapters.length}</div>
        <div className="text-xs text-violet-600">Kapitel</div>
      </div>
      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
        <div className="text-2xl font-bold text-green-700">{writtenChapters}</div>
        <div className="text-xs text-green-600">Geschrieben</div>
      </div>
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="text-2xl font-bold text-blue-700">{totalWords.toLocaleString()}</div>
        <div className="text-xs text-blue-600">Wörter</div>
      </div>
    </div>
  );
}

export function DraftingPhaseNew() {
  const params = useParams();
  const bookId = params.id as string;
  
  const {
    currentBook,
    setCurrentBook,
    chapters,
    characters,
    researchNotes,
    setChapters,
    setCharacters,
    setResearchNotes,
  } = useAppStore();

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [viewMode, setViewMode] = useState<'pingpong' | 'classic'>('pingpong');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [parsedPlotStructure, setParsedPlotStructure] = useState<any>(null);
  const [expandedPlotPoints, setExpandedPlotPoints] = useState<Set<string>>(new Set());

  // Load data
  useEffect(() => {
    if (bookId) fetchBook();
  }, [bookId]);

  // Parse plot structure
  useEffect(() => {
    if (currentBook?.plotStructure) {
      try {
        const parsed = JSON.parse(currentBook.plotStructure);
        setParsedPlotStructure(parsed);
        // Expand first act by default
        if (parsed?.beats) {
          const firstActBeats = parsed.beats
            .filter((b: any) => b.act === 'act1')
            .map((b: any) => b.id);
          setExpandedPlotPoints(new Set(firstActBeats));
        }
      } catch (e) {
        console.error('Failed to parse plot structure:', e);
      }
    }
  }, [currentBook?.plotStructure]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}`);
      const book = await response.json();
      setCurrentBook(book);
      setChapters(book.chapters || []);
      setCharacters(book.characters || []);
      setResearchNotes(book.researchNotes || []);
      
      if (book.chapters?.length > 0 && !currentChapter) {
        setCurrentChapter(book.chapters[0]);
      }
    } catch (error) {
      console.error('Failed to fetch book:', error);
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;
    
    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newChapterTitle,
          bookId,
          order: chapters.length,
        }),
      });

      const chapter = await response.json();
      setChapters([...chapters, chapter]);
      setNewChapterTitle('');
      setIsAddingChapter(false);
      setCurrentChapter(chapter);
    } catch (error) {
      console.error('Failed to add chapter:', error);
    }
  };

  const assignChapterToPlotPoint = async (chapterId: string, plotPointId: string) => {
    try {
      await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plotPointId }),
      });
      
      const currentChapters = chapters;
      setChapters(currentChapters.map(c => 
        c.id === chapterId ? { ...c, plotPointId } : c
      ));
    } catch (error) {
      console.error('Failed to assign chapter:', error);
    }
  };

  const togglePlotPoint = (id: string) => {
    setExpandedPlotPoints(prev => {
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
    plotPoints: parsedPlotStructure?.beats?.map((b: any) => ({
      title: b.name,
      description: b.description,
      act: b.act,
    })) || [],
  });

  // LEFT SIDEBAR: Plot Structure with Chapters
  const LeftSidebar = () => (
    <div className="w-80 border-r bg-slate-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Story & Kapitel</h2>
            <p className="text-xs text-slate-500">
              {chapters.length} Kapitel in {parsedPlotStructure?.beats?.length || 0} Story-Beats
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <WritingStats chapters={chapters} plotPoints={parsedPlotStructure?.beats || []} />
        
        {/* Add Chapter */}
        {isAddingChapter ? (
          <div className="space-y-2">
            <Input
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="Kapitel-Titel"
              className="h-9 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
            />
            <div className="flex gap-1">
              <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleAddChapter}>
                Erstellen
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsAddingChapter(false)}>
                ✕
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setIsAddingChapter(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Neues Kapitel
          </Button>
        )}
      </div>

      {/* Story Structure */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Info Text */}
          <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <Lightbulb className="h-3.5 w-3.5 inline mr-1 text-blue-500" />
            <strong>Hierarchie:</strong> Story-Beats (Plot Points) enthalten Kapitel. 
            Ein Beat kann mehrere Kapitel haben.
          </div>

          {/* Plot Points with Chapters */}
          {parsedPlotStructure?.beats?.length > 0 ? (
            <div className="space-y-3">
              {parsedPlotStructure.beats.map((beat: any, index: number) => (
                <PlotPointCard
                  key={beat.id}
                  plotPoint={beat}
                  chapters={chapters}
                  currentChapter={currentChapter}
                  onChapterSelect={setCurrentChapter}
                  expanded={expandedPlotPoints.has(beat.id)}
                  onToggle={() => togglePlotPoint(beat.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Keine Plot-Struktur vorhanden</p>
              <p className="text-xs mt-1">Erstelle zuerst eine Struktur im "Plotting" Reiter</p>
            </div>
          )}

          {/* Unassigned Chapters */}
          <UnassignedChapters
            chapters={chapters}
            plotPoints={parsedPlotStructure?.beats || []}
            currentChapter={currentChapter}
            onChapterSelect={setCurrentChapter}
            onAssign={assignChapterToPlotPoint}
          />
        </div>
      </ScrollArea>
    </div>
  );

  // CENTER: Editor
  const CenterEditor = () => {
    if (!currentChapter) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Wähle ein Kapitel</p>
            <Button onClick={() => setIsAddingChapter(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Kapitel
            </Button>
          </div>
        </div>
      );
    }

    const linkedPlotPoint = parsedPlotStructure?.beats?.find((b: any) => b.id === currentChapter.plotPointId);

    return (
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <div className="border-b px-6 py-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Breadcrumb */}
              {linkedPlotPoint && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <GitBranch className="h-3 w-3" />
                  <span>Story-Beat: {linkedPlotPoint.name}</span>
                  <ChevronRight className="h-3 w-3" />
                  <span>Kapitel</span>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Input
                  value={currentChapter.title}
                  onChange={(e) => setCurrentChapter({ ...currentChapter, title: e.target.value })}
                  className="border-0 bg-transparent font-bold text-xl focus-visible:ring-0 px-0 w-auto text-slate-800"
                />
              </div>
              
              {linkedPlotPoint && (
                <p className="text-sm text-slate-500 mt-1">
                  <strong className="text-slate-700">Ziel dieses Story-Beats:</strong>{' '}
                  {linkedPlotPoint.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setViewMode('pingpong')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5",
                    viewMode === 'pingpong' ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:text-slate-800'
                  )}
                >
                  <Target className="h-4 w-4" />
                  Szene-für-Szene
                </button>
                <button
                  onClick={() => setViewMode('classic')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5",
                    viewMode === 'classic' ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:text-slate-800'
                  )}
                >
                  <Edit3 className="h-4 w-4" />
                  Frei
                </button>
              </div>
              <Button size="sm" variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'pingpong' ? (
            <ScenePingPongV2 chapter={currentChapter} bookId={bookId} />
          ) : (
            <div className="h-full p-6">
              <textarea
                className="w-full h-full resize-none border-0 focus:outline-none focus:ring-0 font-serif text-lg leading-relaxed text-slate-700"
                defaultValue={currentChapter.content}
                placeholder="Beginne zu schreiben..."
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // RIGHT: AI Assistant
  const RightSidebar = () => {
    if (!currentChapter) return null;

    return (
      <div className="w-80 border-l bg-slate-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            KI-Schreibassistent
          </h3>
        </div>
        <div className="flex-1 overflow-hidden">
          <WritingTutor
            chapterContent={currentChapter.content}
            chapterTitle={currentChapter.title}
            bookId={currentBook?.id || ''}
            chapterId={currentChapter.id}
            bookContext={buildContext()}
            onApplySuggestion={(text) => {
              console.log('Applying suggestion:', text);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex">
      <LeftSidebar />
      <CenterEditor />
      <RightSidebar />
    </div>
  );
}
