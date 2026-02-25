# Filmskript-Integration: Konzeption

## Empfohlene Lösung: Separate "Screenplay Adaptation"-Phase

### Warum keine eigene Plotting-Phase für Filme?
Die Plotting-Phase ist für das **Buch** gedacht. Wenn wir hier Filmlogik einbauen:
- Verwirrt das den Autor (Buch oder Film plotten?)
- Überschreibt es die Buchstruktur

### Besser: Adaptation-Workflow

**Flow:**
```
Buch schreiben → Buch fertig → "Film-Adaptation erstellen" → Neue Screenplay-Phase
```

**Vorteile:**
1. Beide Artefakte bleiben (Buch + Drehbuch)
2. Alle recherchierten Daten werden übernommen
3. Klare Trennung der Strukturen
4. Man kann mehrere Filmversionen aus einem Buch machen

### Datenbank (bereits implementiert)
- `projectType`: FICTION, NON_FICTION, SCREENPLAY, TV_SERIES
- `sourceBookId`: Verknüpfung Buch → Drehbuch
- `ScreenplayScene` Model für Szenen

### UI-Änderungen nötig:
1. **Neue Phase**: "Screenplay Adaptation" nach "Veröffentlichen"
2. **Szenen-Editor**: INT./EXT. Format
3. **Film-Strukturen**: Save the Cat, 3-Akt-Film, etc.
4. **"Adaptation erstellen" Button** am Ende des Buch-Workflows

### Technische Unterschiede Roman vs. Film:

| Aspekt | Roman | Filmskript |
|--------|-------|------------|
| Einheiten | Kapitel (2000-5000 Wörter) | Szenen (1-3 Minuten) |
| Anzahl | 10-50 Kapitel | 40-120 Szenen |
| Format | Fließtext | Scene Heading + Action + Dialog |
| Plot-Beats | 12-15 | 40 Szenen-Karten |

### Empfohlener Implementierungs-Reihenfolge:
1. ✅ Datenbank-Schema
2. 🔄 "Adaptation erstellen"-Button
3. ⏳ Screenplay-Phase mit Szenen-Editor
4. ⏳ Film-Plot-Strukturen
5. ⏳ Export (PDF, FDX)

**Soll ich mit der Implementierung der Screenplay-Phase beginnen?**
