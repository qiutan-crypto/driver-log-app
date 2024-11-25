'use client'

import { ChevronLeft, Home } from 'lucide-react';
import Link from 'next/link';

interface NavHeaderProps {
  title: string;
}

export const NavHeader = ({ title }: NavHeaderProps) => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center h-14">
          <Link 
            href="/" 
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold flex-1">{title}</h1>
          <Link 
            href="/" 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};