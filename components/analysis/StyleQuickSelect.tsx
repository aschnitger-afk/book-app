'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PREDEFINED_STYLES, StyleProfile } from '@/lib/styles/authorStylesExtended';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StyleQuickSelectProps {
  currentStyle?: StyleProfile;
  onChange: (style: StyleProfile | null) => void;
}

export function StyleQuickSelect({ currentStyle, onChange }: StyleQuickSelectProps) {
  const [selected, setSelected] = useState<StyleProfile | null>(currentStyle || null);

  const handleSelect = (style: StyleProfile) => {
    setSelected(style);
    onChange(style);
  };

  return (
    <ScrollArea className="h-[300px]">
      <div className="grid grid-cols-2 gap-3 p-1">
        {PREDEFINED_STYLES.map((style) => (
          <Card
            key={style.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selected?.id === style.id
                ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                : "border-slate-200 hover:border-violet-300"
            )}
            onClick={() => handleSelect(style)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{style.name}</p>
                    {selected?.id === style.id && (
                      <Check className="h-4 w-4 text-violet-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {style.description}
                  </p>
                  
                  {/* Key characteristics */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {style.characteristics && (
                      <>
                        {style.characteristics.pacing > 7 && (
                          <Badge variant="secondary" className="text-[10px] px-1">Schnell</Badge>
                        )}
                        {style.characteristics.pacing < 4 && (
                          <Badge variant="secondary" className="text-[10px] px-1">Langsam</Badge>
                        )}
                        {style.characteristics.descriptionLevel > 7 && (
                          <Badge variant="secondary" className="text-[10px] px-1">Detailliert</Badge>
                        )}
                        {style.characteristics.dialogueDensity > 7 && (
                          <Badge variant="secondary" className="text-[10px] px-1">Dialoglastig</Badge>
                        )}
                        {style.characteristics.sentenceComplexity > 7 && (
                          <Badge variant="secondary" className="text-[10px] px-1">Komplex</Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
