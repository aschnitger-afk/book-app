'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore, DEFAULT_PERSONAS } from '@/lib/store';
import { cn } from '@/lib/utils';
import { User, Sparkles, PenTool, Glasses, Compass, GitBranch, ChevronDown } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="h-4 w-4" />,
  PenTool: <PenTool className="h-4 w-4" />,
  Glasses: <Glasses className="h-4 w-4" />,
  Compass: <Compass className="h-4 w-4" />,
  GitBranch: <GitBranch className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
};

const colorMap: Record<string, string> = {
  violet: 'text-violet-600 bg-violet-50 hover:bg-violet-100',
  blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
  red: 'text-red-600 bg-red-50 hover:bg-red-100',
  amber: 'text-amber-600 bg-amber-50 hover:bg-amber-100',
  emerald: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100',
};

export function PersonaSelector() {
  const { selectedPersona, setSelectedPersona } = useAppStore();
  const [open, setOpen] = useState(false);

  const currentPersona = DEFAULT_PERSONAS.find(p => p.key === selectedPersona) || DEFAULT_PERSONAS[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "gap-2 h-8 px-3 rounded-full",
            colorMap[currentPersona.color]
          )}
        >
          {iconMap[currentPersona.icon] || <User className="h-4 w-4" />}
          <span className="hidden sm:inline">{currentPersona.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase">
          KI-Persona wählen
        </div>
        {DEFAULT_PERSONAS.map((persona) => (
          <DropdownMenuItem
            key={persona.key}
            onClick={() => {
              setSelectedPersona(persona.key);
              setOpen(false);
            }}
            className={cn(
              "flex flex-col items-start gap-1 py-3 cursor-pointer",
              selectedPersona === persona.key && "bg-slate-100"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                colorMap[persona.color]
              )}>
                {iconMap[persona.icon] || <User className="h-3 w-3" />}
              </div>
              <span className="font-medium">{persona.name}</span>
              {persona.isDefault && (
                <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded">Standard</span>
              )}
            </div>
            <p className="text-xs text-slate-500 pl-8">{persona.description}</p>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
