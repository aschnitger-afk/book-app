# AuthorAI - AI-Assisted Book Writing Software

A comprehensive web application to support the entire book writing process with AI assistance.

## 🚀 Schnellstart (Google Gemini)

### 1. Gratis API Key holen
- Gehe zu: **https://ai.google.dev/**
- Melde dich mit deinem Google-Account an
- Klicke auf **"Get API Key"** und erstelle einen Key

### 2. Key einfügen
```bash
# Öffne die .env Datei
open /Users/knut/my-app/.env
```

Ersetze:
```
GEMINI_API_KEY="dein-gemini-key-hier"
```

mit deinem echten Key

### 3. Key testen
```bash
cd /Users/knut/my-app
./test-gemini.sh "dein-gemini-key"
```

### 4. App starten
```bash
cd /Users/knut/my-app && npm run dev
```

Öffne http://localhost:3000

---

## Features

### 📚 Project Management
- Create and manage multiple books
- Organize books into chapters
- Track writing progress and status

### ✍️ Rich Text Editor
- TipTap-based rich text editor
- Formatting tools (bold, italic, lists, quotes)
- Word count tracking
- Auto-save every 30 seconds

### 🤖 AI Chat Assistant
- Real-time chat with Google Gemini AI
- Brainstorm ideas
- Get feedback on your writing
- Ask questions about plot, characters, or style

### 📝 Inline AI Suggestions
- **Continue**: AI continues writing from your current position
- **Rewrite**: Improve clarity and flow while maintaining meaning
- **Expand**: Add more detail and depth to your writing

### 👤 Character Development Tools
- Create detailed character profiles
- Track character arcs, backgrounds, goals, and conflicts
- AI-generated character suggestions

### 🗺️ Plot Structure
- Three-act structure organization (Setup, Confrontation, Resolution)
- Plot point tracking
- AI-generated plot ideas

### 🎨 Style Mimicry
- Upload example texts to analyze writing style
- AI analyzes and describes style patterns
- AI writes in your chosen style

### 📊 Content Assessment
- AI reviews and provides feedback on your writing
- Strengths, areas for improvement, pacing analysis

### 📤 Export
- Export to Markdown format

---

## Tech Stack

- **Framework**: Next.js 16 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite + Prisma ORM
- **Editor**: TipTap
- **AI**: Google Gemini (gratis Tier)
- **State Management**: Zustand

---

## Verfügbare Gemini Modelle

| Modell | Beschreibung | Rate Limit |
|--------|-------------|------------|
| `gemini-1.5-flash` | Schnell, günstig, gut | 15 RPM gratis |
| `gemini-1.5-pro` | Beste Qualität | 2 RPM gratis |
| `gemini-1.0-pro` | Legacy | 15 RPM gratis |

Ändere das Modell in `lib/ai.ts`:
```typescript
export const DEFAULT_MODEL = 'gemini-1.5-flash';
```

---

## Projektstruktur

```
my-app/
├── app/
│   ├── api/              # API Routen
│   ├── books/[id]/       # Buch-Editor
│   └── page.tsx          # Startseite
├── components/
│   ├── editor/           # TipTap Editor
│   ├── sidebar/          # Navigation & Chat
│   └── modals/           # Character/Plot/Style
├── lib/
│   ├── prisma.ts         # Datenbank
│   ├── ai.ts             # Gemini Integration
│   └── store.ts          # State Management
└── prisma/
    └── schema.prisma     # Datenbank Schema
```

---

## License

MIT
