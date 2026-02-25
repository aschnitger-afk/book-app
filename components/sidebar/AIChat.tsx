'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Sparkles, Trash2, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AIChatProps {
  context?: string;
}

export function AIChat({ context }: AIChatProps) {
  const { chatMessages, addChatMessage, clearChat, currentBookId, chapters, characters } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMessage, context });
    setIsLoading(true);

    try {
      const contextInfo = [
        currentBookId && `Book context: Writing a book with ${chapters.length} chapters`,
        characters.length > 0 && `Characters: ${characters.map(c => c.name).join(', ')}`,
        context
      ].filter(Boolean).join('\n');

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })).concat([{ role: 'user', content: userMessage }]),
          context: contextInfo
        }),
      });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        addChatMessage({ role: 'assistant', content: '', context });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          
          // Update the last message
          const messages = [...useAppStore.getState().chatMessages];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = assistantMessage;
            // Update store
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage({ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        context 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Help me brainstorm plot ideas',
    'Analyze my story structure',
    'Suggest character developments',
    'Help with dialogue',
    'Review my writing',
  ];

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-violet-600" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={clearChat}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {chatMessages.length === 0 ? (
          <div className="space-y-3">
            <div className="text-center text-slate-500 py-8">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-violet-400" />
              <p className="text-sm">How can I help with your writing today?</p>
            </div>
            <div className="space-y-2">
              {quickPrompts.map((prompt, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start text-left text-sm h-auto py-2"
                  onClick={() => setInput(prompt)}
                >
                  <MessageSquare className="h-3 w-3 mr-2 shrink-0" />
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-2',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={cn(
                    'text-xs',
                    message.role === 'user' ? 'bg-slate-200' : 'bg-violet-100 text-violet-600'
                  )}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm max-w-[85%]',
                    message.role === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  )}
                >
                  {message.content || (isLoading && index === chatMessages.length - 1 && message.role === 'assistant') ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : null}
                  {isLoading && index === chatMessages.length - 1 && message.role === 'assistant' && !message.content && (
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce delay-100">●</span>
                      <span className="animate-bounce delay-200">●</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
