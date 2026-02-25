'use client';

import { useState } from 'react';
import { Character } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PolishButton } from '@/components/shared/PolishableTextarea';
import { Sparkles, Save, User, Target, Heart, AlertCircle, Zap, BookOpen, Wand2, Lock, Building2, Tag, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface CharacterDetailProps {
  character: Character;
}

export function CharacterDetail({ character }: CharacterDetailProps) {
  const [formData, setFormData] = useState(character);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [newTag, setNewTag] = useState('');

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

  const addTag = () => {
    if (!newTag.trim()) return;
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
    if (!currentTags.includes(newTag.trim())) {
      const updatedTags = [...currentTags, newTag.trim()].join(', ');
      handleChange('tags', updatedTags);
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
    const updatedTags = currentTags.filter(t => t !== tagToRemove).join(', ');
    handleChange('tags', updatedTags);
  };

  const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  // Field configurations organized by category
  const coreFields = [
    { key: 'personality', label: 'Persönlichkeit', icon: User, placeholder: 'Charaktereigenschaften, Macken, Verhaltensweisen...' },
    { key: 'background', label: 'Hintergrund', icon: BookOpen, placeholder: 'Vergangenheit, prägende Erfahrungen...' },
  ];

  const motivationFields = [
    { key: 'storyGoal', label: 'Ziel in der Geschichte', icon: Target, placeholder: 'Was will der Charakter in dieser Geschichte erreichen?' },
    { key: 'motivations', label: 'Bewusste Motivation', icon: Heart, placeholder: 'Warum will er das? (bewusste Gründe)' },
    { key: 'unconsciousNeed', label: 'Unbewusstes Bedürfnis', icon: Brain, placeholder: 'Was braucht der Charakter wirklich, ohne es zu wissen?' },
  ];

  const conflictFields = [
    { key: 'flaws', label: 'Schwächen & Flaws', icon: AlertCircle, placeholder: 'Welche Fehler machen ihn menschlich?' },
    { key: 'strengths', label: 'Stärken', icon: Zap, placeholder: 'Besondere Fähigkeiten und Talente...' },
    { key: 'conflicts', label: 'Konflikte', icon: AlertCircle, placeholder: 'Interne und externe Konflikte...' },
    { key: 'arc', label: 'Charakterbogen', icon: BookOpen, placeholder: 'Wie entwickelt sich der Charakter?' },
  ];

  const secretFields = [
    { key: 'secret', label: 'Geheimnis', icon: Lock, placeholder: 'Hat der Charakter etwas zu verbergen?' },
    { key: 'affiliation', label: 'Zugehörigkeit', icon: Building2, placeholder: 'Zu welcher Fraktion/Gruppe/Sozialschicht gehört er?' },
  ];

  const renderField = (field: typeof coreFields[0]) => (
    <TabsContent key={field.key} value={field.key} className="mt-0">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium flex items-center gap-2">
            <field.icon className="h-5 w-5 text-violet-500" />
            {field.label}
          </Label>
          <div className="flex gap-2">
            <PolishButton
              text={(formData as any)[field.key] || ''}
              onPolished={(text) => handleChange(field.key as keyof Character, text)}
            />
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
  );

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col min-h-0"
      >
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-6">
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

              {/* Tags */}
              <div className="mt-4 space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Schlagwörter / Tags
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Neues Tag hinzufügen..."
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">Hinzufügen</Button>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <Label>Beschreibung</Label>
                  <div className="flex gap-2">
                    <PolishButton
                      text={formData.description || ''}
                      onPolished={(text) => handleChange('description', text)}
                      className="h-8 text-xs"
                    />
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
                </div>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Physisches Erscheinungsbild und erster Eindruck..."
                  rows={3}
                />
              </div>
            </div>

            {/* Core Fields Tabs */}
            <Tabs defaultValue="personality" className="bg-white rounded-2xl border">
              <TabsList className="w-full justify-start px-4 pt-4 bg-transparent flex-wrap">
                <TabsTrigger value="personality" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <User className="h-4 w-4 mr-2" />
                  Persönlichkeit
                </TabsTrigger>
                <TabsTrigger value="background" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Hintergrund
                </TabsTrigger>
                <TabsTrigger value="storyGoal" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <Target className="h-4 w-4 mr-2" />
                  Story-Ziel
                </TabsTrigger>
                <TabsTrigger value="motivations" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <Heart className="h-4 w-4 mr-2" />
                  Motivation
                </TabsTrigger>
                <TabsTrigger value="unconsciousNeed" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <Brain className="h-4 w-4 mr-2" />
                  Bedürfnis
                </TabsTrigger>
                <TabsTrigger value="flaws" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Flaws
                </TabsTrigger>
                <TabsTrigger value="strengths" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Stärken
                </TabsTrigger>
                <TabsTrigger value="conflicts" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Konflikte
                </TabsTrigger>
                <TabsTrigger value="arc" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Arc
                </TabsTrigger>
                <TabsTrigger value="secret" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <Lock className="h-4 w-4 mr-2" />
                  Geheimnis
                </TabsTrigger>
                <TabsTrigger value="affiliation" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                  <Building2 className="h-4 w-4 mr-2" />
                  Zugehörigkeit
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                {coreFields.map(renderField)}
                {motivationFields.map(renderField)}
                {conflictFields.map(renderField)}
                {secretFields.map(renderField)}
              </div>
            </Tabs>

            {/* Notes */}
            <div className="bg-white rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Notizen</Label>
                <PolishButton
                  text={formData.notes || ''}
                  onPolished={(text) => handleChange('notes', text)}
                />
              </div>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Zusätzliche Notizen, Ideen, Inspirationen..."
                rows={4}
                className="mt-2 resize-none"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4">
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
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}
