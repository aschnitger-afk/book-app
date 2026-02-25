import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Export to various formats
export async function POST(request: NextRequest) {
  try {
    const { bookId, format } = await request.json();
    
    if (!bookId || !format) {
      return NextResponse.json({ error: 'Book ID and format required' }, { status: 400 });
    }
    
    // Get book with all content
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          orderBy: { order: 'asc' }
        },
        characters: true,
      }
    });
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    let content = '';
    let filename = '';
    let mimeType = '';
    
    switch (format) {
      case 'markdown':
        content = generateMarkdown(book);
        filename = `${sanitizeFilename(book.title)}.md`;
        mimeType = 'text/markdown';
        break;
      case 'html':
        content = generateHTML(book);
        filename = `${sanitizeFilename(book.title)}.html`;
        mimeType = 'text/html';
        break;
      case 'txt':
        content = generatePlainText(book);
        filename = `${sanitizeFilename(book.title)}.txt`;
        mimeType = 'text/plain';
        break;
      case 'kdp':
        content = generateKDP(book);
        filename = `${sanitizeFilename(book.title)}_KDP.docx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        // Note: Actual DOCX generation would require a library like docx.js
        content = generateKDP(book); // Returns markdown that can be converted
        break;
      default:
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      content, 
      filename,
      mimeType,
      wordCount: book.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
      chapterCount: book.chapters.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export book' }, { status: 500 });
  }
}

function sanitizeFilename(title: string): string {
  return title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function generateMarkdown(book: any): string {
  let md = `# ${book.title}\n\n`;
  
  if (book.description) {
    md += `>${book.description}\n\n`;
  }
  
  md += `---\n\n`;
  
  book.chapters.forEach((chapter: any) => {
    md += `## ${chapter.title}\n\n`;
    md += `${chapter.content}\n\n`;
    md += `---\n\n`;
  });
  
  return md;
}

function generateHTML(book: any): string {
  let html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${book.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { text-align: center; margin-bottom: 0.5rem; }
    .subtitle { text-align: center; color: #666; margin-bottom: 2rem; }
    h2 { margin-top: 3rem; page-break-before: always; }
    .chapter { margin-bottom: 2rem; }
    @media print { h2 { page-break-before: always; } }
  </style>
</head>
<body>
  <h1>${book.title}</h1>
  ${book.description ? `<p class="subtitle">${book.description}</p>` : ''}
`;
  
  book.chapters.forEach((chapter: any) => {
    html += `  <h2>${chapter.title}</h2>\n`;
    html += `  <div class="chapter">${chapter.content.replace(/\n/g, '<br>')}</div>\n`;
  });
  
  html += `</body>\n</html>`;
  
  return html;
}

function generatePlainText(book: any): string {
  let text = `${book.title}\n${'='.repeat(book.title.length)}\n\n`;
  
  if (book.description) {
    text += `${book.description}\n\n`;
  }
  
  book.chapters.forEach((chapter: any) => {
    text += `${chapter.title.toUpperCase()}\n${'-'.repeat(chapter.title.length)}\n\n`;
    text += `${chapter.content}\n\n`;
  });
  
  return text;
}

function generateKDP(book: any): string {
  // KDP-ready format (simplified markdown with clear structure)
  let kdp = `# ${book.title}\n\n`;
  
  if (book.description) {
    kdp += `${book.description}\n\n`;
  }
  
  kdp += `***\n\n`;
  kdp += `COPYRIGHT\n\n`;
  kdp += `© ${new Date().getFullYear()} Alle Rechte vorbehalten.\n\n`;
  kdp += `***\n\n`;
  
  book.chapters.forEach((chapter: any, index: number) => {
    kdp += `# Kapitel ${index + 1}: ${chapter.title}\n\n`;
    kdp += `${chapter.content}\n\n`;
    kdp += `***\n\n`;
  });
  
  return kdp;
}

// Update book status to published
export async function PUT(request: NextRequest) {
  try {
    const { bookId, status } = await request.json();
    
    const book = await prisma.book.update({
      where: { id: bookId },
      data: { 
        status: status || 'published',
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update book status' }, { status: 500 });
  }
}
