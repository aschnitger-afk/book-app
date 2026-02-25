'use client';

import { useState } from 'react';
import { useAppStore, Chapter } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIFeedbackButton } from '@/components/shared/AIFeedbackButton';
import { Edit3, FileText, CheckCircle2, AlertTriangle, Sparkles, MessageSquare } from 'lucide-react';

const EDIT_TYPES = [
  { value: 'full_review', label: 'Vollständige Manuskriptkritik', icon: FileText },
  { value: 'line_edit', label: 'Line-Editing', icon: Edit3 },
  { value: 'continuity', label: 'Kontinuitäts-Check', icon: CheckCircle2 },
  { value: 'pacing', label: 'Pacing-Analyse', icon: AlertTriangle },
  { value: 'dialogue', label: 'Dialog-Check', icon: MessageSquare },
];

export function EditingPhase() {
  const { currentBook, chapters, setCurrentBook } = useAppStore();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [selectedEditType, setSelectedEditType] = useState('full_review');

  const handleCompletePhase = async () => {
    if (!currentBook) return;

    try {
      await fetch(`/api/books/${currentBook.id}/phase`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'editing',
          completed: true,
        }),
      });

      setCurrentBook({ ...currentBook, editingCompleted: true });
    } catch (error) {
      console.error('Failed to complete phase:', error);
    }
  };

  const getChapterStats = () => {
    const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
    const completedChapters = chapters.filter(ch => ch.status === 'completed').length;
    return { totalWords, completedChapters, totalChapters: chapters.length };
  };

  const stats = getChapterStats();

  const getEditContext = () => {
    if (selectedChapter) {
      return `Kapitel: ${selectedChapter.title}\nInhalt: ${selectedChapter.content?.substring(0, 2000)}...`;
    }
    return `Gesamtes Buch:\n${chapters.map(ch => `${ch.title}: ${ch.content?.substring(0, 500)}...`).join('\n\n')}`;
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Edit3 className="h-6 w-6 text-amber-600" />
                Bearbeiten & Polieren
              </h1>
              <p className="text-slate-500 mt-1">
                Verfeinere dein Manuskript mit KI-Unterstützung
              </p>
            </div>
            <Button 
              onClick={handleCompletePhase}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Phase abschließen
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
                <div className="text-sm text-slate-500">Wörter gesamt</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.totalChapters}</div>
                <div className="text-sm text-slate-500">Kapitel</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.completedChapters}</div>
                <div className="text-sm text-slate-500">Vollständig</div>
              </CardContent>
            </Card>
          </div>

          {/* Editing Tools */}
          <Card>
            <CardHeader>
              <CardTitle>KI-Lektorat</CardTitle>
              <CardDescription>
                Wähle ein Kapitel und eine Art des Feedbacks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Kapitel</label>
                  <Select
                    value={selectedChapter?.id || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setSelectedChapter(null);
                      } else {
                        setSelectedChapter(chapters.find(c => c.id === value) || null);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kapitel wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Gesamtes Buch</SelectItem>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Art der Bearbeitung</label>
                  <Select
                    value={selectedEditType}
                    onValueChange={setSelectedEditType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EDIT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <AIFeedbackButton
                  content={getEditContext()}
                  type="feedback"
                  label={`${EDIT_TYPES.find(t => t.value === selectedEditType)?.label} starten`}
                  onFeedback={setAiFeedback}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kapitel-Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedChapter?.id === chapter.id 
                            ? 'border-violet-500 bg-violet-50' 
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedChapter(chapter)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{chapter.title}</span>
                          <Badge variant={chapter.status === 'completed' ? 'default' : 'secondary'}>
                            {chapter.wordCount || 0} Wörter
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schnell-Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <AIFeedbackButton
                  content={getEditContext()}
                  type="analyze"
                  label="Stil-Analyse"
                  onFeedback={setAiFeedback}
                  variant="outline"
                  className="w-full justify-start"
                />
                <AIFeedbackButton
                  content={getEditContext()}
                  type="feedback"
                  label="Plot-Lücken finden"
                  onFeedback={setAiFeedback}
                  variant="outline"
                  className="w-full justify-start"
                />
                <AIFeedbackButton
                  content={getEditContext()}
                  type="analyze"
                  label="Charakter-Konsistenz"
                  onFeedback={setAiFeedback}
                  variant="outline"
                  className="w-full justify-start"
                />
                <AIFeedbackButton
                  content={getEditContext()}
                  type="feedback"
                  label="Show-don't-tell Check"
                  onFeedback={setAiFeedback}
                  variant="outline"
                  className="w-full justify-start"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Feedback Sidebar */}
      {aiFeedback && (
        <div className="w-96 border-l bg-slate-50 flex flex-col">
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              KI-Feedback
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setAiFeedback('')}>
              ✕
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-700">{aiFeedback}</div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
