'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { StyleRadarChart } from './StyleRadarChart';
import { StyleProfile } from '@/lib/styles/authorStylesExtended';
import { 
  Sparkles, Save, Wand2, FileText, SlidersHorizontal, 
  Zap, BookOpen, MessageCircle, Eye, Brain, Wind, Heart,
  Activity, Gauge, Compass
} from 'lucide-react';
import { motion } from 'framer-motion';

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

  const handleCharacteristicChange = (key: string, value: number[]) => {
    setCharacteristics(prev => ({ ...prev, [key]: value[0] }));
  };

  const analyzeText = async () => {
    if (!sampleText.trim() || sampleText.length < 100) return;
    
    setIsAnalyzing(true);
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
          setCharacteristics({ ...defaultCharacteristics, ...parsed });
          
          // Auto-generate description based on analysis
          const desc = generateDescription(parsed);
          setStyleDescription(desc);
          
          setActiveSubTab('manual');
        } catch (e) {
          console.error('Failed to parse analysis:', e);
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
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
    name: styleName || 'Vorschau',
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
        <TabsContent value="manual" className="mt-6 space-y-6">
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
                {characteristicConfig.map((config) => (
                  <motion.div 
                    key={config.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
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
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2"
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
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
              <Textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Füge hier deinen Beispieltext ein (mindestens 200 Zeichen für gute Ergebnisse)..."
                rows={10}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {sampleText.length} Zeichen {sampleText.length < 200 && (
                    <span className="text-amber-600">(mindestens 200 empfohlen)</span>
                  )}
                </p>
                <Button
                  onClick={analyzeText}
                  disabled={sampleText.length < 100 || isAnalyzing}
                  className="bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  {isAnalyzing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2"
                    >
                      <Wand2 className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Stil analysieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
