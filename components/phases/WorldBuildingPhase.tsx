'use client';

import { useState, useEffect } from 'react';
import { useAppStore, WorldSettings, Location } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIFeedbackButton } from '@/components/shared/AIFeedbackButton';
import { TextEnhancer } from '@/components/shared/TextEnhancer';
import { ImageGenerator } from '@/components/shared/ImageGenerator';
import { WebResearchButton } from '@/components/shared/WebResearchButton';
import { ResearchNotesBoard, ResearchNote, QuickResearchNote } from '@/components/research/ResearchNotesBoard';
import { 
  Globe, MapPin, Plus, Trash2, CheckCircle2, Sparkles, 
  StickyNote, BookOpen, Search
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

  useEffect(() => {
    if (worldSettings) {
      setLocalSettings(worldSettings);
      setLocations(worldSettings.locations || []);
      // Load research notes from localStorage for now
      const saved = localStorage.getItem(`research-notes-${worldSettings.id}`);
      if (saved) {
        try {
          setResearchNotes(JSON.parse(saved));
        } catch {}
      }
    }
  }, [worldSettings]);

  // Save research notes when they change
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
                Schaffe die Welt deiner Geschichte und sammle Recherche-Notizen
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
            <TabsContent value="basics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Welt-Grundlagen</CardTitle>
                  <CardDescription>
                    Definiere die grundlegenden Parameter deiner Welt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Zeitraum</label>
                      <div className="flex gap-2">
                        <Input
                          value={localSettings.timePeriod || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, timePeriod: e.target.value })}
                          placeholder="z.B. Mittelalter, 1984, Jahr 3045"
                          className="flex-1"
                        />
                        <WebResearchButton
                          topic={localSettings.timePeriod || ''}
                          researchType="history"
                          onResearch={(result) => handleResearchResult(result, `Recherche: ${localSettings.timePeriod}`, 'history')}
                          size="sm"
                          variant="outline"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Welttyp</label>
                      <Input
                        value={localSettings.worldType || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, worldType: e.target.value })}
                        placeholder="z.B. Fantasy, Sci-Fi, Realität"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Hauptsetting / Ort</label>
                    <div className="flex gap-2">
                      <Input
                        value={localSettings.location || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, location: e.target.value })}
                        placeholder="z.B. Ein kleines Dorf in den Alpen"
                        className="flex-1"
                      />
                      <WebResearchButton
                        topic={localSettings.location || ''}
                        researchType="location"
                        onResearch={(result) => handleResearchResult(result, `Ort: ${localSettings.location}`, 'location')}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Geographie & Landschaft</label>
                      <WebResearchButton
                        topic={`${localSettings.location || ''} ${localSettings.worldType || ''} geography`.trim()}
                        researchType="geography"
                        onResearch={(result) => handleResearchResult(result, 'Geographie', 'location')}
                        size="sm"
                      />
                    </div>
                    <TextEnhancer
                      label=""
                      value={localSettings.geography || ''}
                      onChange={(value) => setLocalSettings({ ...localSettings, geography: value })}
                      placeholder="Berge, Wälder, Meere, Klima, besondere geographische Merkmale..."
                      rows={5}
                      context="Beschreibe die Geographie und Landschaft der Welt."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Society Tab */}
            <TabsContent value="society" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gesellschaft & Kultur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Politik & Machtstrukturen</label>
                      <WebResearchButton
                        topic={`${localSettings.timePeriod || ''} political system government`.trim()}
                        researchType="politics"
                        onResearch={(result) => handleResearchResult(result, 'Politik & Macht', 'politics')}
                        size="sm"
                      />
                    </div>
                    <TextEnhancer
                      value={localSettings.politics || ''}
                      onChange={(value) => setLocalSettings({ ...localSettings, politics: value })}
                      placeholder="Regierung, Herrscher, Rechtsystem..."
                      rows={4}
                      context="Politische Strukturen und Machtverhältnisse."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Kultur & Bräuche</label>
                      <WebResearchButton
                        topic={`${localSettings.timePeriod || ''} ${localSettings.location || ''} culture traditions customs`.trim()}
                        researchType="culture"
                        onResearch={(result) => handleResearchResult(result, 'Kultur & Bräuche', 'culture')}
                        size="sm"
                      />
                    </div>
                    <TextEnhancer
                      value={localSettings.culture || ''}
                      onChange={(value) => setLocalSettings({ ...localSettings, culture: value })}
                      placeholder="Religionen, Feste, Kleidung, Essen..."
                      rows={4}
                      context="Kultur, Bräuche und Traditionen."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Historischer Hintergrund</label>
                      <WebResearchButton
                        topic={`${localSettings.timePeriod || ''} history historical events`.trim()}
                        researchType="history"
                        onResearch={(result) => handleResearchResult(result, 'Historischer Hintergrund', 'history')}
                        size="sm"
                      />
                    </div>
                    <TextEnhancer
                      value={localSettings.history || ''}
                      onChange={(value) => setLocalSettings({ ...localSettings, history: value })}
                      placeholder="Wichtige historische Ereignisse..."
                      rows={4}
                      context="Geschichte der Welt."
                    />
                  </div>
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
                              placeholder="Atmosphäre..."
                              className="w-40"
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Welt-Regeln</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Technologie & Magiesystem</label>
                      <WebResearchButton
                        topic={`${localSettings.worldType || 'fantasy'} magic system rules`.trim()}
                        researchType="technology"
                        onResearch={(result) => handleResearchResult(result, 'Tech/Magie-System', 'technology')}
                        size="sm"
                      />
                    </div>
                    <TextEnhancer
                      value={localSettings.technology || ''}
                      onChange={(value) => setLocalSettings({ ...localSettings, technology: value })}
                      placeholder="Technologie-Level, Magiesystem..."
                      rows={5}
                      context="Magiesystem oder Technologie."
                    />
                  </div>

                  <TextEnhancer
                    label="Welt-Regeln & Einschränkungen"
                    value={localSettings.rules || ''}
                    onChange={(value) => setLocalSettings({ ...localSettings, rules: value })}
                    placeholder="Was ist möglich und was nicht?"
                    rows={5}
                    context="Physikalische oder magische Regeln."
                  />
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
                    Sammle hier alle deine Recherche-Ergebnisse wie ein echter Autor - mit Kategorien und Tags sortiert
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
