'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Check } from 'lucide-react';

// Dynamically import TemplatePreview to avoid SSR issues
const TemplatePreview = dynamic(
  () => import('./TemplatePreview').then((mod) => ({ default: mod.TemplatePreview })),
  { ssr: false }
);

// Starter template definitions (these would normally come from the database)
export const STARTER_TEMPLATES = [
  {
    id: 'classic-frame',
    name: 'Classic Frame',
    description: 'Simple elegant border',
    isPremium: false,
    thumbnail: '/templates/classic-frame.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          version: '6.0.0',
          left: 20,
          top: 20,
          width: 760,
          height: 560,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 8,
        },
      ],
      background: '#ffffff',
    },
  },
  {
    id: 'rounded-corners',
    name: 'Rounded Corners',
    description: 'Modern rounded frame',
    isPremium: false,
    thumbnail: '/templates/rounded-corners.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 20,
          top: 20,
          width: 760,
          height: 560,
          fill: 'transparent',
          stroke: '#3b82f6',
          strokeWidth: 6,
          rx: 20,
          ry: 20,
        },
      ],
      background: '#ffffff',
    },
  },
  {
    id: 'photo-strip',
    name: 'Photo Strip',
    description: 'Classic photo booth strip layout',
    isPremium: false,
    thumbnail: '/templates/photo-strip.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 50,
          top: 30,
          width: 700,
          height: 160,
          fill: 'transparent',
          stroke: '#64748b',
          strokeWidth: 2,
        },
        {
          type: 'Rect',
          left: 50,
          top: 220,
          width: 700,
          height: 160,
          fill: 'transparent',
          stroke: '#64748b',
          strokeWidth: 2,
        },
        {
          type: 'Rect',
          left: 50,
          top: 410,
          width: 700,
          height: 160,
          fill: 'transparent',
          stroke: '#64748b',
          strokeWidth: 2,
        },
      ],
      background: '#ffffff',
    },
  },
  {
    id: 'celebration',
    name: 'Celebration',
    description: 'Party-ready with confetti border',
    isPremium: false,
    thumbnail: '/templates/celebration.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 15,
          top: 15,
          width: 770,
          height: 570,
          fill: 'transparent',
          stroke: '#f59e0b',
          strokeWidth: 10,
        },
        {
          type: 'Text',
          left: 300,
          top: 550,
          text: '🎉 CELEBRATE 🎉',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#f59e0b',
        },
      ],
      background: '#ffffff',
    },
  },
  {
    id: 'wedding-elegant',
    name: 'Wedding Elegant',
    description: 'Romantic wedding design',
    isPremium: false,
    thumbnail: '/templates/wedding-elegant.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 25,
          top: 25,
          width: 750,
          height: 550,
          fill: 'transparent',
          stroke: '#d4af37',
          strokeWidth: 4,
        },
        {
          type: 'Text',
          left: 280,
          top: 540,
          text: '~ Forever & Always ~',
          fontSize: 22,
          fontFamily: 'Georgia',
          fill: '#d4af37',
          fontStyle: 'italic',
        },
      ],
      background: '#fffdf7',
    },
  },
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    description: 'Professional business events',
    isPremium: true,
    thumbnail: '/templates/corporate-clean.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 0,
          top: 0,
          width: 800,
          height: 80,
          fill: '#1e293b',
        },
        {
          type: 'Rect',
          left: 0,
          top: 520,
          width: 800,
          height: 80,
          fill: '#1e293b',
        },
        {
          type: 'Text',
          left: 300,
          top: 545,
          text: 'YOUR LOGO HERE',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#ffffff',
        },
      ],
      background: '#ffffff',
    },
  },
  {
    id: 'vintage-polaroid',
    name: 'Vintage Polaroid',
    description: 'Retro Polaroid style',
    isPremium: true,
    thumbnail: '/templates/vintage-polaroid.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 50,
          top: 30,
          width: 700,
          height: 470,
          fill: '#f5f5f0',
          stroke: '#d4d4d4',
          strokeWidth: 2,
        },
        {
          type: 'Rect',
          left: 70,
          top: 50,
          width: 660,
          height: 400,
          fill: 'transparent',
          stroke: '#e5e5e5',
          strokeWidth: 1,
        },
        {
          type: 'Text',
          left: 300,
          top: 470,
          text: 'Memories',
          fontSize: 28,
          fontFamily: 'Brush Script MT',
          fill: '#6b7280',
        },
      ],
      background: '#fafafa',
    },
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'Vibrant neon party theme',
    isPremium: true,
    thumbnail: '/templates/neon-glow.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 20,
          top: 20,
          width: 760,
          height: 560,
          fill: 'transparent',
          stroke: '#ff00ff',
          strokeWidth: 6,
        },
        {
          type: 'Rect',
          left: 30,
          top: 30,
          width: 740,
          height: 540,
          fill: 'transparent',
          stroke: '#00ffff',
          strokeWidth: 3,
        },
      ],
      background: '#0a0a0a',
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and simple design',
    isPremium: false,
    thumbnail: '/templates/minimalist.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Line',
          left: 50,
          top: 50,
          x1: 0,
          y1: 0,
          x2: 700,
          y2: 0,
          stroke: '#000000',
          strokeWidth: 2,
        },
        {
          type: 'Line',
          left: 50,
          top: 550,
          x1: 0,
          y1: 0,
          x2: 700,
          y2: 0,
          stroke: '#000000',
          strokeWidth: 2,
        },
      ],
      background: '#ffffff',
    },
  },
  {
    id: 'birthday-party',
    name: 'Birthday Party',
    description: 'Fun birthday celebration',
    isPremium: false,
    thumbnail: '/templates/birthday-party.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 25,
          top: 25,
          width: 750,
          height: 550,
          fill: 'transparent',
          stroke: '#ff6b9d',
          strokeWidth: 8,
          rx: 15,
          ry: 15,
        },
        {
          type: 'Text',
          left: 280,
          top: 40,
          text: '🎂 BIRTHDAY 🎉',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#ff6b9d',
          fontWeight: 'bold',
        },
      ],
      background: '#fff5f7',
    },
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower',
    description: 'Adorable baby celebration',
    isPremium: false,
    thumbnail: '/templates/baby-shower.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 20,
          top: 20,
          width: 760,
          height: 560,
          fill: 'transparent',
          stroke: '#a8d8ea',
          strokeWidth: 6,
          rx: 25,
          ry: 25,
        },
        {
          type: 'Text',
          left: 250,
          top: 550,
          text: '👶 Welcome Baby 🍼',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#a8d8ea',
        },
      ],
      background: '#f0f8ff',
    },
  },
  {
    id: 'graduation',
    name: 'Graduation',
    description: 'Academic achievement theme',
    isPremium: false,
    thumbnail: '/templates/graduation.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 0,
          top: 0,
          width: 800,
          height: 100,
          fill: '#1a237e',
        },
        {
          type: 'Rect',
          left: 0,
          top: 500,
          width: 800,
          height: 100,
          fill: '#1a237e',
        },
        {
          type: 'Text',
          left: 250,
          top: 530,
          text: '🎓 Congratulations! 🎓',
          fontSize: 26,
          fontFamily: 'Arial',
          fill: '#ffd700',
          fontWeight: 'bold',
        },
      ],
      background: '#ffffff',
    },
  },
  {
    id: 'holiday-festive',
    name: 'Holiday Festive',
    description: 'Christmas & winter holidays',
    isPremium: false,
    thumbnail: '/templates/holiday-festive.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 20,
          top: 20,
          width: 760,
          height: 560,
          fill: 'transparent',
          stroke: '#c41e3a',
          strokeWidth: 10,
        },
        {
          type: 'Text',
          left: 220,
          top: 550,
          text: '🎄 Happy Holidays! ❄️',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#165b33',
          fontWeight: 'bold',
        },
      ],
      background: '#f4f4f4',
    },
  },
  {
    id: 'sports-event',
    name: 'Sports Event',
    description: 'Athletic & team sports',
    isPremium: false,
    thumbnail: '/templates/sports-event.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 15,
          top: 15,
          width: 770,
          height: 570,
          fill: 'transparent',
          stroke: '#ff8c00',
          strokeWidth: 12,
        },
        {
          type: 'Text',
          left: 300,
          top: 40,
          text: '⚽ GAME DAY ⚽',
          fontSize: 32,
          fontFamily: 'Arial',
          fill: '#000000',
          fontWeight: 'bold',
        },
      ],
      background: '#ffffff',
    },
  },
  {
    id: 'music-festival',
    name: 'Music Festival',
    description: 'Concert & music events',
    isPremium: false,
    thumbnail: '/templates/music-festival.png',
    canvasData: {
      version: '6.0.0',
      objects: [
        {
          type: 'Rect',
          left: 25,
          top: 25,
          width: 750,
          height: 550,
          fill: 'transparent',
          stroke: '#9c27b0',
          strokeWidth: 6,
        },
        {
          type: 'Rect',
          left: 35,
          top: 35,
          width: 730,
          height: 530,
          fill: 'transparent',
          stroke: '#e91e63',
          strokeWidth: 3,
        },
        {
          type: 'Text',
          left: 280,
          top: 545,
          text: '🎵 LIVE MUSIC 🎸',
          fontSize: 26,
          fontFamily: 'Arial',
          fill: '#9c27b0',
          fontWeight: 'bold',
        },
      ],
      background: '#fafafa',
    },
  },
];

interface StarterTemplatesProps {
  onSelect: (template: typeof STARTER_TEMPLATES[0]) => void;
  selectedId?: string;
}

export function StarterTemplates({ onSelect, selectedId }: StarterTemplatesProps) {
  const freeTemplates = STARTER_TEMPLATES.filter((t) => !t.isPremium);
  const premiumTemplates = STARTER_TEMPLATES.filter((t) => t.isPremium);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Free Templates</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {freeTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedId === template.id}
              onSelect={() => onSelect(template)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">
          Premium Templates
          <Badge variant="secondary" className="ml-2">
            Coming Soon
          </Badge>
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {premiumTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedId === template.id}
              onSelect={() => {}} // Disabled for premium
              disabled
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: typeof STARTER_TEMPLATES[0];
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function TemplateCard({ template, isSelected, onSelect, disabled }: TemplateCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${disabled ? 'opacity-60' : ''}`}
      onClick={disabled ? undefined : onSelect}
    >
      <CardContent className="p-3">
        <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded bg-muted">
          {/* Render actual template preview */}
          <div className="flex h-full items-center justify-center">
            <TemplatePreview
              canvasData={template.canvasData}
              width={200}
              height={150}
              className="rounded"
            />
          </div>
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
              <Check className="h-8 w-8 text-primary drop-shadow-md" />
            </div>
          )}
          {template.isPremium && (
            <div className="absolute right-1 top-1">
              <Badge variant="secondary" className="gap-1 px-1.5 py-0.5 text-xs">
                <Lock className="h-3 w-3" />
              </Badge>
            </div>
          )}
        </div>
        <h4 className="truncate text-sm font-medium">{template.name}</h4>
        <p className="truncate text-xs text-muted-foreground">{template.description}</p>
      </CardContent>
    </Card>
  );
}

