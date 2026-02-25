'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { PhaseNavigation } from '@/components/phases/PhaseNavigation';
import { ConceptPhase } from '@/components/phases/ConceptPhase';
import { WorldBuildingPhase } from '@/components/phases/WorldBuildingPhase';
import { PlottingPhase } from '@/components/phases/PlottingPhase';
import { StyleAnalysisPhase } from '@/components/phases/StyleAnalysisPhase';
import { DraftingPhase } from '@/components/phases/DraftingPhase';
import { EditingPhase } from '@/components/phases/EditingPhase';
import { PublishingPhase } from '@/components/phases/PublishingPhase';
import { PersonaSelector } from '@/components/shared/PersonaSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Loader2, Film, FileText, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

// Project type display mapping
const PROJECT_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'FICTION': { label: 'Roman', icon: <BookOpen className="h-3 w-3" />, color: 'bg-blue-100 text-blue-700' },
  'NON_FICTION': { label: 'Sachbuch', icon: <BookMarked className="h-3 w-3" />, color: 'bg-green-100 text-green-700' },
  'SCREENPLAY': { label: 'Drehbuch', icon: <Film className="h-3 w-3" />, color: 'bg-purple-100 text-purple-700' },
  'TV_SERIES': { label: 'TV-Serie', icon: <Film className="h-3 w-3" />, color: 'bg-amber-100 text-amber-700' },
  'SHORT_STORY': { label: 'Kurzgeschichte', icon: <FileText className="h-3 w-3" />, color: 'bg-pink-100 text-pink-700' },
};

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  
  const { 
    currentBook, 
    currentPhase, 
    setCurrentBook, 
    setCurrentPhase,
    setConcept,
    setWorldSettings,
    isLoading,
    setIsLoading
  } = useAppStore();

  // Load book data
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
      setConcept(book.concept);
      setWorldSettings(book.worldSettings);
      
      // Set initial phase if not set - start with styleanalysis
      if (!currentPhase) {
        setCurrentPhase(book.currentPhase as any || 'styleanalysis');
      }
    } catch (error) {
      console.error('Failed to fetch book:', error);
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 'styleanalysis':
        return <StyleAnalysisPhase />;
      case 'concept':
        return <ConceptPhase />;
      case 'worldbuilding':
        return <WorldBuildingPhase />;
      case 'plotting':
        return <PlottingPhase />;
      case 'drafting':
        return <DraftingPhase />;
      case 'editing':
        return <EditingPhase />;
      case 'publishing':
        return <PublishingPhase />;
      default:
        return <StyleAnalysisPhase />;
    }
  };

  const projectTypeInfo = currentBook?.projectType 
    ? PROJECT_TYPE_LABELS[currentBook.projectType] 
    : PROJECT_TYPE_LABELS['FICTION'];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Enhanced Header with Book Info */}
      <header className="bg-gradient-to-r from-slate-900 via-violet-900 to-slate-900 text-white border-b shrink-0">
        <div className="flex items-center px-4 py-3">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="h-8 w-px bg-white/20 mx-4" />
          
          {/* Book Cover / Icon */}
          <div className="relative mr-4">
            {currentBook?.coverImage ? (
              <img 
                src={currentBook.coverImage} 
                alt={currentBook.title}
                className="w-12 h-16 object-cover rounded shadow-lg border border-white/20"
              />
            ) : (
              <div className="w-12 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded shadow-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white/80" />
              </div>
            )}
            {/* Project Type Badge on Cover */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md",
              projectTypeInfo?.color?.split(' ')[0] || 'bg-blue-100'
            )}>
              {projectTypeInfo?.icon}
            </div>
          </div>
          
          {/* Book Title and Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold truncate">
                {currentBook?.title || 'Laden...'}
              </h1>
              {currentBook?.projectType && (
                <Badge className={cn("text-xs", projectTypeInfo?.color)}>
                  <span className="flex items-center gap-1">
                    {projectTypeInfo?.icon}
                    {projectTypeInfo?.label}
                  </span>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              {currentBook?.genre && (
                <span>{currentBook.genre}</span>
              )}
              {currentBook?.genre && currentBook?.projectCategory && (
                <span className="text-white/30">•</span>
              )}
              {currentBook?.projectCategory && (
                <span className="text-white/70">{currentBook.projectCategory}</span>
              )}
            </div>
          </div>
          
          {/* Right side: Persona Selector and Actions */}
          <div className="flex items-center gap-3">
            <PersonaSelector />
          </div>
        </div>
      </header>

      {/* Phase Navigation */}
      <PhaseNavigation />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {!currentBook ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : (
          renderPhase()
        )}
      </div>
    </div>
  );
}
