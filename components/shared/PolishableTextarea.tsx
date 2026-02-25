'use client';

import { useState } from 'react';
import { Textarea, TextareaProps } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

interface PolishableTextareaProps extends Omit<TextareaProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  showButton?: boolean;
  buttonPosition?: 'inside' | 'outside';
}

export function PolishableTextarea({
  value,
  onChange,
  label,
  placeholder,
  rows = 6,
  className,
  showButton = true,
  buttonPosition = 'inside',
  ...textareaProps
}: PolishableTextareaProps) {
  const { currentBook } = useAppStore();
  const [isPolishing, setIsPolishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [polishedText, setPolishedText] = useState('');

  const polishText = async () => {
    if (!value.trim() || value.trim().length < 10) {
      return;
    }

    setIsPolishing(true);
    
    try {
      // Gather context for polishing
      const context = {
        genre: currentBook?.genre,
        tone: currentBook?.concept?.tone,
        title: currentBook?.title,
      };

      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Poliere und verbessere den folgenden Text. Behalte den Inhalt und die Bedeutung bei, aber verbessere:
- Grammatik und Rechtschreibung
- Satzstruktur und Fluss
- Klarheit und Präzision
- Lesbarkeit

Kontext:
- Genre: ${context.genre || 'Nicht angegeben'}
- Titel: ${context.title || 'Nicht angegeben'}
- Ton: ${context.tone || 'Nicht angegeben'}

ORIGINALTEXT:
${value}

GIB NUR den verbesserten Text zurück, ohne Erklärungen oder Einleitungen.`,
          type: 'polish',
          persona: 'editor',
        }),
      });

      const data = await response.json();
      
      if (data.result) {
        setPolishedText(data.result);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Polishing error:', error);
    } finally {
      setIsPolishing(false);
    }
  };

  const acceptPolished = () => {
    onChange(polishedText);
    setShowPreview(false);
    setPolishedText('');
  };

  const rejectPolished = () => {
    setShowPreview(false);
    setPolishedText('');
  };

  if (showPreview && polishedText) {
    return (
      <div className={cn("space-y-3", className)}>
        {label && (
          <label className="text-sm font-medium text-slate-700">{label}</label>
        )}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-violet-50 px-3 py-2 border-b flex items-center justify-between">
            <span className="text-sm font-medium text-violet-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Verbesserter Text
            </span>
          </div>
          <div className="p-3 bg-white">
            <textarea
              value={polishedText}
              readOnly
              rows={rows}
              className="w-full resize-none bg-transparent text-sm"
            />
          </div>
          <div className="px-3 py-2 bg-slate-50 border-t flex gap-2">
            <Button size="sm" onClick={acceptPolished} className="flex-1">
              Übernehmen
            </Button>
            <Button size="sm" variant="outline" onClick={rejectPolished} className="flex-1">
              Verwerfen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          {showButton && buttonPosition === 'outside' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={polishText}
              disabled={isPolishing || !value.trim() || value.trim().length < 10}
              className="h-7 text-xs"
            >
              {isPolishing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Poliere...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  Text polieren
                </>
              )}
            </Button>
          )}
        </div>
      )}
      
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "resize-none pr-10",
            showButton && buttonPosition === 'inside' && "pb-10"
          )}
          {...textareaProps}
        />
        
        {showButton && buttonPosition === 'inside' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={polishText}
            disabled={isPolishing || !value.trim() || value.trim().length < 10}
            className="absolute bottom-2 right-2 h-8 text-xs bg-white/80 hover:bg-white shadow-sm border"
          >
            {isPolishing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Wand2 className="h-3 w-3 mr-1" />
                Polieren
              </>
            )}
          </Button>
        )}
      </div>
      
      {value.length > 0 && (
        <div className="mt-1 text-xs text-slate-400 flex justify-between">
          <span>{value.length} Zeichen</span>
          {value.length < 10 && showButton && (
            <span className="text-amber-500">Mindestens 10 Zeichen für Polieren</span>
          )}
        </div>
      )}
    </div>
  );
}

// Simple inline polish button that can be added to any textarea
export function PolishButton({ 
  text, 
  onPolished,
  className 
}: { 
  text: string; 
  onPolished: (polished: string) => void;
  className?: string;
}) {
  const { currentBook } = useAppStore();
  const [isPolishing, setIsPolishing] = useState(false);

  const polishText = async () => {
    if (!text.trim() || text.trim().length < 10) return;

    setIsPolishing(true);
    
    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Poliere und verbessere den folgenden Text. Behalte den Inhalt bei, aber verbessere Grammatik, Satzfluss und Klarheit:

ORIGINAL:
${text}

GIB NUR den verbesserten Text zurück.`,
          type: 'polish',
          persona: 'editor',
          bookId: currentBook?.id,
        }),
      });

      const data = await response.json();
      
      if (data.result) {
        onPolished(data.result);
      }
    } catch (error) {
      console.error('Polishing error:', error);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={polishText}
      disabled={isPolishing || !text.trim() || text.trim().length < 10}
      className={cn("text-xs", className)}
    >
      {isPolishing ? (
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      ) : (
        <Wand2 className="h-3 w-3 mr-1" />
      )}
      Text polieren
    </Button>
  );
}
