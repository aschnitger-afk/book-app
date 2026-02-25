'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, MoreVertical, Trash2, Edit2, ArrowRight } from 'lucide-react';
import { useAppStore, Book } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function BooksPage() {
  const router = useRouter();
  const { setCurrentBookId } = useAppStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookGenre, setNewBookGenre] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBook = async () => {
    if (!newBookTitle.trim()) return;

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBookTitle,
          genre: newBookGenre,
        }),
      });

      const book = await response.json();
      setBooks([book, ...books]);
      setNewBookTitle('');
      setNewBookGenre('');
      setIsCreating(false);
      
      // Navigate to the book
      handleOpenBook(book);
    } catch (error) {
      console.error('Failed to create book:', error);
    }
  };

  const handleOpenBook = (book: Book) => {
    setCurrentBookId(book.id);
    router.push(`/books/${book.id}`);
  };

  const handleDeleteBook = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    try {
      await fetch(`/api/books/${id}`, { method: 'DELETE' });
      setBooks(books.filter(b => b.id !== id));
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'writing': return 'bg-blue-100 text-blue-700';
      case 'editing': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-violet-600" />
            <h1 className="text-xl font-bold">AuthorAI</h1>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Book</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    placeholder="Enter book title"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateBook()}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Genre (optional)</label>
                  <Input
                    value={newBookGenre}
                    onChange={(e) => setNewBookGenre(e.target.value)}
                    placeholder="e.g., Fantasy, Romance, Mystery"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreateBook}
                  disabled={!newBookTitle.trim()}
                >
                  Create Book
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No books yet</h2>
            <p className="text-slate-500 mb-6">Start your writing journey by creating your first book</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Book
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card 
                key={book.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => handleOpenBook(book)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate text-lg">{book.title}</CardTitle>
                      {book.genre && (
                        <CardDescription className="mt-1">{book.genre}</CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleDeleteBook(book.id, e)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(book.status)} variant="secondary">
                      {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Updated {new Date(book.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Card */}
            <Card 
              className="border-dashed cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all flex items-center justify-center min-h-[160px]"
              onClick={() => setIsCreating(true)}
            >
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Create New Book</p>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
