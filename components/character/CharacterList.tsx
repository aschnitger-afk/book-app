'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, UserPlus, X, Loader2, Wand2 } from 'lucide-react';
import { PolishButton } from '@/components/shared/PolishableTextarea';
import { motion } from 'framer-motion';

interface CharacterListProps {
  onSelect: (character: any) => void;
  onCancel: () => void;
}

const roles = [
  { value: 'protagonist', label: 'Protagonist', color: 'bg-blue-500' },
  { value: 'antagonist', label: 'Antagonist', color: 'bg-red-500' },
  { value: 'supporting', label: 'Nebencharakter', color: 'bg-green-500' },
  { value: 'mentor', label: 'Mentor', color: 'bg-amber-500' },
  { value: 'sidekick', label: 'Sidekick', color: 'bg-purple-500' },
  { value: 'love_interest', label: 'Liebesinteresse', color: 'bg-pink-500' },
];

export function CharacterList({ onSelect, onCancel }: CharacterListProps) {
  const { currentBook, addCharacter } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    background: '',
    age: '',
    occupation: '',
  });

  const handleCreate = async () => {
    if (!formData.name.trim() || !currentBook) return;

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bookId: currentBook.id,
        }),
      });

      if (response.ok) {
        const character = await response.json();
        addCharacter(character);
        onSelect(character);
      }
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  const generateWithAI = async () => {
    if (!formData.name.trim() || !currentBook) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a character profile for "${formData.name}" who is a ${formData.role || 'character'}.
          Return a JSON object with:
          - description: physical appearance and first impression (2-3 sentences)
          - background: backstory and formative experiences (3-4 sentences)
          - personality: key traits and quirks (2-3 sentences)
          - goals: what they want (1-2 sentences)
          - motivations: why they want it (1-2 sentences)
          - flaws: character weaknesses (1-2 sentences)
          - strengths: character strengths (1-2 sentences)`,
          type: 'character',
          bookId: currentBook.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        try {
          const aiData = JSON.parse(data.result);
          setFormData(prev => ({
            ...prev,
            description: aiData.description || '',
            background: aiData.background || '',
          }));
        } catch {
          // If not valid JSON, use the text as description
          setFormData(prev => ({
            ...prev,
            description: data.result,
          }));
        }
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-violet-600" />
          Neuer Charakter
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-y-auto space-y-6 bg-white rounded-2xl border p-6"
      >
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Charaktername"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rolle</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rolle wählen" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${role.color}`} />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Alter</Label>
            <Input
              id="age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="z.B. 28 oder 'unbekannt'"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="occupation">Beruf</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="z.B. Detektiv"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Beschreibung</Label>
            <div className="flex gap-2">
              <PolishButton
                text={formData.description}
                onPolished={(text) => setFormData({ ...formData, description: text })}
                className="h-8 text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateWithAI}
                disabled={isGenerating || !formData.name}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1" />
                )}
                Mit AI generieren
              </Button>
            </div>
          </div>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Physisches Erscheinungsbild, erste Eindrücke..."
            rows={3}
          />
        </div>

        {/* Background */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="background">Hintergrund</Label>
            <PolishButton
              text={formData.background}
              onPolished={(text) => setFormData({ ...formData, background: text })}
              className="h-8 text-xs"
            />
          </div>
          <Textarea
            id="background"
            value={formData.background}
            onChange={(e) => setFormData({ ...formData, background: e.target.value })}
            placeholder="Vergangenheit, prägende Erfahrungen..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Abbrechen
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!formData.name.trim()}
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600"
          >
            Charakter erstellen
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
