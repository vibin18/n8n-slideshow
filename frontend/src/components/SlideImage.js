import React from 'react';

const SlideImage = ({ imageData }) => {
  if (!imageData) {
    return null;
  }

  // Determine if the image data already has a proper data URL prefix
  const imageUrl = imageData.startsWith('data:') 
    ? imageData 
    : `data:image/jpeg;base64,${imageData}`;

  return (
    <img 
      src={imageUrl}
      alt="Slideshow" 
      className="slide-image" 
    />
  );
};

export default SlideImage;
