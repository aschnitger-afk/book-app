'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  SlidersHorizontal, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Wind,
  Flame,
  Snowflake,
  Sparkles,
  Eye,
  MessageSquare,
  Layers,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WritingStyle {
  length: 'shorter' | 'same' | 'longer';
  pace: 'slower' | 'same' | 'faster';
  intensity: 'calmer' | 'same' | 'more_intense';
  showDontTell: 'more_showing' | 'same' | 'more_telling';
  dialogueAmount: 'less' | 'same' | 'more';
  descriptionLevel: 'sparse' | 'balanced' | 'rich';
  povDepth: 'surface' | 'medium' | 'deep';
  toneShift?: string;
}

const defaultStyle: WritingStyle = {
  length: 'same',
  pace: 'same',
  intensity: 'same',
  showDontTell: 'same',
  dialogueAmount: 'same',
  descriptionLevel: 'balanced',
  povDepth: 'medium',
};

interface WritingStyleControlsProps {
  style: WritingStyle;
  onChange: (style: WritingStyle) => void;
  onApply?: () => void;
}

interface StyleOption {
  key: keyof WritingStyle;
  label: string;
  icon: React.ReactNode;
  options: { value: string; label: string; icon?: React.ReactNode }[];
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    key: 'length',
    label: 'Länge',
    icon: <Maximize2 className="h-4 w-4" />,
    options: [
      { value: 'shorter', label: 'Kürzer', icon: <Minimize2 className="h-3 w-3" /> },
      { value: 'same', label: 'Gleich' },
      { value: 'longer', label: 'Länger', icon: <Maximize2 className="h-3 w-3" /> },
    ],
  },
  {
    key: 'pace',
    label: 'Tempo',
    icon: <Zap className="h-4 w-4" />,
    options: [
      { value: 'slower', label: 'Langsamer', icon: <Wind className="h-3 w-3" /> },
      { value: 'same', label: 'Gleich' },
      { value: 'faster', label: 'Schneller', icon: <Zap className="h-3 w-3" /> },
    ],
  },
  {
    key: 'intensity',
    label: 'Intensität',
    icon: <Flame className="h-4 w-4" />,
    options: [
      { value: 'calmer', label: 'Gedämpfter', icon: <Snowflake className="h-3 w-3" /> },
      { value: 'same', label: 'Gleich' },
      { value: 'more_intense', label: 'Intensiver', icon: <Flame className="h-3 w-3" /> },
    ],
  },
  {
    key: 'showDontTell',
    label: 'Show vs Tell',
    icon: <Eye className="h-4 w-4" />,
    options: [
      { value: 'more_showing', label: 'Mehr Zeigen', icon: <Eye className="h-3 w-3" /> },
      { value: 'same', label: 'Gleich' },
      { value: 'more_telling', label: 'Mehr Erzählen', icon: <MessageSquare className="h-3 w-3" /> },
    ],
  },
  {
    key: 'dialogueAmount',
    label: 'Dialog-Anteil',
    icon: <MessageSquare className="h-4 w-4" />,
    options: [
      { value: 'less', label: 'Weniger Dialog' },
      { value: 'same', label: 'Gleich' },
      { value: 'more', label: 'Mehr Dialog' },
    ],
  },
  {
    key: 'descriptionLevel',
    label: 'Beschreibung',
    icon: <Layers className="h-4 w-4" />,
    options: [
      { value: 'sparse', label: 'Sparsam' },
      { value: 'balanced', label: 'Ausgewogen' },
      { value: 'rich', label: 'Reichhaltig' },
    ],
  },
  {
    key: 'povDepth',
    label: 'POV-Tiefe',
    icon: <Sparkles className="h-4 w-4" />,
    options: [
      { value: 'surface', label: 'Oberflächlich' },
      { value: 'medium', label: 'Mittel' },
      { value: 'deep', label: 'Tief' },
    ],
  },
];

const TONE_SHIFTS = [
  { value: '', label: 'Keine Änderung' },
  { value: 'more_dramatic', label: 'Dramatischer' },
  { value: 'more_humorous', label: 'Humorvoller' },
  { value: 'more_melancholic', label: 'Melancholischer' },
  { value: 'more_urgent', label: 'Dringlicher' },
  { value: 'more_reflective', label: 'Nachdenklicher' },
  { value: 'more_suspenseful', label: 'Spannender' },
  { value: 'more_romantic', label: 'Romantischer' },
  { value: 'more_gritty', label: 'Rauher' },
];

export function WritingStyleControls({ style, onChange, onApply }: WritingStyleControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStyle, setLocalStyle] = useState<WritingStyle>(style);

  const handleChange = (key: keyof WritingStyle, value: string) => {
    const newStyle = { ...localStyle, [key]: value };
    setLocalStyle(newStyle);
    onChange(newStyle);
  };

  const handleReset = () => {
    setLocalStyle(defaultStyle);
    onChange(defaultStyle);
  };

  const hasCustomSettings = Object.entries(localStyle).some(([key, value]) => {
    if (key === 'toneShift') return value !== '';
    return value !== 'same' && value !== 'balanced' && value !== 'medium';
  });

  const getStyleSummary = () => {
    const changes: string[] = [];
    if (localStyle.length !== 'same') changes.push(localStyle.length === 'shorter' ? 'kürzer' : 'länger');
    if (localStyle.pace !== 'same') changes.push(localStyle.pace === 'faster' ? 'schneller' : 'langsamer');
    if (localStyle.intensity !== 'same') changes.push(localStyle.intensity === 'more_intense' ? 'intensiver' : 'gedämpfter');
    if (localStyle.toneShift) {
      const tone = TONE_SHIFTS.find(t => t.value === localStyle.toneShift);
      if (tone) changes.push(tone.label);
    }
    return changes.length > 0 ? changes.join(', ') : 'Standard';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "gap-2",
            hasCustomSettings && "border-violet-300 bg-violet-50 text-violet-700"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Stil
          {hasCustomSettings && (
            <Badge variant="secondary" className="ml-1 text-xs">
              Angepasst
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Schreibstil anpassen</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {getStyleSummary()}
          </p>
        </div>

        <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto">
          {STYLE_OPTIONS.map((option) => (
            <div key={option.key} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                {option.icon}
                {option.label}
              </div>
              <div className="flex gap-1">
                {option.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleChange(option.key, opt.value)}
                    className={cn(
                      "flex-1 px-2 py-1.5 text-xs rounded-md transition-all flex items-center justify-center gap-1",
                      localStyle[option.key] === opt.value
                        ? "bg-violet-100 text-violet-700 font-medium"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Tone Shift */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Sparkles className="h-4 w-4" />
              Tonfall verschieben
            </div>
            <select
              value={localStyle.toneShift || ''}
              onChange={(e) => handleChange('toneShift', e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {TONE_SHIFTS.map((tone) => (
                <option key={tone.value} value={tone.value}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {onApply && (
          <div className="p-3 border-t bg-slate-50">
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => {
                onApply();
                setIsOpen(false);
              }}
            >
              Auf aktuellen Text anwenden
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Generate style instructions for the AI based on style settings
 */
export function generateStyleInstructions(style: WritingStyle): string {
  const instructions: string[] = [];

  if (style.length === 'shorter') {
    instructions.push('Schreibe kürzer und prägnanter. Kürze überflüssige Beschreibungen und Wiederholungen.');
  } else if (style.length === 'longer') {
    instructions.push('Erweitere den Text mit mehr Details, Beschreibungen und inneren Monologen.');
  }

  if (style.pace === 'faster') {
    instructions.push('Erhöhe das Tempo: Kürzere Sätze, mehr Aktion, weniger Reflexion.');
  } else if (style.pace === 'slower') {
    instructions.push('Verlangsame das Tempo: Längere Sätze, mehr Atmosphäre, Raum für Reflexion.');
  }

  if (style.intensity === 'more_intense') {
    instructions.push('Steigere die Intensität: Stärkere Emotionen, höhere Stakes, mehr Konflikt.');
  } else if (style.intensity === 'calmer') {
    instructions.push('Dämpfe die Intensität: Gedämpftere Emotionen, ruhigere Szene, mehr Subtilität.');
  }

  if (style.showDontTell === 'more_showing') {
    instructions.push('Zeige mehr, erzähle weniger: Nutze Sinneseindrücke, Körpersprache, Aktion statt Erklärungen.');
  } else if (style.showDontTell === 'more_telling') {
    instructions.push('Erzähle mehr direkt: Komprimiere Szenen durch Zusammenfassung und Erklärung.');
  }

  if (style.dialogueAmount === 'more') {
    instructions.push('Verwende mehr Dialog: Lass Charaktere durch Gespräche handeln und ihre Persönlichkeit zeigen.');
  } else if (style.dialogueAmount === 'less') {
    instructions.push('Reduziere Dialog: Fokus auf Erzählung, Beschreibung und innere Gedanken.');
  }

  if (style.descriptionLevel === 'sparse') {
    instructions.push('Sparsame Beschreibung: Nur das Wesentliche, keine überflüssigen Details.');
  } else if (style.descriptionLevel === 'rich') {
    instructions.push('Reichhaltige Beschreibung: Detaillierte Szenenbilder, Atmosphäre, Sinnesdetails.');
  }

  if (style.povDepth === 'deep') {
    instructions.push('Tiefe POV: Direkter Zugang zu Gedanken und Gefühlen des Charakters.');
  } else if (style.povDepth === 'surface') {
    instructions.push('Oberflächliche POV: Zeige nur äußerlich beobachtbare Handlungen und Dialog.');
  }

  if (style.toneShift) {
    const toneMap: Record<string, string> = {
      'more_dramatic': 'Mache den Text dramatischer.',
      'more_humorous': 'Füge Humor und Leichtigkeit ein.',
      'more_melancholic': 'Gib dem Text eine melancholische, nachdenkliche Stimmung.',
      'more_urgent': 'Erzeuge Dringlichkeit und Zeitdruck.',
      'more_reflective': 'Mache den Text reflektiver und philosophischer.',
      'more_suspenseful': 'Steigere Spannung und Ungewissheit.',
      'more_romantic': 'Beton romantische Elemente und Gefühle.',
      'more_gritty': 'Mache den Text rauer, realistischer, weniger idealisiert.',
    };
    if (toneMap[style.toneShift]) {
      instructions.push(toneMap[style.toneShift]);
    }
  }

  return instructions.join('\n');
}
