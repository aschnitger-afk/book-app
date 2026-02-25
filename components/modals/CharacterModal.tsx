'use client';

import { useState, useEffect } from 'react';
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
import { Sparkles, Save, User } from 'lucide-react';
import { Character, useAppStore } from '@/lib/store';

interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Partial<Character>) => void;
}

export function CharacterModal({ character, isOpen, onClose, onSave }: CharacterModalProps) {
  const { currentBook } = useAppStore();
  const [formData, setFormData] = useState<Partial<Character>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (character) {
      setFormData({ ...character });
    }
  }, [character]);

  const handleChange = (field: keyof Character, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const generateCharacterDetails = async (type: 'background' | 'goals' | 'conflicts') => {
    setIsGenerating(true);
    try {
      const prompt = `Generate ${type} for a character named "${formData.name}"${formData.role ? ` who is a ${formData.role}` : ''}${formData.description ? `. Description: ${formData.description}` : ''}`;
      
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: 'character',
          bookId: currentBook?.id,
        }),
      });
      
      const data = await response.json();
      handleChange(type, data.result);
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!character) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {formData.name || 'Character Details'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Character name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role || ''}
                  onChange={(e) => handleChange('role', e.target.value)}
                  placeholder="e.g., Protagonist, Antagonist"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Physical appearance and first impression"
                rows={3}
              />
            </div>

            <Tabs defaultValue="background" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="background" className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateCharacterDetails('background')}
                    disabled={isGenerating}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  value={formData.background || ''}
                  onChange={(e) => handleChange('background', e.target.value)}
                  placeholder="Character's history, upbringing, formative experiences..."
                  rows={6}
                />
              </TabsContent>
              
              <TabsContent value="goals" className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateCharacterDetails('goals')}
                    disabled={isGenerating}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  value={formData.goals || ''}
                  onChange={(e) => handleChange('goals', e.target.value)}
                  placeholder="What does this character want? Short-term and long-term goals..."
                  rows={6}
                />
              </TabsContent>
              
              <TabsContent value="conflicts" className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateCharacterDetails('conflicts')}
                    disabled={isGenerating}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  value={formData.conflicts || ''}
                  onChange={(e) => handleChange('conflicts', e.target.value)}
                  placeholder="Internal and external conflicts this character faces..."
                  rows={6}
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any other details about this character..."
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Character
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
