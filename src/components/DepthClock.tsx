import React, { useEffect, useState, useMemo } from 'react';
import { ClockFontStyle } from '../types/wallpaper';
import { CloudSun, BatteryCharging, Footprints, CalendarDays, Sparkles } from 'lucide-react';

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

  // Advanced Customization
  gradientEnabled?: boolean;
  gradientColor2?: string;
  glowEnabled?: boolean;
  glowIntensity?: number;
  letterSpacing?: number;
  shadowBlur?: number;
  topWidget?: 'date' | 'weather' | 'battery' | 'steps' | 'event' | 'none';
  bottomWidgets?: ('battery' | 'weather' | 'activity' | 'calendar')[];
}

export const DepthClock: React.FC<DepthClockProps> = React.memo(({
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
  gradientEnabled = false,
  gradientColor2 = '#FFDE00',
  glowEnabled = false,
  glowIntensity = 50,
  letterSpacing = 0,
  shadowBlur = 10,
  topWidget = 'date',
  bottomWidgets = [],
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
  const fontStyles = useMemo(() => {
    let fontFamily = "'Outfit', sans-serif";
    let fontWeight: number | string = 800;
    let extraStyles: React.CSSProperties = {};

    switch (fontStyle) {
      case 'capsule':
        fontFamily = "'Outfit', 'Cairo', sans-serif";
        fontWeight = 800;
        break;
      case 'outline':
        fontFamily = "'Outfit', sans-serif";
        fontWeight = 900;
        extraStyles = {
          WebkitTextStroke: `2px ${color}`,
          color: 'transparent',
          fill: 'transparent',
        };
        break;
      case 'condensed':
        fontFamily = "'Bebas Neue', sans-serif";
        fontWeight = 400;
        break;
      case 'stencil':
        fontFamily = "'Syne', sans-serif";
        fontWeight = 800;
        break;
      case 'neon':
        fontFamily = "'Outfit', sans-serif";
        fontWeight = 800;
        break;
      case 'serif':
        fontFamily = "Georgia, serif";
        fontWeight = 700;
        break;
      case 'digital':
        fontFamily = "'JetBrains Mono', monospace";
        fontWeight = 700;
        break;
      case 'thin':
        fontFamily = "'Plus Jakarta Sans', sans-serif";
        fontWeight = 300;
        break;
    }

    // Text Shadow & Glow calculation
    const shadows: string[] = [];
    if (shadowBlur > 0 && fontStyle !== 'outline') {
      shadows.push(`0 4px ${shadowBlur}px rgba(0, 0, 0, 0.7)`);
    }
    if (glowEnabled) {
      const glowSpread = Math.max(4, Math.round(glowIntensity * 0.4));
      const glowSpread2 = Math.max(8, Math.round(glowIntensity * 0.8));
      shadows.push(`0 0 ${glowSpread}px ${color}cc`);
      shadows.push(`0 0 ${glowSpread2}px ${color}66`);
    } else if (fontStyle === 'neon') {
      shadows.push(`0 0 15px ${color}aa`, `0 0 30px ${color}55`);
    }

    // Gradient text
    let gradientStyle: React.CSSProperties = {};
    if (gradientEnabled && fontStyle !== 'outline') {
      gradientStyle = {
        background: `linear-gradient(135deg, ${color} 0%, ${gradientColor2} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
    } else if (fontStyle !== 'outline') {
      gradientStyle = {
        color: color,
      };
    }

    return {
      fontFamily,
      fontWeight,
      letterSpacing: `${letterSpacing}px`,
      textShadow: shadows.length > 0 ? shadows.join(', ') : undefined,
      ...gradientStyle,
      ...extraStyles,
    };
  }, [fontStyle, color, gradientEnabled, gradientColor2, glowEnabled, glowIntensity, letterSpacing, shadowBlur]);

  // Render Top Widget
  const renderTopWidget = () => {
    if (topWidget === 'none' || !showDate) return null;

    if (topWidget === 'weather') {
      return (
        <div className="flex items-center space-x-1.5 text-[10px] md:text-xs font-semibold tracking-wider uppercase mb-1 drop-shadow-md text-white/90">
          <CloudSun className="w-3.5 h-3.5 text-yellow-300" />
          <span>24°C Sunny • {displayDate}</span>
        </div>
      );
    }
    if (topWidget === 'battery') {
      return (
        <div className="flex items-center space-x-1.5 text-[10px] md:text-xs font-semibold tracking-wider uppercase mb-1 drop-shadow-md text-white/90">
          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          <span>88% Charged • {displayDate}</span>
        </div>
      );
    }
    if (topWidget === 'steps') {
      return (
        <div className="flex items-center space-x-1.5 text-[10px] md:text-xs font-semibold tracking-wider uppercase mb-1 drop-shadow-md text-white/90">
          <Footprints className="w-3.5 h-3.5 text-sky-400" />
          <span>8,420 Steps</span>
        </div>
      );
    }
    if (topWidget === 'event') {
      return (
        <div className="flex items-center space-x-1.5 text-[10px] md:text-xs font-semibold tracking-wider uppercase mb-1 drop-shadow-md text-white/90">
          <CalendarDays className="w-3.5 h-3.5 text-pink-400" />
          <span>Meeting in 45m</span>
        </div>
      );
    }

    // Default 'date'
    return (
      <div
        className="text-[10px] md:text-xs font-semibold tracking-widest uppercase mb-1 drop-shadow-md transition-colors text-center"
        style={{
          color: color,
          opacity: 0.9,
          letterSpacing: '0.12em',
        }}
      >
        {displayDate}
      </div>
    );
  };

  return (
    <div
      className={`absolute flex flex-col items-center justify-center select-none pointer-events-none ${className}`}
      style={{
        left: `${horizontalPos}%`,
        top: `${verticalPos}%`,
        transform: 'translate(-50%, -50%)',
        opacity: opacity / 100,
      }}
    >
      {/* Top Complication Widget */}
      {renderTopWidget()}

      {/* Main Clock Digits */}
      <div
        className="leading-none select-none text-center transition-all whitespace-nowrap"
        style={{
          fontSize: `${fontSize * 3.8}px`,
          ...fontStyles,
        }}
      >
        {displayTime}
      </div>

      {/* Optional Bottom Widgets Row (Complications) */}
      {bottomWidgets.length > 0 && (
        <div className="flex items-center space-x-2 mt-2 px-2 py-1 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 shadow-lg">
          {bottomWidgets.map((w, idx) => {
            if (w === 'battery') {
              return (
                <div key={idx} className="flex items-center space-x-1 text-[9px] font-bold text-white/90 px-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>88%</span>
                </div>
              );
            }
            if (w === 'weather') {
              return (
                <div key={idx} className="flex items-center space-x-1 text-[9px] font-bold text-white/90 px-1.5 py-0.5">
                  <CloudSun className="w-3 h-3 text-yellow-300" />
                  <span>24°</span>
                </div>
              );
            }
            if (w === 'activity') {
              return (
                <div key={idx} className="flex items-center space-x-1 text-[9px] font-bold text-white/90 px-1.5 py-0.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>420 kcal</span>
                </div>
              );
            }
            if (w === 'calendar') {
              return (
                <div key={idx} className="flex items-center space-x-1 text-[9px] font-bold text-white/90 px-1.5 py-0.5">
                  <CalendarDays className="w-3 h-3 text-purple-300" />
                  <span>14:00</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
});

DepthClock.displayName = 'DepthClock';
