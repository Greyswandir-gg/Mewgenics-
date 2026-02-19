
import React from 'react';

export type IconType = 'hp' | 'mana' | 'str' | 'dex' | 'con' | 'int' | 'speed' | 'cha' | 'luck' | 'battle' | 'breeding' | 'cat' | 'archive' | 'branch';

interface GameIconProps {
  type: IconType | string;
  className?: string;
  size?: number;
}

const GameIcon: React.FC<GameIconProps> = ({ type, className = "", size = 24 }) => {
  const icons: Record<string, React.ReactNode> = {
    hp: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
    mana: <path d="M12 2C9 5.5 7 9 7 12a5 5 0 0010 0c0-3-2-6.5-5-10zm0 7.5c.8 1.2 1.5 2.6 1.5 3.7a1.5 1.5 0 11-3 0c0-1.1.7-2.5 1.5-3.7z" />,
    str: <path d="M12.5 2c-3.1 0-5.4 2-5.4 5.3s2.3 5.4 5.4 5.4 5.4-2.1 5.4-5.4S15.6 2 12.5 2zM12 14c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5z" />, // Arm silhouette placeholder
    dex: <path d="M21 2l-8.5 8.5L10 8l-3 3 2.5 2.5L2 21l3-3 2.5 2.5 3-3-2.5-2.5 8.5-8.5L21 2z" />, // Bow/Arrow feel
    con: <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />, // Shield
    int: <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />, // Bulb
    speed: <path d="M22 12l-4-4v3H10v2h8v3l4-4zM2 12l4 4v-3h8v-2H6V8l-4 4z" />, // Arrows
    cha: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />, // Mouth/Heart feel
    luck: <path d="M12 22c4.97 0 9-4.03 9-9V4l-9-2-9 2v9c0 4.97 4.03 9 9 9z" />, // Clover/Shield
    battle: <path d="M21 2l-8.5 8.5L10 8l-3 3 2.5 2.5L2 21l3-3 2.5 2.5 3-3-2.5-2.5 8.5-8.5L21 2z" />,
    breeding: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-2.19c-1.74-.46-3-2.02-3-3.81 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.79-1.26 3.35-3 3.81v2.19h-2z" />,
    cat: <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />,
    archive: <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.41l.83-1zM5 19V8h14v11H5zm3-5h8v2H8v-2z" />
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      fill="currentColor" 
      className={`inline-block ${className}`}
      style={{ stroke: 'black', strokeWidth: '0.5px' }}
    >
      {icons[type] || icons['cat']}
    </svg>
  );
};

export default GameIcon;
