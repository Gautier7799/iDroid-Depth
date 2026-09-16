import React, { useState, useRef, useEffect } from 'react';
import { DepthClock } from './DepthClock';
import { WallpaperConfig, WallpaperItem } from '../types/wallpaper';
import { Wifi, Battery, Signal, Camera, Flashlight, Info, X } from 'lucide-react';

interface PhoneMockupProps {
  wallpaper: WallpaperItem;
  config: WallpaperConfig;
  customBgUrl?: string | null;
  customFgUrl?: string | null;
  interactiveParallax?: boolean;
  scale?: number;
  showDismissNotice?: boolean;
  className?: string;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  wallpaper,
  config,
  customBgUrl,
  customFgUrl,
  interactiveParallax = true,
  scale = 1,
  showDismissNotice = true,
  className = '',
}) => {
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [noticeDismissed, setNoticeDismissed] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const bgUrl = customBgUrl || wallpaper.bgUrl;
  const fgUrl = customFgUrl || wallpaper.fgUrl;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveParallax || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    const sensitivity = (config.depthSensitivity || 35) / 25;
    setTilt({
      x: x * sensitivity,
      y: y * sensitivity,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Device orientation gyro for real mobile devices
  useEffect(() => {
    if (!interactiveParallax) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const x = Math.min(Math.max(e.gamma / 20, -1), 1);
        const y = Math.min(Math.max((e.beta - 45) / 20, -1), 1);
        const sensitivity = (config.depthSensitivity || 35) / 25;
        setTilt({ x: x * sensitivity, y: y * sensitivity });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [interactiveParallax, config.depthSensitivity]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Smartphone Frame Outer Bezel */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden rounded-[42px] border-[5px] border-[#262626] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] bg-black transition-transform duration-100 ease-out"
        style={{
          width: `${280 * scale}px`,
          height: `${580 * scale}px`,
          transform: `perspective(1000px) rotateY(${tilt.x * 4}deg) rotateX(${-tilt.y * 4}deg)`,
        }}
      >
        {/* Layer 1: Background Scenery Wallpaper */}
        <div
          className="absolute inset-[-20px] bg-cover bg-center transition-transform duration-75 ease-out"
          style={{
            backgroundImage: `url(${bgUrl})`,
            filter: config.blurBackground > 0 ? `blur(${config.blurBackground}px)` : 'none',
            transform: `translate3d(${-tilt.x * 12}px, ${-tilt.y * 12}px, 0) scale(1.1)`,
          }}
        />

        {/* Layer 2: Depth Clock (In between Background and Foreground if depthBehindSubject is true) */}
        {config.depthBehindSubject && (
          <div
            className="absolute inset-0 z-10 transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${-tilt.x * 6}px, ${-tilt.y * 6}px, 0)`,
            }}
          >
            <DepthClock
              fontSize={config.fontSize}
              horizontalPos={config.horizontalPos}
              verticalPos={config.verticalPos}
              fontStyle={config.fontStyle}
              color={config.color}
              opacity={config.opacity}
              showDate={config.showDate}
              customDateText={config.customDateText}
              useLiveTime={config.useLiveTime}
              customTimeText={config.customTimeText}
              is24Hour={config.is24Hour}
              showSeconds={config.showSeconds}
            />
          </div>
        )}

        {/* Layer 3: Foreground Subject (House, Mountain Peak, Motorcycle, Person, Dunes) */}
        {fgUrl && (
          <div
            className="absolute inset-[-15px] z-20 bg-contain bg-bottom bg-no-repeat pointer-events-none transition-transform duration-75 ease-out"
            style={{
              backgroundImage: `url(${fgUrl})`,
              // Using drop-shadow mask or blend to accentuate foreground separation
              filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.45))',
              transform: `translate3d(${tilt.x * 14}px, ${tilt.y * 14}px, 0) scale(1.05)`,
            }}
          />
        )}

        {/* Fallback Clock if depthBehindSubject is false (Clock sits on top of everything) */}
        {!config.depthBehindSubject && (
          <div
            className="absolute inset-0 z-30 transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${-tilt.x * 8}px, ${-tilt.y * 8}px, 0)`,
            }}
          >
            <DepthClock
              fontSize={config.fontSize}
              horizontalPos={config.horizontalPos}
              verticalPos={config.verticalPos}
              fontStyle={config.fontStyle}
              color={config.color}
              opacity={config.opacity}
              showDate={config.showDate}
              customDateText={config.customDateText}
              useLiveTime={config.useLiveTime}
              customTimeText={config.customTimeText}
              is24Hour={config.is24Hour}
              showSeconds={config.showSeconds}
            />
          </div>
        )}

        {/* Dynamic Island / Top Camera pill */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-[#333] mr-4" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1c2938]" />
        </div>

        {/* Status Bar: Time, Signal, Wifi, Battery */}
        <div className="absolute top-2 inset-x-5 flex items-center justify-between z-40 text-white text-[11px] font-medium tracking-tight">
          <span className="font-semibold ml-1">20:24</span>
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-white">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <div className="flex items-center space-x-0.5 border border-white/60 rounded px-0.5 py-[1px] text-[8px] font-bold">
              <span>71</span>
              <Battery className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>

        {/* Bottom Shortcuts (Flashlight & Camera) */}
        <div className="absolute bottom-5 inset-x-6 flex items-center justify-between z-40 pointer-events-none opacity-80">
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
            <Flashlight className="w-4 h-4" />
          </div>
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
            <Camera className="w-4 h-4" />
          </div>
        </div>

        {/* Home Indicator bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/70 rounded-full z-40" />
      </div>

      {/* Dismissible info banner: "⚠️ Preview may differ slightly. Dismiss" */}
      {showDismissNotice && !noticeDismissed && (
        <div className="mt-3 inline-flex items-center space-x-2 rtl:space-x-reverse bg-[#1a1a1c]/90 text-gray-200 text-xs px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg backdrop-blur-md transition-all animate-fade-in">
          <div className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-[10px] font-bold">
            i
          </div>
          <span className="font-medium">Preview may differ slightly.</span>
          <button
            onClick={() => setNoticeDismissed(true)}
            className="text-yellow-400 font-semibold hover:underline text-xs ml-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
