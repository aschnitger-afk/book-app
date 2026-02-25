import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// POST analyze character voice/style
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, bookId, sampleText, type } = body;

    if (!characterId || !bookId) {
      return NextResponse.json(
        { error: 'Character ID and Book ID required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    if (type === 'voice') {
      // Analyze character voice from sample text
      const prompt = `Analyze the writing voice of this character from the following sample text.
      Return ONLY a JSON object with these exact fields:
      {
        "complexity": number (0-100, vocabulary sophistication),
        "avgSentenceLength": number (average words per sentence),
        "favoriteWords": string[] (top 5 characteristic words),
        "tone": string (overall emotional tone: formal, casual, poetic, harsh, etc.)
      }
      
      Sample text: "${sampleText || 'No text provided'}"`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const voiceProfile = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      // Update character
      await prisma.character.update({
        where: { id: characterId },
        data: { voiceProfile: JSON.stringify(voiceProfile) },
      });

      return NextResponse.json(voiceProfile);
    }

    if (type === 'soulprint') {
      // Generate psychological profile
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      });

      const prompt = `Analyze this character's psychological profile based on their description.
      Return ONLY a JSON object with values 0-100 for each dimension:
      {
        "empathy": number (0=selfish, 100=compassionate),
        "order": number (0=chaotic, 100=structured),
        "tradition": number (0=innovative, 100=traditional),
        "extroversion": number (0=introverted, 100=extroverted),
        "risk": number (0=cautious, 100=risk-taking),
        "logic": number (0=emotional, 100=logical)
      }
      
      Character: ${character?.name}
      Description: ${character?.description || ''}
      Personality: ${character?.personality || ''}
      Background: ${character?.background || ''}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const soulprint = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      await prisma.character.update({
        where: { id: characterId },
        data: { soulprint: JSON.stringify(soulprint) },
      });

      return NextResponse.json(soulprint);
    }

    if (type === 'decision') {
      // Character decision simulation
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      });

      const { scenario } = body;

      const prompt = `You are ${character?.name}. Respond to this scenario AS THIS CHARACTER would.
      Include:
      1. The decision/action taken
      2. Brief internal monologue explaining WHY (referencing motivations, fears, goals)
      
      Character Profile:
      - Name: ${character?.name}
      - Role: ${character?.role}
      - Personality: ${character?.personality}
      - Goals: ${character?.goals}
      - Motivations: ${character?.motivations}
      - Flaws: ${character?.flaws}
      - Strengths: ${character?.strengths}
      
      Scenario: ${scenario}
      
      Respond in character, first person.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return NextResponse.json({ decision: response });
    }

    return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
  } catch (error) {
    console.error('Character analysis failed:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
