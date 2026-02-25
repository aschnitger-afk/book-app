'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Character } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Heart, 
  Swords, 
  Users, 
  Shield, 
  GraduationCap,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RelationshipGraphProps {
  bookId: string;
  characters: Character[];
  selectedCharacter: Character;
}

interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'ally' | 'enemy' | 'family' | 'love' | 'mentor' | 'rival';
  strength: number;
  description?: string;
  isConflict: boolean;
}

const relationshipIcons = {
  ally: Shield,
  enemy: Swords,
  family: Users,
  love: Heart,
  mentor: GraduationCap,
  rival: Swords,
};

const relationshipColors = {
  ally: '#22c55e',
  enemy: '#ef4444',
  family: '#3b82f6',
  love: '#ec4899',
  mentor: '#f59e0b',
  rival: '#8b5cf6',
};

export function RelationshipGraph({ bookId, characters, selectedCharacter }: RelationshipGraphProps) {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch relationships
  useEffect(() => {
    fetchRelationships();
  }, [bookId]);

  // Initialize node positions in a circle
  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = 400;
    const centerY = 250;
    const radius = 180;
    
    characters.forEach((char, index) => {
      const angle = (index / characters.length) * 2 * Math.PI - Math.PI / 2;
      positions[char.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
    
    setNodePositions(positions);
  }, [characters]);

  const fetchRelationships = async () => {
    try {
      const response = await fetch(`/api/characters/relationships?bookId=${bookId}`);
      const data = await response.json();
      setRelationships(data);
    } catch (error) {
      console.error('Failed to fetch relationships:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRelationship = async (targetId: string, type: string, strength: number) => {
    try {
      const response = await fetch('/api/characters/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: selectedCharacter.id,
          targetId,
          type,
          strength,
          bookId,
        }),
      });
      
      if (response.ok) {
        fetchRelationships();
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create relationship:', error);
    }
  };

  const handleDeleteRelationship = async (id: string) => {
    try {
      await fetch(`/api/characters/relationships?id=${id}`, { method: 'DELETE' });
      fetchRelationships();
    } catch (error) {
      console.error('Failed to delete relationship:', error);
    }
  };

  const handleMouseDown = (charId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggedNode(charId);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setNodePositions(prev => ({
      ...prev,
      [draggedNode]: { x, y },
    }));
  }, [draggedNode]);

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  // Get related relationships for selected character
  const relatedRelationships = relationships.filter(
    r => r.sourceId === selectedCharacter.id || r.targetId === selectedCharacter.id
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6">
      {/* Graph Visualization */}
      <div 
        ref={containerRef}
        className="flex-1 bg-gradient-to-br from-slate-50 to-violet-50 rounded-2xl border relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg 
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
        >
          {/* Connection Lines */}
          {relatedRelationships.map((rel) => {
            const source = rel.sourceId === selectedCharacter.id ? selectedCharacter : characters.find(c => c.id === rel.sourceId);
            const target = rel.targetId === selectedCharacter.id ? selectedCharacter : characters.find(c => c.id === rel.targetId);
            
            if (!source || !target) return null;
            
            const sourcePos = nodePositions[source.id] || { x: 400, y: 250 };
            const targetPos = nodePositions[target.id] || { x: 400, y: 250 };
            
            const Icon = relationshipIcons[rel.type];
            const color = relationshipColors[rel.type];
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;
            
            return (
              <g key={rel.id}>
                {/* Animated connection line */}
                <motion.line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={color}
                  strokeWidth={rel.strength / 20}
                  strokeDasharray={rel.isConflict ? "5,5" : "0"}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.8 }}
                />
                
                {/* Relationship icon at midpoint */}
                <foreignObject x={midX - 12} y={midY - 12} width={24} height={24}>
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                </foreignObject>
                
                {/* Delete button */}
                <foreignObject x={midX + 15} y={midY - 10} width={20} height={20}>
                  <button
                    onClick={() => handleDeleteRelationship(rel.id)}
                    className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Character Nodes */}
        {characters.map((char) => {
          const pos = nodePositions[char.id] || { x: 400, y: 250 };
          const isSelected = char.id === selectedCharacter.id;
          const hasRelationship = relatedRelationships.some(
            r => r.sourceId === char.id || r.targetId === char.id
          );
          
          if (!isSelected && !hasRelationship) return null;
          
          return (
            <motion.div
              key={char.id}
              className={`absolute cursor-move select-none ${isSelected ? 'z-20' : 'z-10'}`}
              style={{
                left: pos.x - 40,
                top: pos.y - 40,
              }}
              onMouseDown={(e) => handleMouseDown(char.id, e)}
              whileHover={{ scale: 1.1 }}
              drag={false}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold shadow-lg transition-all ${
                isSelected 
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 ring-4 ring-violet-200' 
                  : 'bg-gradient-to-br from-slate-400 to-slate-500'
              }`}>
                {char.portraitUrl ? (
                  <img 
                    src={char.portraitUrl} 
                    alt={char.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  char.name?.[0]?.toUpperCase()
                )}
              </div>
              <p className="text-center text-sm font-medium mt-2 bg-white/80 px-2 py-1 rounded-full">
                {char.name}
              </p>
            </motion.div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <h4 className="text-sm font-semibold mb-2">Beziehungstypen</h4>
          <div className="space-y-1">
            {Object.entries(relationshipIcons).map(([type, Icon]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: relationshipColors[type as keyof typeof relationshipColors] }}
                >
                  <Icon className="h-2 w-2" />
                </div>
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar - Relationships List */}
      <div className="w-80 bg-white rounded-2xl border p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Beziehungen</h3>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Beziehung hinzufügen</DialogTitle>
              </DialogHeader>
              <RelationshipCreator
                characters={characters.filter(c => c.id !== selectedCharacter.id)}
                onCreate={handleCreateRelationship}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {relatedRelationships.map((rel) => {
            const otherId = rel.sourceId === selectedCharacter.id ? rel.targetId : rel.sourceId;
            const otherChar = characters.find(c => c.id === otherId);
            if (!otherChar) return null;
            
            const Icon = relationshipIcons[rel.type];
            const color = relationshipColors[rel.type];
            
            return (
              <motion.div
                key={rel.id}
                className="p-3 rounded-xl border hover:shadow-md transition-shadow"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{otherChar.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{rel.type}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteRelationship(rel.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Strength indicator */}
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Stärke</span>
                    <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${rel.strength}%`,
                          backgroundColor: color 
                        }}
                      />
                    </div>
                    <span>{rel.strength}%</span>
                  </div>
                </div>
                
                {rel.description && (
                  <p className="text-xs text-slate-600 mt-2">{rel.description}</p>
                )}
              </motion.div>
            );
          })}
          
          {relatedRelationships.length === 0 && (
            <p className="text-center text-slate-400 py-8">
              Noch keine Beziehungen. Erstelle die erste!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Relationship Creator Component
function RelationshipCreator({ 
  characters, 
  onCreate 
}: { 
  characters: Character[]; 
  onCreate: (targetId: string, type: string, strength: number) => void;
}) {
  const [selectedChar, setSelectedChar] = useState('');
  const [type, setType] = useState('ally');
  const [strength, setStrength] = useState([50]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Charakter</label>
        <select
          value={selectedChar}
          onChange={(e) => setSelectedChar(e.target.value)}
          className="w-full mt-1 p-2 border rounded-lg"
        >
          <option value="">Wählen...</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Beziehungstyp</label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {Object.keys(relationshipIcons).map((t) => {
            const Icon = relationshipIcons[t as keyof typeof relationshipIcons];
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-colors ${
                  type === t 
                    ? 'bg-violet-100 border-violet-300 text-violet-700' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="capitalize">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Stärke: {strength[0]}%</label>
        <Slider
          value={strength}
          onValueChange={setStrength}
          max={100}
          step={5}
          className="mt-2"
        />
      </div>

      <Button
        onClick={() => onCreate(selectedChar, type, strength[0])}
        disabled={!selectedChar}
        className="w-full"
      >
        Beziehung erstellen
      </Button>
    </div>
  );
}
