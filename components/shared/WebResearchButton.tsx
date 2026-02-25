'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Globe, History, Users, Scale, Sparkles, Mountain, BookOpen, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface WebResearchButtonProps {
  topic: string;
  context?: string;
  onResearch: (result: string) => void;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  researchType?: 'general' | 'location' | 'history' | 'culture' | 'geography' | 'technology' | 'politics';
}

const typeConfig = {
  general: { icon: Search, label: 'Recherchieren', prompt: 'general research' },
  location: { icon: Globe, label: 'Ort recherchieren', prompt: 'detailed location research' },
  history: { icon: History, label: 'Geschichte', prompt: 'historical research' },
  culture: { icon: Users, label: 'Kultur', prompt: 'cultural research' },
  geography: { icon: Mountain, label: 'Geographie', prompt: 'geographical research' },
  technology: { icon: Sparkles, label: 'Technologie', prompt: 'technology/magic research' },
  politics: { icon: Scale, label: 'Politik', prompt: 'political system research' },
};

export function WebResearchButton({
  topic,
  context,
  onResearch,
  label,
  variant = 'outline',
  size = 'sm',
  className,
  researchType = 'general',
}: WebResearchButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentBook } = useAppStore();

  const handleResearch = async () => {
    const searchQuery = topic.trim();
    
    if (!searchQuery) {
      console.log('WebResearchButton: No topic provided');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    console.log('WebResearchButton: Starting research for:', searchQuery);
    
    try {
      const requestBody = {
        query: searchQuery,
        context: context || `Für ein ${currentBook?.genre || ''} Buch mit dem Setting: ${currentBook?.description || ''}`,
        type: typeConfig[researchType].prompt,
      };
      
      console.log('WebResearchButton: Request:', requestBody);

      const response = await fetch('/api/research/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('WebResearchButton: Response status:', response.status);

      const data = await response.json();
      console.log('WebResearchButton: Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }
      
      if (data.result) {
        console.log('WebResearchButton: Success, calling onResearch');
        onResearch(data.result);
      } else {
        throw new Error('Keine Ergebnisse erhalten');
      }
    } catch (err: any) {
      console.error('WebResearchButton: Error:', err);
      setError(err.message || 'Unbekannter Fehler');
      
      // Still try to provide something useful via fallback AI
      try {
        console.log('WebResearchButton: Trying fallback AI...');
        const aiResponse = await fetch('/api/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Recherchiere detaillierte Informationen über "${searchQuery}" für ein ${currentBook?.genre || ''} Buch. 

Kontext: ${context || 'World Building für eine fiktive Geschichte'}

Bitte liefere:
1. ZUSAMMENFASSUNG (3-5 Sätze)
2. DETAILS (5-10 spezifische Punkte)
3. ANWENDUNG (2-3 Vorschläge für das Buch)

Schreibe auf Deutsch, akademisch aber verständlich.`,
            type: 'feedback',
            persona: 'developmental_editor',
            bookId: currentBook?.id,
          }),
        });
        
        const aiData = await aiResponse.json();
        if (aiData.result) {
          onResearch(aiData.result);
          setError(null);
        }
      } catch (fallbackErr) {
        console.error('WebResearchButton: Fallback also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = typeConfig[researchType].icon;
  const buttonLabel = label || typeConfig[researchType].label;
  const hasTopic = topic && topic.trim().length > 0;

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleResearch}
        disabled={isLoading || !hasTopic}
        className={cn(
          "gap-2 whitespace-nowrap",
          variant === 'outline' && "border-blue-300 text-blue-700 hover:bg-blue-50",
          error && "border-red-300 text-red-600",
          className
        )}
        title={!hasTopic ? 'Bitte zuerst einen Suchbegriff eingeben' : buttonLabel}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : error ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {isLoading ? 'Recherchiere...' : error ? 'Fehler' : buttonLabel}
      </Button>
      {error && (
        <span className="text-xs text-red-500 max-w-[200px]">{error}</span>
      )}
    </div>
  );
}

// Simplified inline research button for text fields
interface InlineResearchButtonProps {
  value: string;
  onResult: (result: string) => void;
  placeholder?: string;
}

export function InlineResearchButton({ value, onResult, placeholder }: InlineResearchButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResearch = async () => {
    const query = value.trim() || placeholder;
    if (!query) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/research/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: 'World Building für ein Buch',
        }),
      });

      const data = await response.json();
      
      if (data.result) {
        onResult(data.result);
      }
    } catch (error) {
      console.error('Research error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleResearch}
      disabled={isLoading || (!value.trim() && !placeholder)}
      className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      title="Internet-Recherche zu diesem Thema"
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Search className="h-3.5 w-3.5" />
      )}
      <span className="text-xs ml-1">{isLoading ? '...' : 'Recherche'}</span>
    </Button>
  );
}
