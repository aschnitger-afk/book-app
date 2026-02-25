import { NextResponse } from 'next/server';
import { chatCompletion, DEFAULT_PERSONAS } from '@/lib/ai';

export async function GET() {
  try {
    const testResult = await chatCompletion([
      { role: 'system', content: 'Du bist ein hilfreicher Assistent. Antworte auf Deutsch.' },
      { role: 'user', content: 'Sag "KI-Verbindung funktioniert!" in einem kurzen Satz.' }
    ]);

    return NextResponse.json({ 
      success: true, 
      message: testResult,
      personas: DEFAULT_PERSONAS.map(p => p.name),
      provider: process.env.AI_PROVIDER,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      moonshotConfigured: !!process.env.MOONSHOT_API_KEY,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      provider: process.env.AI_PROVIDER,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      moonshotConfigured: !!process.env.MOONSHOT_API_KEY,
      moonshotKeyPrefix: process.env.MOONSHOT_API_KEY?.substring(0, 10) + '...',
      help: error.message?.includes('Authentication') 
        ? 'Der Moonshot API Key ist ungültig. API Keys gibt es nur unter https://platform.moonshot.cn/ (nicht kimi.moonshot.cn!)'
        : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    const result = await chatCompletion([
      { role: 'system', content: 'Du bist ein kreativer Schreibassistent. Antworte auf Deutsch.' },
      { role: 'user', content: prompt }
    ]);

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      help: error.message?.includes('Authentication') 
        ? 'API Key ungültig. Für Moonshot/Kimi: Key muss von https://platform.moonshot.cn/ kommen (Developer Platform, nicht die Chat-Console!)'
        : undefined
    }, { status: 500 });
  }
}
