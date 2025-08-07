import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PanicButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handlePanic = () => {
    // Clear all local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear browser history
    window.history.replaceState(null, '', '/');
    
    // Navigate to a safe page
    window.location.href = 'https://www.google.com';
  };

  // Listen for Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && event.ctrlKey) {
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:bg-red-500/10 hover:text-red-300 h-8 w-8 sm:h-9 sm:w-9 lg:h-auto lg:w-auto lg:px-2 lg:py-1 flex flex-col sm:flex-row items-center justify-center"
        >
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 lg:mr-1" />
          <span className="text-xs sm:hidden lg:inline">Panic</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-900 border-red-500/20 text-white w-[95vw] max-w-md sm:max-w-lg mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-400 text-lg sm:text-xl">Emergency Exit</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300 text-sm sm:text-base">
            This will immediately clear all data and redirect to a safe page. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="border-white/20 text-gray-300 hover:bg-white/10 w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handlePanic}
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
          >
            Emergency Exit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
