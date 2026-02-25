'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, Italic, List, ListOrdered, Quote, Redo, Undo, 
  Wand2, RefreshCw, Maximize2, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAiAction: (action: 'continue' | 'rewrite' | 'expand', text: string) => void;
  placeholder?: string;
}

export function TipTapEditor({ content, onChange, onAiAction, placeholder }: TipTapEditorProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your story...',
      }),
      Highlight,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      setSelectedText(text);
      
      if (text.length > 0) {
        const { view } = editor;
        const { state } = view;
        const { from, to } = state.selection;
        const start = view.coordsAtPos(from);
        setMenuPosition({ x: start.left, y: start.top - 50 });
        setShowAiMenu(true);
      } else {
        setShowAiMenu(false);
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleAiAction = useCallback((action: 'continue' | 'rewrite' | 'expand') => {
    const textToUse = selectedText || editor?.getText() || '';
    onAiAction(action, textToUse);
    setShowAiMenu(false);
  }, [selectedText, editor, onAiAction]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-slate-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-slate-200')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-slate-200')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-slate-200')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') && 'bg-slate-200')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive('blockquote') && 'bg-slate-200')}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        
        {/* AI Actions in Toolbar */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiAction('continue')}
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Continue
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiAction('rewrite')}
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Rewrite
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiAction('expand')}
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
          >
            <Maximize2 className="h-4 w-4 mr-1" />
            Expand
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-6">
        <EditorContent 
          editor={editor} 
          className="prose prose-slate max-w-none min-h-[300px] focus:outline-none"
        />
      </div>

      {/* Floating AI Menu for Selection */}
      {showAiMenu && selectedText && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-lg border p-1 flex gap-1"
          style={{ 
            left: Math.min(menuPosition.x, window.innerWidth - 250), 
            top: Math.max(menuPosition.y, 10) 
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiAction('rewrite')}
            className="text-violet-600"
          >
            <Wand2 className="h-3 w-3 mr-1" />
            Rewrite
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiAction('expand')}
            className="text-violet-600"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Expand
          </Button>
        </div>
      )}
    </div>
  );
}
