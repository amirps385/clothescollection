"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/product-images";

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export function ProductImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
  width,
  height,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_IMAGE);
  const [failed, setFailed] = useState(!src);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setImgSrc(PLACEHOLDER_IMAGE);
    }
  };

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={cn(className, failed && "object-contain p-8")}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        unoptimized={failed}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width ?? 80}
      height={height ?? 96}
      className={cn(className, failed && "object-contain p-2")}
      onError={handleError}
      unoptimized={failed}
    />
  );
}
