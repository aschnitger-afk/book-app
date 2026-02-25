'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StyleRadarChart } from '@/components/analysis/StyleRadarChart';
import { StyleCreator } from '@/components/analysis/StyleCreator';
import { ALL_AUTHOR_STYLES, StyleProfile } from '@/lib/styles/authorStylesExtended';
import { 
  User, Sparkles, BookOpen, Database, Star, 
  Save, CheckCircle2, ChevronRight, Plus, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Preset styles for quick selection
const PRESET_STYLES: StyleProfile[] = [
  {
    id: 'fast-paced',
    name: 'Schnell & Actionreich',
    author: 'Preset',
    description: 'Kurze Sätze, schnelle Abfolge, wenig Beschreibung',
    characteristics: {
      pacing: 9, dialogueDensity: 6, descriptionLevel: 3,
      sentenceComplexity: 4, vocabularyRichness: 5, emotionalDepth: 5,
      atmosphericDensity: 4, tensionLevel: 9, introspection: 3, accessibility: 8
    },
    systemPrompt: 'Write with fast pacing, short sentences, minimal description, high action.',
    genre: 'Action/Thriller', era: 'Modern'
  },
  {
    id: 'literary',
    name: 'Literarisch & Tiefgründig',
    author: 'Preset',
    description: 'Komplexe Sätze, reicher Wortschatz, introspektiv',
    characteristics: {
      pacing: 3, dialogueDensity: 4, descriptionLevel: 8,
      sentenceComplexity: 9, vocabularyRichness: 9, emotionalDepth: 9,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 9, accessibility: 4
    },
    systemPrompt: 'Write literary fiction with complex sentences, rich vocabulary, deep introspection.',
    genre: 'Literary', era: 'Modern'
  },
  {
    id: 'balanced',
    name: 'Ausgewogen',
    author: 'Preset',
    description: 'Gute Mischung aus Dialog, Action und Beschreibung',
    characteristics: {
      pacing: 6, dialogueDensity: 6, descriptionLevel: 6,
      sentenceComplexity: 6, vocabularyRichness: 6, emotionalDepth: 6,
      atmosphericDensity: 6, tensionLevel: 6, introspection: 6, accessibility: 7
    },
    systemPrompt: 'Write with balanced pacing, good mix of dialogue and description.',
    genre: 'General', era: 'Modern'
  },
  {
    id: 'minimalist',
    name: 'Minimalistisch (Hemingway-Stil)',
    author: 'Preset',
    description: 'Wenig Worte, viel Bedeutung, sachlich',
    characteristics: {
      pacing: 7, dialogueDensity: 7, descriptionLevel: 3,
      sentenceComplexity: 3, vocabularyRichness: 4, emotionalDepth: 6,
      atmosphericDensity: 4, tensionLevel: 6, introspection: 4, accessibility: 9
    },
    systemPrompt: 'Write minimalist prose. Short, direct sentences. Show, don\'t tell.',
    genre: 'Modern', era: '1950s'
  },
];

interface SavedStyle {
  id: string;
  name: string;
  description: string;
  characteristics: StyleProfile['characteristics'];
  createdAt: string;
}

export function StyleAnalysisPhase() {
  const { currentBook, setCurrentBook, setCurrentPhase } = useAppStore();
  
  // State
  const [activeTab, setActiveTab] = useState('presets');
  const [selectedStyle, setSelectedStyle] = useState<StyleProfile | null>(null);
  const [savedStyles, setSavedStyles] = useState<SavedStyle[]>([]);
  const [authorSearch, setAuthorSearch] = useState('');
  const [customStyleName, setCustomStyleName] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Load saved styles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved-writing-styles');
    if (saved) {
      try {
        setSavedStyles(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save style selection to book
  const saveStyleToBook = async () => {
    if (!currentBook || !selectedStyle) return;

    await fetch(`/api/books/${currentBook.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        styleProfile: selectedStyle.systemPrompt,
        styleName: selectedStyle.name,
      }),
    });

    setCurrentBook({ 
      ...currentBook, 
      styleProfile: selectedStyle.systemPrompt,
    });
    
    setIsComplete(true);
  };

  // Save custom style
  const saveCustomStyle = () => {
    if (!customStyleName || !selectedStyle) return;
    
    const newStyle: SavedStyle = {
      id: `custom-${Date.now()}`,
      name: customStyleName,
      description: selectedStyle.description,
      characteristics: selectedStyle.characteristics,
      createdAt: new Date().toLocaleDateString(),
    };
    
    const updated = [newStyle, ...savedStyles];
    setSavedStyles(updated);
    localStorage.setItem('saved-writing-styles', JSON.stringify(updated));
    setCustomStyleName('');
  };

  // Filter authors
  const filteredAuthors = authorSearch 
    ? ALL_AUTHOR_STYLES.filter(a => 
        a.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
        a.genre.toLowerCase().includes(authorSearch.toLowerCase())
      ).slice(0, 8)
    : ALL_AUTHOR_STYLES.slice(0, 8);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <User className="h-6 w-6 text-violet-500" />
              Schreibstil definieren
            </h1>
            <p className="text-slate-500 mt-1">
              Wähle oder entwickle den Stil für dein Buch
            </p>
          </div>
          {selectedStyle && (
            <Button onClick={saveStyleToBook} className="bg-green-600">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isComplete ? 'Gespeichert!' : 'Stil übernehmen'}
            </Button>
          )}
        </div>

        {/* Selected Style Banner */}
        {selectedStyle && (
          <Card className="bg-violet-50 border-violet-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-violet-700">Gewählter Stil:</p>
                  <p className="text-xl font-semibold text-violet-900">{selectedStyle.name}</p>
                  <p className="text-sm text-violet-600">{selectedStyle.description}</p>
                </div>
                <StyleRadarChart
                  profiles={[selectedStyle]}
                  height={150}
                  className="w-64"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets">
              <Sparkles className="h-4 w-4 mr-2" />
              Schnellauswahl
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              Meine Stile
            </TabsTrigger>
            <TabsTrigger value="authors">
              <Star className="h-4 w-4 mr-2" />
              Star-Autoren
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Plus className="h-4 w-4 mr-2" />
              Individuell
            </TabsTrigger>
          </TabsList>

          {/* PRESETS TAB */}
          <TabsContent value="presets" className="mt-6">
            <div className="grid grid-cols-2 gap-4">
              {PRESET_STYLES.map((style) => (
                <Card
                  key={style.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedStyle?.id === style.id
                      ? "ring-2 ring-violet-500 bg-violet-50"
                      : "hover:border-violet-300"
                  )}
                  onClick={() => setSelectedStyle(style)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{style.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{style.description}</p>
                      </div>
                      {selectedStyle?.id === style.id && (
                        <CheckCircle2 className="h-5 w-5 text-violet-600" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {Object.entries(style.characteristics).slice(0, 4).map(([key, val]) => (
                        <Badge key={key} variant="outline" className="text-[10px]">
                          {key}: {val}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* DATABASE TAB */}
          <TabsContent value="database" className="mt-6">
            {savedStyles.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {savedStyles.map((style) => (
                  <Card
                    key={style.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedStyle?.id === style.id
                        ? "ring-2 ring-violet-500 bg-violet-50"
                        : "hover:border-violet-300"
                    )}
                    onClick={() => setSelectedStyle({
                      ...style,
                      author: 'Custom',
                      systemPrompt: `Custom style: ${style.name}`,
                      genre: 'Custom',
                      era: 'Modern'
                    })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{style.name}</h3>
                          <p className="text-xs text-slate-500">Gespeichert: {style.createdAt}</p>
                        </div>
                        {selectedStyle?.id === style.id && (
                          <CheckCircle2 className="h-5 w-5 text-violet-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-slate-500">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Noch keine eigenen Stile gespeichert</p>
                <p className="text-sm">Erstelle im "Individuell"-Tab deinen ersten Stil</p>
              </Card>
            )}
          </TabsContent>

          {/* AUTHORS TAB */}
          <TabsContent value="authors" className="mt-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  placeholder="Autor suchen (z.B. Hemingway, King, Tolkien...)"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredAuthors.map((author) => (
                <Card
                  key={author.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedStyle?.id === author.id
                      ? "ring-2 ring-violet-500 bg-violet-50"
                      : "hover:border-violet-300"
                  )}
                  onClick={() => setSelectedStyle(author)}
                >
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm">{author.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{author.description}</p>
                    <Badge variant="outline" className="text-[10px] mt-2">
                      {author.genre}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CUSTOM TAB */}
          <TabsContent value="custom" className="mt-6">
            <StyleCreator 
              onStyleCreated={(style) => {
                setSelectedStyle(style);
                setCustomStyleName(style.name);
              }}
              savedStyles={savedStyles}
              onSaveStyle={saveCustomStyle}
            />
          </TabsContent>
        </Tabs>

        {/* Continue Button */}
        {isComplete && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-medium">Schreibstil festgelegt!</p>
                  <p className="text-green-600 text-sm">Du kannst jetzt mit der Konzept-Phase fortfahren.</p>
                </div>
                <Button onClick={() => setCurrentPhase('concept')} className="bg-green-600">
                  Weiter zur Konzept-Phase
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
