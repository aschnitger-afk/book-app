import { NextRequest, NextResponse } from 'next/server';
import { streamChat, WRITING_ASSISTANT_PROMPT } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();
    
    const systemMessage = {
      role: 'system' as const,
      content: WRITING_ASSISTANT_PROMPT + (context ? `\n\nContext: ${context}` : '')
    };
    
    const stream = await streamChat([systemMessage, ...messages]);
    
    if (!stream) {
      return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 });
    }
    
    // Gemini Streaming zu ReadableStream konvertieren
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    
    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      error: 'AI request failed',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
