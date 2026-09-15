import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WallpaperPreset } from '../data/presets';
import {
  Layers,
  Battery,
  Wifi,
  Sparkles,
  Fingerprint,
  Rotate3d,
  Gauge,
  Eye,
  EyeOff,
  Clock,
  Sliders,
  Type
} from 'lucide-react';

interface ParallaxPhoneSimulatorProps {
  preset: WallpaperPreset;
  depthStrength: number;
  sensitivity: number;
  isBatterySaver: boolean;
  onToggleBatterySaver: (val: boolean) => void;
  onDepthChange: (val: number) => void;
  onSensitivityChange: (val: number) => void;
  customFgUrl?: string | null;
  customBgUrl?: string | null;
}

export const ParallaxPhoneSimulator: React.FC<ParallaxPhoneSimulatorProps> = ({
  preset,
  depthStrength,
  sensitivity,
  isBatterySaver,
  onToggleBatterySaver,
  onDepthChange,
  onSensitivityChange,
  customFgUrl,
  customBgUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Tilt targets and smoothed coordinates
  const [roll, setRoll] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const targetTilt = useRef<{ roll: number; pitch: number }>({ roll: 0, pitch: 0 });
  const currentTilt = useRef<{ roll: number; pitch: number }>({ roll: 0, pitch: 0 });

  // Toggles
  const [isExploded3D, setIsExploded3D] = useState<boolean>(false);
  const [showClock, setShowClock] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [showForeground, setShowForeground] = useState<boolean>(true);
  const [showBackground, setShowBackground] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);

  // Clock Customization State (com.example.depthlockscreen.data.model.ClockConfig)
  const [isClockBehindSubject, setIsClockBehindSubject] = useState<boolean>(true);
  const [clockFontFamily, setClockFontFamily] = useState<string>('Display Bold');
  const [clockColor, setClockColor] = useState<string>('#ffffff');
  const [clockSize, setClockSize] = useState<number>(72);
  const [clockVerticalBias, setClockVerticalBias] = useState<number>(0.18); // top percentage

  // Time for clock
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [currentDate, setCurrentDate] = useState<string>('الثلاثاء، ١٥ سبتمبر');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Mouse movement across container or window
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);

    targetTilt.current = {
      roll: Math.max(-1, Math.min(1, normalizedX)),
      pitch: Math.max(-1, Math.min(1, normalizedY)),
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetTilt.current = { roll: 0, pitch: 0 };
  }, []);

  // Support DeviceOrientation if opened on a real mobile device
  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null && event.beta !== null) {
        const normalizedRoll = Math.max(-1, Math.min(1, event.gamma / 35));
        const normalizedPitch = Math.max(-1, Math.min(1, (event.beta - 45) / 35));
        targetTilt.current = { roll: normalizedRoll, pitch: normalizedPitch };
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  // Animation Loop: Low-Pass Filter / LERP mimicking Kotlin ParallaxSensorHelper
  useEffect(() => {
    let animId: number;
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const lerpFactor = isBatterySaver ? 0.08 : 0.12;

    const loop = (now: number) => {
      frameCount++;
      if (now - lastFpsUpdate >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      currentTilt.current.roll +=
        (targetTilt.current.roll - currentTilt.current.roll) * lerpFactor;
      currentTilt.current.pitch +=
        (targetTilt.current.pitch - currentTilt.current.pitch) * lerpFactor;

      setRoll(currentTilt.current.roll);
      setPitch(currentTilt.current.pitch);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isBatterySaver]);

  // Parallax offsets math
  const maxOffset = depthStrength * sensitivity * 0.45;
  const bgOffsetX = -roll * maxOffset * 0.4;
  const bgOffsetY = -pitch * maxOffset * 0.4;

  const clockOffsetX = -roll * maxOffset * 0.15;
  const clockOffsetY = -pitch * maxOffset * 0.15;

  const fgOffsetX = roll * maxOffset * 0.9;
  const fgOffsetY = pitch * maxOffset * 0.9;

  const bgUrl = customBgUrl || preset.bgUrl;
  const fgUrl = customFgUrl || preset.fgUrl;

  const getFontClass = (fontName: string) => {
    switch (fontName) {
      case 'Serif Elegant':
        return 'font-serif font-bold tracking-normal';
      case 'Tech Mono':
        return 'font-mono font-bold tracking-tight';
      case 'Display Bold':
        return 'font-black tracking-tighter';
      case 'Rounded Soft':
        return 'font-semibold tracking-wide';
      default:
        return 'font-sans font-extrabold tracking-tight';
    }
  };

  const renderClockElement = (isBehind: boolean) => {
    if (!showClock || isClockBehindSubject !== isBehind) return null;

    return (
      <div
        className="absolute inset-x-0 pointer-events-none flex flex-col items-center text-center transition-transform duration-75 ease-out"
        style={{
          top: `${clockVerticalBias * 100}%`,
          transform: isExploded3D
            ? `translate3d(${clockOffsetX}px, ${clockOffsetY}px, ${isBehind ? '35px' : '170px'})`
            : `translate3d(${clockOffsetX}px, ${clockOffsetY}px, 0)`,
          zIndex: isBehind ? 10 : 30,
          color: clockColor,
        }}
      >
        <span
          className={`leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] ${getFontClass(clockFontFamily)}`}
          style={{ fontSize: `${clockSize}px` }}
        >
          {currentTime}
        </span>
        <span
          className="text-xs font-semibold mt-1 drop-shadow opacity-85"
          style={{ color: clockColor }}
        >
          {currentDate}
        </span>
      </div>
    );
  };

  return (
    <div id="parallax-simulator-container" className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
      {/* Phone Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative cursor-crosshair select-none flex flex-col items-center justify-center"
        style={{ perspective: isExploded3D ? '1400px' : '1000px' }}
      >
        {/* Device Frame */}
        <div
          className="relative w-[310px] h-[640px] sm:w-[340px] sm:h-[690px] rounded-[48px] p-3 shadow-2xl transition-transform duration-500 ease-out"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            boxShadow:
              '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
            transform: isExploded3D
              ? 'rotateY(-28deg) rotateX(16deg) scale(0.92)'
              : 'rotateY(0deg) rotateX(0deg) scale(1)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Outer Screen Bezel */}
          <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-black flex flex-col">
            {/* Top Dynamic Island / Punch Hole */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80" />
            </div>

            {/* Android Status Bar */}
            <div className="absolute top-2 left-0 right-0 z-40 px-6 pt-1 flex justify-between items-center text-white/90 text-xs font-semibold tracking-wider">
              <span>{currentTime}</span>
              <div className="flex items-center gap-2 text-white/80">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">5G</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">98%</span>
                  <Battery className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* PARALLAX VIEWPORT CANVAS (Double/Triple Layers Sandwich) */}
            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* 1️⃣ Layer 1: Background (Scaled 115% with Inverted Parallax) */}
              {showBackground && (
                <div
                  className="absolute inset-[-15%] w-[130%] h-[130%] transition-transform duration-75 ease-out z-0"
                  style={{
                    transform: isExploded3D
                      ? `translate3d(${bgOffsetX}px, ${bgOffsetY}px, -120px) scale(1.1)`
                      : `translate3d(${bgOffsetX}px, ${bgOffsetY}px, 0) scale(1.15)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={bgUrl}
                    alt="Background"
                    className="w-full h-full object-cover pointer-events-none filter brightness-95"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                </div>
              )}

              {/* Ambient Floating Particles */}
              {showParticles && (
                <div
                  className="absolute inset-0 pointer-events-none transition-transform duration-75 ease-out z-[5]"
                  style={{
                    transform: `translate3d(${fgOffsetX * 0.3}px, ${fgOffsetY * 0.3}px, ${isExploded3D ? '-40px' : '5px'})`,
                  }}
                >
                  <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-300/60 blur-[1px] animate-pulse" />
                  <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-amber-300/50 blur-[1px] animate-bounce" />
                  <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-white/70" />
                  <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 rounded-full bg-pink-300/60 blur-[0.5px]" />
                </div>
              )}

              {/* 2️⃣ Layer 2 (Sandwich Middle): Clock when BEHIND subject */}
              {renderClockElement(true)}

              {/* 3️⃣ Layer 3: Foreground Subject (Segmented via ML Kit) */}
              {showForeground && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75 ease-out z-20"
                  style={{
                    transform: isExploded3D
                      ? `translate3d(${fgOffsetX}px, ${fgOffsetY}px, 95px) scale(1.08)`
                      : `translate3d(${fgOffsetX}px, ${fgOffsetY}px, 0) scale(1.04)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={fgUrl}
                    alt="Foreground Subject"
                    className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
                    loading="eager"
                    style={{
                      maskImage: customFgUrl ? undefined : 'radial-gradient(ellipse 70% 80% at 50% 65%, black 40%, transparent 85%)',
                      WebkitMaskImage: customFgUrl ? undefined : 'radial-gradient(ellipse 70% 80% at 50% 65%, black 40%, transparent 85%)',
                    }}
                  />
                </div>
              )}

              {/* 4️⃣ Clock when IN FRONT of subject */}
              {renderClockElement(false)}

              {/* 5️⃣ Layer 5: System UI Lock Screen Widgets (Fingerprint & Bottom Prompt) */}
              <div
                className="absolute inset-0 pointer-events-none flex flex-col justify-end p-6 pb-12 transition-transform duration-75 ease-out z-30"
                style={{
                  transform: isExploded3D
                    ? 'translate3d(0, 0, 180px)'
                    : 'translate3d(0, 0, 20px)',
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full border border-white/20 bg-black/35 backdrop-blur-md flex items-center justify-center text-white/85 shadow-lg">
                    <Fingerprint className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="text-[11px] text-white/70 font-medium tracking-wide">
                    المس لفتح القفل
                  </span>
                </div>
              </div>

              {/* 3D Exploded View Labels (Visible only when in exploded view) */}
              {isExploded3D && (
                <div className="absolute inset-0 pointer-events-none z-50">
                  <div className="absolute top-8 -left-20 bg-blue-600/90 text-white text-[10px] px-2 py-0.5 rounded font-mono shadow-md">
                    +180px UI Widgets
                  </div>
                  <div className="absolute top-1/2 -left-22 bg-emerald-600/90 text-white text-[10px] px-2 py-0.5 rounded font-mono shadow-md">
                    +95px ML Kit Subject
                  </div>
                  {isClockBehindSubject && (
                    <div className="absolute top-28 -left-22 bg-amber-600/90 text-white text-[10px] px-2 py-0.5 rounded font-mono shadow-md">
                      +35px Clock Sandwich
                    </div>
                  )}
                  <div className="absolute bottom-16 -left-20 bg-purple-600/90 text-white text-[10px] px-2 py-0.5 rounded font-mono shadow-md">
                    -120px Overscan BG
                  </div>
                </div>
              )}
            </div>

            {/* Android Navigation Bar */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/70 rounded-full z-40" />
          </div>
        </div>

        {/* Real-time Telemetry Badge */}
        <div className="mt-4 flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-300 shadow-lg">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono">{fps} FPS</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Roll: {(roll * 15).toFixed(1)}°</span>
            <span className="text-slate-600">|</span>
            <span>Pitch: {(pitch * 15).toFixed(1)}°</span>
          </div>
        </div>
      </div>

      {/* Simulator Control Dashboard */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              لوحة التحكم بمحاكي قفل الشاشة
            </h3>
            <p className="text-xs text-slate-400">
              حرك الفأرة أو الهاتف لتجربة استجابة الجيروسكوب وتأثير ساندوتش العمق
            </p>
          </div>
          <button
            id="toggle-exploded-3d-btn"
            onClick={() => setIsExploded3D(!isExploded3D)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isExploded3D
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Rotate3d className="w-4 h-4" />
            {isExploded3D ? 'منظور عادي' : 'تفجير الطبقات 3D'}
          </button>
        </div>

        {/* 🕰️ CLOCK CUSTOMIZER CONTROLS (ClockConfig) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              تخصيص الساعة (ClockConfig)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300">
              {isClockBehindSubject ? 'خلف العنصر (Depth)' : 'فوق العنصر'}
            </span>
          </div>

          {/* Depth Sandwich Switch */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white">تأثير ساندوتش العمق</div>
              <div className="text-[10px] text-slate-400">إخفاء جزء من أرقام الساعة خلف الشخصية</div>
            </div>
            <button
              id="toggle-clock-behind-subject-btn"
              onClick={() => setIsClockBehindSubject(!isClockBehindSubject)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isClockBehindSubject ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  isClockBehindSubject ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Font Style Selection */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              نوع الخط (Font Family):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Display Bold', 'Modern Sans', 'Serif Elegant', 'Tech Mono', 'Rounded Soft'].map(
                (font) => (
                  <button
                    key={font}
                    onClick={() => setClockFontFamily(font)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      clockFontFamily === font
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {font}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">لون الساعة:</span>
            <div className="flex items-center gap-2">
              {[
                { hex: '#ffffff', label: 'أبيض' },
                { hex: '#38bdf8', label: 'سماوي' },
                { hex: '#f59e0b', label: 'ذهبي' },
                { hex: '#ec4899', label: 'وردي' },
                { hex: '#10b981', label: 'زمردي' },
                { hex: '#a855f7', label: 'بنفسجي' },
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setClockColor(c.hex)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    clockColor === c.hex
                      ? 'scale-125 ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Vertical Bias & Size */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>الموقع الرأسي</span>
                <span className="text-sky-400">{Math.round(clockVerticalBias * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.02"
                value={clockVerticalBias}
                onChange={(e) => setClockVerticalBias(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>حجم الساعة</span>
                <span className="text-sky-400">{clockSize}px</span>
              </div>
              <input
                type="range"
                min="56"
                max="96"
                value={clockSize}
                onChange={(e) => setClockSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Sliders for Depth and Sensitivity */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>قوة تباعد العمق (Z-Axis Depth)</span>
              <span className="text-sky-400 font-mono">{depthStrength} px</span>
            </div>
            <input
              id="slider-depth-strength"
              type="range"
              min="10"
              max="70"
              value={depthStrength}
              onChange={(e) => onDepthChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>حساسية المستشعر (Sensor Sensitivity)</span>
              <span className="text-sky-400 font-mono">{sensitivity.toFixed(1)}x</span>
            </div>
            <input
              id="slider-sensitivity"
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={sensitivity}
              onChange={(e) => onSensitivityChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        {/* Layer Visibility Toggles */}
        <div className="border-t border-slate-800 pt-4">
          <span className="text-xs font-bold text-slate-400 block mb-2.5">
            فحص وتحليل الطبقات (Layer Inspection)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              id="toggle-foreground-layer"
              onClick={() => setShowForeground(!showForeground)}
              className={`p-2 rounded-xl flex items-center justify-between border transition-all ${
                showForeground
                  ? 'bg-sky-950/40 border-sky-600/40 text-sky-200'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <span>عنصر المقدمة (Subject)</span>
              {showForeground ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              id="toggle-background-layer"
              onClick={() => setShowBackground(!showBackground)}
              className={`p-2 rounded-xl flex items-center justify-between border transition-all ${
                showBackground
                  ? 'bg-purple-950/40 border-purple-600/40 text-purple-200'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <span>طبقة الخلفية (Overscan)</span>
              {showBackground ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              id="toggle-clock-layer"
              onClick={() => setShowClock(!showClock)}
              className={`p-2 rounded-xl flex items-center justify-between border transition-all ${
                showClock
                  ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <span>ساعة وقفل أندرويد</span>
              {showClock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              id="toggle-particles-layer"
              onClick={() => setShowParticles(!showParticles)}
              className={`p-2 rounded-xl flex items-center justify-between border transition-all ${
                showParticles
                  ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <span>جزيئات الضوء المحيط</span>
              {showParticles ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Battery Saver Mode */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isBatterySaver ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Battery className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">محاكاة توفير الطاقة (Battery Saver)</div>
              <div className="text-[11px] text-slate-400">تخفيض التردد وتنعيم أكبر للمستشعر</div>
            </div>
          </div>
          <button
            id="toggle-battery-saver-btn"
            onClick={() => onToggleBatterySaver(!isBatterySaver)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              isBatterySaver ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                isBatterySaver ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
