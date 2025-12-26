'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchInput() {
  return (
    <div className="relative w-full md:w-64 lg:w-80">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        className="pl-8 h-9 bg-background"
      />
    </div>
  );
}

