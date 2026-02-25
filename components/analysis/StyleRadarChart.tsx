'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { StyleProfile } from '@/lib/styles/authorStylesExtended';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StyleRadarChartProps {
  profiles: StyleProfile[];
  personalProfile?: StyleProfile['characteristics'];
  className?: string;
  height?: number;
}

const CHARACTERISTIC_LABELS: Record<string, string> = {
  pacing: 'Tempo',
  dialogueDensity: 'Dialog-Dichte',
  descriptionLevel: 'Beschreibung',
  sentenceComplexity: 'Satzkomplexität',
  vocabularyRichness: 'Wortschatz',
  emotionalDepth: 'Emotionale Tiefe',
  atmosphericDensity: 'Atmosphäre',
  tensionLevel: 'Spannung',
  introspection: 'Introspektion',
  accessibility: 'Lesbarkeit',
};

export function StyleRadarChart({ profiles, personalProfile, className, height = 400 }: StyleRadarChartProps) {
  // Transform data for Recharts
  const data = Object.keys(CHARACTERISTIC_LABELS).map((key) => {
    const entry: any = {
      characteristic: CHARACTERISTIC_LABELS[key],
      fullMark: 10,
    };
    
    profiles.forEach((profile) => {
      entry[profile.id] = profile.characteristics[key as keyof typeof profile.characteristics];
    });
    
    if (personalProfile) {
      entry.personal = personalProfile[key as keyof typeof personalProfile];
    }
    
    return entry;
  });

  const colors = [
    '#8884d8', // violet
    '#82ca9d', // green
    '#ffc658', // yellow
    '#ff7300', // orange
    '#00C49F', // teal
    '#FFBB28', // gold
    '#FF8042', // coral
    '#0088FE', // blue
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-2xl">🕸️</span>
          Stil-Analyse (Linguistische Merkmale)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="characteristic" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
              
              {profiles.map((profile, index) => (
                <Radar
                  key={profile.id}
                  name={profile.name}
                  dataKey={profile.id}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              
              {personalProfile && (
                <Radar
                  name="Dein Stil"
                  dataKey="personal"
                  stroke="#e11d48"
                  fill="#e11d48"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
              )}
              
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-semibold mb-2">{label}</p>
                        {payload.map((entry: any) => (
                          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}/10
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded">
            <h4 className="font-semibold mb-2">Skala 1-10:</h4>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• <strong>1-3:</strong> Minimal/Anspruchsvoll</li>
              <li>• <strong>4-6:</strong> Ausgewogen</li>
              <li>• <strong>7-10:</strong> Stark ausgeprägt</li>
            </ul>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <h4 className="font-semibold mb-2">Merkmale:</h4>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• <strong>Tempo:</strong> Geschwindigkeit der Handlung</li>
              <li>• <strong>Lesbarkeit:</strong> Zugänglichkeit des Textes</li>
              <li>• <strong>Introspektion:</strong> Innere Monologe</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for comparing personal style to famous authors
export function StyleComparison({ 
  personalCharacteristics, 
  onMatchFound 
}: { 
  personalCharacteristics: StyleProfile['characteristics'];
  onMatchFound?: (bestMatch: StyleProfile, similarity: number) => void;
}) {
  const { PREDEFINED_STYLES } = require('@/lib/styles/authorStyles');
  
  // Calculate similarity scores
  const similarities = PREDEFINED_STYLES.map((style: StyleProfile) => {
    let totalDiff = 0;
    let count = 0;
    
    Object.keys(personalCharacteristics).forEach((key) => {
      const personal = personalCharacteristics[key as keyof typeof personalCharacteristics] || 0;
      const author = style.characteristics[key as keyof typeof style.characteristics] || 0;
      totalDiff += Math.abs(personal - author);
      count++;
    });
    
    const similarity = 100 - (totalDiff / count) * 10; // Convert to percentage
    return { style, similarity: Math.max(0, similarity) };
  });
  
  similarities.sort((a: any, b: any) => b.similarity - a.similarity);
  const bestMatch = similarities[0];
  
  if (onMatchFound && bestMatch) {
    onMatchFound(bestMatch.style, bestMatch.similarity);
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Ähnlichkeit mit berühmten Autoren:</h3>
      {similarities.slice(0, 5).map(({ style, similarity }: any) => (
        <div key={style.id} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{style.name}</span>
              <span className="text-slate-500">{similarity.toFixed(1)}% Match</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-500 transition-all"
                style={{ width: `${similarity}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
