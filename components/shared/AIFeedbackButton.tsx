'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AIFeedbackButtonProps {
  content: string;
  type: 'analyze' | 'brainstorm' | 'feedback' | 'suggest' | 'review' | 'rewrite';
  context?: Record<string, any>;
  onFeedback: (feedback: string) => void;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  icon?: 'sparkles' | 'wand';
}

export function AIFeedbackButton({
  content,
  type,
  context = {},
  onFeedback,
  label = 'KI-Feedback',
  variant = 'outline',
  size = 'sm',
  className,
  icon = 'sparkles',
}: AIFeedbackButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedPersona, currentBook } = useAppStore();

  const buildEnhancedPrompt = () => {
    let prompt = '';
    
    // Add world building context if available
    if (context?.world) {
      prompt += `WELT/SETTING:\n`;
      prompt += `Typ: ${context.world.worldType || 'Nicht angegeben'}\n`;
      prompt += `Zeitraum: ${context.world.timePeriod || 'Nicht angegeben'}\n`;
      prompt += `Ort: ${context.world.location || 'Nicht angegeben'}\n`;
      if (context.world.geography) prompt += `Geographie: ${context.world.geography}\n`;
      if (context.world.culture) prompt += `Kultur: ${context.world.culture}\n`;
      if (context.world.rules) prompt += `Regeln: ${context.world.rules}\n`;
      if (context.world.locations?.length > 0) {
        prompt += `Wichtige Orte: ${context.world.locations.map((l: any) => l.name).join(', ')}\n`;
      }
      prompt += `\n`;
    }
    
    // Add concept context
    if (context?.concept) {
      prompt += `KONZEPT:\n`;
      prompt += `Genre: ${context.concept.genre || 'Nicht angegeben'}\n`;
      prompt += `Tonalität: ${context.concept.tone || 'Nicht angegeben'}\n`;
      prompt += `Themen: ${context.concept.themes || 'Nicht angegeben'}\n`;
      if (context.concept.premise) prompt += `Prämisse: ${context.concept.premise}\n`;
      prompt += `\n`;
    }
    
    // Add characters
    if (context?.characters?.length > 0) {
      prompt += `CHARAKTERE:\n`;
      context.characters.forEach((char: any, i: number) => {
        prompt += `${i + 1}. ${char.name}`;
        if (char.role) prompt += ` (${char.role})`;
        if (char.description) prompt += `: ${char.description}`;
        prompt += `\n`;
      });
      prompt += `\n`;
    }
    
    // Add plot position
    if (context?.plotPosition) {
      prompt += `POSITION IN DER GESCHICHTE:\n`;
      prompt += `Kapitel ${context.plotPosition.chapterNumber} von ${context.plotPosition.totalChapters}\n`;
      if (context.plotPosition.previousPlotPoints?.length > 0) {
        prompt += `Vorherige Ereignisse: ${context.plotPosition.previousPlotPoints.map((p: any) => p.title).join(', ')}\n`;
      }
      prompt += `\n`;
    }
    
    // Add the actual content to analyze/rewrite
    prompt += `ZU ANALYSIERENDER TEXT:\n${content}`;
    
    return prompt;
  };

  const handleClick = async () => {
    if (!content.trim()) {
      setError('Bitte gib zuerst einen Text ein');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const enhancedPrompt = buildEnhancedPrompt();
      
      console.log('Sending AI request:', { type, persona: selectedPersona, contextKeys: Object.keys(context) });
      
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          type: type === 'brainstorm' ? 'brainstorm' : 'feedback',
          persona: selectedPersona,
          bookId: currentBook?.id,
          context: {
            genre: currentBook?.genre,
            ...context,
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Unbekannter Fehler');
      }
      
      if (!data.result) {
        throw new Error('Keine Antwort von der KI erhalten');
      }
      
      onFeedback(data.result);
    } catch (error: any) {
      console.error('AI Feedback error:', error);
      setError(error.message || 'Fehler beim Laden der KI-Analyse');
      onFeedback(`**Fehler:** ${error.message || 'Die KI-Analyse konnte nicht geladen werden.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = icon === 'wand' ? Wand2 : Sparkles;

  return (
    <div className="inline-flex flex-col gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading || !content.trim()}
        className={cn(
          "gap-2",
          variant === 'default' && "bg-violet-600 hover:bg-violet-700 text-white",
          error && "border-red-300 text-red-600",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : error ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <IconComponent className="h-4 w-4" />
        )}
        {isLoading ? 'Analysiere...' : label}
      </Button>
      {error && (
        <span className="text-xs text-red-500 max-w-[200px]">{error}</span>
      )}
    </div>
  );
}
