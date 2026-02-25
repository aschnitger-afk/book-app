'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, FileText, Sparkles, X, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StyleModal({ isOpen, onClose }: StyleModalProps) {
  const { currentBookId, currentBook } = useAppStore();
  const [uploadedText, setUploadedText] = useState('');
  const [styleName, setStyleName] = useState('');
  const [styleDescription, setStyleDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      setUploadedText(text);
      setStyleName(file.name.replace('.txt', ''));
    } else {
      // For other files, try to read as text
      try {
        const text = await file.text();
        setUploadedText(text);
        setStyleName(file.name.replace(/\.[^/.]+$/, ''));
      } catch {
        alert('Please upload a text file');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const analyzeStyle = async () => {
    if (!uploadedText) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: uploadedText.slice(0, 3000), // Limit text length
          type: 'style',
          bookId: currentBook?.id,
        }),
      });

      const data = await response.json();
      setStyleDescription(data.result);
    } catch (error) {
      console.error('Failed to analyze style:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveStyle = async () => {
    if (!currentBookId || !styleName || !styleDescription) return;
    
    setIsSaving(true);
    try {
      await fetch('/api/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: styleName,
          description: styleDescription,
          sampleText: uploadedText.slice(0, 5000),
          bookId: currentBookId
        }),
      });
      
      onClose();
      setUploadedText('');
      setStyleName('');
      setStyleDescription('');
    } catch (error) {
      console.error('Failed to save style:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Style Mimicry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!uploadedText ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-violet-500 bg-violet-50' : 'border-slate-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-sm text-slate-600 mb-2">
                Drag and drop a text file here, or click to browse
              </p>
              <p className="text-xs text-slate-400">
                Upload an example of writing you want to mimic (PDF, TXT, or paste text)
              </p>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Browse Files
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  <span className="text-sm font-medium">{styleName || 'Uploaded Text'}</span>
                  <span className="text-xs text-slate-500">
                    ({uploadedText.length.toLocaleString()} characters)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setUploadedText('');
                    setStyleName('');
                    setStyleDescription('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style-name">Style Profile Name</Label>
                <Input
                  id="style-name"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  placeholder="e.g., My Mystery Style, Romance Voice"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="style-description">Style Analysis</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={analyzeStyle}
                    disabled={isAnalyzing}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {isAnalyzing ? 'Analyzing...' : 'Auto-Analyze'}
                  </Button>
                </div>
                <Textarea
                  id="style-description"
                  value={styleDescription}
                  onChange={(e) => setStyleDescription(e.target.value)}
                  placeholder="Describe the style: sentence structure, vocabulary, tone, pacing, etc. Or click Auto-Analyze to have AI generate this."
                  rows={6}
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Tip:</strong> Once you save this style profile, the AI will use it to match 
                  your writing style when generating continuations, rewrites, and expansions.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={saveStyle}
            disabled={!uploadedText || !styleName || !styleDescription || isSaving}
          >
            <Check className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Style Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
