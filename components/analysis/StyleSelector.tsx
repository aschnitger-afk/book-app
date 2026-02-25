'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StyleRadarChart, StyleComparison } from './StyleRadarChart';
import { PREDEFINED_STYLES, analyzeTextStyle, StyleProfile } from '@/lib/styles/authorStylesExtended';
import { useAppStore } from '@/lib/store';
import { Sparkles, Upload, BookOpen, User, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StyleSelectorProps {
  onStyleSelect?: (style: StyleProfile) => void;
  selectedStyleId?: string;
}

export function StyleSelector({ onStyleSelect, selectedStyleId }: StyleSelectorProps) {
  const [activeTab, setActiveTab] = useState('preset');
  const [selectedStyle, setSelectedStyle] = useState<StyleProfile | null>(
    PREDEFINED_STYLES.find(s => s.id === selectedStyleId) || null
  );
  const [personalText, setPersonalText] = useState('');
  const [personalStyle, setPersonalStyle] = useState<StyleProfile['characteristics'] | null>(null);
  const [analyzedStyle, setAnalyzedStyle] = useState<StyleProfile | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { setCurrentBook, currentBook } = useAppStore();

  const handleSelectStyle = (style: StyleProfile) => {
    setSelectedStyle(style);
    if (onStyleSelect) {
      onStyleSelect(style);
    }
    
    // Save to book
    if (currentBook) {
      fetch(`/api/books/${currentBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styleProfile: style.systemPrompt }),
      });
    }
  };

  const handleAnalyzePersonalStyle = () => {
    if (!personalText.trim() || personalText.length < 100) {
      alert('Bitte gib mindestens 100 Wörter ein, damit wir deinen Stil analysieren können.');
      return;
    }
    
    const analysis = analyzeTextStyle(personalText);
    setPersonalStyle(analysis as StyleProfile['characteristics']);
    setShowAnalysis(true);
  };

  const handleCreatePersonalStyle = (matchResult: { style: StyleProfile, similarity: number }) => {
    const personalStyleProfile: StyleProfile = {
      id: 'personal',
      name: 'Mein persönlicher Stil',
      author: 'Du',
      description: `Basierend auf deiner Schriftprobe. Ähnlichkeit mit ${matchResult.style.name}: ${matchResult.similarity.toFixed(0)}%`,
      characteristics: personalStyle!,
      systemPrompt: `Du schreibst im persönlichen Stil des Autors. Die Analyse zeigt: ${Object.entries(personalStyle!)
        .map(([key, val]) => `${key}: ${val}/10`)
        .join(', ')}. Orientiere dich am Stil von ${matchResult.style.name} als Referenz.`,
      genre: 'Persönlich',
      era: 'Zeitgenössisch',
    };
    
    setAnalyzedStyle(personalStyleProfile);
    handleSelectStyle(personalStyleProfile);
  };

  const getCharacteristicColor = (value: number) => {
    if (value >= 8) return 'bg-green-500';
    if (value >= 6) return 'bg-yellow-500';
    if (value >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          Schreibstil auswählen
        </CardTitle>
        <CardDescription>
          Wähle einen Stil von berühmten Autoren oder analysiere deinen eigenen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preset">Berühmte Autoren</TabsTrigger>
            <TabsTrigger value="personal">Eigener Stil</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!personalStyle}>Analyse</TabsTrigger>
          </TabsList>

          {/* Preset Styles */}
          <TabsContent value="preset" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PREDEFINED_STYLES.map((style) => (
                <div
                  key={style.id}
                  onClick={() => handleSelectStyle(style)}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                    selectedStyle?.id === style.id 
                      ? "border-violet-500 bg-violet-50" 
                      : "border-slate-200 hover:border-violet-300"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{style.name}</h3>
                      <p className="text-sm text-slate-500">{style.genre}</p>
                    </div>
                    {selectedStyle?.id === style.id && (
                      <Check className="h-5 w-5 text-violet-600" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{style.description}</p>
                  
                  {/* Mini radar preview */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(style.characteristics).slice(0, 4).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedStyle && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2">Ausgewählt: {selectedStyle.name}</h4>
                <p className="text-sm text-slate-600">{selectedStyle.systemPrompt.substring(0, 200)}...</p>
              </div>
            )}
          </TabsContent>

          {/* Personal Style */}
          <TabsContent value="personal" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Füge eine Schriftprobe ein (mindestens 100 Wörter)
                </label>
                <Textarea
                  value={personalText}
                  onChange={(e) => setPersonalText(e.target.value)}
                  placeholder="Füge hier einen Text ein, den du geschrieben hast. Die KI analysiert dann deinen Schreibstil..."
                  className="min-h-[200px]"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {personalText.split(/\s+/).filter(w => w.length > 0).length} Wörter eingegeben
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAnalyzePersonalStyle}
                  disabled={personalText.length < 100}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Stil analysieren
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Analysis */}
          <TabsContent value="analysis" className="space-y-4">
            {personalStyle && (
              <>
                <StyleRadarChart
                  profiles={PREDEFINED_STYLES.slice(0, 4)}
                  personalProfile={personalStyle}
                  height={300}
                />
                
                <StyleComparison
                  personalCharacteristics={personalStyle}
                  onMatchFound={(style, similarity) => {
                    console.log('Best match:', style.name, similarity);
                  }}
                />
                
                {analyzedStyle && (
                  <Button 
                    onClick={() => handleSelectStyle(analyzedStyle)}
                    className="w-full"
                  >
                    Diesen persönlichen Stil verwenden
                  </Button>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Quick style selector for the toolbar
export function StyleQuickSelect({ currentStyle, onChange }: { currentStyle?: StyleProfile, onChange: (style: StyleProfile) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          {currentStyle ? currentStyle.name : 'Stil wählen'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schreibstil auswählen</DialogTitle>
        </DialogHeader>
        <StyleSelector 
          selectedStyleId={currentStyle?.id}
          onStyleSelect={(style) => {
            onChange(style);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
