import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;
const WAVESPEED_API_URL = 'https://api.wavespeed.ai/api/v3/images/generations';

// Available models at Wavespeed.ai
// NOTE: These models require an active WaveSpeed.ai subscription
// If you get "product not found" errors, the API key may not have access to these models
const MODELS = {
  sdxl: 'wavespeed-ai/flux-dev-realism',  // Better for realistic portraits
  general: 'wavespeed-ai/flux-dev',        // General purpose
};

// Fallback: Create a placeholder SVG image when API fails
function createPlaceholderImage(prompt: string, imageType: string): Buffer {
  const colors = imageType === 'character' 
    ? { bg: '#6366f1', text: '#ffffff' }
    : { bg: '#10b981', text: '#ffffff' };
  
  const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="${colors.bg}"/>
    <text x="256" y="240" font-family="Arial" font-size="24" fill="${colors.text}" text-anchor="middle">
      ${imageType === 'character' ? '👤' : '🖼️'}
    </text>
    <text x="256" y="280" font-family="Arial" font-size="16" fill="${colors.text}" text-anchor="middle">
      ${imageType === 'character' ? 'Character Portrait' : 'Scene Image'}
    </text>
    <text x="256" y="310" font-family="Arial" font-size="12" fill="${colors.text}" text-anchor="middle" opacity="0.7">
      AI Generation Temporarily Unavailable
    </text>
  </svg>`;
  
  return Buffer.from(svg);
}

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
    
    console.log('Generating image:', { prompt: prompt?.substring(0, 50), imageType, bookId });

    if (!prompt || !bookId) {
      return NextResponse.json({ error: 'Prompt and bookId are required' }, { status: 400 });
    }

    // Enhance prompt for character portraits
    let enhancedPrompt = prompt;
    if (imageType === 'character') {
      enhancedPrompt = `Professional portrait photograph of ${prompt}, high quality, detailed face, good lighting, realistic, 8k, masterpiece, cinematic lighting, sharp focus`;
    }

    // Try different models
    let lastError = null;
    
    for (const [modelName, modelId] of Object.entries(MODELS)) {
      try {
        console.log(`Trying model: ${modelName} (${modelId})`);
        
        const response = await fetch(WAVESPEED_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WAVESPEED_API_KEY}`,
          },
          body: JSON.stringify({
            model: modelId,
            prompt: enhancedPrompt,
            negative_prompt: negativePrompt || 'blurry, low quality, distorted, ugly, bad anatomy, deformed, watermark',
            width: Math.min(width, 1024),
            height: Math.min(height, 1024),
            num_inference_steps: 28,
            guidance_scale: 7.5,
          }),
        });

        console.log(`Model ${modelName} response status:`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${modelName} failed:`, errorText);
          lastError = errorText;
          continue; // Try next model
        }

        const data = await response.json();
        console.log(`Model ${modelName} response:`, JSON.stringify(data, null, 2));
        
        // Handle different response formats
        let imageUrl = data.image_url || data.url || data.output?.[0] || data.images?.[0]?.url || data.image?.url;
        
        if (!imageUrl && data.id) {
          // Async processing - poll for result
          console.log('Image processing asynchronously, job ID:', data.id);
          
          // Poll for result (max 30 seconds)
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 1000));
            
            const statusResponse = await fetch(`${WAVESPEED_API_URL}/${data.id}`, {
              headers: { 'Authorization': `Bearer ${WAVESPEED_API_KEY}` },
            });
            
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              console.log(`Poll ${i+1}:`, statusData.status);
              
              if (statusData.status === 'completed' && statusData.image_url) {
                imageUrl = statusData.image_url;
                break;
              } else if (statusData.status === 'failed') {
                throw new Error('Image generation failed');
              }
            }
          }
        }
        
        if (!imageUrl) {
          console.error('No image URL from model:', modelName);
          continue; // Try next model
        }

        // Download the image
        console.log('Downloading image from:', imageUrl);
        const imageResponse = await fetch(imageUrl);
        
        if (!imageResponse.ok) {
          console.error('Failed to download image:', imageResponse.status);
          continue; // Try next model
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
        
      } catch (modelError: any) {
        console.error(`Model ${modelName} error:`, modelError.message);
        lastError = modelError.message;
        continue; // Try next model
      }
    }
    
    // All models failed - use fallback placeholder
    console.log('All models failed, using placeholder image');
    
    // Ensure directory exists
    const publicDir = join(process.cwd(), 'public', 'generated');
    await ensureDirectory(publicDir);
    
    const fileName = `${uuidv4()}.svg`;
    const filePath = join(publicDir, fileName);
    
    // Create placeholder
    const placeholderBuffer = createPlaceholderImage(prompt, imageType || 'scene');
    await writeFile(filePath, placeholderBuffer);
    console.log('Placeholder saved to:', filePath);
    
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

    console.log('Placeholder record created:', generatedImage.id);
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
