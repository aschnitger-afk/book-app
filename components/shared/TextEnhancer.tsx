'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextEnhancerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  context?: string;
}

export function TextEnhancer({
  value,
  onChange,
  placeholder,
  label,
  multiline = true,
  rows = 4,
  className,
  context = '',
}: TextEnhancerProps) {
  const { currentBook } = useAppStore();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!value.trim()) return;

    setIsEnhancing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `VERBessere diesen Text sprachlich (NICHT inhaltlich recherchieren, nur stilistisch polieren):

ORIGINAL:
${value}

KONTEXT: ${context}

ANWEISUNGEN (nur sprachliche Verbesserungen):
1. GRAMMATIK: Korrekte Grammatik, Rechtschreibung, Zeichensetzung
2. FLUSS: Bessere Satzstruktur für flüssigeres Lesen
3. KLARHEIT: Unklare Formulierungen präzisieren
4. VARIATION: Wiederholungen vermeiden, Synonyme nutzen
5. RHythMUS: Satzlängen variieren für besseren Rhythmus

WICHTIG: 
- Ändere NICHT die Informationen oder Fakten
- Füge KEINE neuen Recherche-Ergebnisse hinzu
- Behalte den Stil und Ton bei
- Mache den Text nur sprachlich besser

GIB NUR den verbesserten Text zurück, keine Erklärungen.`,
          type: 'rewrite',
          persona: 'editor',
          bookId: currentBook?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result) {
        onChange(data.result.trim());
      }
    } catch (error: any) {
      console.error('Enhance error:', error);
      setError('Fehler beim Verbessern: ' + error.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleEnhance}
            disabled={isEnhancing || !value.trim()}
            className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Nur sprachlich verbessern (keine Recherche)"
          >
            {isEnhancing ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 mr-1" />
            )}
            <span className="text-xs">{isEnhancing ? 'Poliere...' : 'Text polieren'}</span>
          </Button>
        </div>
      )}
      <div className="relative">
        <InputComponent
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={multiline ? rows : undefined}
          className={cn(
            "pr-10",
            !label && "pb-10"
          )}
        />
        {!label && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleEnhance}
            disabled={isEnhancing || !value.trim()}
            className="absolute bottom-2 right-2 h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Sprachlich verbessern"
          >
            {isEnhancing ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 mr-1" />
            )}
            <span className="text-xs">{isEnhancing ? '...' : 'Polieren'}</span>
          </Button>
        )}
      </div>
      <p className="text-xs text-slate-400">
        💡 "Text polieren" = nur sprachliche Verbesserung (Grammatik, Fluss, Rhythmus). KEINE Recherche, KEINE neuen Inhalte.
      </p>
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}
