import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== TYPES ====================

export interface Book {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  status: string;
  currentPhase: string;
  coverImage: string | null;
  styleanalysisCompleted: boolean;
  conceptCompleted: boolean;
  worldbuildingCompleted: boolean;
  plottingCompleted: boolean;
  draftingCompleted: boolean;
  editingCompleted: boolean;
  aiPersona: string | null;
  styleProfile?: string | null;
  plotStructure?: string | null;
  projectType?: string | null;
  projectCategory?: string | null;
  charactersCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BookPhase = 'styleanalysis' | 'concept' | 'worldbuilding' | 'characters' | 'plotting' | 'drafting' | 'editing' | 'publishing';

export const PHASES: { key: BookPhase; label: string; description: string }[] = [
  { key: 'styleanalysis', label: 'Stilanalyse', description: 'Deinen Schreibstil finden' },
  { key: 'concept', label: 'Konzept', description: 'Idee, Prämisse, Elevator Pitch' },
  { key: 'worldbuilding', label: 'World Building', description: 'Welt, Setting, Orte' },
  { key: 'characters', label: 'Charaktere', description: 'Figuren, Beziehungen, Psyche' },
  { key: 'plotting', label: 'Plotting & Struktur', description: 'Story-Struktur mit Kapitel-Beats planen' },
  { key: 'drafting', label: 'Schreiben', description: 'Kapitel schreiben' },
  { key: 'editing', label: 'Bearbeiten', description: 'Überarbeiten, Feedback' },
  { key: 'publishing', label: 'Veröffentlichen', description: 'Export, KDP, PDF' },
];

export interface Concept {
  id: string;
  bookId: string;
  premise: string | null;
  elevatorPitch: string | null;
  themes: string | null;
  tone: string | null;
  targetAudience: string | null;
  logline: string | null;
  centralConflict: string | null;
  uniqueHook: string | null;
  aiFeedback: string | null;
  suggestions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldSettings {
  id: string;
  bookId: string;
  timePeriod: string | null;
  location: string | null;
  worldType: string | null;
  geography: string | null;
  culture: string | null;
  politics: string | null;
  technology: string | null;
  history: string | null;
  rules: string | null;
  locations: Location[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  worldSettingsId: string;
  name: string;
  description: string | null;
  significance: string | null;
  atmosphere: string | null;
  imageUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  name: string;
  role: string | null;
  age: string | null;
  occupation: string | null;
  appearance: string | null;
  description: string | null;
  background: string | null;
  personality: string | null;
  goals: string | null;
  motivations: string | null;
  conflicts: string | null;
  flaws: string | null;
  strengths: string | null;
  arc: string | null;
  relationships: string | null;
  portraitUrl: string | null;
  notes: string | null;
  bookId: string;
  wish: string | null;
  roadBack: string | null;
  createdAt: Date;
  updatedAt: Date;
  // NEW: Character Nexus fields
  soulprint?: string | null;
  voiceProfile?: string | null;
  arcTimeline?: string | null;
  heroJourneyStep?: string | null;
  emotionPortraits?: string | null;
}

export interface PlotPoint {
  id: string;
  title: string;
  act: string;
  order: number;
  description: string | null;
  plotPointType: string | null;
  emotionalBeat: string | null;
  charactersInvolved: string | null;
  locationId: string | null;
  notes: string | null;
  bookId: string;
  isComplete: boolean;
  wordCountTarget: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  content: string;
  wordCount: number;
  status: string;
  plotPointId: string | null;
  povCharacter: string | null;
  setting: string | null;
  timeline: string | null;
  aiAnalysis: string | null;
  suggestions: string | null;
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchNote {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  tags: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileName: string | null;
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  imageType: 'cover' | 'character' | 'location' | 'scene';
  characterId: string | null;
  locationId: string | null;
  bookId: string;
  createdAt: Date;
}

export interface AIPersona {
  id: string;
  key: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export const DEFAULT_PERSONAS: Omit<AIPersona, 'id'>[] = [
  {
    key: 'creative_muse',
    name: 'Kreative Muse',
    description: 'Inspirierend und ideenreich – hilft beim Brainstorming',
    systemPrompt: 'Du bist eine kreative Muse für Autoren. Du bist inspirierend, enthusiastisch und hilfst dabei, kreative Blockaden zu überwinden. Du stellst aufschlussreiche Fragen und schlägst unerwartete Richtungen vor.',
    icon: 'Sparkles',
    color: 'violet',
    isDefault: true,
  },
  {
    key: 'editor',
    name: 'Lektor',
    description: 'Konkretes Feedback zur Prosa und zum Stil',
    systemPrompt: 'Du bist ein professioneller Lektor. Du gibst präzises, konstruktives Feedback zu Stil, Grammatik, Satzbau und Lesefluss. Du bist höflich, aber ehrlich in deiner Kritik.',
    icon: 'PenTool',
    color: 'blue',
    isDefault: false,
  },
  {
    key: 'critic',
    name: 'Kritiker',
    description: 'Harte, aber faire Kritik für bessere Geschichten',
    systemPrompt: 'Du bist ein erfahrener Literaturkritiker. Du identifizierst Schwächen in der Handlung, Charakteren und dem Erzählen. Du forderst den Autor heraus, besser zu werden, bleibst aber konstruktiv.',
    icon: 'Glasses',
    color: 'red',
    isDefault: false,
  },
  {
    key: 'developmental_editor',
    name: 'Entwicklungsredakteur',
    description: 'Großes Bild: Struktur, Arcs, Themen',
    systemPrompt: 'Du bist ein Entwicklungsredakteur. Du konzentrierst dich auf die große Ebene: Story-Struktur, Charakterentwicklung, Themen, Pacing und emotionale Resonanz. Du hilfst dabei, die Geschichte in ihrem Kern zu stärken.',
    icon: 'Compass',
    color: 'amber',
    isDefault: false,
  },
  {
    key: 'plot_specialist',
    name: 'Plot-Spezialist',
    description: 'Story-Struktur, Wendepunkte, Spannungsbögen',
    systemPrompt: 'Du bist ein Spezialist für Story-Struktur. Du verstehst 3-Akt-Struktur, Hero\'s Journey, Save the Cat und andere Modelle. Du hilfst dabei, starke Wendepunkte, klare Ziele und befriedigende Auflösungen zu gestalten.',
    icon: 'GitBranch',
    color: 'emerald',
    isDefault: false,
  },
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  context?: string;
  persona?: string;
  createdAt: Date;
}

// ==================== STORE ====================

interface AppState {
  // Current selections
  currentBookId: string | null;
  currentChapterId: string | null;
  currentPhase: BookPhase | null;
  selectedPersona: string;
  
  // Data
  books: Book[];
  chapters: Chapter[];
  characters: Character[];
  plotPoints: PlotPoint[];
  researchNotes: ResearchNote[];
  generatedImages: GeneratedImage[];
  chatMessages: ChatMessage[];
  concept: Concept | null;
  worldSettings: WorldSettings | null;
  
  // UI State
  sidebarOpen: boolean;
  activeTab: string;
  isLoading: boolean;
  currentBook: Book | null;
  
  // Actions
  setCurrentBookId: (bookId: string | null) => void;
  setCurrentBook: (book: Book | null) => void;
  setCurrentChapter: (chapterId: string | null) => void;
  setCurrentPhase: (phase: BookPhase | null) => void;
  setSelectedPersona: (persona: string) => void;
  
  setBooks: (books: Book[]) => void;
  setChapters: (chapters: Chapter[]) => void;
  setCharacters: (characters: Character[]) => void;
  setPlotPoints: (plotPoints: PlotPoint[]) => void;
  setResearchNotes: (notes: ResearchNote[]) => void;
  setGeneratedImages: (images: GeneratedImage[]) => void;
  setConcept: (concept: Concept | null) => void;
  setWorldSettings: (settings: WorldSettings | null) => void;
  
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setIsLoading: (loading: boolean) => void;
  
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  clearChat: () => void;
  updateChapterContent: (chapterId: string, content: string) => void;
  updateBookProgress: (phase: BookPhase, completed: boolean) => void;
  
  // NEW: Character Nexus Actions
  fetchCharacters: (bookId: string) => Promise<void>;
  addCharacter: (character: Character) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  deleteCharacter: (characterId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentBookId: null,
      currentChapterId: null,
      currentPhase: null,
      selectedPersona: 'creative_muse',
      
      books: [],
      chapters: [],
      characters: [],
      plotPoints: [],
      researchNotes: [],
      generatedImages: [],
      chatMessages: [],
      concept: null,
      worldSettings: null,
      
      sidebarOpen: true,
      activeTab: 'chapters',
      isLoading: false,
      currentBook: null,
      
      setCurrentBookId: (bookId) => set({ 
        currentBookId: bookId, 
        currentChapterId: null,
        currentPhase: bookId ? 'concept' : null,
        chapters: [],
        characters: [],
        plotPoints: [],
        researchNotes: [],
        generatedImages: [],
        concept: null,
        worldSettings: null,
      }),
      
      setCurrentChapter: (chapterId) => set({ currentChapterId: chapterId }),
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      setSelectedPersona: (persona) => set({ selectedPersona: persona }),
      
      setBooks: (books) => set({ books }),
      setCurrentBook: (book) => set({ currentBook: book }),
      setChapters: (chapters) => set({ chapters }),
      setCharacters: (characters) => set({ characters }),
      setPlotPoints: (plotPoints) => set({ plotPoints }),
      setResearchNotes: (researchNotes) => set({ researchNotes }),
      setGeneratedImages: (generatedImages) => set({ generatedImages }),
      setConcept: (concept) => set({ concept }),
      setWorldSettings: (worldSettings) => set({ worldSettings }),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, {
          ...message,
          id: crypto.randomUUID(),
          createdAt: new Date()
        }]
      })),
      
      clearChat: () => set({ chatMessages: [] }),
      
      updateChapterContent: (chapterId, content) => set((state) => ({
        chapters: state.chapters.map(ch => 
          ch.id === chapterId 
            ? { ...ch, content, wordCount: content.split(/\s+/).filter(w => w.length > 0).length }
            : ch
        )
      })),
      
      updateBookProgress: (phase, completed) => set((state) => {
        const updates: Partial<Book> = {};
        switch (phase) {
          case 'concept':
            updates.conceptCompleted = completed;
            break;
          case 'worldbuilding':
            updates.worldbuildingCompleted = completed;
            break;
          case 'plotting':
            updates.plottingCompleted = completed;
            break;
          case 'drafting':
            updates.draftingCompleted = completed;
            break;
          case 'editing':
            updates.editingCompleted = completed;
            break;
        }
        return {
          books: state.books.map(b => 
            b.id === state.currentBookId 
              ? { ...b, ...updates }
              : b
          )
        };
      }),
      
      // NEW: Character Nexus Actions
      fetchCharacters: async (bookId) => {
        try {
          const response = await fetch(`/api/characters?bookId=${bookId}`);
          if (response.ok) {
            const characters = await response.json();
            set({ characters });
          }
        } catch (error) {
          console.error('Failed to fetch characters:', error);
        }
      },
      
      addCharacter: (character) => set((state) => ({
        characters: [...state.characters, character]
      })),
      
      updateCharacter: (characterId, updates) => set((state) => ({
        characters: state.characters.map(c => 
          c.id === characterId ? { ...c, ...updates } : c
        )
      })),
      
      deleteCharacter: (characterId) => set((state) => ({
        characters: state.characters.filter(c => c.id !== characterId)
      })),
    }),
    {
      name: 'novelcraft-storage',
      partialize: (state) => ({
        currentBookId: state.currentBookId,
        currentChapterId: state.currentChapterId,
        currentPhase: state.currentPhase,
        selectedPersona: state.selectedPersona,
        sidebarOpen: state.sidebarOpen,
      })
    }
  )
);
