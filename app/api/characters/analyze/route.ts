import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Check if API key is configured
const isAIConfigured = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== ''; // Fallback responses for demo/testing when no API key
const getFallbackDecision = (characterName: string, scenario: string) => {
  return `Als ${characterName} würde ich zunächst innezuhalten und die Situation abwägen. Meine ersten Gedanken kreisen um die Konsequenzen - nicht nur für mich, sondern für alle Beteiligten.\n\nNach einer Moment der Reflexion würde ich mich entscheiden, das Richtige zu tun, auch wenn es schwerfällt. Meine Motivation ist tief verwurzelt in meinen Werten und meiner Vergangenheit.\n\nWarum? Weil jede Entscheidung, die ich treffe, mich definiert. Und ich möchte der Mensch sein, der auch in schwierigen Momenten Integrität zeigt.`;
};

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
      // Fallback if no API key
      if (!isAIConfigured) {
        const fallbackProfile = {
          complexity: 50,
          avgSentenceLength: 15,
          favoriteWords: ['wirklich', 'einfach', 'natürlich', 'genau', 'tatsächlich'],
          tone: 'neutral'
        };
        await prisma.character.update({
          where: { id: characterId },
          data: { voiceProfile: JSON.stringify(fallbackProfile) },
        });
        return NextResponse.json(fallbackProfile);
      }

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

      try {
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
      } catch (aiError) {
        console.error('Voice analysis failed:', aiError);
        return NextResponse.json({ 
          complexity: 50,
          avgSentenceLength: 15,
          favoriteWords: ['wirklich', 'einfach', 'natürlich'],
          tone: 'neutral'
        });
      }
    }

    if (type === 'soulprint') {
      // Generate psychological profile
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      });

      // Fallback if no API key
      if (!isAIConfigured) {
        const fallbackSoulprint = {
          empathy: 50,
          order: 50,
          tradition: 50,
          extroversion: 50,
          risk: 50,
          logic: 50
        };
        await prisma.character.update({
          where: { id: characterId },
          data: { soulprint: JSON.stringify(fallbackSoulprint) },
        });
        return NextResponse.json(fallbackSoulprint);
      }

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

      try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const soulprint = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        await prisma.character.update({
          where: { id: characterId },
          data: { soulprint: JSON.stringify(soulprint) },
        });

        return NextResponse.json(soulprint);
      } catch (aiError) {
        console.error('Soulprint analysis failed:', aiError);
        return NextResponse.json({
          empathy: 50, order: 50, tradition: 50,
          extroversion: 50, risk: 50, logic: 50
        });
      }
    }

    if (type === 'decision') {
      // Character decision simulation
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      });

      const { scenario } = body;

      // Use fallback if no API key configured
      if (!isAIConfigured) {
        console.log('Using fallback decision (no API key)');
        return NextResponse.json({ 
          decision: getFallbackDecision(character?.name || 'Character', scenario),
          note: 'Demo mode - API key not configured'
        });
      }

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

      try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return NextResponse.json({ decision: response });
      } catch (aiError) {
        console.error('AI generation failed, using fallback:', aiError);
        return NextResponse.json({ 
          decision: getFallbackDecision(character?.name || 'Character', scenario),
          note: 'Fallback mode - AI temporarily unavailable'
        });
      }
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
