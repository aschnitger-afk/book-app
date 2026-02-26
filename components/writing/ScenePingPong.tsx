'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, Bot, User, Sparkles, CheckCircle2, 
  RotateCcw, ChevronRight, BookOpen, Users, MapPin,
  Target, MessageSquare, Wand2, Save, Edit3, Scroll
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, Character, Chapter } from '@/lib/store';

interface Scene {
  id: string;
  title: string;
  content: string;
  briefing: string;
  status: 'draft' | 'review' | 'approved';
  order: number;
  characters: string[];
  location?: string;
  mood?: string;
  wordCount: number;
}

interface ScenePingPongProps {
  chapter: Chapter;
  bookId: string;
}

export function ScenePingPong({ chapter, bookId }: ScenePingPongProps) {
  const { characters, currentBook, worldSettings, concept, plotPoints } = useAppStore();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [briefing, setBriefing] = useState('');
  const [mood, setMood] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneContent, setSceneContent] = useState('');
  const [activeTab, setActiveTab] = useState('briefing');

  // Load existing scenes
  useEffect(() => {
    const savedScenes = localStorage.getItem(`scenes-${chapter.id}`);
    if (savedScenes) {
      setScenes(JSON.parse(savedScenes));
    }
  }, [chapter.id]);

  const saveScenes = (newScenes: Scene[]) => {
    setScenes(newScenes);
    localStorage.setItem(`scenes-${chapter.id}`, JSON.stringify(newScenes));
  };

  const createScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      title: `Szene ${scenes.length + 1}`,
      content: '',
      briefing,
      status: 'draft',
      order: scenes.length,
      characters: selectedCharacters,
      location: selectedLocation,
      mood,
      wordCount: 0,
    };
    
    const updated = [...scenes, newScene];
    saveScenes(updated);
    setCurrentScene(newScene);
    setSceneContent('');
    setActiveTab('write');
  };

  const buildContextPrompt = () => {
    const sceneCharacters = characters.filter(c => selectedCharacters.includes(c.id));
    const locationDetails = worldSettings?.locations?.find(
      (l: any) => l.name?.toLowerCase() === selectedLocation?.toLowerCase()
    );
    const currentPlotPoint = plotPoints?.find((p: any, idx: number) => idx === scenes.length);
    
    const context: any = {
      system: `Du bist ein professioneller Romanautor. 
Genre: ${currentBook?.genre || 'Literarisch'}
Stil: Bildhaft, präzise, atmosphärisch
Verwende kurze Sätze für Action, reiche Beschreibungen für Atmosphäre.`,
      
      concept: concept ? {
        genre: currentBook?.genre,
        premise: concept.premise,
        tone: concept.tone,
        themes: concept.themes,
        targetAudience: concept.targetAudience,
        logline: concept.logline,
      } : null,
      
      world: worldSettings ? {
        timePeriod: worldSettings.timePeriod,
        location: worldSettings.location,
        worldType: worldSettings.worldType,
        geography: worldSettings.geography,
        culture: worldSettings.culture,
        politics: worldSettings.politics,
        technology: worldSettings.technology,
        history: worldSettings.history,
        rules: worldSettings.rules,
        currentLocation: selectedLocation ? {
          name: selectedLocation,
          description: locationDetails?.description,
          atmosphere: locationDetails?.atmosphere,
        } : null,
      } : null,
      
      characters: sceneCharacters.map(c => ({
        name: c.name,
        role: c.role,
        age: c.age,
        occupation: c.occupation,
        appearance: c.appearance,
        description: c.description,
        personality: c.personality,
        background: c.background,
        goals: c.storyGoal || c.goals,
        motivations: c.motivations,
        unconsciousNeed: c.unconsciousNeed,
        conflicts: c.conflicts,
        flaws: c.flaws,
        strengths: c.strengths,
        secret: c.secret,
        affiliation: c.affiliation,
        speechPattern: c.voiceProfile,
      })),
      
      plot: {
        currentPoint: currentPlotPoint ? {
          title: currentPlotPoint.title,
          description: currentPlotPoint.description,
          act: currentPlotPoint.act,
          emotionalBeat: currentPlotPoint.emotionalBeat,
        } : null,
        previousScenes: scenes.slice(-2).map(s => ({
          title: s.title,
          summary: s.content?.slice(0, 200),
        })),
      },
      
      scene: {
        location: selectedLocation,
        mood: mood,
        briefing: briefing,
      },
      
      anchor: scenes.length > 0 && scenes[scenes.length - 1].content 
        ? scenes[scenes.length - 1].content.slice(-800)
        : null,
    };

    return context;
  };

  const generateScene = async () => {
    if (!briefing.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const context = buildContextPrompt();
      
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${context.system}

KONZEPT DES BUCHS:
${JSON.stringify(context.concept, null, 2)}

WELT (Worldbuilding):
${JSON.stringify(context.world, null, 2)}

CHARAKTERE IN DIESER SZENE:
${JSON.stringify(context.characters, null, 2)}

PLOT-KONTEXT:
${JSON.stringify(context.plot, null, 2)}

VORHERIGER TEXT (Anker):
${context.anchor || '[Anfang des Kapitels]'}

REGIEANWEISUNG FÜR DIESE SZENE:
Ort: ${context.scene.location || 'Nicht spezifiziert'}
Stimmung: ${context.scene.mood || 'Nicht spezifiziert'}
Was passiert: ${context.scene.briefing}

Schreibe die Szene (ca. 300-500 Wörter). 

WICHTIG:
- Nutze alle Informationen aus dem Worldbuilding (Kultur, Politik, Technologie, Geschichte)
- Die Charaktere müssen sich authentisch verhalten gemäß ihren Profilen (Ziele, Motivationen, Flaws, Geheimnisse)
- Beachte den Plot-Kontext und den emotionalen Beat
- Baue den Ort atmosphärisch aus (Nutze Details aus der Welt-Datenbank)
- Dialoge müssen zum Sprachstil der Charaktere passen
- Nahtlose Anbindung an den vorherigen Text
- Zeige Gefühle durch Handlungen, nicht nur Beschreibungen`,
          type: 'scene_write',
          context,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSceneContent(data.result);
        
        if (currentScene) {
          const updated = scenes.map(s => 
            s.id === currentScene.id 
              ? { ...s, content: data.result, wordCount: data.result.split(/\s+/).length }
              : s
          );
          saveScenes(updated);
          setCurrentScene({ ...currentScene, content: data.result, wordCount: data.result.split(/\s+/).length });
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const iterateScene = async (instruction: string) => {
    if (!sceneContent || !instruction.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const context = buildContextPrompt();
      
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `AKTUELLER SZENEN-TEXT:
"""${sceneContent}"""

KONTEXT (zur Referenz):
Charaktere: ${JSON.stringify(context.characters.map((c: any) => c.name))}
Ort: ${context.scene.location}
Welt-Typ: ${context.world?.worldType}

REGIE-KORREKTUR:
${instruction}

Überarbeite den Text entsprechend der Anweisung. Behalte den Grundinhalt bei, aber passe Stil, Ton oder Details an.
Achte besonders darauf, dass die Charaktere authentisch bleiben und der Kontext der Welt erhalten bleibt.`,
          type: 'scene_iterate',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSceneContent(data.result);
        
        if (currentScene) {
          const updated = scenes.map(s => 
            s.id === currentScene.id 
              ? { ...s, content: data.result, wordCount: data.result.split(/\s+/).length }
              : s
          );
          saveScenes(updated);
          setCurrentScene({ ...currentScene, content: data.result, wordCount: data.result.split(/\s+/).length });
        }
      }
    } catch (error) {
      console.error('Iteration failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const approveScene = () => {
    if (!currentScene) return;
    
    const updated = scenes.map(s => 
      s.id === currentScene.id 
        ? { ...s, status: 'approved' as const, content: sceneContent }
        : s
    );
    saveScenes(updated);
    
    const fullContent = updated.map(s => s.content).join('\n\n---\n\n');
    fetch(`/api/chapters/${chapter.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: fullContent }),
    });
    
    setCurrentScene(null);
    setBriefing('');
    setActiveTab('briefing');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Scene List Header */}
      <div className="border-b bg-white p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Szenen ({scenes.length})</h3>
          <div className="flex gap-1">
            {scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  setCurrentScene(scene);
                  setSceneContent(scene.content);
                  setBriefing(scene.briefing);
                  setSelectedCharacters(scene.characters);
                  setSelectedLocation(scene.location || '');
                  setMood(scene.mood || '');
                  setActiveTab(scene.content ? 'write' : 'briefing');
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  currentScene?.id === scene.id
                    ? 'bg-violet-600 text-white'
                    : scene.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={() => {
            setCurrentScene(null);
            setBriefing('');
            setSceneContent('');
            setSelectedCharacters([]);
            setActiveTab('briefing');
          }}
          className="bg-violet-600"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Neue Szene
        </Button>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-slate-50 px-4 flex-shrink-0">
            <TabsTrigger value="briefing">
              <Target className="h-4 w-4 mr-2" />
              1. Briefing
            </TabsTrigger>
            <TabsTrigger value="write" disabled={!currentScene}>
              <Edit3 className="h-4 w-4 mr-2" />
              2. Schreiben
            </TabsTrigger>
            <TabsTrigger value="review" disabled={!sceneContent}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              3. Lektorat
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Briefing - SCROLLABLE */}
          <TabsContent value="briefing" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="max-w-2xl mx-auto space-y-4 pb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-violet-500" />
                      Szenen-Briefing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Was passiert?</label>
                      <Textarea
                        value={briefing}
                        onChange={(e) => setBriefing(e.target.value)}
                        placeholder="Beschreibe die Szene... (z.B. 'Held A trifft Schurke B in der Taverne. Sie streiten über das magische Amulett.')"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Stimmung / Ziel</label>
                      <Input
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        placeholder="z.B. 'Angespannt, Held A ist nervös, versucht aber cool zu bleiben'"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Charaktere in dieser Szene</label>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                        {characters.map((char) => (
                          <button
                            key={char.id}
                            onClick={() => {
                              setSelectedCharacters(prev => 
                                prev.includes(char.id)
                                  ? prev.filter(id => id !== char.id)
                                  : [...prev, char.id]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                              selectedCharacters.includes(char.id)
                                ? 'bg-violet-100 text-violet-700 border-violet-300 border'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border'
                            }`}
                          >
                            {char.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Ort</label>
                      <Input
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        placeholder="z.B. 'Die Spelunke am Hafen'"
                        list="locations"
                      />
                      <datalist id="locations">
                        {worldSettings?.locations?.map((loc: any) => (
                          <option key={loc.id} value={loc.name} />
                        ))}
                      </datalist>
                    </div>

                    <Button 
                      onClick={createScene}
                      disabled={!briefing.trim()}
                      className="w-full bg-violet-600"
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Szene anlegen & Schreiben
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Step 2: Write */}
          <TabsContent value="write" className="flex-1 m-0 overflow-hidden">
            <div className="h-full flex">
              {/* Left: AI Generation */}
              <div className="w-1/2 border-r p-4 space-y-4 overflow-y-auto">
                <div className="bg-violet-50 rounded-lg p-4">
                  <h4 className="font-medium text-violet-900 flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4" />
                    KI-Vorschlag
                  </h4>
                  <p className="text-sm text-violet-700">
                    Die KI berücksichtigt beim Schreiben:
                  </p>
                  <ul className="text-xs text-violet-600 mt-2 space-y-1 list-disc list-inside">
                    <li>Konzept & Genre des Buches</li>
                    <li>Welt-Regeln & Orts-Beschreibungen</li>
                    <li>Charakter-Profile (Ziele, Flaws, Geheimnisse)</li>
                    <li>Plot-Struktur & emotionalen Beat</li>
                    <li>Nahtlose Anbindung an vorherige Szene</li>
                  </ul>
                </div>

                <Button
                  onClick={generateScene}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Generiere Szene...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Szene mit KI schreiben
                    </>
                  )}
                </Button>

                {sceneContent && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Oder:</p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('review')}
                      className="w-full"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Manuell schreiben
                    </Button>
                  </div>
                )}
              </div>

              {/* Right: Preview */}
              <div className="w-1/2 p-4 overflow-hidden">
                <ScrollArea className="h-full">
                  {sceneContent ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap">{sceneContent}</div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Generiere einen Vorschlag oder schreibe selbst</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* Step 3: Review */}
          <TabsContent value="review" className="flex-1 m-0 overflow-hidden">
            <div className="h-full flex">
              {/* Left: Editor */}
              <div className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full">
                  <Textarea
                    value={sceneContent}
                    onChange={(e) => setSceneContent(e.target.value)}
                    className="min-h-[500px] resize-none font-serif text-lg leading-relaxed border-0 focus-visible:ring-0 p-0"
                    placeholder="Schreibe oder editiere die Szene hier..."
                  />
                </ScrollArea>
              </div>

              {/* Right: Iteration Panel */}
              <div className="w-80 border-l bg-slate-50 p-4 space-y-4 overflow-y-auto">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Regie-Korrektur
                </h4>

                <div className="space-y-2">
                  {[
                    { label: 'Spannender machen', icon: Sparkles, instruction: 'Erhöhe die Spannung. Füge subtile Hinweise auf drohende Gefahr oder Konflikte hinzu.' },
                    { label: 'Dialog verbessern', icon: MessageSquare, instruction: 'Mache den Dialog scharfzüngiger und charakteristischer für die jeweiligen Personen.' },
                    { label: 'Atmosphäre dicker', icon: MapPin, instruction: 'Verdichte die atmosphärische Beschreibung. Nutze alle Sinne (Geruch, Geräusche, Temperatur).' },
                    { label: 'Gefühle zeigen', icon: Users, instruction: 'Zeige die Gefühle der Charaktere durch Körpersprache und Handlungen, nicht nur durch Erzählen.' },
                  ].map((btn) => (
                    <Button
                      key={btn.label}
                      variant="outline"
                      size="sm"
                      onClick={() => iterateScene(btn.instruction)}
                      disabled={isGenerating}
                      className="w-full justify-start text-left"
                    >
                      <btn.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      {btn.label}
                    </Button>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Eigene Anweisung</h4>
                  <Textarea
                    placeholder="z.B. 'Mach den Dialog zynischer' oder 'Beschreibe den Raum genauer'"
                    rows={3}
                    id="custom-instruction"
                    className="mb-2"
                  />
                  <Button 
                    onClick={() => {
                      const instr = (document.getElementById('custom-instruction') as HTMLTextAreaElement)?.value;
                      if (instr) iterateScene(instr);
                    }}
                    disabled={isGenerating}
                    className="w-full"
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Anwenden
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <Button 
                    onClick={approveScene}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Szene freigeben
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
