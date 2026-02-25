'use client';

import { useState, useEffect } from 'react';
import { useAppStore, Concept } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIFeedbackButton } from '@/components/shared/AIFeedbackButton';
import { TextEnhancer } from '@/components/shared/TextEnhancer';
import { 
  Lightbulb, Target, Users, Zap, MessageSquare, CheckCircle2, 
  HelpCircle, BookOpen, ArrowRight, Check
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ConceptPhase() {
  const { currentBook, setCurrentBook, concept, setConcept, setCurrentPhase } = useAppStore();
  const [localConcept, setLocalConcept] = useState<Partial<Concept>>({});
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (concept) {
      setLocalConcept(concept);
    }
  }, [concept]);

  const handleSave = async () => {
    if (!currentBook) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: currentBook.id,
          ...localConcept,
        }),
      });

      const data = await response.json();
      setConcept(data);
      alert('Konzept gespeichert!');
    } catch (error) {
      console.error('Failed to save concept:', error);
      alert('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompletePhase = async () => {
    if (!currentBook) return;
    
    try {
      await fetch(`/api/books/${currentBook.id}/phase`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'concept',
          completed: true,
        }),
      });
      
      setCurrentBook({ ...currentBook, conceptCompleted: true });
      alert('Phase abgeschlossen!');
    } catch (error) {
      console.error('Failed to complete phase:', error);
    }
  };

  const getConceptSummary = () => {
    return `TITEL: ${currentBook?.title || 'Nicht angegeben'}
GENRE: ${currentBook?.genre || 'Nicht angegeben'}

PRÄMISSE:
${localConcept.premise || 'Nicht angegeben'}

ELEVATOR PITCH:
${localConcept.elevatorPitch || 'Nicht angegeben'}

LOGLINE:
${localConcept.logline || 'Nicht angegeben'}

ZENTRALER KONFLIKT:
${localConcept.centralConflict || 'Nicht angegeben'}

UNIQUE HOOK:
${localConcept.uniqueHook || 'Nicht angegeben'}

THEMEN: ${localConcept.themes || 'Nicht angegeben'}
TONALITÄT: ${localConcept.tone || 'Nicht angegeben'}
ZIELGRUPPE: ${localConcept.targetAudience || 'Nicht angegeben'}`.trim();
  };

  const isComplete = localConcept.premise && localConcept.elevatorPitch && localConcept.centralConflict;

  return (
    <TooltipProvider>
      <div className="h-full flex">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-amber-500" />
                  Konzept-Phase
                </h1>
                <p className="text-slate-500 mt-1">
                  Die Grundidee deines Buches entwickeln
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AIFeedbackButton
                  content={getConceptSummary()}
                  type="analyze"
                  label={aiFeedback ? "Analyse aktualisieren" : "Konzept analysieren"}
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

            {/* Reference to Style Analysis */}
            <Card className="bg-violet-50 border-violet-200">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-violet-700 font-medium">Schreibstil bereits definiert?</p>
                    <p className="text-sm text-violet-600">
                      Falls du deinen Stil noch nicht festgelegt hast, gehe zurück zur Stilanalyse-Phase.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPhase('styleanalysis')}
                    className="border-violet-300 text-violet-700"
                  >
                    Zur Stilanalyse
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Vollständigkeit</span>
                      <span className="font-medium">
                        {[localConcept.premise, localConcept.elevatorPitch, localConcept.centralConflict].filter(Boolean).length}/3 Pflichtfelder
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ 
                          width: `${([localConcept.premise, localConcept.elevatorPitch, localConcept.centralConflict].filter(Boolean).length / 3) * 100}%` 
                        }}
                      />
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

            {/* Core Concept */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Kernkonzept
                </CardTitle>
                <CardDescription>
                  Die grundlegende Idee deiner Geschichte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextEnhancer
                  label="Prämisse (Was wäre wenn...) *"
                  value={localConcept.premise || ''}
                  onChange={(value) => setLocalConcept({ ...localConcept, premise: value })}
                  placeholder="Was wäre, wenn ein junger Zauberer erfährt, dass er der Auserwählte ist?"
                  rows={3}
                  context="Grundidee der Geschichte. Kurz und prägnant formulieren."
                />

                <TextEnhancer
                  label="Elevator Pitch *"
                  value={localConcept.elevatorPitch || ''}
                  onChange={(value) => setLocalConcept({ ...localConcept, elevatorPitch: value })}
                  placeholder="Ein Satz, der das Buch verkauft"
                  rows={2}
                  context="In einem Satz: Wer ist der Held, was will er, was steht auf dem Spiel?"
                />

                <TextEnhancer
                  label="Logline (Protagonist + Ziel + Hindernis)"
                  value={localConcept.logline || ''}
                  onChange={(value) => setLocalConcept({ ...localConcept, logline: value })}
                  placeholder="Ein [Protagonist] muss [Ziel] erreichen, sonst [Stakes]"
                  rows={2}
                  context="Klassische Hollywood-Logline für Klarheit"
                />
              </CardContent>
            </Card>

            {/* Story Elements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Story-Elemente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextEnhancer
                  label="Zentraler Konflikt *"
                  value={localConcept.centralConflict || ''}
                  onChange={(value) => setLocalConcept({ ...localConcept, centralConflict: value })}
                  placeholder="Was ist das Hauptproblem, das der Protagonist lösen muss?"
                  rows={4}
                  context="Interner und externer Konflikt. Was will der Held und was hindert ihn daran?"
                />

                <TextEnhancer
                  label="Unique Hook"
                  value={localConcept.uniqueHook || ''}
                  onChange={(value) => setLocalConcept({ ...localConcept, uniqueHook: value })}
                  placeholder="Was macht deine Geschichte anders als alle anderen?"
                  rows={3}
                  context="Der Twist oder das Alleinstellungsmerkmal, das Leser neugierig macht"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Themen</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            <strong>Themen</strong> sind die großen Ideen deiner Geschichte.<br/><br/>
                            Beispiele: Liebe vs. Pflicht, Rache und Vergebung, Macht und Korruption
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      value={localConcept.themes || ''}
                      onChange={(e) => setLocalConcept({ ...localConcept, themes: e.target.value })}
                      placeholder="z.B. Verrat, Erlösung, Coming-of-Age"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tonalität</label>
                    <Input
                      value={localConcept.tone || ''}
                      onChange={(e) => setLocalConcept({ ...localConcept, tone: e.target.value })}
                      placeholder="z.B. Düster, humorvoll, episch"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Zielgruppe
                  </label>
                  <Input
                    value={localConcept.targetAudience || ''}
                    onChange={(e) => setLocalConcept({ ...localConcept, targetAudience: e.target.value })}
                    placeholder="z.B. Young Adult (14-18), Fantasy-Fans..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Feedback Sidebar */}
        <div className={`border-l bg-slate-50 flex flex-col transition-all duration-300 ${aiFeedback ? 'w-[450px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
          {aiFeedback && (
            <>
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-violet-500" />
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
    </TooltipProvider>
  );
}
