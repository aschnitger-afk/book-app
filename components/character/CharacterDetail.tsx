'use client';

import { useState } from 'react';
import { Character } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Save, User, Target, Heart, AlertCircle, Zap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface CharacterDetailProps {
  character: Character;
}

export function CharacterDetail({ character }: CharacterDetailProps) {
  const [formData, setFormData] = useState(character);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof Character, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateField = async (field: string) => {
    setIsGenerating(prev => ({ ...prev, [field]: true }));
    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate ${field} for character "${formData.name}" who is ${formData.role || 'a character'}. 
          Current info: ${formData.description || 'No description yet'}
          ${formData.background ? `Background: ${formData.background}` : ''}`,
          type: 'character',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        handleChange(field as keyof Character, data.result);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(prev => ({ ...prev, [field]: false }));
    }
  };

  const fieldConfig = [
    { key: 'personality', label: 'Persönlichkeit', icon: User, placeholder: 'Charaktereigenschaften, Macken, Verhaltensweisen...' },
    { key: 'goals', label: 'Ziele', icon: Target, placeholder: 'Was will der Charakter erreichen?' },
    { key: 'motivations', label: 'Motivationen', icon: Heart, placeholder: 'Warum will er das?' },
    { key: 'conflicts', label: 'Konflikte', icon: AlertCircle, placeholder: 'Interne und externe Konflikte...' },
    { key: 'flaws', label: 'Schwächen', icon: AlertCircle, placeholder: 'Charakterfehler, die er überwinden muss...' },
    { key: 'strengths', label: 'Stärken', icon: Zap, placeholder: 'Besondere Fähigkeiten und Talente...' },
    { key: 'arc', label: 'Charakterbogen', icon: BookOpen, placeholder: 'Wie entwickelt sich der Charakter?' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Grundinformationen</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Rolle</Label>
              <Input
                value={formData.role || ''}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="z.B. Protagonist"
              />
            </div>
            <div className="space-y-2">
              <Label>Alter</Label>
              <Input
                value={formData.age || ''}
                onChange={(e) => handleChange('age', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Beruf</Label>
              <Input
                value={formData.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <Label>Beschreibung</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateField('description')}
                disabled={isGenerating.description}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {isGenerating.description ? '...' : 'AI'}
              </Button>
            </div>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Physisches Erscheinungsbild und erster Eindruck..."
              rows={3}
            />
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <Label>Hintergrund</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateField('background')}
                disabled={isGenerating.background}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {isGenerating.background ? '...' : 'AI'}
              </Button>
            </div>
            <Textarea
              value={formData.background || ''}
              onChange={(e) => handleChange('background', e.target.value)}
              placeholder="Vergangenheit und prägende Erfahrungen..."
              rows={3}
            />
          </div>
        </div>

        {/* Detailed Fields Tabs */}
        <Tabs defaultValue="personality" className="bg-white rounded-2xl border">
          <TabsList className="w-full justify-start px-4 pt-4 bg-transparent">
            {fieldConfig.map((field) => (
              <TabsTrigger 
                key={field.key} 
                value={field.key}
                className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
              >
                <field.icon className="h-4 w-4 mr-2" />
                {field.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {fieldConfig.map((field) => (
            <TabsContent key={field.key} value={field.key} className="p-6 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">{field.label}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateField(field.key)}
                    disabled={isGenerating[field.key]}
                  >
                    {isGenerating[field.key] ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                      </motion.div>
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Mit AI generieren
                  </Button>
                </div>
                <Textarea
                  value={(formData as any)[field.key] || ''}
                  onChange={(e) => handleChange(field.key as keyof Character, e.target.value)}
                  placeholder={field.placeholder}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Notes */}
        <div className="bg-white rounded-2xl border p-6">
          <Label className="text-lg font-medium">Notizen</Label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Zusätzliche Notizen, Ideen, Inspirationen..."
            rows={4}
            className="mt-2 resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-violet-600 to-purple-600"
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2"
              >
                <Save className="h-4 w-4" />
              </motion.div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
