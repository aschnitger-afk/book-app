'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StyleRadarChart } from './StyleRadarChart';
import { ALL_AUTHOR_STYLES, findSimilarAuthors, StyleProfile } from '@/lib/styles/authorStylesExtended';
import { User, Sparkles, Save, Wand2, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StyleCreatorProps {
  onStyleCreated?: (style: StyleProfile) => void;
  initialStyle?: StyleProfile | null;
  showSimilarAuthors?: boolean;
}

const defaultCharacteristics: StyleProfile['characteristics'] = {
  pacing: 5,
  dialogueDensity: 5,
  descriptionLevel: 5,
  sentenceComplexity: 5,
  vocabularyRichness: 5,
  emotionalDepth: 5,
  atmosphericDensity: 5,
  tensionLevel: 5,
  introspection: 5,
  accessibility: 5,
};

const labels: Record<string, { label: string; low: string; high: string }> = {
  pacing: { label: 'Tempo', low: 'Langsam/lyrisch', high: 'Schnell/action' },
  dialogueDensity: { label: 'Dialog-Anteil', low: 'Erzählend', high: 'Dialoglastig' },
  descriptionLevel: { label: 'Beschreibung', low: 'Minimal', high: 'Sehr detailliert' },
  sentenceComplexity: { label: 'Satz-Komplexität', low: 'Einfach/kurz', high: 'Komplex/lang' },
  vocabularyRichness: { label: 'Wortschatz', low: 'Einfach', high: 'Anspruchsvoll' },
  emotionalDepth: { label: 'Emotionale Tiefe', low: 'Oberflächlich', high: 'Tiefgründig' },
  atmosphericDensity: { label: 'Atmosphäre', low: 'Sachlich', high: 'Dicht/stimmungsvoll' },
  tensionLevel: { label: 'Spannung', low: 'Entspannt', high: 'Hochspannend' },
  introspection: { label: 'Introspektion', low: 'Externe Handlung', high: 'Innerer Monolog' },
  accessibility: { label: 'Lesbarkeit', low: 'Anspruchsvoll', high: 'Leicht zugänglich' },
};

export function StyleCreator({ onStyleCreated, initialStyle, showSimilarAuthors = true }: StyleCreatorProps) {
  const [name, setName] = useState(initialStyle?.name || 'Mein Stil');
  const [description, setDescription] = useState(initialStyle?.description || '');
  const [characteristics, setCharacteristics] = useState<StyleProfile['characteristics']>(
    initialStyle?.characteristics || defaultCharacteristics
  );
  const [sampleText, setSampleText] = useState('');
  const [similarAuthors, setSimilarAuthors] = useState<{ style: StyleProfile; similarity: number }[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const updateCharacteristic = (key: keyof StyleProfile['characteristics'], value: number) => {
    setCharacteristics(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const generateStyleDescription = (chars: StyleProfile['characteristics']): string => {
    const parts: string[] = [];
    
    // Tempo
    if (chars.pacing >= 7) parts.push('schnell getaktet');
    else if (chars.pacing <= 3) parts.push('langsam und lyrisch');
    else parts.push('ausgewogen im Tempo');
    
    // Dialog vs Narration
    if (chars.dialogueDensity >= 7) parts.push('dialoglastig');
    else if (chars.dialogueDensity <= 3) parts.push('erzählend');
    
    // Beschreibung
    if (chars.descriptionLevel >= 7) parts.push('reich beschreibend');
    else if (chars.descriptionLevel <= 3) parts.push('karg/minimalistisch');
    
    // Komplexität
    if (chars.sentenceComplexity >= 7) parts.push('komplex verschachtelt');
    else if (chars.sentenceComplexity <= 3) parts.push('einfach und direkt');
    
    // Wortschatz
    if (chars.vocabularyRichness >= 7) parts.push('anspruchsvoll im Wortschatz');
    else if (chars.vocabularyRichness <= 3) parts.push('einfacher Wortschatz');
    
    // Emotionen
    if (chars.emotionalDepth >= 7) parts.push('emotional tiefgründig');
    else if (chars.emotionalDepth <= 3) parts.push('eher sachlich');
    
    // Atmosphäre
    if (chars.atmosphericDensity >= 7) parts.push('atmosphärisch dicht');
    
    // Spannung
    if (chars.tensionLevel >= 7) parts.push('hochspannend');
    else if (chars.tensionLevel <= 3) parts.push('entspannt');
    
    // Introspektion
    if (chars.introspection >= 7) parts.push('introspektiv');
    else if (chars.introspection <= 3) parts.push('aktionsorientiert');
    
    // Lesbarkeit
    if (chars.accessibility >= 7) parts.push('leicht lesbar');
    else if (chars.accessibility <= 3) parts.push('anspruchsvoll/élitär');

    return parts.join(', ') + '.';
  };

  const getStyleProfileType = (chars: StyleProfile['characteristics']): string => {
    // Determine primary style archetype
    if (chars.pacing >= 7 && chars.tensionLevel >= 7) return 'Thriller-Autor';
    if (chars.descriptionLevel >= 8 && chars.atmosphericDensity >= 8) return 'Atmosphärischer Erzähler';
    if (chars.dialogueDensity >= 8) return 'Dialog-Spezialist';
    if (chars.introspection >= 8) return 'Psychologischer Romancier';
    if (chars.sentenceComplexity >= 8 && chars.vocabularyRichness >= 8) return 'Literarischer Stilist';
    if (chars.pacing <= 4 && chars.descriptionLevel >= 7) return 'Lyrischer Erzähler';
    if (chars.accessibility >= 8 && chars.pacing >= 6) return 'Unterhaltungsautor';
    if (chars.emotionalDepth >= 8) return 'Emotionaler Geschichtenerzähler';
    return 'Ausgewogener Allround-Autor';
  };

  const handleAutoAdjustFromText = async () => {
    if (sampleText.length < 50) {
      alert('Bitte gib mindestens 50 Zeichen ein für eine Analyse');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis with small delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple Heuristik
    const sentences = sampleText.split(/[.!?]+/).filter(s => s.trim());
    const words = sampleText.split(/\s+/).filter(w => w);
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    const dialogueMatches = sampleText.match(/[""'']([^""'']+)[""'']/g);
    const dialogueRatio = dialogueMatches ? dialogueMatches.join(' ').split(/\s+/).length / words.length : 0;
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    
    // Count adjectives (simple heuristic)
    const descriptivePattern = /\b\w+(ig|lich|isch|sam|haft|bar)\b/gi;
    const descriptiveMatches = sampleText.match(descriptivePattern);
    const descriptiveDensity = descriptiveMatches ? descriptiveMatches.length / words.length : 0;
    
    setCharacteristics({
      pacing: avgSentenceLength < 12 ? 8 : avgSentenceLength < 20 ? 5 : 3,
      dialogueDensity: Math.min(10, Math.round(dialogueRatio * 20)),
      descriptionLevel: Math.min(10, Math.round(descriptiveDensity * 100)),
      sentenceComplexity: avgSentenceLength > 25 ? 9 : avgSentenceLength > 15 ? 6 : 3,
      vocabularyRichness: avgWordLength > 5.5 ? 8 : avgWordLength > 4.5 ? 5 : 3,
      emotionalDepth: sampleText.match(/\b(fühlen|emotional|Herz|Seele|Schmerz|Freude)\b/gi) ? 7 : 5,
      atmosphericDensity: descriptiveDensity > 0.05 ? 7 : 5,
      tensionLevel: sampleText.match(/\b(Angst|Gefahr|plötzlich|sofort|Spannung)\b/gi) ? 7 : 5,
      introspection: sampleText.match(/\b(dachte|fand|überlegte|innerlich|Gedanken)\b/gi) ? 7 : 4,
      accessibility: avgWordLength > 5 ? 3 : avgWordLength > 4.5 ? 6 : 9,
    });
    
    setIsAnalyzing(false);
    setIsSaved(false);
    
    // Auto-find similar authors after analysis
    const similar = findSimilarAuthors(characteristics, 5);
    setSimilarAuthors(similar);
    setShowComparison(true);
  };

  const handleFindSimilar = () => {
    const similar = findSimilarAuthors(characteristics, 5);
    setSimilarAuthors(similar);
    setShowComparison(true);
  };

  const handleSave = () => {
    const style: StyleProfile = {
      id: 'personal-' + Date.now(),
      name,
      author: name,
      description: description || generateStyleDescription(characteristics),
      characteristics,
      systemPrompt: `Write in a style with these characteristics: pacing ${characteristics.pacing}/10, dialogue ${characteristics.dialogueDensity}/10, description ${characteristics.descriptionLevel}/10, complexity ${characteristics.sentenceComplexity}/10, vocabulary ${characteristics.vocabularyRichness}/10`,
      genre: 'Personal Style',
      era: 'Contemporary',
    };
    onStyleCreated?.(style);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const styleDescription = useMemo(() => generateStyleDescription(characteristics), [characteristics]);
  const styleType = useMemo(() => getStyleProfileType(characteristics), [characteristics]);

  return (
    <div className="space-y-6">
      {/* Main Style Settings */}
      <Card className="border-violet-200">
        <CardHeader className="bg-violet-50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-violet-600" />
            Deinen Schreibstil definieren
          </CardTitle>
          <CardDescription>
            Passe die 10 linguistischen Dimensionen an oder analysiere einen Text automatisch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Name & Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name deines Stils</label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setIsSaved(false); }}
                placeholder="z.B. Mein epischer Fantasy-Stil"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Beschreibung (optional)</label>
              <Input
                value={description}
                onChange={(e) => { setDescription(e.target.value); setIsSaved(false); }}
                placeholder="Kurze Beschreibung deines Stils"
              />
            </div>
          </div>

          {/* Auto-detect from text */}
          <Card className="bg-slate-50 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Schritt 1: Aus Text automatisch ermitteln
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Füge hier einen Textausschnitt ein (mind. 50 Zeichen). Die KI analysiert Satzlänge, Wortwahl, Dialoganteil und setzt die Regler automatisch..."
                rows={3}
                className="text-sm"
              />
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleAutoAdjustFromText}
                disabled={isAnalyzing || sampleText.length < 50}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isAnalyzing ? (
                  <><Sparkles className="h-4 w-4 mr-2 animate-spin" /> Analysiere...</>
                ) : (
                  <><Wand2 className="h-4 w-4 mr-2" /> Text analysieren & Regler setzen</>
                )}
              </Button>
              <p className="text-xs text-slate-500">
                Die Analyse berechnet: Satzlänge → Tempo & Komplexität | Dialog-Marker → Dialog-Anteil | Wortlänge → Wortschatz & Lesbarkeit
              </p>
            </CardContent>
          </Card>

          {/* Sliders - Step 2 */}
          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs">Schritt 2</span>
              Manuelle Feinabstimmung (oder direkt einstellen)
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(labels).map(([key, { label, low, high }]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-slate-500 font-mono">{characteristics[key as keyof typeof characteristics]}/10</span>
                  </div>
                  <Slider
                    value={[characteristics[key as keyof typeof characteristics]]}
                    onValueChange={([v]) => updateCharacteristic(key as keyof typeof characteristics, v)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{low}</span>
                    <span>{high}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Chart & Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Visuelles Profil</h4>
              <StyleRadarChart
                profiles={[]}
                personalProfile={characteristics}
                height={300}
              />
            </div>
            
            <div className="space-y-4">
              {/* Text Description */}
              <div className="p-4 bg-gradient-to-br from-violet-50 to-blue-50 rounded-lg border border-violet-100">
                <h4 className="font-medium text-violet-900 mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Dein Stil-Profil
                </h4>
                <p className="text-lg font-semibold text-violet-800 mb-2">{styleType}</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {styleDescription}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {Object.entries(characteristics).map(([key, val]) => (
                    <Badge 
                      key={key} 
                      variant={val > 7 ? "default" : val < 4 ? "secondary" : "outline"} 
                      className="text-xs"
                    >
                      {labels[key].label}: {val}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Similar Authors - Integrated */}
              {showSimilarAuthors && (
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">Ähnliche Star-Autoren</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleFindSimilar}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Aktualisieren
                    </Button>
                  </div>
                  
                  {showComparison && similarAuthors.length > 0 ? (
                    <div className="space-y-2">
                      {similarAuthors.map(({ style, similarity }) => (
                        <div key={style.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{style.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-violet-500"
                                style={{ width: `${similarity}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-12 text-right">{similarity.toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      Klick auf "Aktualisieren" um ähnliche Autoren zu finden
                    </p>
                  )}
                </div>
              )}
              
              {/* Save Button with Feedback */}
              <Button 
                onClick={handleSave} 
                className={cn(
                  "w-full transition-all",
                  isSaved 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-violet-600 hover:bg-violet-700"
                )}
                disabled={isSaved}
              >
                {isSaved ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Stil gespeichert!</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Stil speichern & übernehmen</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
