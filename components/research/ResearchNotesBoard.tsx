'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  StickyNote, X, Tag, Plus, Search, 
  BookOpen, MapPin, Users, Scale, Sparkles, History,
  ChevronDown, ChevronUp, Trash2, Edit2, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  category: 'location' | 'history' | 'culture' | 'politics' | 'technology' | 'general';
  tags: string[];
  source?: string;
  createdAt: string;
  color?: string;
}

const categoryConfig = {
  location: { icon: MapPin, color: 'bg-emerald-100 border-emerald-300 text-emerald-800', label: 'Ort' },
  history: { icon: History, color: 'bg-amber-100 border-amber-300 text-amber-800', label: 'Geschichte' },
  culture: { icon: Users, color: 'bg-purple-100 border-purple-300 text-purple-800', label: 'Kultur' },
  politics: { icon: Scale, color: 'bg-blue-100 border-blue-300 text-blue-800', label: 'Politik' },
  technology: { icon: Sparkles, color: 'bg-cyan-100 border-cyan-300 text-cyan-800', label: 'Tech/Magie' },
  general: { icon: BookOpen, color: 'bg-slate-100 border-slate-300 text-slate-800', label: 'Allgemein' },
};

const noteColors = [
  'bg-yellow-100 border-yellow-300',
  'bg-green-100 border-green-300',
  'bg-blue-100 border-blue-300',
  'bg-pink-100 border-pink-300',
  'bg-purple-100 border-purple-300',
  'bg-orange-100 border-orange-300',
];

interface ResearchNotesBoardProps {
  notes: ResearchNote[];
  onNotesChange: (notes: ResearchNote[]) => void;
  className?: string;
}

export function ResearchNotesBoard({ notes, onNotesChange, className }: ResearchNotesBoardProps) {
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const filteredNotes = notes.filter(note => {
    const matchesFilter = !filter || 
      note.title.toLowerCase().includes(filter.toLowerCase()) ||
      note.content.toLowerCase().includes(filter.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    
    return matchesFilter && matchesCategory;
  });

  const handleDelete = (id: string) => {
    onNotesChange(notes.filter(n => n.id !== id));
  };

  const handleStartEdit = (note: ResearchNote) => {
    setIsEditing(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = (id: string) => {
    onNotesChange(notes.map(n => 
      n.id === id ? { ...n, content: editContent } : n
    ));
    setIsEditing(null);
    setEditContent('');
  };

  const handleAddTag = (noteId: string, tag: string) => {
    onNotesChange(notes.map(n => 
      n.id === noteId && !n.tags.includes(tag) 
        ? { ...n, tags: [...n.tags, tag] } 
        : n
    ));
  };

  const handleRemoveTag = (noteId: string, tag: string) => {
    onNotesChange(notes.map(n => 
      n.id === noteId 
        ? { ...n, tags: n.tags.filter(t => t !== tag) } 
        : n
    ));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Notizen durchsuchen..."
            className="pl-8"
          />
        </div>
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          Alle
        </Button>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
            className="hidden md:flex"
          >
            <config.icon className="h-3 w-3 mr-1" />
            {config.label}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>{notes.length} Notizen</span>
        {selectedCategory && (
          <Badge variant="secondary">
            {categoryConfig[selectedCategory as keyof typeof categoryConfig]?.label}
          </Badge>
        )}
        {filter && (
          <Badge variant="outline">Suche: "{filter}"</Badge>
        )}
      </div>

      {/* Notes Grid - Like sticky notes on a wall */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note, index) => {
            const config = categoryConfig[note.category];
            const Icon = config.icon;
            const isExpanded = expandedNote === note.id;
            const isEditingThis = isEditing === note.id;
            const bgColor = note.color || noteColors[index % noteColors.length];

            return (
              <Card 
                key={note.id} 
                className={cn(
                  "transition-all duration-200 border-2",
                  bgColor,
                  isExpanded ? "col-span-1 md:col-span-2 lg:col-span-3" : ""
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <CardTitle className="text-sm font-semibold">{note.title}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleStartEdit(note)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      {config.label}
                    </Badge>
                    {note.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-[10px] cursor-pointer hover:bg-red-100"
                        onClick={() => handleRemoveTag(note.id, tag)}
                        title="Klicken zum Entfernen"
                      >
                        {tag} ×
                      </Badge>
                    ))}
                    <button
                      onClick={() => {
                        const newTag = prompt('Neuer Tag:');
                        if (newTag) handleAddTag(note.id, newTag);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/50 hover:bg-white"
                    >
                      + Tag
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {isEditingThis ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 text-sm border rounded min-h-[150px] bg-white"
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(null)}>
                          Abbrechen
                        </Button>
                        <Button size="sm" onClick={() => handleSaveEdit(note.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Speichern
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={cn(
                        "text-sm whitespace-pre-wrap",
                        !isExpanded && "line-clamp-6"
                      )}
                    >
                      {note.content}
                    </div>
                  )}

                  {note.source && (
                    <p className="text-xs text-slate-500 mt-3 italic">
                      Quelle: {note.source}
                    </p>
                  )}

                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(note.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Notizen vorhanden</p>
            <p className="text-sm">Nutze die Recherche-Buttons, um Notizen zu erstellen</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Quick note creator for research results
export function QuickResearchNote({
  title,
  content,
  category,
  onSave,
}: {
  title: string;
  content: string;
  category: ResearchNote['category'];
  onSave: (note: Omit<ResearchNote, 'id' | 'createdAt'>) => void;
}) {
  const [noteTitle, setNoteTitle] = useState(title);
  const [noteContent, setNoteContent] = useState(content);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    onSave({
      title: noteTitle,
      content: noteContent,
      category,
      tags,
    });
  };

  return (
    <Card className="border-2 border-violet-300 bg-violet-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Als Notiz speichern
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Titel der Notiz"
          className="bg-white"
        />
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Inhalt..."
          rows={6}
          className="w-full p-2 text-sm border rounded bg-white"
        />
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Tag hinzufügen"
            className="flex-1 bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTag) {
                setTags([...tags, newTag]);
                setNewTag('');
              }
            }}
          />
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              if (newTag) {
                setTags([...tags, newTag]);
                setNewTag('');
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
              <button 
                onClick={() => setTags(tags.filter(t => t !== tag))}
                className="ml-1 text-slate-400 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <Button onClick={handleSave} className="w-full bg-violet-600 hover:bg-violet-700">
          <StickyNote className="h-4 w-4 mr-2" />
          Als Spickzettel speichern
        </Button>
      </CardContent>
    </Card>
  );
}
