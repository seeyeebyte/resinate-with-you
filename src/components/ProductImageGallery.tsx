"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ProductImage } from "@/lib/mock-data";

type ProductImageGalleryProps = {
  images: ProductImage[];
};

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = sortedImages[activeIndex] ?? sortedImages[0];

  if (!activeImage) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="soft-card rounded-[12px] p-3">
        <div className="relative flex aspect-[4/3] max-h-[560px] items-center justify-center overflow-hidden rounded-[10px] bg-[#f5fbff]">
          <GalleryImage image={activeImage} priority />
        </div>
      </div>

      {sortedImages.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {sortedImages.map((image, index) => (
            <button
              key={`${image.imageUrl}-${image.sortOrder}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View product image ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-[8px] border bg-[#f5fbff] p-1 transition ${
                activeIndex === index
                  ? "border-[#8fb9c5] shadow-[0_0_0_4px_rgb(191_232_247_/_0.35)]"
                  : "border-[#d9ddd2] hover:border-[#9ba69d]"
              }`}
            >
              <GalleryImage image={image} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GalleryImage({ image, priority = false }: { image: ProductImage; priority?: boolean }) {
  if (isRemoteImage(image.imageUrl)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image.imageUrl} alt={image.imageAlt} className="h-full w-full object-contain" />;
  }

  return (
    <Image
      src={image.imageUrl}
      alt={image.imageAlt}
      fill
      priority={priority}
      sizes={priority ? "(min-width: 1024px) 620px, 100vw" : "120px"}
      className="object-contain"
    />
  );
}

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}
