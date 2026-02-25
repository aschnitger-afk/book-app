'use client';

import { useState } from 'react';
import { Character } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Mic, BookOpen, Hash, AlignLeft, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceAnalyzerProps {
  character: Character;
}

interface VoiceProfile {
  complexity: number;
  avgSentenceLength: number;
  favoriteWords: string[];
  tone: string;
}

const defaultVoice: VoiceProfile = {
  complexity: 50,
  avgSentenceLength: 15,
  favoriteWords: [],
  tone: 'neutral',
};

export function VoiceAnalyzer({ character }: VoiceAnalyzerProps) {
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>(() => {
    if (character.voiceProfile) {
      try {
        return { ...defaultVoice, ...JSON.parse(character.voiceProfile) };
      } catch {
        return defaultVoice;
      }
    }
    return defaultVoice;
  });
  
  const [sampleText, setSampleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyze' | 'visualize'>('analyze');

  const handleAnalyze = async () => {
    if (!sampleText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/characters/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          bookId: character.bookId,
          type: 'voice',
          sampleText,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setVoiceProfile({ ...defaultVoice, ...data });
        setActiveTab('visualize');
      }
    } catch (error) {
      console.error('Voice analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Tone color mapping
  const toneColors: Record<string, string> = {
    formal: '#3b82f6',
    casual: '#22c55e',
    poetic: '#ec4899',
    harsh: '#ef4444',
    academic: '#8b5cf6',
    simple: '#f59e0b',
    witty: '#06b6d4',
    melancholic: '#6366f1',
    neutral: '#64748b',
  };

  const toneColor = toneColors[voiceProfile.tone] || toneColors.neutral;

  return (
    <div className="h-full flex gap-6">
      {/* Left: Input */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mic className="h-5 w-5 text-violet-600" />
              Stimmen-Analyse
            </h3>
            <p className="text-sm text-slate-500">
              Analysiere den einzigartigen Sprachstil
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'analyze' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('analyze')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Analyse
            </Button>
            <Button
              variant={activeTab === 'visualize' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('visualize')}
            >
              <Palette className="h-4 w-4 mr-2" />
              Visualisierung
            </Button>
          </div>
        </div>

        {activeTab === 'analyze' ? (
          <div className="flex-1 flex flex-col bg-white rounded-2xl border p-6">
            <label className="text-sm font-medium mb-2">
              Beispieltext von {character.name}
            </label>
            <Textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder={`Füge hier Dialog oder Monolog von ${character.name} ein...\n\nMindestens 100 Zeichen für beste Ergebnisse.`}
              className="flex-1 resize-none"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-500">
                {sampleText.length} Zeichen
              </span>
              <Button
                onClick={handleAnalyze}
                disabled={sampleText.length < 50 || isAnalyzing}
                className="bg-gradient-to-r from-violet-600 to-purple-600"
              >
                {isAnalyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                  </motion.div>
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Stimme analysieren
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gradient-to-br from-slate-50 to-violet-50 rounded-2xl p-8 overflow-y-auto">
            {/* Voice Visualization */}
            <div className="grid grid-cols-2 gap-6">
              {/* Complexity Meter */}
              <motion.div
                className="bg-white rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-violet-600" />
                  <h4 className="font-semibold">Wortschatz-Komplexität</h4>
                </div>
                
                <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute h-full rounded-full"
                    style={{ 
                      background: 'linear-gradient(90deg, #22c55e, #eab308, #ef4444)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${voiceProfile.complexity}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Einfach</span>
                  <span className="font-semibold text-violet-600">{voiceProfile.complexity}%</span>
                  <span>Komplex</span>
                </div>
              </motion.div>

              {/* Sentence Length */}
              <motion.div
                className="bg-white rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <AlignLeft className="h-5 w-5 text-violet-600" />
                  <h4 className="font-semibold">Durchschn. Satzlänge</h4>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-violet-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(voiceProfile.avgSentenceLength * 2, 100)}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-violet-600">
                    {voiceProfile.avgSentenceLength}
                  </span>
                  <span className="text-sm text-slate-500">Wörter</span>
                </div>
              </motion.div>

              {/* Tone Indicator */}
              <motion.div
                className="bg-white rounded-xl p-6 shadow-sm col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5" style={{ color: toneColor }} />
                  <h4 className="font-semibold">Emotionaler Ton</h4>
                </div>
                
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    style={{ backgroundColor: toneColor }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.4 }}
                  >
                    {voiceProfile.tone[0]?.toUpperCase()}
                  </motion.div>
                  <div>
                    <p className="text-lg font-semibold capitalize" style={{ color: toneColor }}>
                      {voiceProfile.tone}
                    </p>
                    <p className="text-sm text-slate-500">
                      {voiceProfile.tone === 'formal' && 'Respektvoll und strukturiert'}
                      {voiceProfile.tone === 'casual' && 'Locker und umgänglich'}
                      {voiceProfile.tone === 'poetic' && 'Bildreich und melodisch'}
                      {voiceProfile.tone === 'harsh' && 'Direkt und kompromisslos'}
                      {voiceProfile.tone === 'academic' && 'Präzise und analytisch'}
                      {voiceProfile.tone === 'simple' && 'Klar und verständlich'}
                      {voiceProfile.tone === 'witty' && 'Humorvoll und schlagfertig'}
                      {voiceProfile.tone === 'melancholic' && 'Nachdenklich und schwermütig'}
                      {voiceProfile.tone === 'neutral' && 'Ausgewogen und sachlich'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Favorite Words */}
              <motion.div
                className="bg-white rounded-xl p-6 shadow-sm col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="h-5 w-5 text-violet-600" />
                  <h4 className="font-semibold">Charakteristische Wörter</h4>
                </div>
                
                {voiceProfile.favoriteWords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {voiceProfile.favoriteWords.map((word, index) => (
                      <motion.span
                        key={word}
                        className="px-3 py-1.5 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 rounded-full text-sm font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    Noch keine Wörter analysiert
                  </p>
                )}
              </motion.div>
            </div>

            {/* Comparison Suggestion */}
            <motion.div
              className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm text-amber-800">
                <strong>💡 Tipp:</strong> Analysiere mehrere Charaktere, um ihre 
                unterschiedlichen Stimmen zu vergleichen. Ein Protagonist könnte 
                einen einfacheren Ton haben als ein akademischer Mentor.
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Right: Tips */}
      <div className="w-72 space-y-4">
        <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
          <h4 className="font-semibold text-violet-900 mb-2">Warum Stimme wichtig ist</h4>
          <p className="text-sm text-violet-800">
            Jeder Charakter sollte einen unverwechselbaren Sprachstil haben. 
            Das macht Dialoge lebendig und hilft Lesern, Sprecher ohne 
            Dialogtags zu erkennen.
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h4 className="font-semibold mb-3">Gute Beispiele</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Monologe oder lange Dialoge</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Gedanken des Charakters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Briefe oder Tagebucheinträge</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h4 className="font-semibold mb-3">Metriken</h4>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-slate-700">Komplexität</p>
              <p className="text-slate-500">Wortschatz-Tiefe und Satzstruktur</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Satzlänge</p>
              <p className="text-slate-500">Durchschnittliche Wörter pro Satz</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Ton</p>
              <p className="text-slate-500">Emotionaler Unterton der Sprache</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
