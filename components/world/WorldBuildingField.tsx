'use client';

import { useState } from 'react';
import { TextEnhancer } from '@/components/shared/TextEnhancer';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Info, Lightbulb, BookOpen, Users, MapPin, Scale, Sparkles } from 'lucide-react';

export interface FieldDefinition {
  key: string;
  label: string;
  placeholder: string;
  rows?: number;
  category: 'basics' | 'society' | 'rules' | 'locations';
  icon: React.ReactNode;
  tooltip: string;
  storyImpact: string;
  writingTips: string[];
  example?: string;
}

export const WORLD_BUILDING_FIELDS: FieldDefinition[] = [
  {
    key: 'timePeriod',
    label: 'Zeitraum / Epoche',
    placeholder: 'z.B. Spätes Mittelalter (ca. 1400), Postapokalyptische Zukunft (2150)',
    category: 'basics',
    icon: <BookOpen className="h-4 w-4" />,
    tooltip: 'Wann spielt deine Geschichte? Das beeinflusst Technologie, Sprache und Denkweise der Charaktere.',
    storyImpact: 'Bestimmt verfügbare Technologie, Sprachstil, gesellschaftliche Normen und die Lebenserwartung der Charaktere.',
    writingTips: [
      'Sei spezifisch: "Viktorianisches England" statt nur "früher"',
      'Berücksichtige, wie Zeitdruck die Handlung beeinflusst',
      'Denke an Saisonale Einflüsse (Winter = Überlebenskampf)'
    ],
    example: 'Jahr 1845, victorianisches London. Gaslampen beleuchten die Straßen, Dampfmaschinen revolutionieren die Industrie.'
  },
  {
    key: 'location',
    label: 'Hauptsetting / Geografischer Schauplatz',
    placeholder: 'z.B. Eine isolierte Bergstadt in den Alpen, Die Mars-Kolonie Ares-7',
    category: 'basics',
    icon: <MapPin className="h-4 w-4" />,
    tooltip: 'Der primäre Schauplatz. Das Klima und die Geographie beeinflussen die Stimmung und Handlungsmöglichkeiten.',
    storyImpact: 'Das Setting ist wie ein Charakter - es erzeugt Konflikte (Isolation, Wetter, Ressourcen) und bestimmt die Atmosphäre.',
    writingTips: [
      'Nutze das Setting aktiv: Lass Wetter die Pläne durchkreuzen',
      'Beschreibe Gerüche und Klänge, nicht nur Visuelles',
      'Zeige, wie Einheimische den Ort anders erleben als Fremde'
    ],
    example: 'Die Stadt liegt in einem Talkessel, umgeben von unpassierbaren Bergen. Der einzige Zugang ist ein Tunnel, der 6 Monate im Jahr verschneit ist.'
  },
  {
    key: 'worldType',
    label: 'Welttyp / Genre-Setting',
    placeholder: 'z.B. Low-Fantasy mit realistischer Magie, Cyberpunk-Dystopie',
    category: 'basics',
    icon: <Sparkles className="h-4 w-4" />,
    tooltip: 'Was unterscheidet diese Welt von unserer Realität? Magie? Fortschrittliche Technik? Eine alternative Geschichte?',
    storyImpact: 'Definiert die Spielregeln deiner Welt. Was ist möglich? Was unmöglich? Das schafft innere Logik und Grenzen.',
    writingTips: [
      'Sei konsistent: Wenn Magie existiert, wer hat Zugang dazu?',
      'Zeige die Kosten von übernatürlichen Fähigkeiten',
      'Vermeide "Ass Pulls" - alles braucht Regeln'
    ],
    example: 'Eine Welt, in der Musik Magie wirkt. Jede Note hat eine Wirkung, aber falsche Melodien können den Sänger verzehren.'
  },
  {
    key: 'geography',
    label: 'Geographie & Umwelt',
    placeholder: 'Berge, Flüsse, Wälder, Klima, besondere Naturphänomene...',
    rows: 5,
    category: 'basics',
    icon: <MapPin className="h-4 w-4" />,
    tooltip: 'Die physische Landschaft. Geographie bestimmt Reiserouten, Ressourcen und Konflikte zwischen Regionen.',
    storyImpact: 'Geographie schafft natürliche Barrieren und Ressourcen-Konflikte. Sie bestimmt, wer reich und wer arm ist.',
    writingTips: [
      'Ressourcen = Macht (Wasser, Öl, seltene Metalle)',
      'Naturgewalten als Plot-Device (Fluten, Erdbeben)',
      'Reisezeiten realistisch darstellen'
    ],
    example: 'Das Königreich besteht aus drei Inseln. Die nördliche ist karg und bergig (Bergbau), die südliche fruchtbar (Landwirtschaft). Ihre Handelsbeziehung ist angespannt.'
  },
  {
    key: 'politics',
    label: 'Politik & Machtstrukturen',
    placeholder: 'Wer regiert? Wie werden Gesetze gemacht? Gibt es Widerstand?',
    rows: 4,
    category: 'society',
    icon: <Scale className="h-4 w-4" />,
    tooltip: 'Wer hat die Macht? Wie funktioniert das politische System? Machtstrukturen sind Quelle von Konflikt und Intrige.',
    storyImpact: 'Politik erzeugt externe Konflikte (Kriege) und interne (Korruption, Verrat). Sie bestimmt, was Charaktere tun dürfen.',
    writingTips: [
      'Zeige Macht durch Details: Wer muss wem zuerst Grüßen?',
      'Jedes System hat Opfer - wer ist unterdrückt?',
      'Gesetze sind narrativ: Zeige sie durch Verletzung'
    ],
    example: 'Eine Theokratie, in der Priester das Recht sprechen. Andersdenkende werden als Ketzer verfolgt. Aber im Untergrund existiert eine aufklärerische Geheimgesellschaft.'
  },
  {
    key: 'culture',
    label: 'Kultur, Bräuche & Religion',
    placeholder: 'Religionen, Feste, Kleidung, Essen, Tabus, Werte...',
    rows: 4,
    category: 'society',
    icon: <Users className="h-4 w-4" />,
    tooltip: 'Was glauben die Menschen? Wie leben sie? Kultur bestimmt, wie Charaktere denken und handeln.',
    storyImpact: 'Kultur gibt Charakteren ihren "Background". Sie erzeugt Konflikte zwischen verschiedenen Gruppen und innerhalb (Tradition vs. Moderne).',
    writingTips: [
      'Schaffe Kontrast durch kulturelle Unterschiede',
      'Zeige Kultur durch Alltagsrituale (Essen, Begrüßung)',
      'Religion = Motivation für extreme Handlungen'
    ],
    example: 'In dieser Gesellschaft gilt Schweigen als höflich. Reden bedeutet Vertrauen. Laute Menschen gelten als ungebildet oder gefährlich.'
  },
  {
    key: 'history',
    label: 'Historischer Hintergrund',
    placeholder: 'Kriege, Revolutionen, Katastrophen, die die Welt prägten...',
    rows: 4,
    category: 'society',
    icon: <BookOpen className="h-4 w-4" />,
    tooltip: 'Wichtige Ereignisse der Vergangenheit. Geschichte erklärt die Gegenwart und schafft Traumata oder Stolz.',
    storyImpact: 'Geschichte gibt Tiefe. Alte Konflikte brechen wieder auf. Historische Ungerechtigkeiten treiben Charaktere an.',
    writingTips: [
      'Nutze historische Fehler als wiederkehrende Themen',
      'Zeige, wie Geschichte von verschiedenen Seiten erzählt wird',
      'Geheimnisse aus der Vergangenheit als Revelation'
    ],
    example: 'Vor 50 Jahren wurde die alte Königsmörderin hingerichtet. Heute gilt sie als Märtyrerin. Ihre Nachfahren leben unter falschem Namen.'
  },
  {
    key: 'technology',
    label: 'Technologie & Magiesystem',
    placeholder: 'Wie funktioniert Magie? Was für Tech existiert? Wer hat Zugang?',
    rows: 5,
    category: 'rules',
    icon: <Sparkles className="h-4 w-4" />,
    tooltip: 'Die "Spielregeln" für übernatürliche oder technologische Elemente. Konsistenz ist hier entscheidend.',
    storyImpact: 'Bestimmt die Lösungsmöglichkeiten für Probleme. Wenn Magie alles kann, gibt es keinen Konflikt. Begrenzungen schaffen Spannung.',
    writingTips: [
      'Definiere: Wer kann Magie/Tech nutzen? Kosten? Risiken?',
      'Magie sollte nie die einzige Lösung sein',
      'Zeige Konsequenzen von Tech/Magie-Missbrauch'
    ],
    example: 'Magie basiert auf Erinnerungen. Jeder Zauber kostet eine Erinnerung für immer. Starke Magier werden amnesisch.'
  },
  {
    key: 'rules',
    label: 'Welt-Regeln & Einschränkungen',
    placeholder: 'Was ist absolut unmöglich? Welche Naturgesetze gelten?',
    rows: 5,
    category: 'rules',
    icon: <Scale className="h-4 w-4" />,
    tooltip: 'Die fundamentalen Grenzen deiner Welt. Was kann niemand tun, egal wie mächtig? Das schafft Spannung.',
    storyImpact: 'Regeln schaffen Stakes. Wenn alles möglich ist, ist nichts bedrohlich. Grenzen zwingen Charaktere zu kreativen Lösungen.',
    writingTips: [
      'Definiere harte Grenzen (Tod ist endgültig?)',
      'Nutze Regeln für Twists (Charakter bricht Regel, aber mit Folgen)',
      'Sei konsistent - Leser merken Widersprüche'
    ],
    example: 'Zeitreisen sind möglich, aber jede Reise erzeugt eine neue Zeitlinie. Du kannst deine eigene Vergangenheit nie ändern, nur neue Varianten erschaffen.'
  }
];

interface WorldBuildingFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  showTips?: boolean;
}

export function WorldBuildingField({ field, value, onChange, showTips = true }: WorldBuildingFieldProps) {
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">{field.icon}</span>
          <label className="text-sm font-medium">{field.label}</label>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-slate-400 hover:text-violet-600 transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-medium text-violet-700">{field.label}</p>
                  <p>{field.tooltip}</p>
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Einfluss auf die Story:
                    </p>
                    <p className="text-xs mt-1">{field.storyImpact}</p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {field.example && (
          <button
            onClick={() => setShowExample(!showExample)}
            className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <Lightbulb className="h-3 w-3" />
            {showExample ? 'Beispiel ausblenden' : 'Beispiel anzeigen'}
          </button>
        )}
      </div>

      {showExample && field.example && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <span className="font-medium">Beispiel: </span>
          {field.example}
        </div>
      )}

      <TextEnhancer
        label={field.label}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        rows={field.rows || 4}
        context={`Beschreibe ${field.label} für die Welt.`}
      />

      {showTips && field.writingTips.length > 0 && value && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Schreib-Tipps:
          </p>
          <ul className="space-y-1">
            {field.writingTips.map((tip, idx) => (
              <li key={idx} className="text-xs text-slate-500 flex items-start gap-1.5">
                <span className="text-violet-400 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
