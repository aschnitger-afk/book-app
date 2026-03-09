'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Lightbulb, 
  Film, 
  User, 
  Target, 
  BookOpen, 
  StickyNote,
  Plus,
  Sparkles,
  Link2,
  Trash2,
  X,
  Layout,
  GitBranch,
  Wand2,
  PenTool,
  MousePointer2,
  Sticker,
  Send,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface StoryIdea {
  id: string;
  title: string;
  content: string;
  type: 'idea' | 'scene' | 'character' | 'plot_point' | 'theme' | 'note';
  positionX: number;
  positionY: number;
  color?: string | null;
  tags?: string | null;
  aiSummary?: string | null;
  status: string;
  createdAt: string;
}

interface IdeaConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  label?: string | null;
  strength: number;
  isAiSuggested: boolean;
  aiReasoning?: string | null;
}

interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

const IDEA_TYPES = {
  idea: { icon: Lightbulb, color: 'bg-amber-100 border-amber-300 text-amber-800', label: 'Idee' },
  scene: { icon: Film, color: 'bg-blue-100 border-blue-300 text-blue-800', label: 'Szene' },
  character: { icon: User, color: 'bg-pink-100 border-pink-300 text-pink-800', label: 'Charakter' },
  plot_point: { icon: Target, color: 'bg-red-100 border-red-300 text-red-800', label: 'Plot-Punkt' },
  theme: { icon: BookOpen, color: 'bg-purple-100 border-purple-300 text-purple-800', label: 'Thema' },
  note: { icon: StickyNote, color: 'bg-gray-100 border-gray-300 text-gray-800', label: 'Notiz' },
};

const CONNECTION_COLORS = {
  related: '#94a3b8',
  leads_to: '#22c55e',
  conflicts_with: '#ef4444',
  supports: '#3b82f6',
};

export function IdeaBoard({ onIntegrateIntoPlot }: { onIntegrateIntoPlot?: () => void }) {
  const { currentBook } = useAppStore();
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [ideas, setIdeas] = useState<StoryIdea[]>([]);
  const [connections, setConnections] = useState<IdeaConnection[]>([]);
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<StoryIdea | null>(null);
  const [draggedIdea, setDraggedIdea] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNewIdeaDialog, setShowNewIdeaDialog] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'structure'>('board');
  const [tool, setTool] = useState<'select' | 'draw' | 'sticker'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [drawColor, setDrawColor] = useState('#8b5cf6');
  const [stickerType, setStickerType] = useState<keyof typeof IDEA_TYPES>('idea');
  
  // New idea form
  const [newIdea, setNewIdea] = useState({
    title: '',
    content: '',
    type: 'idea' as const,
  });

  // Load ideas
  useEffect(() => {
    if (currentBook?.id) {
      loadIdeas();
    }
  }, [currentBook?.id]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (canvas && board) {
      canvas.width = board.offsetWidth;
      canvas.height = board.offsetHeight;
      redrawCanvas();
    }
  }, [drawings]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawings.forEach(path => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });
  };

  const loadIdeas = async () => {
    try {
      const res = await fetch(`/api/ideas?bookId=${currentBook?.id}`);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.ideas || []);
        setConnections(data.connections || []);
      }
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new idea
  const createIdea = async (x?: number, y?: number) => {
    if (!newIdea.title.trim() || !currentBook?.id) return;
    
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: currentBook.id,
          title: newIdea.title,
          content: newIdea.content,
          type: stickerType,
          positionX: x ?? Math.random() * 200 + 50,
          positionY: y ?? Math.random() * 150 + 50,
        }),
      });
      
      if (res.ok) {
        const idea = await res.json();
        setIdeas(prev => [idea, ...prev]);
        setNewIdea({ title: '', content: '', type: 'idea' });
        setShowNewIdeaDialog(false);
      }
    } catch (err) {
      console.error('Failed to create idea:', err);
    }
  };

  // Quick sticker drop
  const dropSticker = async (e: React.MouseEvent) => {
    if (tool !== 'sticker' || !boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 100;
    const y = e.clientY - rect.top - 40;
    
    const title = prompt('Titel für den Sticker:', 'Neue Idee');
    if (!title) return;
    
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: currentBook?.id,
          title,
          content: '',
          type: stickerType,
          positionX: x,
          positionY: y,
        }),
      });
      
      if (res.ok) {
        const idea = await res.json();
        setIdeas(prev => [idea, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create sticker:', err);
    }
  };

  // Update idea position
  const updateIdeaPosition = async (id: string, x: number, y: number) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, positionX: x, positionY: y } : i));
    
    try {
      await fetch('/api/ideas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, positionX: x, positionY: y }),
      });
    } catch (err) {
      console.error('Failed to update position:', err);
    }
  };

  // Delete idea
  const deleteIdea = async (id: string) => {
    try {
      await fetch(`/api/ideas?id=${id}`, { method: 'DELETE' });
      setIdeas(prev => prev.filter(i => i.id !== id));
      setConnections(prev => prev.filter(c => c.sourceId !== id && c.targetId !== id));
    } catch (err) {
      console.error('Failed to delete idea:', err);
    }
  };

  // Create connection
  const createConnection = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    
    try {
      const res = await fetch('/api/ideas/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: currentBook?.id,
          sourceId: fromId,
          targetId: toId,
          type: 'related',
        }),
      });
      
      if (res.ok) {
        const conn = await res.json();
        setConnections(prev => [...prev, conn]);
      }
    } catch (err) {
      console.error('Failed to create connection:', err);
    }
    setConnectingFrom(null);
  };

  // AI Analysis
  const analyzeIdeas = async () => {
    if (ideas.length < 2) return;
    
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ideas/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: currentBook?.id }),
      });
      
      if (res.ok) {
        const analysis = await res.json();
        
        await fetch('/api/ideas/analyze', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: currentBook?.id,
            suggestions: analysis,
          }),
        });
        
        await loadIdeas();
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Integrate into Plot Structure
  const integrateIntoPlot = async () => {
    if (ideas.length === 0) return;
    
    setIsIntegrating(true);
    try {
      const res = await fetch('/api/ideas/integrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookId: currentBook?.id,
          ideas: ideas.filter(i => i.status !== 'converted')
        }),
      });
      
      if (res.ok) {
        const result = await res.json();
        // Reload to see updated plot structure
        await loadIdeas();
        onIntegrateIntoPlot?.();
        alert(`${result.beatsCreated} Story-Beats aus ${result.ideasUsed} Ideen erstellt!`);
      }
    } catch (err) {
      console.error('Integration failed:', err);
    } finally {
      setIsIntegrating(false);
    }
  };

  // Drawing handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (tool !== 'draw') return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setCurrentPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || tool !== 'draw') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setCurrentPath(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      setDrawings(prev => [...prev, {
        id: `draw-${Date.now()}`,
        points: currentPath,
        color: drawColor,
        width: 3
      }]);
    }
    setCurrentPath([]);
    redrawCanvas();
  };

  // Drag handlers for ideas
  const handleMouseDown = (e: React.MouseEvent, idea: StoryIdea) => {
    if (tool !== 'select') return;
    
    if (connectingFrom) {
      createConnection(connectingFrom, idea.id);
      return;
    }
    
    e.preventDefault();
    setDraggedIdea(idea.id);
    const rect = boardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - idea.positionX,
        y: e.clientY - rect.top - idea.positionY,
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedIdea || !boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 200));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 100));
    
    updateIdeaPosition(draggedIdea, x, y);
  }, [draggedIdea, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedIdea(null);
  }, []);

  useEffect(() => {
    if (draggedIdea) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedIdea, handleMouseMove, handleMouseUp]);

  // Render connection lines
  const renderConnections = () => {
    if (!boardRef.current) return null;
    
    const rect = boardRef.current.getBoundingClientRect();
    
    return connections.map(conn => {
      const source = ideas.find(i => i.id === conn.sourceId);
      const target = ideas.find(i => i.id === conn.targetId);
      if (!source || !target) return null;
      
      const x1 = source.positionX + 100;
      const y1 = source.positionY + 40;
      const x2 = target.positionX + 100;
      const y2 = target.positionY + 40;
      
      const color = CONNECTION_COLORS[conn.type as keyof typeof CONNECTION_COLORS] || '#94a3b8';
      
      return (
        <svg
          key={conn.id}
          className="absolute inset-0 pointer-events-none"
          style={{ width: rect.width, height: rect.height }}
        >
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={conn.isAiSuggested ? 3 : 2}
            strokeDasharray={conn.isAiSuggested ? '5,5' : '0'}
            opacity={0.6}
          />
          {conn.label && (
            <text
              x={(x1 + x2) / 2}
              y={(y1 + y2) / 2 - 5}
              fill={color}
              fontSize="10"
              textAnchor="middle"
            >
              {conn.label}
            </text>
          )}
        </svg>
      );
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Kreativ-Board</h2>
            
            {/* Tools */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setTool('select')}
                className={cn(
                  "p-2 rounded transition-colors",
                  tool === 'select' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-600 hover:text-slate-900'
                )}
                title="Auswählen & Verschieben"
              >
                <MousePointer2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTool('draw')}
                className={cn(
                  "p-2 rounded transition-colors",
                  tool === 'draw' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-600 hover:text-slate-900'
                )}
                title="Freihand zeichnen"
              >
                <PenTool className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTool('sticker')}
                className={cn(
                  "p-2 rounded transition-colors",
                  tool === 'sticker' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-600 hover:text-slate-900'
                )}
                title="Sticker platzieren"
              >
                <Sticker className="h-4 w-4" />
              </button>
            </div>

            {/* Tool Options */}
            {tool === 'draw' && (
              <div className="flex items-center gap-1">
                {['#8b5cf6', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#1f2937'].map(color => (
                  <button
                    key={color}
                    onClick={() => setDrawColor(color)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2",
                      drawColor === color ? 'border-slate-900 scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}

            {tool === 'sticker' && (
              <select
                value={stickerType}
                onChange={(e) => setStickerType(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                {Object.entries(IDEA_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {connectingFrom && (
              <Badge variant="secondary" className="gap-2">
                <Link2 className="h-3 w-3" />
                Klicke auf Ziel
                <button onClick={() => setConnectingFrom(null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConnectingFrom(connectingFrom ? null : 'select')}
              disabled={ideas.length < 2}
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              Verbinden
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeIdeas}
              disabled={isAnalyzing || ideas.length < 2}
              className="gap-2"
            >
              {isAnalyzing ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              KI-Analyse
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={integrateIntoPlot}
                    disabled={isIntegrating || ideas.length === 0}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600"
                  >
                    {isIntegrating ? (
                      <Sparkles className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    In Plot überführen
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">Wie funktioniert das?</p>
                    <p className="text-xs">
                      Die KI analysiert deine Ideen und ordnet sie den passenden 
                      Story-Beats zu:
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>• <strong>Szenen-Ideen</strong> → Werden zu Kapiteln</li>
                      <li>• <strong>Charakter-Ideen</strong> → Erweitern bestehende Figuren</li>
                      <li>• <strong>Plot-Punkte</strong> → Werden zu Story-Beats</li>
                      <li>• <strong>Themen</strong> → Fließen in das Konzept ein</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Dialog open={showNewIdeaDialog} onOpenChange={setShowNewIdeaDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Idee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Idee</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Typ</label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(IDEA_TYPES).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setStickerType(key as any)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                            stickerType === key 
                              ? config.color + " ring-2 ring-offset-1"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <config.icon className="h-4 w-4" />
                          <span className="text-sm">{config.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Titel</label>
                    <Input
                      value={newIdea.title}
                      onChange={e => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Gib deiner Idee einen Namen..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Beschreibung</label>
                    <Textarea
                      value={newIdea.content}
                      onChange={e => setNewIdea(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Beschreibe deine Idee..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={() => createIdea()} disabled={!newIdea.title.trim()} className="w-full">
                    Idee erstellen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Legend & Info */}
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          {Object.entries(IDEA_TYPES).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded border", config.color.split(' ')[0])} />
              <span>{config.label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-4">
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Lightbulb className="h-3 w-3" />
              <span>Sammle Ideen → Verbinde sie → Überführe in Plot</span>
            </div>
            <span className="text-slate-400">
              {tool === 'draw' && 'Ziehen zum Zeichnen'}
              {tool === 'sticker' && 'Klicken zum Platzieren'}
              {tool === 'select' && 'Ziehen zum Verschieben'}
            </span>
          </div>
        </div>
      </div>

      {/* Board Area */}
      <div 
        ref={boardRef}
        className="flex-1 relative overflow-auto bg-slate-50 cursor-crosshair"
        style={{ minHeight: 600 }}
        onClick={(e) => {
          if (tool === 'sticker') dropSticker(e);
        }}
      >
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #cbd5e1 1px, transparent 1px),
              linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-auto"
          style={{ zIndex: 10 }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
        
        {/* Connection lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          {renderConnections()}
        </div>
        
        {/* Idea Cards */}
        {ideas.map(idea => {
          const typeConfig = IDEA_TYPES[idea.type] || IDEA_TYPES.idea;
          const TypeIcon = typeConfig.icon;
          
          return (
            <div
              key={idea.id}
              className={cn(
                "absolute w-52 rounded-lg border-2 shadow-sm transition-shadow hover:shadow-md",
                typeConfig.color,
                tool === 'select' && "cursor-move",
                tool === 'sticker' && "pointer-events-none",
                draggedIdea === idea.id && "shadow-lg ring-2 ring-violet-500 z-50"
              )}
              style={{
                left: idea.positionX,
                top: idea.positionY,
                zIndex: draggedIdea === idea.id ? 100 : 20,
              }}
              onMouseDown={tool === 'select' ? (e) => handleMouseDown(e, idea) : undefined}
            >
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <TypeIcon className="h-4 w-4 opacity-70" />
                    <span className="text-xs font-medium opacity-70">{typeConfig.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {idea.aiSummary && (
                      <div title="KI-analysiert">
                        <Sparkles className="h-3 w-3 text-violet-500" />
                      </div>
                    )}
                    {idea.status === 'converted' && (
                      <div title="In Plot eingefügt">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteIdea(idea.id);
                      }}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-sm mb-1 leading-tight">{idea.title}</h3>
                <p className="text-xs opacity-80 line-clamp-3">{idea.content}</p>
                
                {idea.aiSummary && (
                  <div className="mt-2 text-[10px] text-violet-700 bg-violet-50 px-2 py-1 rounded">
                    {idea.aiSummary}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {ideas.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-slate-400">
              <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">Noch keine Ideen</p>
              <p className="text-sm">Wähle ein Tool oder erstelle deine erste Idee</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
