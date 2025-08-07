import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  className?: string;
}

export default function ThemeToggle({ theme, onThemeChange, className = "" }: ThemeToggleProps) {
  const toggleTheme = () => {
    onThemeChange(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`text-gray-300 hover:bg-white/10 h-8 w-8 lg:h-9 lg:w-9 ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-3 w-3 lg:h-4 lg:w-4" />
      ) : (
        <Moon className="h-3 w-3 lg:h-4 lg:w-4" />
      )}
    </Button>
  );
}
