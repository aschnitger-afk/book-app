'use client';

import { useState } from 'react';
import { Character } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CharacterSoulprintProps {
  character: Character;
}

interface SoulprintData {
  empathy: number;
  order: number;
  tradition: number;
  extroversion: number;
  risk: number;
  logic: number;
}

const defaultSoulprint: SoulprintData = {
  empathy: 50,
  order: 50,
  tradition: 50,
  extroversion: 50,
  risk: 50,
  logic: 50,
};

const dimensions = [
  { key: 'empathy', label: 'Empathie', left: 'Egoist', right: 'Fürsorglich' },
  { key: 'order', label: 'Struktur', left: 'Chaotisch', right: 'Geordnet' },
  { key: 'tradition', label: 'Tradition', left: 'Innovativ', right: 'Traditionell' },
  { key: 'extroversion', label: 'Extraversion', left: 'Introvertiert', right: 'Extravertiert' },
  { key: 'risk', label: 'Risiko', left: 'Vorsichtig', right: 'Risikofreudig' },
  { key: 'logic', label: 'Denkweise', left: 'Emotional', right: 'Logisch' },
];

export function CharacterSoulprint({ character }: CharacterSoulprintProps) {
  const [soulprint, setSoulprint] = useState<SoulprintData>(() => {
    if (character.soulprint) {
      try {
        return { ...defaultSoulprint, ...JSON.parse(character.soulprint) };
      } catch {
        return defaultSoulprint;
      }
    }
    return defaultSoulprint;
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/characters/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          bookId: character.bookId,
          type: 'soulprint',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSoulprint({ ...defaultSoulprint, ...data });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdate = async (key: keyof SoulprintData, value: number) => {
    const updated = { ...soulprint, [key]: value };
    setSoulprint(updated);
    
    // Save to database
    try {
      await fetch(`/api/characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soulprint: JSON.stringify(updated) }),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Generate SVG path for radar chart
  const generateRadarPath = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 120;
    const angleStep = (2 * Math.PI) / 6;
    
    const points = dimensions.map((_, index) => {
      const value = soulprint[dimensions[index].key as keyof SoulprintData] / 100;
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')} Z`;
  };

  // Generate hexagon grid lines
  const generateGridLines = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 120;
    const angleStep = (2 * Math.PI) / 6;
    
    const lines = [];
    for (let i = 1; i <= 5; i++) {
      const r = (radius / 5) * i;
      const points = [];
      for (let j = 0; j < 6; j++) {
        const angle = j * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        points.push(`${x},${y}`);
      }
      lines.push(`M ${points.join(' L ')} Z`);
    }
    return lines;
  };

  const radarPath = generateRadarPath();
  const gridLines = generateGridLines();

  return (
    <div className="h-full flex gap-6">
      {/* Left: Radar Chart */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-600" />
              Psyche-Profil
            </h3>
            <p className="text-sm text-slate-500">
              Die sechs Dimensionen der Persönlichkeit
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI-Analyse
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8">
          <div className="relative">
            {/* Radar Chart SVG */}
            <svg width="300" height="300" className="drop-shadow-lg">
              {/* Grid */}
              {gridLines.map((path, i) => (
                <path
                  key={i}
                  d={path}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}
              
              {/* Axis lines */}
              {dimensions.map((_, index) => {
                const angleStep = (2 * Math.PI) / 6;
                const angle = index * angleStep - Math.PI / 2;
                const x = 150 + Math.cos(angle) * 120;
                const y = 150 + Math.sin(angle) * 120;
                return (
                  <line
                    key={index}
                    x1="150"
                    y1="150"
                    x2={x}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Data area */}
              <motion.path
                d={radarPath}
                fill="url(#gradient)"
                fillOpacity="0.6"
                stroke="#8b5cf6"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* Data points */}
              {dimensions.map((dim, index) => {
                const value = soulprint[dim.key as keyof SoulprintData] / 100;
                const angleStep = (2 * Math.PI) / 6;
                const angle = index * angleStep - Math.PI / 2;
                const x = 150 + Math.cos(angle) * 120 * value;
                const y = 150 + Math.sin(angle) * 120 * value;
                
                return (
                  <motion.circle
                    key={dim.key}
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#8b5cf6"
                    stroke="white"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="cursor-pointer hover:r-8"
                    onMouseEnter={() => setHoveredDimension(dim.key)}
                    onMouseLeave={() => setHoveredDimension(null)}
                  />
                );
              })}
            </svg>
            
            {/* Labels around the chart */}
            {dimensions.map((dim, index) => {
              const angleStep = (2 * Math.PI) / 6;
              const angle = index * angleStep - Math.PI / 2;
              const x = 150 + Math.cos(angle) * 145;
              const y = 150 + Math.sin(angle) * 145;
              
              return (
                <motion.div
                  key={dim.key}
                  className="absolute text-xs font-medium text-slate-600 text-center"
                  style={{
                    left: x,
                    top: y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: hoveredDimension === dim.key ? 1.1 : 1,
                    color: hoveredDimension === dim.key ? '#8b5cf6' : '#64748b',
                  }}
                >
                  {dim.label}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="w-80 space-y-4">
        <div className="bg-white rounded-xl border p-4">
          <h4 className="font-semibold mb-4">Dimensionen anpassen</h4>
          
          <div className="space-y-4">
            {dimensions.map((dim) => {
              const value = soulprint[dim.key as keyof SoulprintData];
              
              return (
                <div 
                  key={dim.key}
                  className="space-y-2"
                  onMouseEnter={() => setHoveredDimension(dim.key)}
                  onMouseLeave={() => setHoveredDimension(null)}
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{dim.label}</span>
                    <span className="text-violet-600 font-semibold">{value}%</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-16 text-right">{dim.left}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => handleUpdate(dim.key as keyof SoulprintData, parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                    <span className="text-xs text-slate-400 w-16">{dim.right}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personality Summary */}
        <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl p-4">
          <h4 className="font-semibold text-violet-900 mb-2">Persönlichkeit</h4>
          <p className="text-sm text-violet-800">
            {character.name} ist 
            {soulprint.empathy > 60 ? ' ein fürsorglicher' : soulprint.empathy < 40 ? ' ein egoistischer' : ' ein ausgeglichener'} 
            {' '}Charakter, der 
            {soulprint.order > 60 ? ' Struktur und Ordnung schätzt' : soulprint.order < 40 ? ' chaotisch und spontan ist' : ' flexibel bleibt'}.
            {soulprint.extroversion > 60 ? ' Geselligkeit und Austausch sind wichtig.' : soulprint.extroversion < 40 ? ' Rückzug und Reflexion werden bevorzugt.' : ''}
          </p>
        </div>

        {/* Arc Suggestion */}
        <div className="bg-slate-50 rounded-xl p-4 border">
          <h4 className="font-semibold text-slate-700 mb-2">Arc-Vorschlag</h4>
          <p className="text-sm text-slate-600">
            Basierend auf dem Profil könnte {character.name} eine Reise machen von
            {' '}{soulprint.empathy < 50 ? ' Egoismus zu Mitgefühl' : ' Naivität zu Weisheit'}
            {soulprint.risk < 50 ? ', wobei das Annehmen von Risiken gelernt werden muss' : ''}.
          </p>
        </div>
      </div>
    </div>
  );
}
