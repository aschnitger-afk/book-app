import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;
const WAVESPEED_API_URL = 'https://api.wavespeed.ai/api/v3/images/generations';

export async function POST(request: NextRequest) {
  try {
    if (!WAVESPEED_API_KEY) {
      return NextResponse.json({ error: 'Wavespeed API key not configured' }, { status: 500 });
    }

    const { prompt, imageType, bookId, characterId, locationId, negativePrompt, width = 1024, height = 1024 } = await request.json();

    if (!prompt || !bookId) {
      return NextResponse.json({ error: 'Prompt and bookId are required' }, { status: 400 });
    }

    // Call Wavespeed.ai API
    const response = await fetch(WAVESPEED_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'stable-diffusion-xl',
        prompt,
        negative_prompt: negativePrompt || '',
        width,
        height,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Wavespeed API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Download the image
    const imageUrl = data.image_url || data.images?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    // Fetch and save the image locally
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    
    const fileName = `${uuidv4()}.png`;
    const publicDir = join(process.cwd(), 'public', 'generated');
    const filePath = join(publicDir, fileName);
    
    // Ensure directory exists
    await writeFile(filePath, Buffer.from(imageBuffer));
    
    // Save to database
    const generatedImage = await prisma.generatedImage.create({
      data: {
        prompt,
        imageUrl: `/generated/${fileName}`,
        imageType: imageType || 'scene',
        bookId,
        characterId,
        locationId,
      }
    });

    return NextResponse.json(generatedImage);
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate image',
      details: error.message 
    }, { status: 500 });
  }
}
