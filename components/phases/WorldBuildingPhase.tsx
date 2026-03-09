'use client';

import { useState, useEffect } from 'react';
import { useAppStore, WorldSettings, Location } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIFeedbackButton } from '@/components/shared/AIFeedbackButton';
import { TextEnhancer } from '@/components/shared/TextEnhancer';
import { ImageGenerator } from '@/components/shared/ImageGenerator';
import { WebResearchButton } from '@/components/shared/WebResearchButton';
import { ResearchNotesBoard, ResearchNote, QuickResearchNote } from '@/components/research/ResearchNotesBoard';
import { WorldBuildingField, WORLD_BUILDING_FIELDS } from '@/components/world/WorldBuildingField';
import { 
  Globe, MapPin, Plus, Trash2, CheckCircle2, Sparkles, 
  StickyNote, BookOpen, Search, Lightbulb, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorldBuildingPhase() {
  const { currentBook, setCurrentBook, worldSettings, setWorldSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState<Partial<WorldSettings>>({});
  const [locations, setLocations] = useState<Location[]>([]);
  const [researchNotes, setResearchNotes] = useState<ResearchNote[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [pendingResearch, setPendingResearch] = useState<{title: string, content: string, category: ResearchNote['category']} | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    if (worldSettings) {
      setLocalSettings(worldSettings);
      setLocations(worldSettings.locations || []);
      const saved = localStorage.getItem(`research-notes-${worldSettings.id}`);
      if (saved) {
        try {
          setResearchNotes(JSON.parse(saved));
        } catch {}
      }
    }
  }, [worldSettings]);

  useEffect(() => {
    if (worldSettings?.id && researchNotes.length > 0) {
      localStorage.setItem(`research-notes-${worldSettings.id}`, JSON.stringify(researchNotes));
    }
  }, [researchNotes, worldSettings?.id]);

  const handleSave = async () => {
    if (!currentBook) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/worldbuilding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: currentBook.id,
          ...localSettings,
        }),
      });

      const data = await response.json();
      setWorldSettings({ ...data, locations });
      alert('World Building gespeichert!');
    } catch (error) {
      console.error('Failed to save world settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim() || !worldSettings) return;
    
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldSettingsId: worldSettings.id,
          name: newLocationName,
        }),
      });

      const location = await response.json();
      setLocations([...locations, location]);
      setNewLocationName('');
    } catch (error) {
      console.error('Failed to add location:', error);
    }
  };

  const handleUpdateLocation = async (location: Location) => {
    try {
      await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      });

      setLocations(locations.map(l => l.id === location.id ? location : l));
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await fetch(`/api/locations?id=${id}`, { method: 'DELETE' });
      setLocations(locations.filter(l => l.id !== id));
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  const handleCompletePhase = async () => {
    if (!currentBook) return;
    
    try {
      await fetch(`/api/books/${currentBook.id}/phase`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'worldbuilding',
          completed: true,
        }),
      });
      
      setCurrentBook({ ...currentBook, worldbuildingCompleted: true });
      alert('Phase abgeschlossen!');
    } catch (error) {
      console.error('Failed to complete phase:', error);
    }
  };

  const handleResearchResult = (result: string, title: string, category: ResearchNote['category']) => {
    setPendingResearch({ title, content: result, category });
  };

  const handleSaveNote = (note: Omit<ResearchNote, 'id' | 'createdAt'>) => {
    const newNote: ResearchNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setResearchNotes([newNote, ...researchNotes]);
    setPendingResearch(null);
  };

  const getWorldSummary = () => {
    return `ZEIT: ${localSettings.timePeriod}
ORT: ${localSettings.location}
WELTTYP: ${localSettings.worldType}

GEOGRAPHIE:
${localSettings.geography}

KULTUR:
${localSettings.culture}

POLITIK:
${localSettings.politics}

TECHNOLOGIE/MAGIE:
${localSettings.technology}

HISTORIE:
${localSettings.history}

REGELN:
${localSettings.rules}

ORTE: ${locations.map(l => l.name).join(', ')}`.trim();
  };

  const isComplete = localSettings.worldType && locations.length > 0;

  const getFieldsByCategory = (category: 'basics' | 'society' | 'rules') => {
    return WORLD_BUILDING_FIELDS.filter(f => f.category === category);
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Globe className="h-6 w-6 text-emerald-500" />
                World Building
              </h1>
              <p className="text-slate-500 mt-1">
                Schaffe die Welt deiner Geschichte. Diese Informationen fließen automatisch in den Schreibprozess ein.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AIFeedbackButton
                content={getWorldSummary()}
                type="analyze"
                label={aiFeedback ? "Analyse aktualisieren" : "Welt analysieren"}
                onFeedback={setAiFeedback}
              />
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-slate-900 hover:bg-slate-800"
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </div>

          {/* Guide Card */}
          {showGuide && (
            <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Info className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-violet-900">Wie World Building deine Story beeinflusst</h3>
                    <p className="text-sm text-violet-700 mt-1">
                      Die Informationen, die du hier einträgst, werden automatisch dem KI-Schreibtutor zur Verfügung gestellt. 
                      Sie beeinflussen:
                    </p>
                    <ul className="text-sm text-violet-700 mt-2 space-y-1">
                      <li>• <strong>Dialoge:</strong> Charaktere sprechen passend zu ihrer Kultur und Zeit</li>
                      <li>• <strong>Beschreibungen:</strong> Das Setting wird konsistent dargestellt</li>
                      <li>• <strong>Konflikte:</strong> Politik und Gesellschaft erzeugen natürliche Spannungen</li>
                      <li>• <strong>Lösungen:</strong> Charaktere nutzen verfügbare Technologie/Magie realistisch</li>
                    </ul>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)}>
                    Ausblenden
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Vollständigkeit</span>
                    <span className="font-medium">
                      {locations.length} Orte • {researchNotes.length} Recherche-Notizen
                    </span>
                  </div>
                </div>
                {isComplete && (
                  <Button 
                    onClick={handleCompletePhase}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Phase abschließen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="basics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basics">Grundlagen</TabsTrigger>
              <TabsTrigger value="society">Gesellschaft</TabsTrigger>
              <TabsTrigger value="locations">Orte ({locations.length})</TabsTrigger>
              <TabsTrigger value="rules">Regeln</TabsTrigger>
              <TabsTrigger value="research" className="gap-1">
                <StickyNote className="h-4 w-4" />
                Spickzettel ({researchNotes.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Research Note Dialog */}
            {pendingResearch && (
              <Card className="border-2 border-violet-400 bg-violet-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Recherche-Ergebnis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuickResearchNote
                    title={pendingResearch.title}
                    content={pendingResearch.content}
                    category={pendingResearch.category}
                    onSave={handleSaveNote}
                  />
                </CardContent>
              </Card>
            )}

            {/* Basics Tab */}
            <TabsContent value="basics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welt-Grundlagen</CardTitle>
                  <CardDescription>
                    Diese Grundlagen bestimmen das "Wo" und "Wann" deiner Story
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {getFieldsByCategory('basics').map((field) => (
                    <WorldBuildingField
                      key={field.key}
                      field={field}
                      value={String(localSettings[field.key as keyof WorldSettings] || '')}
                      onChange={(value) => setLocalSettings({ ...localSettings, [field.key]: value })}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Society Tab */}
            <TabsContent value="society" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gesellschaft & Kultur</CardTitle>
                  <CardDescription>
                    Diese Elemente geben deinen Charakteren ihren Hintergrund und ihre Motivation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {getFieldsByCategory('society').map((field) => (
                    <WorldBuildingField
                      key={field.key}
                      field={field}
                      value={String(localSettings[field.key as keyof WorldSettings] || '')}
                      onChange={(value) => setLocalSettings({ ...localSettings, [field.key]: value })}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Wichtige Orte</span>
                    <div className="flex gap-2">
                      <Input
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                        placeholder="Neuer Ort..."
                        className="w-48"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                      />
                      <Button onClick={handleAddLocation} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Spezifische Orte, die in deiner Story eine Rolle spielen. 
                    Sie werden als Settings für Szenen verwendet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {locations.map((location) => (
                      <Card key={location.id} className="group">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-emerald-500" />
                              <h4 className="font-medium">{location.name}</h4>
                            </div>
                            <div className="flex gap-1">
                              <WebResearchButton
                                topic={location.name}
                                researchType="location"
                                onResearch={(result) => handleResearchResult(result, `Ort: ${location.name}`, 'location')}
                                size="sm"
                                variant="outline"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleDeleteLocation(location.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <TextEnhancer
                            value={location.description || ''}
                            onChange={(value) => handleUpdateLocation({ ...location, description: value })}
                            placeholder="Beschreibung des Ortes..."
                            rows={2}
                            context={`Beschreibe den Ort "${location.name}".`}
                          />

                          <div className="flex items-center gap-2">
                            <Input
                              value={location.atmosphere || ''}
                              onChange={(e) => handleUpdateLocation({ ...location, atmosphere: e.target.value })}
                              placeholder="Atmosphäre (z.B. düster, heiter, bedrohlich)..."
                              className="w-64"
                            />
                            <ImageGenerator
                              type="location"
                              entityId={location.id}
                              context={`Location: ${location.name}. ${location.description}`}
                              existingImage={location.imageUrl}
                              onImageGenerated={(url) => handleUpdateLocation({ ...location, imageUrl: url })}
                            />
                          </div>

                          {location.imageUrl && (
                            <img 
                              src={location.imageUrl} 
                              alt={location.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {locations.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Noch keine Orte erstellt</p>
                      <p className="text-sm mt-1">Füge Schauplätze hinzu, die in deiner Story vorkommen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welt-Regeln & Einschränkungen</CardTitle>
                  <CardDescription>
                    Die "Spielregeln" deiner Welt. Konsistenz hier ist entscheidend für glaubwürdige Stories.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {getFieldsByCategory('rules').map((field) => (
                    <WorldBuildingField
                      key={field.key}
                      field={field}
                      value={String(localSettings[field.key as keyof WorldSettings] || '')}
                      onChange={(value) => setLocalSettings({ ...localSettings, [field.key]: value })}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Research Notes Tab */}
            <TabsContent value="research" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5 text-amber-500" />
                    Recherche-Spickzettel
                  </CardTitle>
                  <CardDescription>
                    Sammle hier alle deine Recherche-Ergebnisse. Diese Notizen stehen dem KI-Schreibtutor 
                    als Referenz zur Verfügung, wenn du schreibst.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResearchNotesBoard 
                    notes={researchNotes}
                    onNotesChange={setResearchNotes}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI Feedback Sidebar */}
      <div className={cn(
        "border-l bg-slate-50 flex flex-col transition-all duration-300",
        aiFeedback ? "w-[450px] opacity-100" : "w-0 opacity-0 overflow-hidden"
      )}>
        {aiFeedback && (
          <>
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                KI-Feedback
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setAiFeedback('')}>
                ✕
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-slate-700">{aiFeedback}</div>
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}
