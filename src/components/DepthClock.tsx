import React, { useEffect, useState } from 'react';
import { ClockFontStyle } from '../types/wallpaper';

interface DepthClockProps {
  fontSize?: number; // e.g. 27.1
  horizontalPos?: number; // e.g. 50
  verticalPos?: number; // e.g. 32
  fontStyle?: ClockFontStyle;
  color?: string;
  opacity?: number;
  showDate?: boolean;
  customDateText?: string;
  useLiveTime?: boolean;
  customTimeText?: string;
  is24Hour?: boolean;
  showSeconds?: boolean;
  className?: string;
}

export const DepthClock: React.FC<DepthClockProps> = ({
  fontSize = 27.1,
  horizontalPos = 50,
  verticalPos = 32,
  fontStyle = 'capsule',
  color = '#FFFFFF',
  opacity = 100,
  showDate = true,
  customDateText = '25 NOV 2028',
  useLiveTime = false,
  customTimeText = '02:36',
  is24Hour = true,
  showSeconds = false,
  className = '',
}) => {
  const [liveTime, setLiveTime] = useState<{ time: string; date: string }>({
    time: customTimeText,
    date: customDateText,
  });

  useEffect(() => {
    if (!useLiveTime) return;

    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      if (!is24Hour) {
        hours = hours % 12 || 12;
      }
      const hStr = String(hours).padStart(2, '0');
      const mStr = String(now.getMinutes()).padStart(2, '0');
      const sStr = String(now.getSeconds()).padStart(2, '0');
      const timeStr = showSeconds ? `${hStr}:${mStr}:${sStr}` : `${hStr}:${mStr}`;

      const dateStr = now.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).toUpperCase();

      setLiveTime({ time: timeStr, date: dateStr });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [useLiveTime, is24Hour, showSeconds]);

  const displayTime = useLiveTime ? liveTime.time : customTimeText;
  const displayDate = useLiveTime ? liveTime.date : customDateText;

  // Compute font family and styling based on fontStyle
  const getFontStyleClasses = () => {
    switch (fontStyle) {
      case 'capsule':
        // Tall, rounded iOS capsule digits
        return {
          fontFamily: "'Outfit', 'Cairo', sans-serif",
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'none' as const,
        };
      case 'outline':
        // Hollow outline font with crisp border
        return {
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          letterSpacing: '0.06em',
          WebkitTextStroke: `2.5px ${color}`,
          color: 'transparent',
        };
      case 'condensed':
        // Bebas Neue ultra condensed tall style
        return {
          fontFamily: "'Bebas Neue', sans-serif",
          fontWeight: 400,
          letterSpacing: '0.05em',
        };
      case 'stencil':
        return {
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          letterSpacing: '0.02em',
        };
      case 'neon':
        return {
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          textShadow: `0 0 15px ${color}80, 0 0 30px ${color}40`,
        };
      case 'serif':
        return {
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          letterSpacing: '0.02em',
        };
      default:
        return {
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
        };
    }
  };

  const styleConfig = getFontStyleClasses();

  return (
    <div
      className={`absolute flex flex-col items-center justify-center select-none pointer-events-none transition-all duration-150 ${className}`}
      style={{
        left: `${horizontalPos}%`,
        top: `${verticalPos}%`,
        transform: 'translate(-50%, -50%)',
        opacity: opacity / 100,
      }}
    >
      {/* Date display above clock */}
      {showDate && (
        <div
          className="text-[10px] md:text-xs font-semibold tracking-widest uppercase mb-1 drop-shadow-md transition-colors"
          style={{
            color: fontStyle === 'outline' ? '#FFFFFF' : color,
            opacity: 0.9,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {displayDate}
        </div>
      )}

      {/* Main Clock digits */}
      <div
        className="leading-none text-center select-none transition-all"
        style={{
          fontSize: `calc(${fontSize} * 2.8px)`,
          color: fontStyle === 'outline' ? 'transparent' : color,
          ...styleConfig,
        }}
      >
        {displayTime}
      </div>
    </div>
  );
};
