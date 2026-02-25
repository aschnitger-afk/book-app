import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { bookId, format = 'markdown' } = await request.json();
    
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: { orderBy: { order: 'asc' } },
        characters: true,
      }
    });
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    let content = '';

    if (format === 'markdown') {
      // Title
      content += `# ${book.title}\n\n`;
      
      if (book.description) {
        content += `*${book.description}*\n\n`;
      }
      
      if (book.genre) {
        content += `**Genre:** ${book.genre}\n\n`;
      }

      content += `---\n\n`;

      // Characters
      if (book.characters.length > 0) {
        content += `## Characters\n\n`;
        for (const char of book.characters) {
          content += `### ${char.name}\n`;
          if (char.role) content += `**Role:** ${char.role}\n`;
          if (char.description) content += `${char.description}\n`;
          if (char.background) content += `\n**Background:** ${char.background}\n`;
          if (char.goals) content += `\n**Goals:** ${char.goals}\n`;
          if (char.conflicts) content += `\n**Conflicts:** ${char.conflicts}\n`;
          content += `\n`;
        }
        content += `---\n\n`;
      }

      // Chapters
      for (const chapter of book.chapters) {
        content += `## ${chapter.title}\n\n`;
        
        // Convert HTML to Markdown (basic conversion)
        const chapterText = chapter.content
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"');
        
        content += chapterText + '\n\n';
        content += `---\n\n`;
      }
    } else if (format === 'html') {
      // HTML export
      content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${book.title}</title>
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 1rem; }
    h2 { margin-top: 2rem; page-break-before: always; }
    .meta { text-align: center; color: #666; margin-bottom: 2rem; }
    .characters { background: #f5f5f5; padding: 1rem; margin: 2rem 0; }
  </style>
</head>
<body>
  <h1>${book.title}</h1>
  ${book.description ? `<p class="meta">${book.description}</p>` : ''}
  ${book.genre ? `<p class="meta">Genre: ${book.genre}</p>` : ''}
  
  ${book.characters.length > 0 ? `
  <div class="characters">
    <h2>Characters</h2>
    ${book.characters.map(char => `
      <h3>${char.name}</h3>
      ${char.role ? `<p><strong>Role:</strong> ${char.role}</p>` : ''}
      ${char.description ? `<p>${char.description}</p>` : ''}
    `).join('')}
  </div>
  ` : ''}
  
  ${book.chapters.map(chapter => `
    <h2>${chapter.title}</h2>
    ${chapter.content}
  `).join('')}
</body>
</html>`;
    }

    return NextResponse.json({ 
      content,
      filename: `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format === 'html' ? 'html' : 'md'}`
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export book' }, { status: 500 });
  }
}
