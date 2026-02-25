'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ImageIcon, Wand2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface ImageGeneratorProps {
  type: 'cover' | 'character' | 'location' | 'scene';
  entityId?: string;
  context: string;
  existingImage?: string | null;
  onImageGenerated: (imageUrl: string) => void;
  buttonLabel?: string;
}

export function ImageGenerator({
  type,
  entityId,
  context,
  existingImage,
  onImageGenerated,
  buttonLabel = 'Bild generieren',
}: ImageGeneratorProps) {
  const { currentBook } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  const typeLabels = {
    cover: 'Cover',
    character: 'Charakter',
    location: 'Ort',
    scene: 'Szene',
  };

  const generatePrompt = () => {
    const baseContext = context.substring(0, 500);
    return `Book illustration, ${type}: ${baseContext}. High quality, detailed, professional artwork.`;
  };

  const handleGenerate = async () => {
    if (!currentBook) return;

    setIsGenerating(true);
    try {
      const finalPrompt = prompt || generatePrompt();

      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          negativePrompt,
          imageType: type,
          bookId: currentBook.id,
          characterId: type === 'character' ? entityId : undefined,
          locationId: type === 'location' ? entityId : undefined,
          width: type === 'cover' ? 1024 : 1024,
          height: type === 'cover' ? 1536 : 1024,
        }),
      });

      const data = await response.json();
      
      if (data.imageUrl) {
        onImageGenerated(data.imageUrl);
        setIsOpen(false);
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      alert('Fehler bei der Bildgenerierung: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
        >
          {existingImage ? (
            <ImageIcon className="h-4 w-4" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{typeLabels[type]} mit KI generieren</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {existingImage && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={existingImage} 
                alt="Current" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={generatePrompt()}
              className="min-h-[100px]"
            />
            <p className="text-xs text-slate-500 mt-1">
              Beschreibe das Bild, das du generieren möchtest. Sei so detailliert wie möglich.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Negativer Prompt (optional)</label>
            <Input
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Was soll vermieden werden?"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
            <p className="font-medium mb-1">Kontext:</p>
            <p className="line-clamp-3">{context}</p>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generiere Bild...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                {existingImage ? 'Neues Bild generieren' : 'Bild generieren'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
