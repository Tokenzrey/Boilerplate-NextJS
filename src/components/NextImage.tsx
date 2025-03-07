'use client';

import Image, { ImageProps } from 'next/image';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * NextImage Component Props
 *
 * Enhanced Image component that extends Next.js Image with additional features
 * such as skeleton loading, error handling, and optimized SVG/PNG handling.
 */
type NextImageProps = {
  /** Enable skeleton loading animation while image loads */
  useSkeleton?: boolean;

  /** Additional className for the image element */
  imgClassName?: string;

  /** If true, uses the src directly without '/images' prefix */
  serverStaticImg?: boolean;

  /** Custom className for the blur placeholder */
  blurClassName?: string;

  /** Alternative text for the image (required for accessibility) */
  alt: string;

  /** Width of the image */
  width: string | number;

  /** Fallback image source if the primary image fails to load */
  onErrorSrc?: string;

  /** Marks the image as a high priority resource for loading */
  priority?: boolean;

  /** Use vector format for SVG images (preserves quality) */
  isVector?: boolean;

  /** Custom placeholder color (Tailwind class without the bg- prefix) */
  placeholderColor?: string;

  /** Optional callback when image successfully loads */
  onLoadingComplete?: () => void;

  /** Enables Next.js image optimization (disabled for SVGs by default) */
  unoptimized?: boolean;
} & (
  | { width: string | number; height: string | number }
  | { layout: 'fill'; width?: string | number; height?: string | number }
) &
  Omit<ImageProps, 'src' | 'onLoadingComplete'> & {
    src: string;
  };

/**
 * Enhanced Next.js Image component with additional features
 *
 * Features:
 * - Skeleton loading animation
 * - Error handling with fallback image
 * - Optimized SVG/PNG handling
 * - Custom blur placeholders
 * - Image path handling
 *
 * @example
 * // Basic usage
 * <NextImage src="/hero.jpg" width={800} height={600} alt="Hero image" />
 *
 * @example
 * // With skeleton loader
 * <NextImage
 *   src="/profile.png"
 *   width={200}
 *   height={200}
 *   alt="Profile"
 *   useSkeleton
 *   placeholderColor="gray-200"
 * />
 *
 * @example
 * // SVG with vector optimization
 * <NextImage
 *   src="/icons/logo.svg"
 *   width={120}
 *   height={40}
 *   alt="Logo"
 *   isVector
 * />
 */
export default function NextImage({
  useSkeleton = false,
  serverStaticImg = false,
  src,
  width,
  height,
  alt,
  className,
  imgClassName,
  blurClassName,
  onErrorSrc,
  priority = false,
  isVector = false,
  placeholderColor = 'gray-200',
  onLoadingComplete,
  unoptimized: userUnoptimized,
  ...rest
}: NextImageProps) {
  // Determine loading state for skeleton effect
  const [status, setStatus] = React.useState<'loading' | 'complete' | 'error'>(
    useSkeleton ? 'loading' : 'complete',
  );

  // Check if width is already set in className to avoid style conflicts
  const widthIsSet = className?.includes('w-') ?? false;

  // Check if the image is an SVG to handle it appropriately
  const isSvg = React.useMemo(() => src?.toLowerCase().endsWith('.svg'), [src]);

  // Determine if image optimization should be disabled (for SVGs or when explicitly set)
  const unoptimized = userUnoptimized ?? (isVector || isSvg);

  // Format the source URL based on settings
  const imageSrc = React.useMemo(() => {
    // If the source is a data URL or absolute URL, use it directly
    if (src.startsWith('data:') || src.startsWith('http') || serverStaticImg) {
      return src;
    }

    // Otherwise, prefix with /images/
    return `/images${src.startsWith('/') ? src : `/${src}`}`;
  }, [src, serverStaticImg]);

  // Handle successful image load
  const handleImageLoad = () => {
    setStatus('complete');
    onLoadingComplete?.();
  };

  // Handle image load error
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    setStatus('error');
    if (onErrorSrc) {
      // Cast to HTMLImageElement to access src property
      const imgElement = e.currentTarget as HTMLImageElement;
      imgElement.src = onErrorSrc;
    }
  };

  return (
    <figure
      style={
        !widthIsSet && typeof width === 'number'
          ? { width: `${width}px` }
          : undefined
      }
      className={cn('relative', className)}
    >
      <Image
        className={cn(
          imgClassName,
          status === 'loading' &&
            cn('animate-pulse', `bg-${placeholderColor}`, blurClassName),
          isVector && 'drop-shadow-none',
        )}
        src={imageSrc}
        width={width}
        height={height}
        alt={alt || 'Image'}
        priority={priority}
        onLoad={handleImageLoad}
        onError={handleImageError}
        unoptimized={unoptimized}
        loading={priority ? 'eager' : 'lazy'}
        {...rest}
      />

      {/* Error state indicator - only shown when no fallback image is provided */}
      {status === 'error' && !onErrorSrc && (
        <div
          className='absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-200 rounded'
          style={{ width, height }}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            className='w-1/4 h-1/4 text-gray-400'
            strokeWidth='1.5'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
            />
          </svg>
        </div>
      )}
    </figure>
  );
}

/**
 * Helper types for common image sizes and aspect ratios
 */
export const ImageSizes = {
  /** Square aspect ratios */
  Square: {
    sm: { width: 64, height: 64 },
    md: { width: 128, height: 128 },
    lg: { width: 256, height: 256 },
    xl: { width: 512, height: 512 },
  },
  /** 16:9 aspect ratios */
  Widescreen: {
    sm: { width: 256, height: 144 },
    md: { width: 640, height: 360 },
    lg: { width: 1280, height: 720 },
    xl: { width: 1920, height: 1080 },
  },
  /** 4:3 aspect ratios */
  Standard: {
    sm: { width: 256, height: 192 },
    md: { width: 640, height: 480 },
    lg: { width: 1024, height: 768 },
    xl: { width: 1600, height: 1200 },
  },
};
