import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;
const WAVESPEED_API_URL = 'https://api.wavespeed.ai/api/v3/images/generations';

// Ensure directory exists
async function ensureDirectory(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (e) {
    // Directory already exists
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Image generation request received');
    
    if (!WAVESPEED_API_KEY) {
      console.error('Wavespeed API key not configured');
      return NextResponse.json({ error: 'Wavespeed API key not configured' }, { status: 500 });
    }

    const { prompt, imageType, bookId, characterId, locationId, negativePrompt, width = 1024, height = 1024 } = await request.json();
    
    console.log('Generating image for:', { prompt: prompt?.substring(0, 50), imageType, bookId, characterId });

    if (!prompt || !bookId) {
      return NextResponse.json({ error: 'Prompt and bookId are required' }, { status: 400 });
    }

    // Enhance prompt for character portraits
    let enhancedPrompt = prompt;
    if (imageType === 'character') {
      enhancedPrompt = `Professional portrait photograph of ${prompt}, high quality, detailed face, good lighting, realistic, 8k, masterpiece`;
    }

    // Call Wavespeed.ai API
    console.log('Calling Wavespeed API...');
    const response = await fetch(WAVESPEED_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'stable-diffusion-xl',
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt || 'blurry, low quality, distorted, ugly, bad anatomy',
        width,
        height,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }),
    });

    console.log('Wavespeed API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Wavespeed API error:', errorText);
      return NextResponse.json({ 
        error: 'Wavespeed API error', 
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Wavespeed API response:', JSON.stringify(data, null, 2));
    
    // Try different possible response formats
    let imageUrl = data.image_url || data.url || data.output?.[0] || data.images?.[0]?.url;
    
    if (!imageUrl && data.id) {
      // If we got a job ID, the image is being processed asynchronously
      // Return a placeholder and let the client poll or use the ID
      console.log('Image is being processed, job ID:', data.id);
      
      // For now, return an error - we'll need to implement polling
      return NextResponse.json({ 
        error: 'Image is being processed asynchronously. This feature requires polling implementation.',
        jobId: data.id 
      }, { status: 202 });
    }
    
    if (!imageUrl) {
      console.error('No image URL in response:', data);
      return NextResponse.json({ 
        error: 'No image URL in response',
        response: data
      }, { status: 500 });
    }

    // Download the image
    console.log('Downloading image from:', imageUrl);
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      console.error('Failed to download image:', imageResponse.status);
      return NextResponse.json({ 
        error: 'Failed to download generated image' 
      }, { status: 500 });
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log('Image downloaded, size:', imageBuffer.byteLength);
    
    // Ensure directory exists
    const publicDir = join(process.cwd(), 'public', 'generated');
    await ensureDirectory(publicDir);
    
    const fileName = `${uuidv4()}.png`;
    const filePath = join(publicDir, fileName);
    
    // Save the image
    await writeFile(filePath, Buffer.from(imageBuffer));
    console.log('Image saved to:', filePath);
    
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

    console.log('Image record created:', generatedImage.id);
    return NextResponse.json(generatedImage);
    
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate image',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
