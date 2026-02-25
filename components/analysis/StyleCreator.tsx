'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { StyleRadarChart } from './StyleRadarChart';
import { StyleProfile } from '@/lib/styles/authorStylesExtended';
import { 
  Sparkles, Save, Wand2, FileText, SlidersHorizontal, 
  Zap, BookOpen, MessageCircle, Eye, Brain, Wind, Heart,
  Activity, Gauge, Compass, CheckCircle2, ArrowRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StyleCreatorProps {
  onStyleCreated: (style: StyleProfile) => void;
  savedStyles: any[];
  onSaveStyle: () => void;
}

const defaultCharacteristics = {
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

const characteristicConfig = [
  { key: 'pacing', label: 'Erzähltempo', icon: Zap, min: 'Langsam', max: 'Schnell', desc: 'Wie schnell entwickelt sich die Handlung?' },
  { key: 'dialogueDensity', label: 'Dialog-Anteil', icon: MessageCircle, min: 'Wenig', max: 'Viel', desc: 'Wie viel Dialog vs. Erzählung?' },
  { key: 'descriptionLevel', label: 'Beschreibung', icon: Eye, min: 'Sparsam', max: 'Ausführlich', desc: 'Wie detailliert werden Szenen beschrieben?' },
  { key: 'sentenceComplexity', label: 'Satzkomplexität', icon: Brain, min: 'Einfach', max: 'Komplex', desc: 'Wie aufwendig sind die Satzstrukturen?' },
  { key: 'vocabularyRichness', label: 'Wortschatz', icon: BookOpen, min: 'Einfach', max: 'Reichhaltig', desc: 'Wie vielfältig ist der Wortschatz?' },
  { key: 'emotionalDepth', label: 'Emotionale Tiefe', icon: Heart, min: 'Oberflächlich', max: 'Tief', desc: 'Wie tief werden Emotionen erforscht?' },
  { key: 'atmosphericDensity', label: 'Atmosphäre', icon: Wind, min: 'Sachlich', max: 'Stimmungsvoll', desc: 'Wie atmosphärisch ist die Erzählung?' },
  { key: 'tensionLevel', label: 'Spannung', icon: Activity, min: 'Entspannt', max: 'Spannend', desc: 'Wie spannungsgeladen ist der Stil?' },
  { key: 'introspection', label: 'Introspektion', icon: Compass, min: 'Handlung', max: 'Gedanken', desc: 'Fokus auf Handlung oder innere Gedanken?' },
  { key: 'accessibility', label: 'Zugänglichkeit', icon: Gauge, min: 'Anspruchsvoll', max: 'Leicht', desc: 'Wie leicht ist der Text zu lesen?' },
];

export function StyleCreator({ onStyleCreated, savedStyles, onSaveStyle }: StyleCreatorProps) {
  const [activeSubTab, setActiveSubTab] = useState('manual');
  const [styleName, setStyleName] = useState('');
  const [styleDescription, setStyleDescription] = useState('');
  const [characteristics, setCharacteristics] = useState(defaultCharacteristics);
  const [sampleText, setSampleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<typeof defaultCharacteristics | null>(null);
  const [showAnalysisSuccess, setShowAnalysisSuccess] = useState(false);
  const manualTabRef = useRef<HTMLDivElement>(null);

  const handleCharacteristicChange = (key: string, value: number[]) => {
    setCharacteristics(prev => ({ ...prev, [key]: value[0] }));
  };

  const analyzeText = async () => {
    if (!sampleText.trim() || sampleText.length < 100) return;
    
    setIsAnalyzing(true);
    setShowAnalysisSuccess(false);
    
    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze the following text and rate it on these 10 characteristics (0-10 scale). 
          Return ONLY a JSON object with exact numbers:
          {
            "pacing": number (0=slow, 10=fast),
            "dialogueDensity": number (0=little dialogue, 10=much dialogue),
            "descriptionLevel": number (0=sparse, 10=detailed),
            "sentenceComplexity": number (0=simple, 10=complex),
            "vocabularyRichness": number (0=simple, 10=rich),
            "emotionalDepth": number (0=surface, 10=deep),
            "atmosphericDensity": number (0=factual, 10=atmospheric),
            "tensionLevel": number (0=relaxed, 10=tense),
            "introspection": number (0=action-focused, 10=thought-focused),
            "accessibility": number (0=challenging, 10=easy)
          }
          
          Text to analyze: "${sampleText.substring(0, 2000)}"`,
          type: 'style',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        try {
          const parsed = JSON.parse(data.result);
          setAnalysisResult(parsed);
          setCharacteristics({ ...defaultCharacteristics, ...parsed });
          
          // Auto-generate description based on analysis
          const desc = generateDescription(parsed);
          setStyleDescription(desc);
          
          // Show success message first
          setShowAnalysisSuccess(true);
          
          // Then switch to manual tab after a short delay
          setTimeout(() => {
            setActiveSubTab('manual');
            setShowAnalysisSuccess(false);
            // Scroll to results
            setTimeout(() => {
              manualTabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }, 2000);
          
        } catch (e) {
          console.error('Failed to parse analysis:', e);
          alert('Fehler beim Parsen der Analyse. Bitte versuche es erneut.');
        }
      } else {
        alert('Fehler bei der Analyse. Bitte versuche es erneut.');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Fehler bei der Analyse. Bitte versuche es erneut.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDescription = (chars: typeof defaultCharacteristics) => {
    const traits = [];
    if (chars.pacing > 7) traits.push('schnelles Erzähltempo');
    if (chars.pacing < 4) traits.push('langsames, bedächtiges Tempo');
    if (chars.dialogueDensity > 7) traits.push('dialogreich');
    if (chars.descriptionLevel > 7) traits.push('bildreiche Beschreibungen');
    if (chars.sentenceComplexity > 7) traits.push('komplexe Satzstrukturen');
    if (chars.vocabularyRichness > 7) traits.push('reicher Wortschatz');
    if (chars.emotionalDepth > 7) traits.push('emotionale Tiefe');
    if (chars.introspection > 7) traits.push('introspektiv');
    
    return traits.length > 0 
      ? `Ein Stil mit ${traits.join(', ')}.` 
      : 'Ein ausgewogener Schreibstil.';
  };

  const getTopCharacteristics = (chars: typeof defaultCharacteristics) => {
    return Object.entries(chars)
      .filter(([_, val]) => val >= 7 || val <= 3)
      .sort((a, b) => Math.abs(b[1] - 5) - Math.abs(a[1] - 5))
      .slice(0, 4);
  };

  const createStyle = async () => {
    if (!styleName.trim()) return;
    
    setIsCreating(true);
    
    // Generate system prompt based on characteristics
    const systemPrompt = generateSystemPrompt(characteristics);
    
    const newStyle: StyleProfile = {
      id: `custom-${Date.now()}`,
      name: styleName,
      author: 'Mein Stil',
      description: styleDescription || generateDescription(characteristics),
      characteristics,
      systemPrompt,
      genre: 'Custom',
      era: 'Modern',
    };
    
    onStyleCreated(newStyle);
    setIsCreating(false);
  };

  const generateSystemPrompt = (chars: typeof defaultCharacteristics) => {
    const prompts = [];
    
    if (chars.pacing > 7) prompts.push('Fast pacing, quick scene changes');
    if (chars.pacing < 4) prompts.push('Slow, deliberate pacing');
    if (chars.dialogueDensity > 7) prompts.push('Heavy use of dialogue');
    if (chars.dialogueDensity < 4) prompts.push('Minimal dialogue, narrative focus');
    if (chars.descriptionLevel > 7) prompts.push('Rich, detailed descriptions');
    if (chars.descriptionLevel < 4) prompts.push('Sparse, minimal description');
    if (chars.sentenceComplexity > 7) prompts.push('Complex, varied sentence structures');
    if (chars.sentenceComplexity < 4) prompts.push('Simple, direct sentences');
    if (chars.vocabularyRichness > 7) prompts.push('Rich, sophisticated vocabulary');
    if (chars.emotionalDepth > 7) prompts.push('Deep emotional exploration');
    if (chars.atmosphericDensity > 7) prompts.push('Strong atmospheric, moody writing');
    if (chars.tensionLevel > 7) prompts.push('High tension, suspenseful');
    if (chars.introspection > 7) prompts.push('Introspective, character-focused');
    if (chars.accessibility < 4) prompts.push('Literary, challenging prose');
    if (chars.accessibility > 7) prompts.push('Accessible, easy-to-read prose');
    
    return prompts.length > 0 
      ? `Writing style: ${prompts.join('. ')}.` 
      : 'Balanced, general fiction writing style.';
  };

  const currentStyle: StyleProfile = {
    id: 'preview',
    name: styleName || 'Mein Stil',
    author: 'Mein Stil',
    description: styleDescription,
    characteristics,
    systemPrompt: '',
    genre: 'Custom',
    era: 'Modern',
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Manuell einstellen
          </TabsTrigger>
          <TabsTrigger value="analyze">
            <FileText className="h-4 w-4 mr-2" />
            Aus Text analysieren
          </TabsTrigger>
        </TabsList>

        {/* Manual Creation */}
        <TabsContent value="manual" className="mt-6 space-y-6" ref={manualTabRef}>
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900">Analyse abgeschlossen!</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Der Stil wurde aus deinem Text extrahiert. Du kannst ihn jetzt anpassen und speichern.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {getTopCharacteristics(analysisResult).map(([key, val]) => {
                            const config = characteristicConfig.find(c => c.key === key);
                            return (
                              <Badge key={key} variant="outline" className="bg-white text-green-700 border-green-300">
                                {config?.label}: {val}/10
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Stil-Parameter</CardTitle>
                <CardDescription>
                  Passe die 10 Dimensionen deines Schreibstils an
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 max-h-[500px] overflow-y-auto">
                {characteristicConfig.map((config, index) => (
                  <motion.div 
                    key={config.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4 text-violet-500" />
                      <Label className="font-medium">{config.label}</Label>
                      <span className="ml-auto text-sm font-bold text-violet-600">
                        {characteristics[config.key as keyof typeof characteristics]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{config.desc}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-20 text-right">{config.min}</span>
                      <Slider
                        value={[characteristics[config.key as keyof typeof characteristics]]}
                        onValueChange={(val) => handleCharacteristicChange(config.key, val)}
                        min={0}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-slate-400 w-20">{config.max}</span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Right: Preview */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vorschau</CardTitle>
                  <CardDescription>So sieht dein Stil-Profil aus</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <StyleRadarChart
                    profiles={[currentStyle]}
                    height={250}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stil speichern</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Name deines Stils *</Label>
                    <Input
                      value={styleName}
                      onChange={(e) => setStyleName(e.target.value)}
                      placeholder="z.B. Mein Action-Stil"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={styleDescription}
                      onChange={(e) => setStyleDescription(e.target.value)}
                      placeholder="Beschreibe deinen Stil..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={createStyle}
                    disabled={!styleName.trim() || isCreating}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Stil erstellen & übernehmen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Text Analysis */}
        <TabsContent value="analyze" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Stil aus Text extrahieren</CardTitle>
              <CardDescription>
                Füge einen Text ein, der deinen Wunsch-Stil repräsentiert. Die AI analysiert ihn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Analysis Loading State */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-violet-50 border border-violet-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Wand2 className="h-8 w-8 text-violet-600" />
                        </motion.div>
                        <motion.div
                          className="absolute inset-0 rounded-full bg-violet-400"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-violet-900">Analysiere deinen Text...</h4>
                        <p className="text-sm text-violet-700">
                          Die AI untersucht Erzähltempo, Satzstruktur, Wortschatz und mehr.
                          Dies kann 10-20 Sekunden dauern.
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress steps */}
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {['Text einlesen', 'Tempo analysieren', 'Struktur prüfen', 'Wortschatz bewerten', 'Profil erstellen'].map((step, i) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0.3 }}
                          animate={{ 
                            opacity: [0.3, 1, 0.3],
                            backgroundColor: ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)']
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: i * 0.3,
                            ease: 'easeInOut'
                          }}
                          className="text-center py-2 px-1 rounded text-xs text-violet-700 font-medium"
                        >
                          {step}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {showAnalysisSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3"
                    >
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </motion.div>
                    <h4 className="font-semibold text-green-900 text-lg">Analyse erfolgreich!</h4>
                    <p className="text-green-700 mt-1">
                      Dein Stil-Profil wurde erstellt. Wechsle zum "Manuell" Tab...
                    </p>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="mt-3"
                    >
                      <ArrowRight className="h-5 w-5 text-green-600 mx-auto" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Füge hier deinen Beispieltext ein (mindestens 200 Zeichen für gute Ergebnisse)...

Tipp: Nutze einen Text, der den Stil zeigt, den du erreichen möchtest."
                rows={10}
                className="resize-none"
                disabled={isAnalyzing}
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className={sampleText.length < 200 ? 'text-amber-600' : 'text-green-600'}>
                    {sampleText.length}
                  </span>
                  <span className="text-slate-500"> Zeichen </span>
                  {sampleText.length < 200 && (
                    <span className="text-amber-600">(mindestens 200 empfohlen)</span>
                  )}
                </div>
                <Button
                  onClick={analyzeText}
                  disabled={sampleText.length < 100 || isAnalyzing}
                  className="bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analysiere...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Stil analysieren
                    </>
                  )}
                </Button>
              </div>

              {/* Tips */}
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-700 mb-2">💡 Tipps für beste Ergebnisse:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Mindestens 200-500 Zeichen für aussagekräftige Ergebnisse</li>
                  <li>Verwende Text aus dem Genre deines Buches</li>
                  <li>Idealerweise ein Absatz mit Dialog UND Beschreibung</li>
                  <li>Der Text sollte deinen gewünschten Ziel-Stil repräsentieren</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
