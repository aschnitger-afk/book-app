'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { RelationshipGraph } from '@/components/character/RelationshipGraph';
import { CharacterSoulprint } from '@/components/character/CharacterSoulprint';
import { VoiceAnalyzer } from '@/components/character/VoiceAnalyzer';
import { DecisionSimulator } from '@/components/character/DecisionSimulator';
import { CharacterList } from '@/components/character/CharacterList';
import { CharacterDetail } from '@/components/character/CharacterDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Users, Network, Brain, Mic, HelpCircle, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CharacterPhase() {
  const { currentBook, characters, fetchCharacters, updateCharacter } = useAppStore();
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [isCreating, setIsCreating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (currentBook?.id) {
      fetchCharacters(currentBook.id);
    }
  }, [currentBook?.id]);

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  const handleCharacterCreated = (character: any) => {
    setIsCreating(false);
    setSelectedCharacterId(character.id);
    setActiveTab('detail');
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Left Sidebar - Character List */}
      <div className="w-72 border-r bg-white/80 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-600" />
            Charaktere
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {characters.length} Figuren
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {characters.map((character) => (
            <motion.button
              key={character.id}
              onClick={() => {
                setSelectedCharacterId(character.id);
                setActiveTab('detail');
              }}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                selectedCharacterId === character.id
                  ? 'bg-violet-100 border-violet-300 shadow-md'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {character.portraitUrl ? (
                    <img 
                      src={character.portraitUrl} 
                      alt={character.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    character.name?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{character.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {character.role || 'Keine Rolle'}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="p-3 border-t">
          <Button 
            onClick={() => setIsCreating(true)}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Charakter
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full p-8"
            >
              <CharacterList 
                onSelect={handleCharacterCreated}
                onCancel={() => setIsCreating(false)}
              />
            </motion.div>
          ) : selectedCharacter ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b bg-white/60 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                      {selectedCharacter.portraitUrl ? (
                        <img 
                          src={selectedCharacter.portraitUrl} 
                          alt={selectedCharacter.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedCharacter.name?.[0]?.toUpperCase()
                      )}
                      
                      {/* Generating overlay */}
                      {generatingImage === selectedCharacter.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{selectedCharacter.name}</h1>
                      <p className="text-slate-500">{selectedCharacter.role}</p>
                    </div>
                  </div>
                  
                  {/* Generate Portrait Button */}
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!currentBook || generatingImage) return;
                        
                        setGeneratingImage(selectedCharacter.id);
                        setImageError(null);
                        
                        try {
                          // Build prompt from character description
                          const prompt = `Portrait of ${selectedCharacter.name}, ${selectedCharacter.role || 'character'}. ${selectedCharacter.description || ''} ${selectedCharacter.appearance || ''}`.trim();
                          
                          console.log('Generating image with prompt:', prompt);
                          
                          const response = await fetch('/api/images/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              prompt: prompt || `Portrait of ${selectedCharacter.name}, fictional character`,
                              imageType: 'character',
                              bookId: currentBook.id,
                              characterId: selectedCharacter.id,
                              width: 1024,
                              height: 1024,
                            }),
                          });
                          
                          const data = await response.json();
                          console.log('Image generation response:', data);
                          
                          if (response.ok && data.imageUrl) {
                            // Update character with new portrait
                            await fetch(`/api/characters/${selectedCharacter.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ portraitUrl: data.imageUrl }),
                            });
                            
                            // Update local state
                            updateCharacter(selectedCharacter.id, { portraitUrl: data.imageUrl });
                          } else {
                            const errorMsg = data.error || data.details || 'Unbekannter Fehler';
                            console.error('Image generation failed:', errorMsg);
                            setImageError(errorMsg);
                          }
                        } catch (error: any) {
                          console.error('Image generation error:', error);
                          setImageError(error.message || 'Netzwerkfehler');
                        } finally {
                          setGeneratingImage(null);
                        }
                      }}
                      disabled={generatingImage === selectedCharacter.id}
                      className="gap-2"
                    >
                      {generatingImage === selectedCharacter.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generiere...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Portrait
                        </>
                      )}
                    </Button>
                    
                    {imageError && (
                      <p className="text-xs text-red-500 max-w-[200px] text-right">
                        Fehler: {imageError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="px-6 border-b bg-white/40">
                  <TabsList className="bg-transparent h-14">
                    <TabsTrigger 
                      value="detail" 
                      className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Profil
                    </TabsTrigger>
                    <TabsTrigger 
                      value="relationships"
                      className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
                    >
                      <Network className="h-4 w-4 mr-2" />
                      Beziehungen
                    </TabsTrigger>
                    <TabsTrigger 
                      value="soulprint"
                      className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Psyche
                    </TabsTrigger>
                    <TabsTrigger 
                      value="voice"
                      className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Stimme
                    </TabsTrigger>
                    <TabsTrigger 
                      value="simulator"
                      className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Simulator
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-auto p-6">
                  <TabsContent value="detail" className="mt-0 h-full">
                    <CharacterDetail character={selectedCharacter} />
                  </TabsContent>
                  
                  <TabsContent value="relationships" className="mt-0 h-full">
                    <RelationshipGraph 
                      bookId={currentBook?.id || ''} 
                      characters={characters}
                      selectedCharacter={selectedCharacter}
                    />
                  </TabsContent>
                  
                  <TabsContent value="soulprint" className="mt-0 h-full">
                    <CharacterSoulprint character={selectedCharacter} />
                  </TabsContent>
                  
                  <TabsContent value="voice" className="mt-0 h-full">
                    <VoiceAnalyzer character={selectedCharacter} />
                  </TabsContent>
                  
                  <TabsContent value="simulator" className="mt-0 h-full">
                    <DecisionSimulator character={selectedCharacter} />
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-12 w-12 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700">Kein Charakter ausgewählt</h3>
                <p className="text-slate-500 mt-2">Wähle einen Charakter aus oder erstelle einen neuen</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
