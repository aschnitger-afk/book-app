'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  HardDrive,
  FileJson,
  RotateCcw,
  X,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatFileSize } from '@/lib/date-utils';

interface Backup {
  id: string;
  filename: string;
  filePath: string;
  fileSize: number;
  checksum: string;
  backupType: string;
  bookCount: number;
  chapterCount: number;
  characterCount: number;
  status: string;
  restoredAt: string | null;
  createdAt: string;
}

interface BackupManagerProps {
  bookId?: string;
  bookTitle?: string;
}

export function BackupManager({ bookId, bookTitle }: BackupManagerProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [backupDir, setBackupDir] = useState('');

  useEffect(() => {
    loadBackups();
    const homeDir = typeof window !== 'undefined' ? 
      (navigator.platform.includes('Mac') ? '~/Documents/AuthorAI-Backups' : 
       navigator.platform.includes('Win') ? '%USERPROFILE%\\Documents\\AuthorAI-Backups' : 
       '~/Documents/AuthorAI-Backups') : '';
    setBackupDir(homeDir);
  }, [bookId]);

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const url = bookId ? `/api/backups?bookId=${bookId}` : '/api/backups';
      const response = await fetch(url);
      const data = await response.json();
      setBackups(data);
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          backupType: 'manual',
          label: bookTitle ? `Backup von "${bookTitle}"` : 'Vollständiges Backup',
        }),
      });

      if (response.ok) {
        await loadBackups();
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      setRestoreStatus('idle');
      const response = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId }),
      });

      if (response.ok) {
        setRestoreStatus('success');
        await loadBackups();
        setTimeout(() => {
          setShowRestoreConfirm(false);
          setRestoreStatus('idle');
        }, 2000);
      } else {
        setRestoreStatus('error');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      setRestoreStatus('error');
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/backups?id=${backupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadBackups();
        if (selectedBackup?.id === backupId) {
          setSelectedBackup(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
    }
  };

  const getBackupTypeBadge = (type: string) => {
    switch (type) {
      case 'manual':
        return <Badge className="bg-blue-100 text-blue-700">Manuell</Badge>;
      case 'auto_daily':
        return <Badge className="bg-green-100 text-green-700">Täglich (Auto)</Badge>;
      case 'pre_export':
        return <Badge className="bg-amber-100 text-amber-700">Vor Export</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const manualBackups = backups.filter(b => b.backupType === 'manual');
  const autoBackups = backups.filter(b => b.backupType === 'auto_daily');

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <HardDrive className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-violet-900">Deine Daten sind sicher</h3>
              <p className="text-sm text-violet-700 mt-1">
                Backups werden in <code className="bg-violet-100 px-1.5 py-0.5 rounded">{backupDir}</code> gespeichert.
                Die Datenbank wird täglich automatisch gesichert.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={createBackup} 
          disabled={isCreating}
          className="flex-1 sm:flex-none"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {bookId ? 'Dieses Buch sichern' : 'Alles sichern'}
        </Button>
        
        {!bookId && (
          <Button variant="outline" onClick={loadBackups} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Aktualisieren
          </Button>
        )}
      </div>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileJson className="h-5 w-5 text-slate-500" />
            Gespeicherte Backups
          </CardTitle>
          <CardDescription>
            {manualBackups.length} manuelle • {autoBackups.length} automatische Backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            {backups.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileJson className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Noch keine Backups vorhanden</p>
                <p className="text-sm mt-1">Erstelle dein erstes Backup mit dem Button oben</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all",
                      selectedBackup?.id === backup.id
                        ? "border-violet-500 bg-violet-50"
                        : "hover:border-slate-300"
                    )}
                    onClick={() => setSelectedBackup(backup)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getBackupTypeBadge(backup.backupType)}
                          {backup.restoredAt && (
                            <Badge variant="outline" className="text-xs">Wiederhergestellt</Badge>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(new Date(backup.createdAt))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>{formatFileSize(backup.fileSize)}</span>
                            <span>•</span>
                            <span>{backup.bookCount} Bücher</span>
                            <span>•</span>
                            <span>{backup.chapterCount} Kapitel</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBackup(backup.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Backup Details */}
      {selectedBackup && (
        <Card className="border-violet-200">
          <CardHeader>
            <CardTitle className="text-base">Backup Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Dateiname:</span>
                <p className="font-mono text-xs mt-1 break-all">{selectedBackup.filename}</p>
              </div>
              <div>
                <span className="text-slate-500">Prüfsumme (SHA256):</span>
                <p className="font-mono text-xs mt-1 break-all">{selectedBackup.checksum.substring(0, 32)}...</p>
              </div>
            </div>

            {!showRestoreConfirm ? (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowRestoreConfirm(true)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Dieses Backup wiederherstellen
              </Button>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium">
                      Achtung: Wiederherstellung überschreibt aktuelle Daten
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Das Backup wird als neues Buch wiederhergestellt. Deine aktuellen Daten bleiben erhalten.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => restoreBackup(selectedBackup.id)}
                        disabled={restoreStatus === 'success'}
                      >
                        {restoreStatus === 'success' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Wiederhergestellt!
                          </>
                        ) : (
                          'Ja, wiederherstellen'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRestoreConfirm(false)}
                        disabled={restoreStatus === 'success'}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
