'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, Sparkles, FileText, Users, MapPin, CheckCircle2, 
  Loader2, Plus, BookOpen, ChevronRight, Target, Edit3,
  LayoutGrid, List
} from 'lucide-react';
import { useAppStore, Chapter, Character, PlotPoint, ResearchNote } from '@/lib/store';
import { ScenePingPong } from '@/components/writing/ScenePingPong';
import { WritingTutor } from '@/components/writing/WritingTutor';

export function DraftingPhaseNew() {
  const params = useParams();
  const bookId = params.id as string;
  
  const {
    currentBook,
    setCurrentBook,
    chapters,
    characters,
    plotPoints,
    researchNotes,
    setChapters,
    setCharacters,
    setPlotPoints,
    setResearchNotes,
  } = useAppStore();

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [viewMode, setViewMode] = useState<'pingpong' | 'classic'>('pingpong');
  const [sidebarTab, setSidebarTab] = useState<'plot' | 'characters' | 'world' | 'tutor'>('plot');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Load data
  useEffect(() => {
    if (bookId) fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}`);
      const book = await response.json();
      setCurrentBook(book);
      setChapters(book.chapters || []);
      setCharacters(book.characters || []);
      setPlotPoints(book.plotPoints || []);
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

  const buildContext = () => ({
    genre: currentBook?.genre,
    characters: characters.map(c => ({
      name: c.name,
      role: c.role,
      goals: c.storyGoal || c.goals,
      motivations: c.motivations,
    })),
    plotPoints: plotPoints.map(p => ({
      title: p.title,
      description: p.description,
      act: p.act,
    })),
  });

  // LEFT SIDEBAR: Plot Tree & Navigation
  const LeftSidebar = () => (
    <div className="w-64 border-r bg-slate-50 flex flex-col h-full">
      <div className="p-3 border-b bg-white">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-violet-500" />
          {currentBook?.title}
        </h2>
      </div>

      <ScrollArea className="flex-1 p-3">
        {/* Chapters */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Kapitel</h3>
          
          {isAddingChapter ? (
            <div className="space-y-2 mb-2">
              <Input 
                value={newChapterTitle} 
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="Kapitel-Titel"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                className="h-8 text-sm"
              />
              <div className="flex gap-1">
                <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleAddChapter}>OK</Button>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setIsAddingChapter(false)}>✕</Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-slate-500 mb-2 h-7 text-xs"
              onClick={() => setIsAddingChapter(true)}
            >
              <Plus className="h-3 w-3 mr-1" />Neues Kapitel
            </Button>
          )}

          <div className="space-y-1">
            {chapters.map((chapter, idx) => (
              <button
                key={chapter.id}
                onClick={() => setCurrentChapter(chapter)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  currentChapter?.id === chapter.id 
                    ? 'bg-violet-100 text-violet-900' 
                    : 'hover:bg-slate-100'
                }`}
              >
                <span className="font-medium">{idx + 1}. {chapter.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Plot Points */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Plot-Struktur</h3>
          <div className="space-y-1">
            {plotPoints.map((point) => (
              <div key={point.id} className="px-2 py-1.5 text-sm">
                <Badge variant="outline" className="text-[10px] mr-1">{point.act}</Badge>
                <span className="text-slate-700">{point.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Characters */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Charaktere</h3>
          <div className="space-y-1">
            {characters.map((char) => (
              <div key={char.id} className="px-2 py-1.5 text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs text-violet-600 font-medium">
                  {char.name[0]}
                </div>
                <div>
                  <p className="font-medium">{char.name}</p>
                  {char.role && <p className="text-xs text-slate-500">{char.role}</p>}
                </div>
              </div>
            ))}
          </div>
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
            <p>Wähle ein Kapitel oder erstelle ein neues</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-4">
            <Input
              value={currentChapter.title}
              onChange={(e) => setCurrentChapter({ ...currentChapter, title: e.target.value })}
              className="border-0 bg-transparent font-semibold text-lg focus-visible:ring-0 px-0 w-auto"
            />
            <div className="flex bg-slate-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('pingpong')}
                className={`px-3 py-1 rounded-md text-sm transition-colors flex items-center gap-1 ${
                  viewMode === 'pingpong' ? 'bg-white shadow-sm' : 'text-slate-600'
                }`}
              >
                <Target className="h-4 w-4" />
                Szene-für-Szene
              </button>
              <button
                onClick={() => setViewMode('classic')}
                className={`px-3 py-1 rounded-md text-sm transition-colors flex items-center gap-1 ${
                  viewMode === 'classic' ? 'bg-white shadow-sm' : 'text-slate-600'
                }`}
              >
                <Edit3 className="h-4 w-4" />
                Klassisch
              </button>
            </div>
          </div>
          
          <Button size="sm" variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'pingpong' ? (
            <ScenePingPong chapter={currentChapter} bookId={bookId} />
          ) : (
            <div className="h-full p-4">
              <textarea
                className="w-full h-full resize-none border-0 focus:outline-none font-serif text-lg leading-relaxed"
                defaultValue={currentChapter.content}
                placeholder="Beginne zu schreiben..."
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // RIGHT: AI Assistant / Tutor
  const RightSidebar = () => {
    if (!currentChapter) return null;

    return (
      <div className="w-80 border-l bg-slate-50 flex flex-col">
        <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as any)} className="h-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-white px-2 h-10">
            <TabsTrigger value="tutor" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              KI-Tutor
            </TabsTrigger>
            <TabsTrigger value="characters" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Charaktere
            </TabsTrigger>
            <TabsTrigger value="world" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Welt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutor" className="m-0 h-[calc(100%-40px)]">
            <WritingTutor
              chapterContent={currentChapter.content}
              chapterTitle={currentChapter.title}
              bookContext={buildContext()}
              onApplySuggestion={(text) => {
                // Append to current scene content
                console.log('Applying suggestion:', text);
              }}
            />
          </TabsContent>

          <TabsContent value="characters" className="m-0 p-3">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {characters.map((char) => (
                  <div key={char.id} className="bg-white rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-sm font-medium text-violet-600">
                        {char.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{char.name}</p>
                        <p className="text-xs text-slate-500">{char.role}</p>
                      </div>
                    </div>
                    {char.storyGoal && (
                      <div className="text-xs">
                        <span className="font-medium text-slate-600">Ziel:</span>
                        <p className="text-slate-500 mt-0.5">{char.storyGoal}</p>
                      </div>
                    )}
                    {char.secret && (
                      <div className="text-xs mt-2">
                        <span className="font-medium text-amber-600">Geheimnis:</span>
                        <p className="text-slate-500 mt-0.5">{char.secret}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="world" className="m-0 p-3">
            <ScrollArea className="h-full">
              <div className="text-sm text-slate-500">
                Welt-Informationen werden hier angezeigt...
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
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
