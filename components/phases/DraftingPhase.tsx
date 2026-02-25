'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Save, Sparkles, FileText, Users, Map, CheckCircle2, 
  Loader2, Plus, Globe, BookOpen, Lightbulb 
} from 'lucide-react';
import { useAppStore, Chapter, Character, PlotPoint, ResearchNote, WorldSettings, Concept } from '@/lib/store';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { AIFeedbackButton } from '@/components/shared/AIFeedbackButton';
import { PersonaSelector } from '@/components/shared/PersonaSelector';
import { StyleQuickSelect } from '@/components/analysis/StyleSelector';
import { StyleProfile, PREDEFINED_STYLES } from '@/lib/styles/authorStylesExtended';

export function DraftingPhase() {
  const params = useParams();
  const bookId = params.id as string;
  
  const {
    currentBook,
    setCurrentBook,
    chapters,
    characters,
    plotPoints,
    researchNotes,
    worldSettings,
    concept,
    setChapters,
    setCharacters,
    setPlotPoints,
    setResearchNotes,
    setWorldSettings,
    setConcept,
  } = useAppStore();

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapterContent, setChapterContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [sidebarTab, setSidebarTab] = useState<'chapters' | 'characters' | 'plot' | 'world' | 'research'>('chapters');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StyleProfile | null>(null);

  // Load book data including world building and concept
  useEffect(() => {
    if (bookId) {
      fetchBook();
    }
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
      setWorldSettings(book.worldSettings);
      setConcept(book.concept);
      
      if (book.chapters?.length > 0 && !currentChapter) {
        handleSelectChapter(book.chapters[0]);
      }
    } catch (error) {
      console.error('Failed to fetch book:', error);
    }
  };

  const handleSelectChapter = (chapter: Chapter) => {
    if (currentChapter && chapterContent !== currentChapter.content) {
      saveChapter(currentChapter.id, chapterContent);
    }
    setCurrentChapter(chapter);
    setChapterContent(chapter.content);
  };

  const saveChapter = async (chapterId: string, content: string) => {
    setIsSaving(true);
    try {
      await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      setChapters(chapters.map(ch => 
        ch.id === chapterId ? { ...ch, content, wordCount: content.split(/\s+/).filter(w => w.length > 0).length } : ch
      ));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save chapter:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!currentChapter) return;
    
    const interval = setInterval(() => {
      if (chapterContent !== currentChapter.content) {
        saveChapter(currentChapter.id, chapterContent);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentChapter, chapterContent]);

  // Build comprehensive context for AI
  const buildWritingContext = () => {
    const context: any = {};
    
    // Style information - THIS IS THE KEY ADDITION!
    if (selectedStyle) {
      context.style = {
        name: selectedStyle.name,
        author: selectedStyle.author,
        characteristics: selectedStyle.characteristics,
        systemPrompt: selectedStyle.systemPrompt,
      };
    }
    
    // Concept information
    if (concept) {
      context.concept = {
        genre: currentBook?.genre,
        premise: concept.premise,
        tone: concept.tone,
        themes: concept.themes,
        targetAudience: concept.targetAudience,
      };
    }
    
    // World Building information
    if (worldSettings) {
      context.world = {
        timePeriod: worldSettings.timePeriod,
        location: worldSettings.location,
        worldType: worldSettings.worldType,
        geography: worldSettings.geography,
        culture: worldSettings.culture,
        politics: worldSettings.politics,
        technology: worldSettings.technology,
        history: worldSettings.history,
        rules: worldSettings.rules,
        locations: worldSettings.locations?.map((l: any) => ({
          name: l.name,
          description: l.description,
          atmosphere: l.atmosphere,
        })),
      };
    }
    
    // Characters
    if (characters.length > 0) {
      context.characters = characters.map((c: Character) => ({
        name: c.name,
        role: c.role,
        description: c.description,
        background: c.background,
        goals: c.goals,
        motivations: c.motivations,
        conflicts: c.conflicts,
        personality: c.personality,
      }));
    }
    
    // Plot context - where are we in the story?
    if (plotPoints.length > 0 && currentChapter) {
      const chapterIndex = chapters.findIndex(c => c.id === currentChapter.id);
      context.plotPosition = {
        chapterNumber: chapterIndex + 1,
        totalChapters: chapters.length,
        previousPlotPoints: plotPoints
          .filter(p => p.order < chapterIndex)
          .slice(-2)
          .map(p => ({ title: p.title, description: p.description })),
        currentPlotPoints: plotPoints
          .filter(p => p.order === chapterIndex)
          .map(p => ({ title: p.title, description: p.description })),
      };
    }
    
    // Chapter specific context
    if (currentChapter) {
      context.currentChapter = {
        title: currentChapter.title,
        povCharacter: currentChapter.povCharacter,
        setting: currentChapter.setting,
      };
    }
    
    return context;
  };

  const handleAiAction = async (action: 'continue' | 'rewrite' | 'expand', text: string) => {
    try {
      const context = buildWritingContext();
      
      // Add specific instructions based on action
      let enhancedPrompt = text;
      
      // Build style instruction
      let styleInstruction = '';
      if (selectedStyle) {
        styleInstruction = `\n\n[SCHREIBSTIL: ${selectedStyle.name}]\n${selectedStyle.systemPrompt}\n`;
      }
      
      if (action === 'continue') {
        enhancedPrompt = `${text}\n\n${styleInstruction}\n[Setze die Geschichte fort. Berücksichtige: Genre: ${currentBook?.genre}, Welt: ${worldSettings?.worldType}, Charaktere: ${characters.map(c => c.name).join(', ')}]`;
      } else if (action === 'rewrite') {
        enhancedPrompt = `${styleInstruction}\n\nSchreibe den folgenden Text im Stil von ${selectedStyle?.name || 'einem professionellen Autor'} um:\n\n${text}`;
      } else if (action === 'expand') {
        enhancedPrompt = `${styleInstruction}\n\nErweitere den folgenden Text im Stil von ${selectedStyle?.name || 'einem professionellen Autor'}:\n\n${text}`;
      }

      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          type: action,
          bookId: currentBook?.id,
          context,
        }),
      });

      const data = await response.json();
      
      if (action === 'continue') {
        setChapterContent(prev => prev + '\n\n' + data.result);
      } else if (action === 'rewrite' || action === 'expand') {
        setChapterContent(prev => prev.replace(text, data.result));
      }
    } catch (error) {
      console.error('AI action failed:', error);
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
      handleSelectChapter(chapter);
    } catch (error) {
      console.error('Failed to add chapter:', error);
    }
  };

  const handleCompletePhase = async () => {
    try {
      await fetch(`/api/books/${bookId}/phase`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'drafting', completed: true }),
      });
      
      if (currentBook) {
        setCurrentBook({ ...currentBook, draftingCompleted: true });
      }
    } catch (error) {
      console.error('Failed to complete phase:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b bg-white h-14 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-violet-600" />
            <span className="font-medium truncate max-w-[200px]">{currentBook?.title}</span>
          </div>
          {currentBook?.genre && (
            <Badge variant="secondary" className="hidden sm:inline-flex">{currentBook.genre}</Badge>
          )}
          <PersonaSelector />
          <div className="h-6 w-px bg-slate-200" />
          <StyleQuickSelect 
            currentStyle={selectedStyle || undefined}
            onChange={setSelectedStyle}
          />
        </div>

        <div className="flex items-center gap-2">
          <AIFeedbackButton
            content={chapterContent}
            type="feedback"
            label="Kapitel-Feedback"
            context={buildWritingContext()}
            onFeedback={setAiFeedback}
            variant="outline"
            size="sm"
          />
          <Button variant="outline" size="sm" onClick={() => handleAiAction('continue', chapterContent)}>
            <Sparkles className="h-4 w-4 mr-2" />Fortsetzen
          </Button>
          <Button variant="outline" size="sm" onClick={() => currentChapter && saveChapter(currentChapter.id, chapterContent)} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Speichern
          </Button>
          {chapters.length > 0 && (
            <Button size="sm" onClick={handleCompletePhase} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 className="h-4 w-4 mr-2" />Phase abschließen
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar with Tabs */}
        <div className="w-64 border-r bg-slate-50 flex flex-col">
          <div className="flex border-b">
            {[
              { key: 'chapters', icon: FileText, label: 'Kapitel' },
              { key: 'characters', icon: Users, label: 'Charaktere' },
              { key: 'world', icon: Globe, label: 'Welt' },
              { key: 'plot', icon: Map, label: 'Plot' },
              { key: 'research', icon: Lightbulb, label: 'Recherche' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSidebarTab(tab.key as any)}
                className={`flex-1 py-3 ${sidebarTab === tab.key ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-600 hover:text-slate-900'}`}
                title={tab.label}
              >
                <tab.icon className="h-4 w-4 mx-auto" />
              </button>
            ))}
          </div>

          <ScrollArea className="flex-1 p-3">
            {sidebarTab === 'chapters' && (
              <div className="space-y-2">
                {isAddingChapter ? (
                  <div className="space-y-2">
                    <Input value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} placeholder="Kapitel-Titel" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()} />
                    <div className="flex gap-1">
                      <Button size="sm" className="flex-1" onClick={handleAddChapter}>Hinzufügen</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsAddingChapter(false)}>✕</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="ghost" className="w-full justify-start text-slate-500" onClick={() => setIsAddingChapter(true)}>
                    <Plus className="h-4 w-4 mr-2" />Neues Kapitel
                  </Button>
                )}

                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleSelectChapter(chapter)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${currentChapter?.id === chapter.id ? 'bg-violet-100 text-violet-900' : 'hover:bg-slate-100'}`}
                  >
                    <span className="text-sm font-medium">{index + 1}. {chapter.title}</span>
                    <span className="text-xs text-slate-400 ml-2">{chapter.wordCount || 0} Wörter</span>
                  </button>
                ))}
              </div>
            )}

            {sidebarTab === 'characters' && characters.map((char) => (
              <div key={char.id} className="p-2 rounded-lg hover:bg-slate-100 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-xs text-violet-600 font-medium">{char.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{char.name}</p>
                    {char.role && <p className="text-xs text-slate-500">{char.role}</p>}
                  </div>
                </div>
              </div>
            ))}

            {sidebarTab === 'world' && worldSettings && (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Welttyp</h4>
                  <p className="text-sm">{worldSettings.worldType || 'Nicht festgelegt'}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Zeitraum</h4>
                  <p className="text-sm">{worldSettings.timePeriod || 'Nicht festgelegt'}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Orte</h4>
                  {worldSettings.locations?.map((loc: any) => (
                    <div key={loc.id} className="text-sm mb-1">• {loc.name}</div>
                  ))}
                </div>
              </div>
            )}

            {sidebarTab === 'plot' && plotPoints.map((point) => (
              <div key={point.id} className="p-2 rounded-lg hover:bg-slate-100 text-sm">
                <Badge variant="secondary" className="text-xs mb-1">{point.act}</Badge>
                <p className="font-medium">{point.title}</p>
              </div>
            ))}

            {sidebarTab === 'research' && researchNotes.map((note) => (
              <div key={note.id} className="p-2 rounded-lg hover:bg-slate-100 text-sm">
                <p className="font-medium">{note.title}</p>
                {note.category && <Badge variant="outline" className="text-xs mt-1">{note.category}</Badge>}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {currentChapter ? (
            <>
              <div className="border-b px-4 py-2 flex items-center justify-between bg-slate-50">
                <Input
                  value={currentChapter.title}
                  onChange={(e) => setCurrentChapter({ ...currentChapter, title: e.target.value })}
                  className="border-0 bg-transparent font-medium text-lg focus-visible:ring-0 px-0"
                />
                <span className="text-xs text-slate-500">{chapterContent.split(/\s+/).filter(w => w.length > 0).length} Wörter</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <TipTapEditor
                  content={chapterContent}
                  onChange={setChapterContent}
                  onAiAction={handleAiAction}
                  placeholder="Beginne zu schreiben..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Wähle ein Kapitel zum Bearbeiten</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - AI Feedback */}
        {aiFeedback && (
          <div className="w-80 border-l bg-slate-50 flex flex-col">
            <div className="p-3 border-b bg-white flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-violet-500" />KI-Feedback
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setAiFeedback('')}>✕</Button>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-slate-700">{aiFeedback}</div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
