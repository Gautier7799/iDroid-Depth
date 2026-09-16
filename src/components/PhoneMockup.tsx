import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DepthClock } from './DepthClock';
import { WallpaperConfig, WallpaperItem } from '../types/wallpaper';
import { sound } from '../utils/haptics';
import { Wifi, Battery, Signal, Camera, Flashlight, Unlock, Sparkles, ChevronUp } from 'lucide-react';

interface PhoneMockupProps {
  wallpaper: WallpaperItem;
  config: WallpaperConfig;
  customBgUrl?: string | null;
  customFgUrl?: string | null;
  interactiveParallax?: boolean;
  scale?: number;
  showDismissNotice?: boolean;
  className?: string;
  onOpenFullscreen?: () => void;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  wallpaper,
  config,
  customBgUrl,
  customFgUrl,
  interactiveParallax = true,
  scale = 1,
  className = '',
  onOpenFullscreen,
}) => {
  // DOM element refs for ZERO-LAG direct GPU transform manipulation
  const containerRef = useRef<HTMLDivElement>(null);
  const bezelRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const clockBehindRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const clockFrontRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  // Physics animation state kept in refs to avoid triggering React re-renders!
  const targetTilt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentTilt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Local interactive lockscreen state
  const [flashlightOn, setFlashlightOn] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const bgUrl = customBgUrl || wallpaper.bgUrl;
  const fgUrl = customFgUrl || wallpaper.fgUrl;

  // Ultra-smooth 60/120 FPS physics loop using requestAnimationFrame
  useEffect(() => {
    if (!interactiveParallax) return;

    let isRunning = true;
    const lerpFactor = 0.085; // Butter smooth spring interpolation

    const updatePhysics = () => {
      if (!isRunning) return;

      // Spring lerp towards target
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * lerpFactor;
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * lerpFactor;

      const { x, y } = currentTilt.current;
      const sensitivity = (config.depthSensitivity || 35) / 25;

      // 1. Phone Bezel 3D Rotation
      if (bezelRef.current) {
        const rotY = (x * 7 * sensitivity).toFixed(2);
        const rotX = (-y * 7 * sensitivity).toFixed(2);
        bezelRef.current.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      }

      // 2. Background Scenery Layer
      if (bgRef.current) {
        const bgX = (-x * 14 * sensitivity).toFixed(2);
        const bgY = (-y * 14 * sensitivity).toFixed(2);
        bgRef.current.style.transform = `translate3d(${bgX}px, ${bgY}px, 0) scale(1.12)`;
      }

      // 3. Clock Behind Subject Layer
      if (clockBehindRef.current) {
        const clkX = (-x * 6 * sensitivity).toFixed(2);
        const clkY = (-y * 6 * sensitivity).toFixed(2);
        clockBehindRef.current.style.transform = `translate3d(${clkX}px, ${clkY}px, 0)`;
      }

      // 4. Foreground Subject (Pushes toward viewer)
      if (fgRef.current) {
        const popScale = config.depthPop || 1.05;
        const fgX = (x * 16 * sensitivity).toFixed(2);
        const fgY = (y * 16 * sensitivity).toFixed(2);
        fgRef.current.style.transform = `translate3d(${fgX}px, ${fgY}px, 0) scale(${popScale})`;
      }

      // 5. Clock Front Layer (if depthBehindSubject is false)
      if (clockFrontRef.current) {
        const clkX = (-x * 8 * sensitivity).toFixed(2);
        const clkY = (-y * 8 * sensitivity).toFixed(2);
        clockFrontRef.current.style.transform = `translate3d(${clkX}px, ${clkY}px, 0)`;
      }

      // 6. Realistic Glass Glare Reflection
      if (glareRef.current) {
        const glareX = ((x + 1) * 50).toFixed(1);
        const glareY = ((y + 1) * 50).toFixed(1);
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 65%)`;
      }

      animFrameId.current = requestAnimationFrame(updatePhysics);
    };

    animFrameId.current = requestAnimationFrame(updatePhysics);

    return () => {
      isRunning = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [interactiveParallax, config.depthSensitivity, config.depthPop]);

  // Pointer move handler (Mouse & Touch supported without triggering state updates!)
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((clientY - rect.top) / rect.height - 0.5) * 2;

    targetTilt.current = {
      x: Math.max(-1.2, Math.min(1.2, nx)),
      y: Math.max(-1.2, Math.min(1.2, ny)),
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  }, [handlePointerMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handlePointerMove]);

  const handlePointerLeave = useCallback(() => {
    targetTilt.current = { x: 0, y: 0 };
  }, []);

  // Gyroscope orientation for mobile devices
  useEffect(() => {
    if (!interactiveParallax) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const x = Math.min(Math.max(e.gamma / 22, -1.2), 1.2);
        const y = Math.min(Math.max((e.beta - 45) / 22, -1.2), 1.2);
        targetTilt.current = { x, y };
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [interactiveParallax]);

  // Flashlight click handler with sound
  const handleToggleFlashlight = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !flashlightOn;
    setFlashlightOn(nextState);
    sound.playFlashlight(nextState);
  };

  // Camera click handler with haptic sound
  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
  };

  // Swipe up to unlock animation
  const handleUnlockTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playUnlock();
    setIsUnlocked(true);
    setTimeout(() => {
      setIsUnlocked(false);
    }, 2400);
  };

  // Image Filter style map
  const getImageFilterStyle = () => {
    switch (config.imageFilter) {
      case 'cinematic':
        return 'contrast(1.15) saturate(1.25) hue-rotate(-5deg)';
      case 'bw':
        return 'grayscale(1) contrast(1.25)';
      case 'cyberpunk':
        return 'saturate(1.6) contrast(1.2) hue-rotate(15deg)';
      case 'warm':
        return 'sepia(0.25) saturate(1.3) contrast(1.05)';
      case 'amoled':
        return 'contrast(1.35) brightness(0.9)';
      case 'vintage':
        return 'sepia(0.35) contrast(0.95) brightness(1.05)';
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handlePointerLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerLeave}
      className={`relative flex flex-col items-center select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{
        perspective: '1200px',
      }}
    >
      {/* Smartphone Frame Outer Titanium Bezel */}
      <div
        ref={bezelRef}
        className="relative overflow-hidden rounded-[46px] border-[5px] border-[#222225] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] bg-black will-change-transform"
        style={{
          width: `${285 * scale}px`,
          height: `${590 * scale}px`,
          boxShadow: flashlightOn
            ? '0 0 60px rgba(255, 255, 255, 0.4), 0 30px 70px -15px rgba(0,0,0,0.95)'
            : '0 30px 70px -15px rgba(0,0,0,0.95)',
          transition: 'box-shadow 0.25s ease',
        }}
      >
        {/* Layer 1: Background Scenery Wallpaper */}
        <div
          ref={bgRef}
          className="absolute inset-[-24px] bg-cover bg-center will-change-transform pointer-events-none"
          style={{
            backgroundImage: `url(${bgUrl})`,
            filter: `blur(${config.blurBackground || 0}px) ${getImageFilterStyle()}`,
          }}
        />

        {/* Ambient AMOLED Vignette for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-[5]" />

        {/* Layer 2: Depth Clock (Behind Subject) */}
        {config.depthBehindSubject && (
          <div
            ref={clockBehindRef}
            className="absolute inset-0 z-10 will-change-transform pointer-events-none"
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
              gradientEnabled={config.gradientEnabled}
              gradientColor2={config.gradientColor2}
              glowEnabled={config.glowEnabled}
              glowIntensity={config.glowIntensity}
              letterSpacing={config.letterSpacing}
              shadowBlur={config.shadowBlur}
              topWidget={config.topWidget}
              bottomWidgets={config.bottomWidgets}
            />
          </div>
        )}

        {/* Layer 3: Foreground Cutout Subject */}
        {fgUrl && (
          <div
            ref={fgRef}
            className="absolute inset-[-20px] z-20 bg-contain bg-bottom bg-no-repeat pointer-events-none will-change-transform"
            style={{
              backgroundImage: `url(${fgUrl})`,
              filter: `drop-shadow(0 16px 30px rgba(0,0,0,0.65)) ${getImageFilterStyle()}`,
            }}
          />
        )}

        {/* Fallback Clock on Top (if depthBehindSubject is false) */}
        {!config.depthBehindSubject && (
          <div
            ref={clockFrontRef}
            className="absolute inset-0 z-30 will-change-transform pointer-events-none"
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
              gradientEnabled={config.gradientEnabled}
              gradientColor2={config.gradientColor2}
              glowEnabled={config.glowEnabled}
              glowIntensity={config.glowIntensity}
              letterSpacing={config.letterSpacing}
              shadowBlur={config.shadowBlur}
              topWidget={config.topWidget}
              bottomWidgets={config.bottomWidgets}
            />
          </div>
        )}

        {/* Dynamic Island / Punch Hole Sensor Notch */}
        <div className="absolute top-2.5 inset-x-0 z-50 flex justify-center pointer-events-none">
          <div className="w-24 h-6 bg-black rounded-full flex items-center justify-between px-2.5 border border-white/10 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0d0d10] border border-white/15" />
            <div className="w-2 h-2 rounded-full bg-[#1b3a23] ring-1 ring-emerald-500/50 animate-pulse" />
          </div>
        </div>

        {/* Top iOS Status Bar */}
        <div className="absolute top-3.5 inset-x-5 z-40 flex items-center justify-between text-[11px] font-bold text-white drop-shadow-md pointer-events-none">
          <span>T-Mobile</span>
          <div className="flex items-center space-x-1.5">
            <Signal className="w-3 h-3 text-white" />
            <span className="text-[10px] font-black">5G</span>
            <Wifi className="w-3 h-3 text-white" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px]">88%</span>
              <Battery className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Unlocked Toast Banner */}
        {isUnlocked && (
          <div className="absolute inset-x-4 top-16 z-50 p-3 rounded-2xl bg-emerald-500/90 backdrop-blur-md text-white text-center shadow-2xl animate-bounce">
            <div className="flex items-center justify-center space-x-1.5 font-bold text-xs">
              <Unlock className="w-4 h-4" />
              <span>Screen Unlocked • 60 FPS Fluidity</span>
            </div>
          </div>
        )}

        {/* Bottom Lockscreen Shortcuts Bar */}
        <div className="absolute inset-x-6 bottom-7 z-40 flex items-center justify-between">
          {/* Flashlight Shortcut Button */}
          <button
            onClick={handleToggleFlashlight}
            className={`w-11 h-11 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg ${
              flashlightOn
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.9)]'
                : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
            }`}
            title="Flashlight"
          >
            <Flashlight className="w-5 h-5 fill-current" />
          </button>

          {/* Swipe Up To Unlock indicator */}
          <div
            onClick={handleUnlockTrigger}
            className="flex flex-col items-center justify-center cursor-pointer group py-1"
          >
            <ChevronUp className="w-4 h-4 text-white/70 animate-bounce group-hover:text-yellow-400" />
            <div className="w-32 h-1 bg-white/75 rounded-full group-hover:bg-yellow-400 transition-colors" />
          </div>

          {/* Camera Shortcut Button */}
          <button
            onClick={handleCameraClick}
            className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 active:scale-90 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-lg"
            title="Camera"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Screen Glare Layer */}
        <div
          ref={glareRef}
          className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-300"
        />

        {/* Flashlight On Screen Illumination */}
        {flashlightOn && (
          <div className="absolute inset-0 bg-white/20 pointer-events-none z-30 backdrop-brightness-125" />
        )}
      </div>

      {/* Subtle Hint Below Phone */}
      <div className="mt-3 flex items-center space-x-1.5 text-[11px] font-semibold text-neutral-400">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
        <span>حرك الماوس أو المس الشاشة لمعاينة تأثير العمق ثلاثي الأبعاد</span>
      </div>
    </div>
  );
};
