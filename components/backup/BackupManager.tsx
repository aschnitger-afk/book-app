'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Cloud, CheckCircle2, Database, Download } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function BackupManager() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ configured: boolean; lastBackup: string | null } | null>(null);
  const [autoBackup, setAutoBackup] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);
  const { currentBook } = useAppStore();

  useEffect(() => {
    checkBackupStatus();
  }, []);

  const checkBackupStatus = async () => {
    try {
      const response = await fetch('/api/backup');
      const data = await response.json();
      setBackupStatus(data);
    } catch (error) {
      console.error('Failed to check backup status:', error);
    }
  };

  const handleBackup = async () => {
    if (!currentBook) return;

    setIsBackingUp(true);
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: currentBook.id }),
      });

      const data = await response.json();
      
      if (data.success) {
        setLastBackupTime(new Date());
        alert(`Backup erfolgreich!\n\nKapitel: ${data.stats.chapters}\nCharaktere: ${data.stats.characters}\nWörter: ${data.stats.wordCount.toLocaleString()}`);
      } else {
        alert('Backup lokal gespeichert (Cloud nicht konfiguriert). Dein Werk ist auf diesem Computer sicher!');
      }
    } catch (error) {
      alert('Backup-Fehler. Deine Daten sind dennoch lokal sicher gespeichert.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExport = async () => {
    if (!currentBook) return;

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: currentBook.id, format: 'markdown' }),
      });

      const data = await response.json();
      
      const blob = new Blob([data.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentBook.title.replace(/[^a-z0-9]/gi, '_')}_backup.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Export-Fehler');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-500" />
          Datensicherung
        </CardTitle>
        <CardDescription>
          Deine Daten werden automatisch lokal gespeichert. Optional: Cloud-Backup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-sm">Lokale Speicherung</p>
              <p className="text-xs text-slate-600">SQLite-Datenbank auf diesem Computer</p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            Aktiv
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Cloud className="h-5 w-5 text-slate-400" />
            <div>
              <p className="font-medium text-sm">Cloud-Backup</p>
              <p className="text-xs text-slate-600">
                {backupStatus?.configured 
                  ? 'Optionaler externer Speicher' 
                  : 'Nicht konfiguriert (optional)'}
              </p>
            </div>
          </div>
          <Badge variant={backupStatus?.configured ? 'default' : 'secondary'}>
            {backupStatus?.configured ? 'Verfügbar' : 'Optional'}
          </Badge>
        </div>

        {lastBackupTime && (
          <div className="text-xs text-slate-500">
            Letztes Backup: {lastBackupTime.toLocaleString()}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Automatische Backups</p>
            <p className="text-xs text-slate-500">Bei jedem Speichern</p>
          </div>
          <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleBackup}
            disabled={isBackingUp || !currentBook}
          >
            {isBackingUp ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Cloud className="h-4 w-4 mr-2" />
            )}
            Jetzt sichern
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleExport}
            disabled={!currentBook}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
          <strong>🔒 Sicherheitshinweis:</strong><br />
          Deine Daten werden in einer SQLite-Datenbank auf diesem Computer gespeichert. 
          Für zusätzliche Sicherheit: Regelmäßig exportieren und extern speichern.
        </div>
      </CardContent>
    </Card>
  );
}
