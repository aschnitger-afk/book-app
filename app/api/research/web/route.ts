import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { query, context, category, type } = await request.json();
    
    console.log('Research API called:', { query, type, category });
    
    if (!query?.trim()) {
      console.log('Error: No query provided');
      return NextResponse.json({ error: 'Suchbegriff erforderlich' }, { status: 400 });
    }

    const researchType = type || category || 'general';

    const researchPrompt = `Du bist ein Recherche-Assistent für einen Romanautoren. 

KONTEXT DES BUCHS:
${context || 'Kein Kontext angegeben'}

RECHERCHE-TYP: ${researchType}

SUCHE: "${query}"

Bitte erstelle eine fundierte Recherche zu diesem Thema. Strukturiere deine Antwort wie folgt:

## ZUSAMMENFASSUNG
3-5 prägnante Sätze mit den wichtigsten Fakten.

## DETAIL-INFORMATIONEN
5-10 spezifische Punkte mit relevanten Details, die für die Weltentwicklung nützlich sind.

## MÖGLICHE QUELLEN (fiktiv)
- Wikipedia-Artikel zum Thema
- Fachbücher oder Akademische Quellen
- Reiseberichte oder Dokumentationen
- Historische Archive
- Experteninterviews

## ANWENDUNG IM BUCH
2-3 konkrete Vorschläge, wie diese Informationen in die Geschichte integriert werden können.

## NOTIZEN / SPICKZETTEL
Erstelle 3-5 Stichpunkte, die der Autor als "Spickzettel" für spätere Referenz nutzen kann.

Schreibe auf Deutsch, akademisch aber verständlich. Fokussiere auf authentische, nutzbare Details.`;

    console.log('Calling AI with prompt...');
    
    const result = await chatCompletion([
      { role: 'system', content: 'Du bist ein hilfreicher Recherche-Assistent für Autoren.' },
      { role: 'user', content: researchPrompt }
    ]);

    console.log('AI result received, length:', result?.length || 0);

    if (!result) {
      throw new Error('Keine Antwort von der KI erhalten');
    }

    return NextResponse.json({ 
      result,
      query,
      type: researchType,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Research API Error:', error);
    return NextResponse.json({ 
      error: 'Recherche fehlgeschlagen',
      details: error.message 
    }, { status: 500 });
  }
}
