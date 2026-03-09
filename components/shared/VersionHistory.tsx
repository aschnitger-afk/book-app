'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  RotateCcw, 
  Clock, 
  Save, 
  Trash2, 
  Check,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/date-utils';

interface Snapshot {
  id: string;
  chapterId: string;
  title: string;
  wordCount: number;
  snapshotType: 'auto' | 'manual' | 'pre_restore';
  label: string | null;
  changeSummary: string | null;
  createdAt: string;
}

interface VersionHistoryProps {
  chapterId: string;
  bookId: string;
  currentContent: string;
  currentTitle: string;
  currentWordCount: number;
  onRestore: (content: string, title: string) => void;
  onSave: () => void;
}

export function VersionHistory({
  chapterId,
  bookId,
  currentContent,
  currentTitle,
  currentWordCount,
  onRestore,
  onSave,
}: VersionHistoryProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSnapshots: 0,
    autoSnapshots: 0,
    manualSnapshots: 0,
  });

  // Load snapshots when opened
  useEffect(() => {
    if (isOpen) {
      loadSnapshots();
    }
  }, [isOpen, chapterId]);

  const loadSnapshots = async () => {
    setIsLoading(true);
    try {
      const [snapshotsRes, statsRes] = await Promise.all([
        fetch(`/api/snapshots?chapterId=${chapterId}`),
        fetch(`/api/auto-backup?chapterId=${chapterId}`),
      ]);
      
      const snapshotsData = await snapshotsRes.json();
      const statsData = await statsRes.json();
      
      setSnapshots(snapshotsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load snapshots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createManualSnapshot = async () => {
    try {
      const response = await fetch('/api/auto-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          type: 'manual',
          label: `Gesichert am ${new Date().toLocaleString('de-DE')}`,
        }),
      });

      if (response.ok) {
        await loadSnapshots();
        onSave(); // Trigger parent save as well
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error);
    }
  };

  const restoreSnapshot = async (snapshotId: string) => {
    setIsRestoring(true);
    try {
      const response = await fetch('/api/snapshots/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshotId,
          createBackup: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onRestore(data.chapter.content, data.chapter.title);
        setIsOpen(false);
        // Reload to show the new pre-restore snapshot
        await loadSnapshots();
      }
    } catch (error) {
      console.error('Failed to restore snapshot:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const deleteSnapshot = async (snapshotId: string) => {
    try {
      const response = await fetch(`/api/snapshots?id=${snapshotId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadSnapshots();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
    }
  };

  const getSnapshotIcon = (type: string) => {
    switch (type) {
      case 'auto':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'manual':
        return <Save className="h-4 w-4 text-green-500" />;
      case 'pre_restore':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getSnapshotBadge = (type: string) => {
    switch (type) {
      case 'auto':
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Auto</Badge>;
      case 'manual':
        return <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Manuell</Badge>;
      case 'pre_restore':
        return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">Vor Restore</Badge>;
      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <History className="h-4 w-4 mr-2" />
        Versionen
        {stats.totalSnapshots > 0 && (
          <span className="ml-1.5 text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
            {stats.totalSnapshots}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-violet-600" />
              Versions-Historie
            </h2>
            <p className="text-sm text-slate-500">
              {stats.totalSnapshots} gespeicherte Versionen • {stats.autoSnapshots} automatisch • {stats.manualSnapshots} manuell
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={createManualSnapshot}
            >
              <Save className="h-4 w-4 mr-2" />
              Jetzt sichern
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Noch keine gespeicherten Versionen</p>
              <p className="text-sm mt-1">
                Automatische Sicherungen werden alle 5 Minuten erstellt
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className={cn(
                    "border rounded-lg p-4 transition-all",
                    selectedSnapshot?.id === snapshot.id
                      ? "border-violet-500 bg-violet-50"
                      : "hover:border-slate-300"
                  )}
                  onClick={() => setSelectedSnapshot(snapshot)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getSnapshotIcon(snapshot.snapshotType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {snapshot.label || snapshot.title}
                        </span>
                        {getSnapshotBadge(snapshot.snapshotType)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>{formatDistanceToNow(new Date(snapshot.createdAt))}</span>
                        <span>•</span>
                        <span>{snapshot.wordCount} Wörter</span>
                        {snapshot.changeSummary && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">{snapshot.changeSummary}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedSnapshot?.id === snapshot.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreSnapshot(snapshot.id);
                            }}
                            disabled={isRestoring}
                          >
                            {isRestoring ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Wiederherstellen
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(snapshot.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSnapshot(snapshot);
                          }}
                        >
                          Auswählen
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === snapshot.id && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700 mb-2">
                        Diese Version wirklich löschen?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSnapshot(snapshot.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Löschen
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(null);
                          }}
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 rounded-b-xl">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Auto: Alle 5 Minuten</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Save className="h-4 w-4 text-green-500" />
              <span>Manuell: Über "Jetzt sichern"</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Vor jedem Restore wird automatisch gesichert</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
