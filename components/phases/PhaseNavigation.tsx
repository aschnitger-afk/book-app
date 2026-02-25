'use client';

import { useAppStore, PHASES, BookPhase } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  Lightbulb, Globe, GitBranch, PenTool, 
  Edit3, BookOpen, CheckCircle2, Circle,
  Radar, Users
} from 'lucide-react';

const phaseIcons: Record<BookPhase, React.ReactNode> = {
  concept: <Lightbulb className="h-4 w-4" />,
  worldbuilding: <Globe className="h-4 w-4" />,
  characters: <Users className="h-4 w-4" />,
  plotting: <GitBranch className="h-4 w-4" />,
  styleanalysis: <Radar className="h-4 w-4" />,
  drafting: <PenTool className="h-4 w-4" />,
  editing: <Edit3 className="h-4 w-4" />,
  publishing: <BookOpen className="h-4 w-4" />,
};

export function PhaseNavigation() {
  const { 
    currentBook, 
    currentPhase, 
    setCurrentPhase,
  } = useAppStore();

  if (!currentBook) return null;

  const getPhaseStatus = (phase: BookPhase) => {
    switch (phase) {
      case 'styleanalysis':
        return currentBook.styleanalysisCompleted;
      case 'concept':
        return currentBook.conceptCompleted;
      case 'worldbuilding':
        return currentBook.worldbuildingCompleted;
      case 'characters':
        return currentBook.charactersCompleted || false;
      case 'plotting':
        return currentBook.plottingCompleted;
      case 'drafting':
        return currentBook.draftingCompleted;
      case 'editing':
        return currentBook.editingCompleted;
      default:
        return false;
    }
  };

  const isPhaseAvailable = (phaseIndex: number) => {
    if (phaseIndex === 0) return true;
    const prevPhase = PHASES[phaseIndex - 1].key;
    // Stylanalyse is optional - concept doesn't require it
    if (PHASES[phaseIndex].key === 'concept') return true;
    return getPhaseStatus(prevPhase);
  };

  return (
    <div className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 py-3 overflow-x-auto">
          {PHASES.map((phase, index) => {
            const isActive = currentPhase === phase.key;
            const isCompleted = getPhaseStatus(phase.key);
            const isAvailable = isPhaseAvailable(index);
            
            return (
              <button
                key={phase.key}
                onClick={() => isAvailable && setCurrentPhase(phase.key)}
                disabled={!isAvailable}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-slate-900 text-white" 
                    : isCompleted
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : isAvailable
                        ? "text-slate-600 hover:bg-slate-100"
                        : "text-slate-300 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full",
                  isActive 
                    ? "bg-white/20" 
                    : isCompleted
                      ? "bg-green-100"
                      : "bg-slate-100"
                )}>
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    phaseIcons[phase.key]
                  )}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{phase.label}</div>
                  <div className={cn(
                    "text-xs",
                    isActive ? "text-white/70" : "text-slate-400"
                  )}>
                    {phase.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
