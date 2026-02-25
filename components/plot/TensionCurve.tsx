'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Beat {
  id: string;
  name: string;
  act: string;
  position: number;
  tension: number;
}

interface TensionCurveProps {
  beats: Beat[];
  onUpdateTension: (beatId: string, tension: number) => void;
  structureName?: string;
}

export function TensionCurve({ beats, onUpdateTension, structureName }: TensionCurveProps) {
  // Sort beats by position
  const sortedBeats = [...beats].sort((a, b) => a.position - b.position);
  
  // Create data points
  const data = sortedBeats.map((beat, index) => ({
    name: beat.name,
    position: index + 1,
    tension: beat.tension || 5,
    act: beat.act,
    id: beat.id,
  }));

  // Add ideal curve based on structure
  const getIdealCurve = () => {
    if (!structureName) return data.map(() => 5);
    
    // Common tension patterns
    const patterns: Record<string, number[]> = {
      'heros_journey': [3, 4, 5, 4, 6, 5, 7, 8, 6, 7, 9, 4], // Classic rise-fall-rise-climax
      'three_act': [3, 4, 5, 6, 5, 7, 8, 9, 4], // Setup-confrontation-resolution
      'save_the_cat': [3, 4, 5, 6, 4, 7, 8, 3, 9, 4], // Fun-games midpoint, dark night, finale
    };
    
    const pattern = patterns[structureName.toLowerCase()] || data.map((_, i) => 3 + (i / data.length) * 6);
    return pattern.slice(0, data.length);
  };

  const idealTension = getIdealCurve();
  const chartData = data.map((d, i) => ({
    ...d,
    ideal: idealTension[i] || d.tension,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-slate-500">Akt: {data.act}</p>
          <p className="text-sm font-medium text-violet-600">
            Spannung: {data.tension}/10
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Spannungsbogen (Tension Curve)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="position" 
                tick={false}
                label={{ value: 'Story-Verlauf', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={[0, 10]} 
                label={{ value: 'Spannung', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={5} stroke="#94a3b8" strokeDasharray="3 3" />
              
              {/* Ideal curve */}
              <Area 
                type="monotone" 
                dataKey="ideal" 
                stroke="#cbd5e1" 
                strokeDasharray="5 5"
                fill="transparent"
                name="Ideale Kurve"
              />
              
              {/* Actual tension */}
              <Area 
                type="monotone" 
                dataKey="tension" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fill="url(#colorTension)"
                name="Deine Story"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-slate-600">
          <p className="font-medium mb-2">Legende:</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-violet-500 rounded"></div>
              <span>Deine Story</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-slate-300 rounded" style={{backgroundImage: 'repeating-linear-gradient(90deg, #cbd5e1 0, #cbd5e1 5px, transparent 5px, transparent 10px)'}}></div>
              <span>Ideale Kurve</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <span className="font-medium text-green-700">Niedrig (1-3):</span>
            <p className="text-green-600">Setup, Charaktereinführung</p>
          </div>
          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
            <span className="font-medium text-yellow-700">Mittel (4-6):</span>
            <p className="text-yellow-600">Entwicklung, Komplikationen</p>
          </div>
          <div className="p-2 bg-red-50 rounded border border-red-200">
            <span className="font-medium text-red-700">Hoch (7-10):</span>
            <p className="text-red-600">Krise, Klimax, Showdown</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Beat tension editor
export function BeatTensionEditor({ beat, onChange }: { beat: Beat; onChange: (tension: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-16">Spannung:</span>
      <input
        type="range"
        min="1"
        max="10"
        value={beat.tension || 5}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
      />
      <span className={cn(
        "text-sm font-medium w-8 text-center",
        (beat.tension || 5) <= 3 ? "text-green-600" :
        (beat.tension || 5) <= 6 ? "text-yellow-600" : "text-red-600"
      )}>
        {beat.tension || 5}
      </span>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
