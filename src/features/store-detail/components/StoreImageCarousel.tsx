'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';

type StoreImageCarouselProps = {
  storeName: string;
  imageUrls?: string[];
};

function sanitizeImageUrls(imageUrls?: string[]): string[] {
  const list = (imageUrls ?? []).filter((url) => url.trim().length > 0).slice(0, 10);
  return list;
}

export function StoreImageCarousel({ storeName, imageUrls }: StoreImageCarouselProps) {
  const images = useMemo(() => sanitizeImageUrls(imageUrls), [imageUrls]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-border bg-base text-sm text-text/50">
        店舗画像（仮置き）
      </div>
    );
  }

  return (
    <div>
      <Carousel setApi={setCarouselApi} opts={{ align: 'start' }} className="w-full">
        <CarouselContent className="ml-0">
          {images.map((imageUrl, index) => (
            <CarouselItem key={`${imageUrl}-${index}`} className="pl-0">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-base">
                <Image
                  src={imageUrl}
                  alt={`${storeName} の店舗画像 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-3 flex items-center justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`画像 ${index + 1} を表示`}
            aria-current={index === currentIndex}
            onClick={() => carouselApi?.scrollTo(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-main-strong' : 'bg-main/40 hover:bg-main/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
