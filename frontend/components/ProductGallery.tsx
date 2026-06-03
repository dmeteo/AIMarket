'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const validImages = images?.length > 0 ? images : ['/placeholder.svg'];

  const goTo = (index: number) => {
    if (index < 0) index = validImages.length - 1;
    if (index >= validImages.length) index = 0;
    setActiveIndex(index);
  };

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={validImages[activeIndex]}
          alt={title}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
              aria-label="Следующее фото"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {activeIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                i === activeIndex ? 'border-zinc-900' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
