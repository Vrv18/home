// Tray icon generation for menu bar
// Creates simple, clean icons that work well at small sizes

import { nativeImage, NativeImage } from 'electron';
import * as path from 'path';

// Colors from our palette
const COLORS = {
  idle: '#8B7355',      // Temple Stone
  focus: '#C67B5C',     // Terracotta
  break: '#7D8471',     // Sage
  paused: '#A68B6A',    // Lighter stone
};

// Create a simple icon using SVG loaded from file
export function getIconForState(state: string): NativeImage {
  const iconsPath = path.join(__dirname, '../../src/assets/icons');
  let iconFile: string;
  
  switch (state) {
    case 'focus':
      iconFile = 'focus.svg';
      break;
    case 'break':
      iconFile = 'break.svg';
      break;
    case 'paused':
      iconFile = 'paused.svg';
      break;
    default:
      iconFile = 'idle.svg';
  }
  
  const iconPath = path.join(iconsPath, iconFile);
  console.log('Loading icon from:', iconPath);
  
  try {
    const image = nativeImage.createFromPath(iconPath);
    if (image.isEmpty()) {
      console.error('Icon is empty, creating fallback');
      return createFallbackIcon(state);
    }
    // Resize for menu bar - macOS uses 16x16 or 22x22 for retina
    return image.resize({ width: 16, height: 16 });
  } catch (error) {
    console.error('Failed to load icon:', error);
    return createFallbackIcon(state);
  }
}

// Fallback: create a simple colored circle
function createFallbackIcon(state: string): NativeImage {
  const color = COLORS[state as keyof typeof COLORS] || COLORS.idle;
  const size = 16;
  
  // Simple circle SVG
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="${color}"/>
  </svg>`;
  
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return nativeImage.createFromDataURL(dataUrl);
}
