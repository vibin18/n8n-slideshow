import React, { useEffect, useState, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import SlideImage from '../components/SlideImage';
import SlideText from '../components/SlideText';
import PixelTransition from '../components/PixelTransition';
import { v4 as uuidv4 } from 'uuid';

const Slideshow = () => {
  const [slideData, setSlideData] = useState({
    image: '',
    text: [],
    'text-color': 'white',
    'transition-effect': 'fade',
    'transition-time': 20
  });
  const [socket, setSocket] = useState(null);
  const [slideKey, setSlideKey] = useState(uuidv4());
  const [previousImage, setPreviousImage] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousSlideDataRef = useRef(null);

  useEffect(() => {
    // Create WebSocket connection - use current hostname for remote access support
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    // Use current hostname so it works both locally and on the network
    const wsUrl = `${protocol}//${hostname}:7070/ws`;
    const ws = new WebSocket(wsUrl);

    // Set up WebSocket event handlers
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received slide data:', data);
        
        // Store previous image for pixel transition if needed
        if (slideData.image && slideData.image !== data.image) {
          console.log('Image changed, preparing for transition');
          
          // Format image URLs properly for the transition
          // Convert to proper data URLs if needed
          const formatImageUrl = (imgData) => {
            return imgData.startsWith('data:') 
              ? imgData 
              : `data:image/jpeg;base64,${imgData}`;
          };
          
          setPreviousImage(formatImageUrl(slideData.image));
          setCurrentImage(formatImageUrl(data.image));
          
          // Always set isTransitioning if the effect is pixel
          if (data['transition-effect'] === 'pixel') {
            console.log('Pixel transition detected, activating canvas transition');
            setIsTransitioning(true);
          } else {
            console.log('Using regular CSS transition for effect:', data['transition-effect']);
          }
        } else {
          console.log('No image change detected or no previous image');
        }
        
        // Store the previous slide data
        previousSlideDataRef.current = {...slideData};
        
        // Generate a new key for transition when data changes
        setSlideKey(uuidv4());
        setSlideData(data);
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Set WebSocket instance to state
    setSocket(ws);

    // Clean up WebSocket connection on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Get transition class name based on effect
  const getTransitionClassName = () => {
    const effect = slideData['transition-effect'] || 'fade';
    if (effect === 'slide') {
      return 'slide-effect';
    }
    if (effect === 'pixel') {
      // No CSS transition classes for pixel effect
      // We'll use the canvas-based transition instead
      return 'none';
    }
    return 'fade';
  };
  
  // Handle the completion of pixel transition
  const handlePixelTransitionEnd = () => {
    setIsTransitioning(false);
  };
  
  // Get transition duration based on slideshow data
  const getTransitionDuration = () => {
    const transitionTime = slideData['transition-time'] || 20;
    return transitionTime * 100; // Convert to milliseconds
  };

  return (
    <div className="slideshow-container">
      {/* Only use CSS Transitions for fade and slide effects */}
      {slideData['transition-effect'] !== 'pixel' && (
        <TransitionGroup>
          <CSSTransition
            key={slideKey}
            timeout={getTransitionDuration()}
            classNames={getTransitionClassName()}
          >
            <div className="slide">
              <SlideImage imageData={slideData.image} />
              <SlideText text={slideData.text} textColor={slideData['text-color']} />
            </div>
          </CSSTransition>
        </TransitionGroup>
      )}

      {/* For pixel effect, use static slide with canvas overlay */}
      {slideData['transition-effect'] === 'pixel' && (
        <div className="slide">
          <SlideImage imageData={slideData.image} />
          <SlideText text={slideData.text} textColor={slideData['text-color']} />
          {isTransitioning && previousImage && (
            <PixelTransition
              previousImage={previousImage}
              currentImage={currentImage}
              isTransitioning={isTransitioning}
              onTransitionEnd={handlePixelTransitionEnd}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Slideshow;
