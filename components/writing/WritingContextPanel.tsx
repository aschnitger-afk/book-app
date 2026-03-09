'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  BookOpen, 
  Users, 
  MapPin, 
  Target, 
  Lightbulb,
  Sparkles,
  Globe,
  Scale,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WritingContextPanelProps {
  book: any;
  onClose: () => void;
}

export function WritingContextPanel({ book, onClose }: WritingContextPanelProps) {
  const [activeTab, setActiveTab] = useState('concept');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-600" />
              Story-Kontext für "{book.title}"
            </h2>
            <p className="text-sm text-slate-500">
              Diese Informationen fließen in die KI-Unterstützung ein
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4 justify-start">
            <TabsTrigger value="concept" className="gap-1">
              <Lightbulb className="h-4 w-4" />
              Konzept
            </TabsTrigger>
            <TabsTrigger value="world" className="gap-1">
              <Globe className="h-4 w-4" />
              Welt
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-1">
              <Users className="h-4 w-4" />
              Charaktere ({book.characters?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="plot" className="gap-1">
              <Target className="h-4 w-4" />
              Plot
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            {/* Concept Tab */}
            <TabsContent value="concept" className="m-0 mt-4 space-y-4">
              {book.concept ? (
                <>
                  {book.concept.premise && (
                    <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                      <h3 className="font-medium text-violet-900 mb-1 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Prämisse
                      </h3>
                      <p className="text-sm text-violet-800">{book.concept.premise}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {book.concept.logline && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <h3 className="text-xs font-medium text-slate-500 mb-1">Logline</h3>
                        <p className="text-sm">{book.concept.logline}</p>
                      </div>
                    )}
                    {book.concept.themes && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <h3 className="text-xs font-medium text-slate-500 mb-1">Themen</h3>
                        <p className="text-sm">{book.concept.themes}</p>
                      </div>
                    )}
                    {book.concept.tone && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <h3 className="text-xs font-medium text-slate-500 mb-1">Ton</h3>
                        <p className="text-sm">{book.concept.tone}</p>
                      </div>
                    )}
                    {book.concept.targetAudience && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <h3 className="text-xs font-medium text-slate-500 mb-1">Zielgruppe</h3>
                        <p className="text-sm">{book.concept.targetAudience}</p>
                      </div>
                    )}
                  </div>

                  {book.concept.centralConflict && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h3 className="font-medium text-amber-900 mb-1">Zentraler Konflikt</h3>
                      <p className="text-sm text-amber-800">{book.concept.centralConflict}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-slate-400 py-8">Noch kein Konzept definiert</p>
              )}
            </TabsContent>

            {/* World Tab */}
            <TabsContent value="world" className="m-0 mt-4 space-y-4">
              {book.worldSettings ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {book.worldSettings.timePeriod && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h3 className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Zeitraum
                        </h3>
                        <p className="text-sm">{book.worldSettings.timePeriod}</p>
                      </div>
                    )}
                    {book.worldSettings.location && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h3 className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Ort
                        </h3>
                        <p className="text-sm">{book.worldSettings.location}</p>
                      </div>
                    )}
                    {book.worldSettings.worldType && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h3 className="text-xs font-medium text-purple-600 mb-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Welttyp
                        </h3>
                        <p className="text-sm">{book.worldSettings.worldType}</p>
                      </div>
                    )}
                  </div>

                  {book.worldSettings.rules && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Welt-Regeln
                      </h3>
                      <p className="text-sm text-slate-600">{book.worldSettings.rules}</p>
                    </div>
                  )}

                  {book.worldSettings.technology && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Technologie / Magiesystem
                      </h3>
                      <p className="text-sm text-slate-600">{book.worldSettings.technology}</p>
                    </div>
                  )}

                  {book.worldSettings.locations?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Wichtige Orte
                      </h3>
                      <div className="grid gap-2">
                        {book.worldSettings.locations.map((loc: any) => (
                          <div key={loc.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{loc.name}</p>
                            {loc.description && (
                              <p className="text-sm text-slate-500 mt-1">{loc.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-slate-400 py-8">Noch keine Welt definiert</p>
              )}
            </TabsContent>

            {/* Characters Tab */}
            <TabsContent value="characters" className="m-0 mt-4">
              {book.characters?.length > 0 ? (
                <div className="grid gap-3">
                  {book.characters.map((char: any) => (
                    <div key={char.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {char.name}
                            {char.role && (
                              <Badge variant="secondary" className="text-xs">
                                {char.role}
                              </Badge>
                            )}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        {char.storyGoal && (
                          <div>
                            <span className="text-slate-500">Ziel:</span>
                            <p>{char.storyGoal}</p>
                          </div>
                        )}
                        {char.motivations && (
                          <div>
                            <span className="text-slate-500">Motivation:</span>
                            <p>{char.motivations}</p>
                          </div>
                        )}
                        {char.flaws && (
                          <div>
                            <span className="text-slate-500">Schwächen:</span>
                            <p>{char.flaws}</p>
                          </div>
                        )}
                        {char.secret && (
                          <div>
                            <span className="text-slate-500">Geheimnis:</span>
                            <p className="italic">{char.secret}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">Noch keine Charaktere definiert</p>
              )}
            </TabsContent>

            {/* Plot Tab */}
            <TabsContent value="plot" className="m-0 mt-4">
              {book.plotPoints?.length > 0 ? (
                <div className="space-y-3">
                  {['act1', 'act2a', 'act2b', 'act3'].map((act) => {
                    const actPoints = book.plotPoints.filter((pp: any) => pp.act === act);
                    if (actPoints.length === 0) return null;
                    
                    const actLabels: Record<string, string> = {
                      act1: 'Akt 1 - Setup',
                      act2a: 'Akt 2a - Konfrontation',
                      act2b: 'Akt 2b - Krise',
                      act3: 'Akt 3 - Resolution',
                    };
                    
                    return (
                      <div key={act}>
                        <h3 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                          {actLabels[act]}
                        </h3>
                        <div className="space-y-2">
                          {actPoints.map((pp: any) => (
                            <div key={pp.id} className="p-3 bg-slate-50 rounded-lg flex items-start gap-3">
                              <span className="text-xs font-mono text-slate-400 mt-0.5">
                                {pp.order}
                              </span>
                              <div>
                                <p className="font-medium text-sm">{pp.title}</p>
                                {pp.description && (
                                  <p className="text-xs text-slate-500 mt-1">{pp.description}</p>
                                )}
                                {pp.emotionalBeat && (
                                  <Badge variant="outline" className="text-xs mt-2">
                                    {pp.emotionalBeat}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">Noch keine Plot-Punkte definiert</p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 text-xs text-slate-500">
          <p>
            Diese Informationen werden automatisch in die KI-Prompts eingebettet, 
            damit der Schreibtutor konsistent mit deiner Story-Welt bleibt.
          </p>
        </div>
      </div>
    </div>
  );
}
