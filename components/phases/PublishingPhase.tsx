'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageGenerator } from '@/components/shared/ImageGenerator';
import { BackupManager } from '@/components/shared/BackupManager';
import { BookOpen, Download, FileText, Book, CheckCircle2, Loader2, ExternalLink, HardDrive } from 'lucide-react';

export function PublishingPhase() {
  const { currentBook, chapters, characters, concept } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);

  const handleExport = async (format: 'markdown' | 'html' | 'txt' | 'kdp') => {
    if (!currentBook) return;

    setIsExporting(true);
    setExportFormat(format);
    
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: currentBook.id, format }),
      });

      const data = await response.json();

      // Create download
      const blob = new Blob([data.content], { 
        type: format === 'html' ? 'text/html' : format === 'kdp' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const getBookSummary = () => {
    return `
Titel: ${currentBook?.title}
Genre: ${currentBook?.genre}
Beschreibung: ${currentBook?.description}
Wortzahl: ${chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)}
Kapitel: ${chapters.length}
    `.trim();
  };

  const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
  const isNovelLength = totalWords >= 50000;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-green-600" />
              Veröffentlichen
            </h1>
            <p className="text-slate-500 mt-1">
              Exportiere dein fertiges Buch
            </p>
          </div>
          {currentBook?.status === 'published' && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Veröffentlicht
            </Badge>
          )}
        </div>

        {/* Book Cover */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Buch-Cover
            </CardTitle>
            <CardDescription>
              Generiere ein professionelles Cover mit KI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="w-48 aspect-[2/3] bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                {currentBook?.coverImage ? (
                  <img 
                    src={currentBook.coverImage} 
                    alt="Book Cover" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Book className="h-16 w-16 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-medium">{currentBook?.title}</h3>
                  <p className="text-sm text-slate-500">{currentBook?.genre}</p>
                </div>
                <ImageGenerator
                  type="cover"
                  context={getBookSummary()}
                  existingImage={currentBook?.coverImage}
                  onImageGenerated={async (url) => {
                    await fetch(`/api/books/${currentBook?.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ coverImage: url }),
                    });
                  }}
                  buttonLabel="Cover generieren"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportieren
            </CardTitle>
            <CardDescription>
              Wähle das Format für dein Manuskript
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:border-violet-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Markdown</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Für weitere Bearbeitung
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-slate-300" />
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => handleExport('markdown')}
                    disabled={isExporting}
                  >
                    {isExporting && exportFormat === 'markdown' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-violet-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">HTML</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Für Web-Veröffentlichung
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-300" />
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => handleExport('html')}
                    disabled={isExporting}
                  >
                    {isExporting && exportFormat === 'html' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-violet-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Plain Text</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Universelles Format
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => handleExport('txt')}
                    disabled={isExporting}
                  >
                    {isExporting && exportFormat === 'txt' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-violet-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">KDP Format</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Für Amazon Kindle Direct Publishing
                      </p>
                    </div>
                    <Book className="h-8 w-8 text-orange-400" />
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => handleExport('kdp')}
                    disabled={isExporting}
                  >
                    {isExporting && exportFormat === 'kdp' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Publishing Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Veröffentlichungs-Checkliste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`h-5 w-5 ${totalWords > 0 ? 'text-green-500' : 'text-slate-300'}`} />
                <span className={totalWords > 0 ? '' : 'text-slate-400'}>
                  Manuskript vollständig ({totalWords.toLocaleString()} Wörter)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`h-5 w-5 ${chapters.length > 0 ? 'text-green-500' : 'text-slate-300'}`} />
                <span className={chapters.length > 0 ? '' : 'text-slate-400'}>
                  {chapters.length} Kapitel strukturiert
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`h-5 w-5 ${currentBook?.coverImage ? 'text-green-500' : 'text-slate-300'}`} />
                <span className={currentBook?.coverImage ? '' : 'text-slate-400'}>
                  Cover erstellt
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`h-5 w-5 ${concept?.elevatorPitch ? 'text-green-500' : 'text-slate-300'}`} />
                <span className={concept?.elevatorPitch ? '' : 'text-slate-400'}>
                  Buchbeschreibung vorhanden
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`h-5 w-5 ${isNovelLength ? 'text-green-500' : 'text-amber-500'}`} />
                <span className={isNovelLength ? '' : 'text-amber-600'}>
                  {isNovelLength ? 'Roman-Länge erreicht (50k+ Wörter)' : `Kurzgeschichte (${totalWords.toLocaleString()} Wörter)`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KDP Guidelines */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">Amazon KDP Tipps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Überprüfe die Formatierung vor dem Upload</li>
              <li>• Nutze ein professionelles Cover (mindestens 300 DPI)</li>
              <li>• Schreibe eine überzeugende Buchbeschreibung</li>
              <li>• Wähle passende Keywords und Kategorien</li>
              <li>• Setze einen angemessenen Preis (empfohlen: $2.99-$9.99)</li>
              <li>
                <a 
                  href="https://kdp.amazon.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline inline-flex items-center gap-1"
                >
                  Zum KDP Dashboard <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-violet-600" />
              Sicherung & Wiederherstellung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BackupManager 
              bookId={currentBook?.id} 
              bookTitle={currentBook?.title}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
