'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
// Collapsible wird durch einfachen State ersetzt
import { Slider } from '@/components/ui/slider';
import { 
  Send, Bot, User, Sparkles, CheckCircle2, 
  RotateCcw, ChevronRight, ChevronDown, BookOpen, Users, MapPin,
  Target, MessageSquare, Wand2, Save, Edit3, Settings2,
  Lightbulb, Flame, Wind, Droplets, Mountain, Gauge,
  ArrowRight, Plus, Minus, Palette
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
  // Context adjustments after first write
  contextAdjustments?: ContextAdjustments;
}

interface ContextAdjustments {
  tensionLevel: number;      // 0-100
  pacingSpeed: number;       // 0-100  
  dialogueAmount: number;    // 0-100
  descriptionDensity: number;// 0-100
  emotionalIntensity: number;// 0-100
  focusOn: 'action' | 'dialogue' | 'description' | 'internal';
  additionalNotes: string;
}

interface ScenePingPongProps {
  chapter: Chapter;
  bookId: string;
}

const defaultAdjustments: ContextAdjustments = {
  tensionLevel: 50,
  pacingSpeed: 50,
  dialogueAmount: 50,
  descriptionDensity: 50,
  emotionalIntensity: 50,
  focusOn: 'dialogue',
  additionalNotes: '',
};

export function ScenePingPongV2({ chapter, bookId }: ScenePingPongProps) {
  const { characters, currentBook, worldSettings, concept, plotPoints } = useAppStore();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [briefing, setBriefing] = useState('');
  const [mood, setMood] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneContent, setSceneContent] = useState('');
  const [activeStep, setActiveStep] = useState<'briefing' | 'generating' | 'review' | 'refine'>('briefing');
  const [adjustments, setAdjustments] = useState<ContextAdjustments>(defaultAdjustments);
  const [showContextPanel, setShowContextPanel] = useState(false);

  // Load existing scenes
  useEffect(() => {
    const savedScenes = localStorage.getItem(`scenes-v2-${chapter.id}`);
    if (savedScenes) {
      setScenes(JSON.parse(savedScenes));
    }
  }, [chapter.id]);

  const saveScenes = (newScenes: Scene[]) => {
    setScenes(newScenes);
    localStorage.setItem(`scenes-v2-${chapter.id}`, JSON.stringify(newScenes));
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
      contextAdjustments: adjustments,
    };
    
    const updated = [...scenes, newScene];
    saveScenes(updated);
    setCurrentScene(newScene);
    setSceneContent('');
    setActiveStep('generating');
  };

  const buildContextPrompt = (isRefinement: boolean = false) => {
    const sceneCharacters = characters.filter(c => selectedCharacters.includes(c.id));
    const locationDetails = worldSettings?.locations?.find(
      (l: any) => l.name?.toLowerCase() === selectedLocation?.toLowerCase()
    );
    const currentPlotPoint = plotPoints?.find((p: any, idx: number) => idx === scenes.length);
    
    const context: any = {
      system: `Du bist ein professioneller Romanautor. 
Genre: ${currentBook?.genre || 'Literarisch'}
Stil: Bildhaft, präzise, atmosphärisch`,
      
      concept: concept ? {
        genre: currentBook?.genre,
        premise: concept.premise,
        tone: concept.tone,
        themes: concept.themes,
        targetAudience: concept.targetAudience,
      } : null,
      
      world: worldSettings ? {
        timePeriod: worldSettings.timePeriod,
        location: worldSettings.location,
        worldType: worldSettings.worldType,
        culture: worldSettings.culture,
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
        appearance: c.appearance,
        personality: c.personality,
        goals: c.storyGoal || c.goals,
        motivations: c.motivations,
        unconsciousNeed: c.unconsciousNeed,
        flaws: c.flaws,
        secret: c.secret,
        affiliation: c.affiliation,
      })),
      
      plot: {
        currentPoint: currentPlotPoint ? {
          title: currentPlotPoint.title,
          act: currentPlotPoint.act,
        } : null,
        previousScenes: scenes.slice(-1).map(s => ({
          summary: s.content?.slice(0, 300),
        })),
      },
      
      scene: {
        location: selectedLocation,
        mood: mood,
        briefing: briefing,
      },
      
      anchor: scenes.length > 0 && scenes[scenes.length - 1].content 
        ? scenes[scenes.length - 1].content.slice(-600)
        : null,
    };

    // Add context adjustments for refinement
    if (isRefinement && adjustments) {
      context.writingStyle = {
        tensionLevel: adjustments.tensionLevel > 50 ? 'hoch' : adjustments.tensionLevel < 50 ? 'niedrig' : 'mittel',
        pacing: adjustments.pacingSpeed > 60 ? 'schnell' : adjustments.pacingSpeed < 40 ? 'langsam' : 'ausgewogen',
        dialogueAmount: adjustments.dialogueAmount > 60 ? 'dialoglastig' : 'beschreibend',
        descriptionDensity: adjustments.descriptionDensity > 60 ? 'detailliert' : 'sparsam',
        emotionalIntensity: adjustments.emotionalIntensity > 60 ? 'emotional intensiv' : 'zurückhaltend',
        focus: adjustments.focusOn,
        additionalNotes: adjustments.additionalNotes,
      };
    }

    return context;
  };

  const generateScene = async (isRefinement: boolean = false) => {
    if (!briefing.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const context = buildContextPrompt(isRefinement);
      
      let promptText = `${context.system}

KONZEPT: ${JSON.stringify(context.concept, null, 2)}
WELT: ${JSON.stringify(context.world, null, 2)}
CHARAKTERE: ${JSON.stringify(context.characters, null, 2)}
PLOT: ${JSON.stringify(context.plot, null, 2)}

VORHERIGER TEXT: ${context.anchor || '[Anfang]'}

SZENE: ${context.scene.location} | ${context.scene.mood}
BRIEFING: ${context.scene.briefing}
`;

      if (isRefinement && context.writingStyle) {
        promptText += `
SCHREIBSTIL-ANPASSUNG:
- Spannung: ${context.writingStyle.tensionLevel}
- Tempo: ${context.writingStyle.pacing}
- Dialog-Anteil: ${context.writingStyle.dialogueAmount}
- Beschreibungs-Dichte: ${context.writingStyle.descriptionDensity}
- Emotionaler Fokus: ${context.writingStyle.emotionalIntensity}
- Hauptfokus: ${context.writingStyle.focus}
${context.writingStyle.additionalNotes ? `- Zusätzliche Notizen: ${context.writingStyle.additionalNotes}` : ''}

Überarbeite die Szene entsprechend dieser Stil-Vorgaben. Behalte die Handlung bei, aber passe Ton und Ausführung an.`;
      } else {
        promptText += `
Schreibe die Szene (ca. 300-500 Wörter). Nutze alle Kontext-Informationen aus Konzept, Welt und Charakteren.`;
      }
      
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          type: isRefinement ? 'scene_refine' : 'scene_write',
          context,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSceneContent(data.result);
        
        if (currentScene) {
          const updated = scenes.map(s => 
            s.id === currentScene.id 
              ? { ...s, content: data.result, wordCount: data.result.split(/\s+/).length, contextAdjustments: adjustments }
              : s
          );
          saveScenes(updated);
          setCurrentScene({ ...currentScene, content: data.result, wordCount: data.result.split(/\s+/).length, contextAdjustments: adjustments });
        }
        
        setActiveStep('review');
      }
    } catch (error) {
      console.error('Generation failed:', error);
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
    
    // Reset for next scene
    setCurrentScene(null);
    setBriefing('');
    setSceneContent('');
    setAdjustments(defaultAdjustments);
    setActiveStep('briefing');
  };

  // RENDER STEPS
  const renderBriefingStep = () => (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Neue Szene planen</h2>
        <p className="text-slate-500">Definiere das Briefing für die KI</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-500" />
            Was passiert in dieser Szene?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            placeholder="Beschreibe die Szene... (z.B. 'Maria trifft den geheimnisvollen Fremden im Nebel. Er weiß mehr über ihr Amulett, als er zugibt.')"
            rows={4}
            className="text-lg"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Stimmung</label>
              <Input
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="z.B. düster, geheimnisvoll"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ort</label>
              <Input
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="z.B. Der alte Marktplatz"
                list="locations"
              />
              <datalist id="locations">
                {worldSettings?.locations?.map((loc: any) => (
                  <option key={loc.id} value={loc.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Welche Charaktere sind dabei?</label>
            <div className="flex flex-wrap gap-2">
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
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCharacters.includes(char.id)
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {char.name}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={createScene}
            disabled={!briefing.trim()}
            className="w-full bg-violet-600 h-12 text-lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Szene erstellen & KI starten
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="h-full flex">
      {/* Left: Context & Controls */}
      <div className="w-1/3 border-r bg-slate-50 p-6 space-y-6 overflow-y-auto">
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Kontext
          </h3>
          <div className="space-y-3 text-sm">
            <div className="bg-white p-3 rounded-lg border">
              <span className="text-slate-500">Genre:</span>
              <p className="font-medium">{currentBook?.genre || 'Nicht definiert'}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <span className="text-slate-500">Welt:</span>
              <p className="font-medium">{worldSettings?.worldType || 'Nicht definiert'}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <span className="text-slate-500">Charaktere:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedCharacters.map(id => {
                  const char = characters.find(c => c.id === id);
                  return char ? (
                    <Badge key={id} variant="secondary">{char.name}</Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <Button
            onClick={() => generateScene(false)}
            disabled={isGenerating}
            className="w-full h-12 text-lg"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                Schreibe...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Szene mit KI schreiben
              </>
            )}
          </Button>
          
          <p className="text-xs text-slate-500 mt-3 text-center">
            Die KI nutzt alle Informationen aus Konzept, Worldbuilding, Charakteren und Plot
          </p>
        </div>
      </div>

      {/* Right: Empty State */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-slate-400">
          <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Klicke auf "Szene mit KI schreiben"</p>
          <p className="text-sm mt-2">oder warte auf die Generierung</p>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="h-full flex">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        <div className="border-b px-6 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">{currentScene?.title}</h3>
            <Badge variant="outline">{sceneContent.split(/\s+/).length} Wörter</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveStep('briefing')}>
              Zurück
            </Button>
            <Button 
              size="sm" 
              onClick={approveScene}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Szene freigeben
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          <Textarea
            value={sceneContent}
            onChange={(e) => setSceneContent(e.target.value)}
            className="min-h-[600px] resize-none font-serif text-lg leading-relaxed border-0 focus-visible:ring-0"
            placeholder="Der Text erscheint hier..."
          />
        </ScrollArea>
      </div>

      {/* Right: Context Control Panel */}
      <div className="w-80 border-l bg-slate-50 flex flex-col">
        <button
          onClick={() => setShowContextPanel(!showContextPanel)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-violet-500" />
            <div className="text-left">
              <p className="font-medium">Stil anpassen</p>
              <p className="text-xs text-slate-500">Richtung ändern (optional)</p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${showContextPanel ? 'rotate-180' : ''}`} />
        </button>
        
        {showContextPanel && (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Schreibe neu mit anderem Fokus</CardTitle>
                  <CardDescription className="text-xs">
                    Passe den Stil an, ohne das Briefing zu ändern
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Tension */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Spannung</span>
                        <span className="text-slate-500">{adjustments.tensionLevel}%</span>
                      </div>
                      <Slider
                        value={[adjustments.tensionLevel]}
                        onValueChange={([v]) => setAdjustments(a => ({ ...a, tensionLevel: v }))}
                        min={0}
                        max={100}
                        step={10}
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Entspannt</span>
                        <span>Gespannt</span>
                      </div>
                    </div>

                    {/* Pacing */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tempo</span>
                        <span className="text-slate-500">{adjustments.pacingSpeed}%</span>
                      </div>
                      <Slider
                        value={[adjustments.pacingSpeed]}
                        onValueChange={([v]) => setAdjustments(a => ({ ...a, pacingSpeed: v }))}
                        min={0}
                        max={100}
                        step={10}
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Langsam</span>
                        <span>Schnell</span>
                      </div>
                    </div>

                    {/* Dialogue */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Dialog-Anteil</span>
                        <span className="text-slate-500">{adjustments.dialogueAmount}%</span>
                      </div>
                      <Slider
                        value={[adjustments.dialogueAmount]}
                        onValueChange={([v]) => setAdjustments(a => ({ ...a, dialogueAmount: v }))}
                        min={0}
                        max={100}
                        step={10}
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Beschreibung</span>
                        <span>Dialog</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Beschreibungs-Dichte</span>
                        <span className="text-slate-500">{adjustments.descriptionDensity}%</span>
                      </div>
                      <Slider
                        value={[adjustments.descriptionDensity]}
                        onValueChange={([v]) => setAdjustments(a => ({ ...a, descriptionDensity: v }))}
                        min={0}
                        max={100}
                        step={10}
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Sparsam</span>
                        <span>Detailliert</span>
                      </div>
                    </div>

                    {/* Focus */}
                    <div className="space-y-2">
                      <span className="text-sm">Hauptfokus</span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'action', label: 'Action', icon: Flame },
                          { key: 'dialogue', label: 'Dialog', icon: MessageSquare },
                          { key: 'description', label: 'Beschreibung', icon: Palette },
                          { key: 'internal', label: 'Gedanken', icon: Lightbulb },
                        ].map(({ key, label, icon: Icon }) => (
                          <button
                            key={key}
                            onClick={() => setAdjustments(a => ({ ...a, focusOn: key as any }))}
                            className={`p-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                              adjustments.focusOn === key
                                ? 'bg-violet-100 text-violet-700 border-violet-300'
                                : 'bg-white border hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <span className="text-sm">Zusätzliche Anweisungen</span>
                      <Textarea
                        value={adjustments.additionalNotes}
                        onChange={(e) => setAdjustments(a => ({ ...a, additionalNotes: e.target.value }))}
                        placeholder="z.B. 'Füge mehr Hinweise auf das Geheimnis ein'"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={() => generateScene(true)}
                      disabled={isGenerating}
                      className="w-full"
                      variant="outline"
                    >
                      {isGenerating ? (
                        <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Mit neuem Stil schreiben
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Fixes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Schnell-Fixes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: 'Spannender', action: 'Erhöhe die Spannung dramatisch' },
                      { label: 'Länger', action: 'Erweitere die Szene um 50% mehr Details' },
                      { label: 'Kürzer', action: 'Kürze die Szene auf das Wesentliche' },
                      { label: 'Mehr Dialog', action: 'Wandle Beschreibungen in Dialog um' },
                    ].map(({ label, action }) => (
                      <Button
                        key={label}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setAdjustments(a => ({ ...a, additionalNotes: action }));
                          generateScene(true);
                        }}
                        disabled={isGenerating}
                      >
                        {label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}

        {/* Alternative: Manual Edit */}
        <div className="p-4 border-t mt-auto">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setActiveStep('refine')}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Manuell bearbeiten
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Scene Navigator */}
      <div className="border-b bg-white p-3 flex items-center gap-4 flex-shrink-0">
        <h3 className="font-semibold text-sm">Szenen</h3>
        <div className="flex gap-1">
          {scenes.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => {
                setCurrentScene(scene);
                setSceneContent(scene.content);
                setBriefing(scene.briefing);
                setSelectedCharacters(scene.characters);
                setActiveStep(scene.content ? 'review' : 'briefing');
              }}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                currentScene?.id === scene.id
                  ? 'bg-violet-600 text-white'
                  : scene.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setCurrentScene(null);
            setActiveStep('briefing');
          }}
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          Neu
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeStep === 'briefing' && renderBriefingStep()}
        {activeStep === 'generating' && renderGeneratingStep()}
        {activeStep === 'review' && renderReviewStep()}
      </div>
    </div>
  );
}
