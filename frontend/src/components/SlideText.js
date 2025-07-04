import React, { useEffect } from 'react';

// List of available Google Fonts to use
const googleFonts = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
  'Raleway',
  'Playfair Display',
  'Dancing Script',
  'Pacifico'
];

// Web-safe fonts as fallbacks
const webSafeFonts = [
  'Arial',
  'Verdana',
  'Helvetica',
  'Tahoma',
  'Georgia',
  'Times New Roman',
  'Courier New'
];

const SlideText = ({ text, textColor }) => {
  // Load Google Fonts when component mounts
  useEffect(() => {
    // Only load fonts once
    const linkId = 'google-fonts-link';
    if (!document.getElementById(linkId)) {
      const fontsList = googleFonts.join('|').replace(/ /g, '+');
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css?family=${fontsList}&display=swap`;
      document.head.appendChild(link);
    }
  }, []);
  
  if (!text || text.length === 0) {
    return null;
  }

  // Generate a font family string with appropriate fallbacks
  const getFontFamily = (font) => {
    if (!font) return "'Arial', sans-serif";
    
    // Check if it's a Google font or web-safe font
    const isGoogleFont = googleFonts.some(gf => gf.toLowerCase() === font.toLowerCase());
    const isWebSafeFont = webSafeFonts.some(wf => wf.toLowerCase() === font.toLowerCase());
    
    if (isGoogleFont || isWebSafeFont) {
      return `'${font}', sans-serif`;
    }
    
    // Default fallback
    return `'${font}', 'Arial', sans-serif`;
  };

  return (
    <>
      {text.map((textItem, index) => (
        <div
          key={index}
          className="slide-text"
          style={{
            top: `${textItem.y}px`,
            left: `${textItem.x}px`,
            fontSize: `${textItem.fontSize || 16}px`,
            fontFamily: getFontFamily(textItem.font),
            color: textColor || 'white'
          }}
        >
          {textItem.content}
        </div>
      ))}
    </>
  );
};

// Export the component and the fonts list for reuse
export { googleFonts, webSafeFonts };
export default SlideText;
