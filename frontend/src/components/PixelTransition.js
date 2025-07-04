import React, { useEffect, useRef } from 'react';

/**
 * Component that handles pixel transition effect between slides
 * Uses canvas to manipulate image pixels for a unique transition
 */
const PixelTransition = ({ currentImage, previousImage, isTransitioning, onTransitionEnd }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const pixelSize = 32; // Size of each "pixel" block - increased for more obvious effect
  const animationDuration = 1500; // Duration in milliseconds (1.5 seconds)
  
  console.log('PixelTransition rendering with:', { 
    currentImage, 
    previousImage, 
    isTransitioning 
  });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage || !previousImage) {
      console.log('Missing canvas or images:', { canvas, currentImage, previousImage });
      return;
    }
    
    console.log('Starting pixel transition animation');
    const ctx = canvas.getContext('2d');
    const startTime = performance.now();
    
    // Set canvas dimensions to match container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
    
    // Create Image objects for both images
    const imgCurrent = new Image();
    const imgPrevious = new Image();
    
    // Handle potential data:image URLs or regular image paths
    imgCurrent.src = currentImage;
    imgPrevious.src = previousImage;
    
    console.log('Image sources set');
    
    // Wait for both images to load
    let imagesLoaded = 0;
    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        // Start animation once both images are loaded
        startAnimation();
      }
    };
    
    imgCurrent.onload = onImageLoad;
    imgPrevious.onload = onImageLoad;
    
    // Animation function
    const startAnimation = () => {
      console.log('Animation starting');
      // Create pixel grid
      const cols = Math.ceil(canvas.width / pixelSize);
      const rows = Math.ceil(canvas.height / pixelSize);
      
      console.log('Grid dimensions:', { cols, rows, pixelSize });
      
      // Create random order for pixel transitions with more interesting patterns
      const pixels = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Add some variety to the animation by grouping pixels
          const variant = Math.floor(Math.random() * 3); // 0, 1, or 2
          pixels.push({ x, y, variant });
        }
      }
      
      // Create patterns rather than completely random transitions
      // Group pixels in various ways for more interesting visual effect
      pixels.sort((a, b) => {
        // Sort by variant first to create grouped patterns
        if (a.variant !== b.variant) {
          return a.variant - b.variant;
        }
        // Within same variant, sort by position with some randomization
        return (Math.random() > 0.7) ? 
          (a.x + a.y) - (b.x + b.y) : 
          Math.random() - 0.5;
      });
      
      // Animation loop
      const animate = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw previous image as background
        ctx.drawImage(
          imgPrevious, 
          0, 0, 
          canvas.width, canvas.height
        );
        
        // Calculate how many pixels to transition based on progress
        const pixelsToShow = Math.floor(pixels.length * progress);
        
        // Draw current image pixels with enhanced visual effect
        for (let i = 0; i < pixelsToShow; i++) {
          const { x, y, variant } = pixels[i];
          const sx = x * pixelSize;
          const sy = y * pixelSize;
          
          // Draw a single "pixel" block from current image with enhanced visual effect
          ctx.save();
          
          // Add different effects based on variant
          if (variant === 0) {
            // Standard replacement
            ctx.drawImage(
              imgCurrent,
              sx, sy, pixelSize, pixelSize, // Source coordinates
              sx, sy, pixelSize, pixelSize  // Destination coordinates
            );
          } else if (variant === 1) {
            // Add a small border to make the pixels more visible
            ctx.drawImage(
              imgCurrent,
              sx, sy, pixelSize, pixelSize, // Source coordinates
              sx, sy, pixelSize-2, pixelSize-2  // Destination coordinates (slightly smaller)
            );
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.strokeRect(sx, sy, pixelSize, pixelSize);
          } else {
            // Add rotation for some pixels
            ctx.translate(sx + pixelSize/2, sy + pixelSize/2);
            ctx.rotate((Math.PI / 180) * (progress * 90)); // Rotate up to 90 degrees
            ctx.drawImage(
              imgCurrent,
              0, 0, pixelSize, pixelSize, // Source coordinates
              -pixelSize/2, -pixelSize/2, pixelSize, pixelSize  // Destination coordinates (centered)
            );
          }
          
          ctx.restore();
        }
        
        if (progress < 1) {
          // Continue animation
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          if (onTransitionEnd) {
            onTransitionEnd();
          }
        }
      };
      
      // Start animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentImage, previousImage, isTransitioning, onTransitionEnd]);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        display: isTransitioning ? 'block' : 'none',
        zIndex: 5,
        backgroundColor: 'black' // Set background to ensure visibility
      }}
    />
  );
};

export default PixelTransition;
