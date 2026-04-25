import React, { useEffect, useRef, useState } from 'react';

interface FrameSequencePlayerProps {
  folderPath: string;
  frameCount: number;
  fps?: number;
  loop?: boolean;
  className?: string;
  onComplete?: () => void;
  play?: boolean;
  autoPlay?: boolean;
  framePrefix?: string;
  extension?: string;
  startFrame?: number;
}

export const FrameSequencePlayer: React.FC<FrameSequencePlayerProps> = ({
  folderPath,
  frameCount,
  fps = 24,
  loop = true,
  className = '',
  onComplete,
  play = true,
  autoPlay = true,
  framePrefix = 'ezgif-frame-',
  extension = '.jpg',
  startFrame = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const preloadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const frameNumber = (startFrame + i).toString().padStart(3, '0');
      img.src = `${folderPath}/${framePrefix}${frameNumber}${extension}`;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setIsLoaded(true);
        }
      };
      
      img.onerror = () => {
        loadedCount++; 
        console.warn(`Frame missing: ${img.src}`);
        if (loadedCount === frameCount) {
          setIsLoaded(true);
        }
      };
      preloadedImages.push(img);
    }

    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.warn("Animation preload timed out. Proceeding with partial frames.");
        setIsLoaded(true);
      }
    }, 5000);

    setImages(preloadedImages);

    return () => {
      clearTimeout(timeout);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [folderPath, frameCount, framePrefix, extension, startFrame]);

  // Animation logic
  const animate = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    const interval = 1000 / fps;

    if (deltaTime >= interval) {
      setCurrentFrame((prev) => {
        if (prev >= frameCount - 1) {
          if (loop) return 0;
          if (onComplete) onComplete();
          return prev; // Stop at last frame
        }
        return prev + 1;
      });
      lastTimeRef.current = time;
    }

    if (play || autoPlay) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isLoaded && (play || autoPlay)) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded, play, autoPlay]);

  // Render frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && images[currentFrame]) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = images[currentFrame];
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
    }
  }, [currentFrame, images]);

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
      {!isLoaded && !images.some(img => img.complete) && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
    </div>
  );
};
