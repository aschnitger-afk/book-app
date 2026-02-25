'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, BookOpen, ChevronRight, FileText, Users, 
  Map, Settings, MoreVertical, Trash2, Edit2 
} from 'lucide-react';
import { useAppStore, Book, Chapter, Character, PlotPoint } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BookSidebarProps {
  onSelectChapter: (chapter: Chapter) => void;
  onSelectCharacter: (character: Character) => void;
  onSelectPlot: () => void;
}

export function BookSidebar({ onSelectChapter, onSelectCharacter, onSelectPlot }: BookSidebarProps) {
  const { 
    currentBookId, 
    chapters, 
    characters, 
    plotPoints,
    setBooks, 
    setChapters, 
    setCharacters, 
    setPlotPoints,
    setCurrentChapter 
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'chapters' | 'characters' | 'plot'>('chapters');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newCharacterName, setNewCharacterName] = useState('');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);

  useEffect(() => {
    if (currentBookId) {
      fetchBookData();
    }
  }, [currentBookId]);

  const fetchBookData = async () => {
    if (!currentBookId) return;
    
    try {
      const response = await fetch(`/api/books/${currentBookId}`);
      const book = await response.json();
      setChapters(book.chapters || []);
      setCharacters(book.characters || []);
      setPlotPoints(book.plotPoints || []);
    } catch (error) {
      console.error('Failed to fetch book data:', error);
    }
  };

  const handleAddChapter = async () => {
    if (!currentBookId || !newChapterTitle.trim()) return;
    
    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newChapterTitle, bookId: currentBookId }),
      });
      
      const chapter = await response.json();
      setChapters([...chapters, chapter]);
      setNewChapterTitle('');
      setIsAddingChapter(false);
    } catch (error) {
      console.error('Failed to add chapter:', error);
    }
  };

  const handleAddCharacter = async () => {
    if (!currentBookId || !newCharacterName.trim()) return;
    
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCharacterName, bookId: currentBookId }),
      });
      
      const character = await response.json();
      setCharacters([...characters, character]);
      setNewCharacterName('');
      setIsAddingCharacter(false);
    } catch (error) {
      console.error('Failed to add character:', error);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    try {
      await fetch(`/api/chapters/${id}`, { method: 'DELETE' });
      setChapters(chapters.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete chapter:', error);
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      await fetch(`/api/characters/${id}`, { method: 'DELETE' });
      setCharacters(characters.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete character:', error);
    }
  };

  if (!currentBookId) {
    return (
      <div className="w-64 border-r bg-slate-50 h-full flex items-center justify-center p-4">
        <p className="text-sm text-slate-500 text-center">
          Select or create a book to get started
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-slate-50 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('chapters')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'chapters' 
              ? 'text-violet-600 border-b-2 border-violet-600' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4 mx-auto" />
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'characters' 
              ? 'text-violet-600 border-b-2 border-violet-600' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4 mx-auto" />
        </button>
        <button
          onClick={() => { setActiveTab('plot'); onSelectPlot(); }}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'plot' 
              ? 'text-violet-600 border-b-2 border-violet-600' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Map className="h-4 w-4 mx-auto" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        {activeTab === 'chapters' && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase">Chapters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsAddingChapter(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {isAddingChapter && (
              <div className="mb-2 space-y-2">
                <Input
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="Chapter title"
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-7 text-xs" onClick={handleAddChapter}>
                    Add
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsAddingChapter(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-200 cursor-pointer"
                  onClick={() => { onSelectChapter(chapter); setCurrentChapter(chapter.id); }}
                >
                  <span className="text-xs text-slate-400 w-4">{index + 1}</span>
                  <span className="text-sm truncate flex-1">{chapter.title}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDeleteChapter(chapter.id)} className="text-red-600">
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase">Characters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsAddingCharacter(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {isAddingCharacter && (
              <div className="mb-2 space-y-2">
                <Input
                  value={newCharacterName}
                  onChange={(e) => setNewCharacterName(e.target.value)}
                  placeholder="Character name"
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCharacter()}
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-7 text-xs" onClick={handleAddCharacter}>
                    Add
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsAddingCharacter(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-200 cursor-pointer"
                  onClick={() => onSelectCharacter(character)}
                >
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-xs text-violet-600 font-medium">
                      {character.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm truncate flex-1">{character.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDeleteCharacter(character.id)} className="text-red-600">
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
