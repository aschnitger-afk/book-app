'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Map, Sparkles, Trash2 } from 'lucide-react';
import { useAppStore, PlotPoint } from '@/lib/store';

interface PlotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlotModal({ isOpen, onClose }: PlotModalProps) {
  const { currentBookId, currentBook, plotPoints, setPlotPoints } = useAppStore();
  const [activeAct, setActiveAct] = useState('act1');
  const [newPointTitle, setNewPointTitle] = useState('');
  const [editingPoint, setEditingPoint] = useState<PlotPoint | null>(null);

  const acts = [
    { id: 'act1', label: 'Act I: Setup', color: 'bg-blue-100 text-blue-700' },
    { id: 'act2', label: 'Act II: Confrontation', color: 'bg-amber-100 text-amber-700' },
    { id: 'act3', label: 'Act III: Resolution', color: 'bg-green-100 text-green-700' },
  ];

  const handleAddPoint = async () => {
    if (!currentBookId || !newPointTitle.trim()) return;

    try {
      const response = await fetch('/api/plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPointTitle,
          act: activeAct,
          bookId: currentBookId
        }),
      });

      const point = await response.json();
      setPlotPoints([...plotPoints, point]);
      setNewPointTitle('');
    } catch (error) {
      console.error('Failed to add plot point:', error);
    }
  };

  const handleUpdatePoint = async (point: PlotPoint) => {
    try {
      await fetch(`/api/plot/${point.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(point),
      });

      setPlotPoints(plotPoints.map(p => p.id === point.id ? point : p));
      setEditingPoint(null);
    } catch (error) {
      console.error('Failed to update plot point:', error);
    }
  };

  const handleDeletePoint = async (id: string) => {
    try {
      await fetch(`/api/plot/${id}`, { method: 'DELETE' });
      setPlotPoints(plotPoints.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete plot point:', error);
    }
  };

  const generatePlotIdea = async () => {
    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a plot point idea for ${activeAct} of a story`,
          type: 'plot',
          bookId: currentBook?.id,
        }),
      });

      const data = await response.json();
      // Parse the result to extract title and description
      const lines = data.result.split('\n').filter((l: string) => l.trim());
      const title = lines[0]?.replace(/^[\d\s\-\.]+/, '').trim() || 'New Plot Point';
      const description = lines.slice(1).join('\n').trim();
      
      // Create the plot point
      const createResponse = await fetch('/api/plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          act: activeAct,
          bookId: currentBookId
        }),
      });

      const point = await createResponse.json();
      setPlotPoints([...plotPoints, point]);
    } catch (error) {
      console.error('Failed to generate plot idea:', error);
    }
  };

  const getPointsForAct = (act: string) => 
    plotPoints.filter(p => p.act === act).sort((a, b) => a.order - b.order);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Plot Structure
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeAct} onValueChange={setActiveAct} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {acts.map(act => (
              <TabsTrigger key={act.id} value={act.id}>
                {act.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {acts.map(act => (
            <TabsContent key={act.id} value={act.id}>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newPointTitle}
                    onChange={(e) => setNewPointTitle(e.target.value)}
                    placeholder={`Add a plot point to ${act.label}...`}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPoint()}
                  />
                  <Button onClick={handleAddPoint}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={generatePlotIdea}>
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {getPointsForAct(act.id).map((point, index) => (
                      <div
                        key={point.id}
                        className="p-4 border rounded-lg hover:border-violet-300 transition-colors"
                      >
                        {editingPoint?.id === point.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editingPoint.title}
                              onChange={(e) => setEditingPoint({ ...editingPoint, title: e.target.value })}
                              placeholder="Plot point title"
                            />
                            <Textarea
                              value={editingPoint.description || ''}
                              onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                              placeholder="Description..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUpdatePoint(editingPoint)}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingPoint(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${act.color}`}>
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="font-medium cursor-pointer hover:text-violet-600"
                                onClick={() => setEditingPoint(point)}
                              >
                                {point.title}
                              </h4>
                              {point.description && (
                                <p className="text-sm text-slate-600 mt-1">{point.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 shrink-0 text-red-500"
                              onClick={() => handleDeletePoint(point.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
