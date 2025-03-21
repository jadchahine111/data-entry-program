
import React from 'react';
import Header from './Header';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={cn("flex-1 container py-8 animate-fade-in", className)}>
        {children}
      </main>
    </div>
  );
};

export default Container;
