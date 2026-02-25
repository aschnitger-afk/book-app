'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PLOT_STRUCTURES, PlotStructure } from '@/lib/plot/structures';
import { useAppStore } from '@/lib/store';
import { GitBranch, Check, Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StructureSelectorProps {
  selectedStructureId?: string;
  onStructureSelect?: (structure: PlotStructure) => void;
}

export function StructureSelector({ selectedStructureId, onStructureSelect }: StructureSelectorProps) {
  const [selectedStructure, setSelectedStructure] = useState<PlotStructure | null>(
    PLOT_STRUCTURES.find(s => s.id === selectedStructureId) || null
  );
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const { currentBook } = useAppStore();

  const handleSelect = (structure: PlotStructure) => {
    setSelectedStructure(structure);
    if (onStructureSelect) {
      onStructureSelect(structure);
    }
  };

  // Suggest structures based on genre
  const genre = currentBook?.genre?.toLowerCase() || '';
  const suggestedStructures = PLOT_STRUCTURES.filter(s => 
    s.bestFor.some(g => g.toLowerCase().includes(genre) || genre.includes(g.toLowerCase()))
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-violet-500" />
          Story-Struktur wählen
        </CardTitle>
        <CardDescription>
          Wähle eine etablierte Plot-Struktur für deine Geschichte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLOT_STRUCTURES.map((structure) => (
            <div
              key={structure.id}
              onClick={() => handleSelect(structure)}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                selectedStructure?.id === structure.id 
                  ? "border-violet-500 bg-violet-50" 
                  : "border-slate-200 hover:border-violet-300"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{structure.name}</h3>
                    {suggestedStructures.some(s => s.id === structure.id) && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Empfohlen
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {structure.acts} Akte • {structure.complexity}
                  </p>
                </div>
                {selectedStructure?.id === structure.id && (
                  <Check className="h-5 w-5 text-violet-600" />
                )}
              </div>
              
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{structure.description}</p>
              
              {/* Explanation preview */}
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
                {structure.explanation}
              </p>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {structure.bestFor.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function StructureBadge({ structureId }: { structureId?: string }) {
  const structure = PLOT_STRUCTURES.find(s => s.id === structureId);
  
  if (!structure) return null;
  
  return (
    <Badge variant="outline" className="gap-1">
      <GitBranch className="h-3 w-3" />
      {structure.name}
    </Badge>
  );
}

// Simple structure suggester function
export function suggestStructure(genre: string): PlotStructure[] {
  const genreLower = genre.toLowerCase();
  return PLOT_STRUCTURES.filter(s => 
    s.bestFor.some(g => g.toLowerCase().includes(genreLower))
  );
}
