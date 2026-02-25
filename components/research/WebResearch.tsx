'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus, Globe } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface WebResearchProps {
  category?: string;
  onAddToResearch?: (content: string, title: string) => void;
  className?: string;
}

export function WebResearch({ category = 'worldbuilding', onAddToResearch, className }: WebResearchProps) {
  const [query, setQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [result, setResult] = useState<string>('');
  const { currentBook, worldSettings, concept } = useAppStore();

  const handleResearch = async () => {
    if (!query.trim()) return;

    setIsResearching(true);
    setResult('');

    try {
      const context = `
Buch: ${currentBook?.title}
Genre: ${currentBook?.genre}
Welt: ${worldSettings?.worldType}
Zeitraum: ${worldSettings?.timePeriod}
Prämisse: ${concept?.premise}
      `.trim();

      const response = await fetch('/api/research/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context,
          category,
        }),
      });

      const data = await response.json();
      
      if (data.result) {
        setResult(data.result);
      } else {
        setResult('Keine Ergebnisse gefunden.');
      }
    } catch (error) {
      setResult('Fehler bei der Recherche. Bitte versuche es erneut.');
    } finally {
      setIsResearching(false);
    }
  };

  const handleAddToNotes = () => {
    if (!result || !onAddToResearch) return;
    
    const title = `Recherche: ${query}`;
    onAddToResearch(result, title);
    setResult('');
    setQuery('');
  };

  const suggestedQueries = {
    worldbuilding: [
      'Mittelalterliche Stadtplanung',
      'Magiesysteme in Fantasy',
      'Klimazonen und Geographie',
      'Politische Systeme',
      'Währung und Wirtschaft',
    ],
    characters: [
      'Psychologie von Antagonisten',
      'Charakterentwicklung Arcs',
      'Motivation von Helden',
      'Beziehungsdynamiken',
    ],
    plotting: [
      'Dramaturgie',
      'Spannungsaufbau',
      'Überraschungseffekte',
    ],
  };

  const suggestions = suggestedQueries[category as keyof typeof suggestedQueries] || suggestedQueries.worldbuilding;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4 text-blue-500" />
          KI-gestützte Recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Was möchtest du recherchieren?"
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
          />
          <Button 
            onClick={handleResearch}
            disabled={isResearching || !query.trim()}
          >
            {isResearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Badge
              key={suggestion}
              variant="secondary"
              className="cursor-pointer hover:bg-blue-100"
              onClick={() => setQuery(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>

        {/* Results */}
        {result && (
          <div className="border rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Rechercheergebnis</h4>
              {onAddToResearch && (
                <Button size="sm" variant="outline" onClick={handleAddToNotes}>
                  <Plus className="h-3 w-3 mr-1" />
                  Zu Notizen
                </Button>
              )}
            </div>
            <ScrollArea className="h-64">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm">{result}</div>
              </div>
            </ScrollArea>
          </div>
        )}

        <p className="text-xs text-slate-500">
          💡 Die KI simuliert eine Internet-Recherche basierend auf deinem Buch-Kontext.
        </p>
      </CardContent>
    </Card>
  );
}
