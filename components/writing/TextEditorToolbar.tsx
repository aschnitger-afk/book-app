'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Wand2, 
  Scissors, 
  Expand, 
  Sparkles, 
  Eye, 
  MessageSquare,
  Palette,
  Gauge,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextEditorToolbarProps {
  content: string;
  onApply: (newContent: string) => void;
  disabled?: boolean;
}

type EnhancementType = 
  | 'shorten' 
  | 'expand' 
  | 'improve' 
  | 'showDontTell' 
  | 'betterDialogue' 
  | 'betterDescription'
  | 'moreIntense'
  | 'calmer'
  | 'polish';

interface EnhancementOption {
  id: EnhancementType;
  label: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const ENHANCEMENTS: EnhancementOption[] = [
  {
    id: 'polish',
    label: 'Text polieren',
    description: 'Grammatik, Stil, Lesbarkeit verbessern',
    icon: <Sparkles className="h-4 w-4" />,
    prompt: 'Verbessere den folgenden Text in Bezug auf Grammatik, Rechtschreibung, Stil und Lesbarkeit. Behalte den Inhalt und Ton bei, mache ihn aber professioneller und flüssiger.',
  },
  {
    id: 'shorten',
    label: 'Kürzen',
    description: 'Prägnanter und kompakter machen',
    icon: <Scissors className="h-4 w-4" />,
    prompt: 'Kürze den folgenden Text um etwa 30-40%. Entferne überflüssige Wörter, Wiederholungen und Redundanzen. Halte die Kernbotschaft bei.',
  },
  {
    id: 'expand',
    label: 'Ausführen',
    description: 'Mehr Details und Tiefe hinzufügen',
    icon: <Expand className="h-4 w-4" />,
    prompt: 'Erweitere den folgenden Text mit mehr Details, Beschreibungen und inneren Gedanken. Füge Sinnesdetails und emotionale Tiefe hinzu.',
  },
  {
    id: 'improve',
    label: 'Stil verbessern',
    description: 'Bessere Wortwahl und Fluss',
    icon: <Wand2 className="h-4 w-4" />,
    prompt: 'Verbessere den Schreibstil des folgenden Texts. Verwende präzisere, bildreichere Wörter. Variiere die Satzlängen für besseren Rhythmus.',
  },
  {
    id: 'showDontTell',
    label: 'Zeigen statt erzählen',
    description: 'Szenen lebendiger machen',
    icon: <Eye className="h-4 w-4" />,
    prompt: 'Wandle "Erzählen" in "Zeigen" um. Ersetze abstrakte Beschreibungen durch konkrete Szenen, Aktionen und Sinnesdetails. Zeige Emotionen durch Körpersprache und Verhalten.',
  },
  {
    id: 'betterDialogue',
    label: 'Dialog verbessern',
    description: 'Natürlichere Gespräche',
    icon: <MessageSquare className="h-4 w-4" />,
    prompt: 'Verbessere die Dialoge im folgenden Text. Mache sie natürlicher, subtiler und charakterspezifischer. Füge Dialog-Tags und Aktionen hinzu, die die Szene lebendiger machen.',
  },
  {
    id: 'betterDescription',
    label: 'Beschreibung verbessern',
    description: 'Bilderreicher und atmosphärischer',
    icon: <Palette className="h-4 w-4" />,
    prompt: 'Verbessere die Beschreibungen im folgenden Text. Verwende alle fünf Sinne. Schaffe eine stärkere Atmosphäre durch bildreiche Sprache und Metaphern.',
  },
  {
    id: 'moreIntense',
    label: 'Intensiver',
    description: 'Mehr Spannung und Emotion',
    icon: <Gauge className="h-4 w-4" />,
    prompt: 'Steigere die Intensität des folgenden Texts. Verstärke die Emotionen, erhöhe die Stakes, mache die Szene dramatischer und fesselnder.',
  },
  {
    id: 'calmer',
    label: 'Gedämpfter',
    description: 'Ruhiger und subtiler',
    icon: <CheckCircle2 className="h-4 w-4" />,
    prompt: 'Dämpfe die Intensität des folgenden Texts. Mache die Szene ruhiger, introspektiver und subtiler. Reduziere übertriebene Emotionen.',
  },
];

export function TextEditorToolbar({ content, onApply, disabled }: TextEditorToolbarProps) {
  const [isLoading, setIsLoading] = useState<EnhancementType | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleEnhance = async (type: EnhancementType) => {
    if (!content.trim() || isLoading) return;

    const enhancement = ENHANCEMENTS.find(e => e.id === type);
    if (!enhancement) return;

    setIsLoading(type);
    
    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${enhancement.prompt}

ORIGINALTEXT:
"""
${content}
"""

Gib nur den verbesserten Text zurück, ohne Erklärungen oder Einleitungen.`,
          type: 'text_enhancement',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onApply(data.result);
        setLastAction(enhancement.label);
        
        // Clear success message after 3 seconds
        setTimeout(() => setLastAction(null), 3000);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const getSelectedText = () => {
    if (typeof window !== 'undefined') {
      const selection = window.getSelection()?.toString();
      return selection || content;
    }
    return content;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Main Actions */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
        {ENHANCEMENTS.slice(0, 3).map((enhancement) => (
          <Button
            key={enhancement.id}
            variant="ghost"
            size="sm"
            onClick={() => handleEnhance(enhancement.id)}
            disabled={disabled || !!isLoading || !content.trim()}
            className={cn(
              "h-8 px-2 text-xs",
              isLoading === enhancement.id && "bg-violet-100 text-violet-700"
            )}
          >
            {isLoading === enhancement.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <span className="mr-1">{enhancement.icon}</span>
            )}
            {enhancement.label}
          </Button>
        ))}
      </div>

      {/* More Options Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            disabled={disabled || !!isLoading || !content.trim()}
          >
            <Wand2 className="h-3.5 w-3.5 mr-1" />
            Mehr...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {ENHANCEMENTS.slice(3).map((enhancement) => (
              <button
                key={enhancement.id}
                onClick={() => handleEnhance(enhancement.id)}
                disabled={isLoading === enhancement.id}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors",
                  "hover:bg-slate-100 disabled:opacity-50"
                )}
              >
                <span className="text-slate-500">{enhancement.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{enhancement.label}</p>
                  <p className="text-xs text-slate-400">{enhancement.description}</p>
                </div>
                {isLoading === enhancement.id && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Success Indicator */}
      {lastAction && (
        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {lastAction} angewendet
        </Badge>
      )}

      {/* Help Text */}
      {!content.trim() && (
        <span className="text-xs text-slate-400">
          Schreibe zuerst etwas Text...
        </span>
      )}
    </div>
  );
}
