'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { RelationshipGraph } from '@/components/character/RelationshipGraph';
import { CharacterSoulprint } from '@/components/character/CharacterSoulprint';
import { VoiceAnalyzer } from '@/components/character/VoiceAnalyzer';
import { DecisionSimulator } from '@/components/character/DecisionSimulator';
import { CharacterDetail } from '@/components/character/CharacterDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Users, Network, Brain, Mic, HelpCircle, Camera, 
  Loader2, Sparkles, X, User, Target, Search, Filter,
  ChevronRight, Heart, Ghost, Wand2, RefreshCw, MoreVertical,
  Trash2, Edit3, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Compact Character List Item
function CharacterListItem({ 
  character, 
  isSelected, 
  onClick,
  onGenerateImage,
  isGenerating 
}: { 
  character: any; 
  isSelected: boolean;
  onClick: () => void;
  onGenerateImage: (e: React.MouseEvent) => void;
  isGenerating: boolean;
}) {
  const roleColors: Record<string, string> = {
    protagonist: 'bg-amber-100 text-amber-700 border-amber-300',
    antagonist: 'bg-red-100 text-red-700 border-red-300',
    supporting: 'bg-blue-100 text-blue-700 border-blue-300',
    mentor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    love: 'bg-pink-100 text-pink-700 border-pink-300',
    sidekick: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  };

  const roleLabels: Record<string, string> = {
    protagonist: 'Protagonist',
    antagonist: 'Antagonist',
    supporting: 'Nebenfigur',
    mentor: 'Mentor',
    love: 'Love Interest',
    sidekick: 'Sidekick',
  };

  const style = roleColors[character.role] || 'bg-violet-100 text-violet-700 border-violet-300';

  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
        isSelected 
          ? "bg-violet-50 border-violet-400 shadow-sm" 
          : "bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden",
          character.portraitUrl ? "" : "bg-gradient-to-br from-violet-400 to-purple-500"
        )}>
          {character.portraitUrl ? (
            <img 
              src={character.portraitUrl} 
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-7 w-7 text-white/70" />
          )}
        </div>
        
        {/* Generate Button on Hover */}
        {!character.portraitUrl && (
          <button
            onClick={onGenerateImage}
            disabled={isGenerating}
            className="absolute -bottom-1 -right-1 p-1.5 bg-violet-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-700 disabled:opacity-100"
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Camera className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "font-semibold truncate",
            isSelected ? "text-violet-900" : "text-slate-800"
          )}>
            {character.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", style)}>
            {roleLabels[character.role] || character.role || 'Figur'}
          </Badge>
          {character.age && (
            <span className="text-xs text-slate-400">{character.age}</span>
          )}
        </div>

        {character.storyGoal && (
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 flex items-center gap-1">
            <Target className="h-3 w-3 text-violet-400 shrink-0" />
            {character.storyGoal}
          </p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className={cn(
        "h-5 w-5 shrink-0 transition-colors",
        isSelected ? "text-violet-500" : "text-slate-300 group-hover:text-slate-400"
      )} />
    </motion.div>
  );
}

// Empty State for List
function EmptyCharacterList({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-8 px-4">
      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
        <Users className="h-8 w-8 text-slate-300" />
      </div>
      <p className="text-sm text-slate-500 mb-3">Noch keine Charaktere</p>
      <Button onClick={onCreate} size="sm" className="bg-violet-600">
        <Plus className="h-4 w-4 mr-1" />
        Erstellen
      </Button>
    </div>
  );
}

// Create Form
function CreateCharacterForm({ onCancel, onCreated, bookId }: { 
  onCancel: () => void; 
  onCreated: (char: any) => void; 
  bookId: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    role: 'supporting',
    age: '',
    occupation: '',
    storyGoal: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const roles = [
    { value: 'protagonist', label: 'Protagonist', color: 'bg-amber-100 text-amber-700' },
    { value: 'antagonist', label: 'Antagonist', color: 'bg-red-100 text-red-700' },
    { value: 'supporting', label: 'Nebenfigur', color: 'bg-blue-100 text-blue-700' },
    { value: 'mentor', label: 'Mentor', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'love', label: 'Love Interest', color: 'bg-pink-100 text-pink-700' },
    { value: 'sidekick', label: 'Sidekick', color: 'bg-cyan-100 text-cyan-700' },
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, bookId }),
      });
      
      const character = await response.json();
      onCreated(character);
    } catch (error) {
      console.error('Failed to create:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="h-48 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Zurück</span>
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white">Neuen Charakter erstellen</h1>
          <p className="text-white/70 mt-1">Gib deiner Figur Leben und Persönlichkeit</p>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 max-w-3xl">
        <div className="grid grid-cols-2 gap-6">
          {/* Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="z.B. Elena Mueller"
              className="text-lg h-12"
              autoFocus
            />
          </div>

          {/* Role */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Rolle in der Geschichte</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all border-2",
                    formData.role === role.value
                      ? cn("border-current", role.color)
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age & Occupation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Alter</label>
            <Input
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="z.B. 28"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Beruf</label>
            <Input
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="z.B. Journalistin"
            />
          </div>

          {/* Story Goal */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Ziel in der Geschichte</label>
            <Input
              value={formData.storyGoal}
              onChange={(e) => setFormData({ ...formData, storyGoal: e.target.value })}
              placeholder="Was will die Figur erreichen?"
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Aussehen, Persönlichkeit, Hintergrundgeschichte..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || isSaving}
            className="bg-gradient-to-r from-violet-600 to-purple-600 px-8"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Erstellen...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Charakter erstellen
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} size="lg">
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function CharacterPhase() {
  const { currentBook, characters, fetchCharacters, updateCharacter } = useAppStore();
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (currentBook?.id) {
      fetchCharacters(currentBook.id);
    }
  }, [currentBook?.id]);

  // Select first character if none selected
  useEffect(() => {
    if (characters.length > 0 && !selectedCharacter && !isCreating) {
      setSelectedCharacter(characters[0]);
    }
  }, [characters, selectedCharacter, isCreating]);

  const filteredCharacters = characters.filter((char: any) => 
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateImage = async (e: React.MouseEvent, character: any) => {
    e.stopPropagation();
    if (!currentBook || generatingId) return;
    
    setGeneratingId(character.id);
    try {
      const prompt = `Professional character portrait of ${character.name}, ${character.role || 'character'}. ${character.appearance || ''} ${character.description || ''}`.trim();
      
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt || `Portrait of ${character.name}`,
          imageType: 'character',
          bookId: currentBook.id,
          characterId: character.id,
        }),
      });
      
      const data = await response.json();
      if (response.ok && data.imageUrl) {
        await fetch(`/api/characters/${character.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portraitUrl: data.imageUrl }),
        });
        updateCharacter(character.id, { portraitUrl: data.imageUrl });
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setGeneratingId(null);
    }
  };

  if (isCreating && currentBook) {
    return (
      <CreateCharacterForm 
        onCancel={() => setIsCreating(false)}
        onCreated={(char) => {
          setIsCreating(false);
          setSelectedCharacter(char);
          fetchCharacters(currentBook.id);
        }}
        bookId={currentBook.id}
      />
    );
  }

  return (
    <div className="h-full flex">
      {/* LEFT: Character List */}
      <div className="w-80 border-r bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-slate-800">Charaktere</h2>
              <p className="text-xs text-slate-500">{characters.length} Figuren</p>
            </div>
            <Button 
              size="sm" 
              onClick={() => setIsCreating(true)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..."
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1 p-3">
          {characters.length === 0 ? (
            <EmptyCharacterList onCreate={() => setIsCreating(true)} />
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredCharacters.map((character: any) => (
                  <CharacterListItem
                    key={character.id}
                    character={character}
                    isSelected={selectedCharacter?.id === character.id}
                    onClick={() => setSelectedCharacter(character)}
                    onGenerateImage={(e) => generateImage(e, character)}
                    isGenerating={generatingId === character.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* CENTER: Detail View */}
      <div className="flex-1 bg-white flex flex-col min-w-0">
        {selectedCharacter ? (
          <>
            {/* Header with Large Portrait */}
            <div className="h-56 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-20 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
                <div className="absolute bottom-0 left-10 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
              </div>

              <div className="relative h-full flex items-end px-8 pb-6">
                {/* Large Portrait */}
                <div className="relative -mb-8">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 rounded-2xl bg-white shadow-2xl overflow-hidden ring-4 ring-white"
                  >
                    {selectedCharacter.portraitUrl ? (
                      <img 
                        src={selectedCharacter.portraitUrl} 
                        alt={selectedCharacter.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                        <User className="h-16 w-16 text-violet-300" />
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Generate Button */}
                  <button
                    onClick={(e) => generateImage(e, selectedCharacter)}
                    disabled={generatingId === selectedCharacter.id}
                    className="absolute -bottom-2 -right-2 p-2.5 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-all disabled:opacity-50 hover:scale-110 active:scale-95"
                    title="KI-Portrait generieren"
                  >
                    {generatingId === selectedCharacter.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Name & Info */}
                <div className="ml-6 mb-2 text-white flex-1">
                  <motion.h1 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl font-bold"
                  >
                    {selectedCharacter.name}
                  </motion.h1>
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 mt-2 text-white/80"
                  >
                    <Badge className="bg-white/20 text-white border-0 capitalize text-xs">
                      {selectedCharacter.role || 'Figur'}
                    </Badge>
                    {selectedCharacter.age && (
                      <span className="text-sm">{selectedCharacter.age} Jahre</span>
                    )}
                    {selectedCharacter.occupation && (
                      <span className="text-sm">• {selectedCharacter.occupation}</span>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="pt-10 px-6 border-b bg-white">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100 p-1">
                  <TabsTrigger value="profile" className="gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="relationships" className="gap-2">
                    <Network className="h-4 w-4" />
                    Beziehungen
                  </TabsTrigger>
                  <TabsTrigger value="psyche" className="gap-2">
                    <Brain className="h-4 w-4" />
                    Psyche
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="gap-2">
                    <Mic className="h-4 w-4" />
                    Stimme
                  </TabsTrigger>
                  <TabsTrigger value="simulator" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Simulator
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto bg-slate-50 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  {activeTab === 'profile' && (
                    <CharacterDetail character={selectedCharacter} />
                  )}
                  {activeTab === 'relationships' && currentBook && (
                    <RelationshipGraph 
                      bookId={currentBook.id} 
                      characters={characters}
                      selectedCharacter={selectedCharacter}
                    />
                  )}
                  {activeTab === 'psyche' && (
                    <CharacterSoulprint character={selectedCharacter} />
                  )}
                  {activeTab === 'voice' && (
                    <VoiceAnalyzer character={selectedCharacter} />
                  )}
                  {activeTab === 'simulator' && (
                    <DecisionSimulator character={selectedCharacter} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="h-12 w-12 text-slate-300" />
              </div>
              <p className="text-slate-500">Wähle einen Charakter aus der Liste</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
