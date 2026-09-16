import React, { useState, useRef } from 'react';
import { WallpaperItem, WallpaperConfig, ClockFontStyle } from '../types/wallpaper';
import { PhoneMockup } from './PhoneMockup';
import { sound } from '../utils/haptics';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
  Upload,
  Layers,
  Palette,
  Clock,
  Type,
  CheckCircle2,
  Sliders,
  Volume2,
  VolumeX,
  Eye,
  Sun,
  LayoutGrid,
  Zap,
} from 'lucide-react';

interface StudioViewProps {
  wallpaper: WallpaperItem;
  config: WallpaperConfig;
  onChangeConfig: (newConfig: WallpaperConfig) => void;
  onResetConfig: () => void;
  onSetWallpaper: () => void;
  onExportJson: () => void;
  onUploadCustomPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customBgUrl: string | null;
  customFgUrl: string | null;
}

type StudioTab = 'basics' | 'typography' | 'widgets' | 'depth' | 'photo';

export const StudioView: React.FC<StudioViewProps> = ({
  wallpaper,
  config,
  onChangeConfig,
  onResetConfig,
  onSetWallpaper,
  onExportJson,
  onUploadCustomPhoto,
  customBgUrl,
  customFgUrl,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('basics');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(sound.isEnabled());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateConfig = (key: keyof WallpaperConfig, value: any) => {
    sound.playTick();
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    sound.setEnabled(next);
    if (next) sound.playPop();
  };

  const fontOptions: { id: ClockFontStyle; label: string; preview: string; fontFam: string }[] = [
    { id: 'capsule', label: 'Capsule iOS', preview: '02:36', fontFam: "'Outfit', sans-serif" },
    { id: 'outline', label: 'Glass Outline', preview: '02:36', fontFam: "'Outfit', sans-serif" },
    { id: 'condensed', label: 'Bebas Tall', preview: '02:36', fontFam: "'Bebas Neue', sans-serif" },
    { id: 'stencil', label: 'Cyber Stencil', preview: '02:36', fontFam: "'Syne', sans-serif" },
    { id: 'neon', label: 'Neon Bloom', preview: '02:36', fontFam: "'Outfit', sans-serif" },
    { id: 'serif', label: 'Editorial Serif', preview: '02:36', fontFam: 'Georgia, serif' },
    { id: 'digital', label: 'Retro Segment', preview: '02:36', fontFam: "'JetBrains Mono', monospace" },
    { id: 'thin', label: 'Minimal Thin', preview: '02:36', fontFam: "'Plus Jakarta Sans', sans-serif" },
  ];

  const colorPresets = [
    '#FFFFFF',
    '#FFDE00',
    '#FB923C',
    '#EF4444',
    '#F472B6',
    '#A78BFA',
    '#38BDF8',
    '#10B981',
    '#E2E8F0',
    '#9A6B46',
  ];

  const filterPresets: { id: WallpaperConfig['imageFilter']; label: string }[] = [
    { id: 'none', label: 'Normal' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'bw', label: 'Noir B&W' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'warm', label: 'Golden Hour' },
    { id: 'amoled', label: 'AMOLED Dark' },
    { id: 'vintage', label: 'Film Grain' },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 pt-6 pb-28 max-w-md mx-auto sm:max-w-lg md:max-w-xl font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-xl bg-[#FFDE00] flex items-center justify-center text-black font-black text-sm">
            D
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white font-['Outfit']">
              Studio Pro
            </h1>
            <p className="text-[10px] text-neutral-400 font-semibold tracking-wide">
              {wallpaper.title} • 3D Depth Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
              isSoundOn
                ? 'bg-[#1e1e22] text-[#FFDE00] border-[#FFDE00]/30'
                : 'bg-[#18181c] text-neutral-500 border-white/5'
            }`}
            title="Toggle Haptic Sound"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen View */}
          <button
            onClick={() => {
              sound.playPop();
              setIsFullscreenPreview(!isFullscreenPreview);
            }}
            className="w-9 h-9 rounded-full bg-[#1c1c1f] hover:bg-[#28282c] flex items-center justify-center text-yellow-400 border border-white/5 transition-colors cursor-pointer"
            title="Toggle Preview Scale"
          >
            {isFullscreenPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Reset Config */}
          <button
            onClick={() => {
              sound.playToggle(false);
              onResetConfig();
            }}
            className="w-9 h-9 rounded-full bg-[#1c1c1f] hover:bg-[#28282c] flex items-center justify-center text-neutral-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
            title="Reset Settings"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zero-Lag Phone Simulator */}
      <div className="flex justify-center my-2 transition-all duration-300">
        <PhoneMockup
          wallpaper={wallpaper}
          config={config}
          customBgUrl={customBgUrl}
          customFgUrl={customFgUrl}
          scale={isFullscreenPreview ? 1.05 : 0.85}
          interactiveParallax={true}
        />
      </div>

      {/* Customizer Sheet (when not in full preview) */}
      {!isFullscreenPreview && (
        <div className="mt-4 bg-[#121215] rounded-3xl p-4 border border-white/10 shadow-2xl space-y-4">
          {/* Tabs Navigation */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 overflow-x-auto no-scrollbar gap-2">
            {(['basics', 'typography', 'widgets', 'depth', 'photo'] as StudioTab[]).map((tab) => {
              const isActive = activeTab === tab;
              const labels: Record<StudioTab, { name: string; icon: any }> = {
                basics: { name: 'Basics', icon: Sliders },
                typography: { name: 'Font & Color', icon: Type },
                widgets: { name: 'Widgets', icon: LayoutGrid },
                depth: { name: '3D Depth', icon: Layers },
                photo: { name: 'My Photo', icon: Upload },
              };
              const IconComp = labels[tab].icon;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    sound.playPop();
                    setActiveTab(tab);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#FFDE00] text-black shadow-md'
                      : 'bg-[#1a1a1f] text-neutral-400 hover:text-white'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{labels[tab].name}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: BASICS */}
          {activeTab === 'basics' && (
            <div className="space-y-4 pt-1">
              {/* Font Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-300">Clock Size</span>
                  <span className="text-[#FFDE00] font-mono">{config.fontSize.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="42"
                  step="0.5"
                  value={config.fontSize}
                  onChange={(e) => updateConfig('fontSize', parseFloat(e.target.value))}
                  className="w-full accent-[#FFDE00] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Vertical Position */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-300">Vertical Position (Y)</span>
                  <span className="text-[#FFDE00] font-mono">{config.verticalPos}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="65"
                  value={config.verticalPos}
                  onChange={(e) => updateConfig('verticalPos', parseInt(e.target.value))}
                  className="w-full accent-[#FFDE00] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Horizontal Position */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-300">Horizontal Position (X)</span>
                  <span className="text-[#FFDE00] font-mono">{config.horizontalPos}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={config.horizontalPos}
                  onChange={(e) => updateConfig('horizontalPos', parseInt(e.target.value))}
                  className="w-full accent-[#FFDE00] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Letter Spacing & Clock Opacity */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-neutral-300">
                    <span>Letter Spacing</span>
                    <span className="text-[#FFDE00]">{config.letterSpacing || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="14"
                    value={config.letterSpacing || 0}
                    onChange={(e) => updateConfig('letterSpacing', parseInt(e.target.value))}
                    className="w-full accent-[#FFDE00] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-neutral-300">
                    <span>Clock Opacity</span>
                    <span className="text-[#FFDE00]">{config.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={config.opacity}
                    onChange={(e) => updateConfig('opacity', parseInt(e.target.value))}
                    className="w-full accent-[#FFDE00] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181c] border border-white/5 cursor-pointer">
                  <span className="text-xs font-semibold text-neutral-300">24-Hour Clock</span>
                  <input
                    type="checkbox"
                    checked={config.is24Hour}
                    onChange={(e) => updateConfig('is24Hour', e.target.checked)}
                    className="w-4 h-4 accent-[#FFDE00] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181c] border border-white/5 cursor-pointer">
                  <span className="text-xs font-semibold text-neutral-300">Live Device Time</span>
                  <input
                    type="checkbox"
                    checked={config.useLiveTime}
                    onChange={(e) => updateConfig('useLiveTime', e.target.checked)}
                    className="w-4 h-4 accent-[#FFDE00] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY & COLOR */}
          {activeTab === 'typography' && (
            <div className="space-y-4 pt-1">
              {/* Font Family Selection */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Select Font Style (8 Typographic Families)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {fontOptions.map((f) => {
                    const isSelected = config.fontStyle === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => updateConfig('fontStyle', f.id)}
                        className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1e1e24] border-[#FFDE00] shadow-[0_0_12px_rgba(255,222,0,0.2)]'
                            : 'bg-[#161619] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div
                            className="text-lg font-bold leading-none mb-1 text-white"
                            style={{ fontFamily: f.fontFam }}
                          >
                            {f.preview}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-semibold">{f.label}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FFDE00]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Primary Clock Color
                </label>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateConfig('color', c)}
                      className={`w-8 h-8 rounded-full flex-shrink-0 transition-transform cursor-pointer border ${
                        config.color === c
                          ? 'ring-2 ring-[#FFDE00] scale-110 border-white'
                          : 'border-white/20 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {/* Custom Hex input */}
                  <input
                    type="color"
                    value={config.color.startsWith('#') ? config.color : '#FFFFFF'}
                    onChange={(e) => updateConfig('color', e.target.value)}
                    className="w-8 h-8 rounded-full border border-white/20 bg-transparent cursor-pointer flex-shrink-0"
                    title="Custom Color"
                  />
                </div>
              </div>

              {/* Dual-Tone Gradient Toggle & 2nd Color */}
              <div className="p-3 rounded-2xl bg-[#18181c] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#FFDE00]" />
                    <span className="text-xs font-bold text-white">Dual-Tone Color Gradient</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.gradientEnabled || false}
                    onChange={(e) => updateConfig('gradientEnabled', e.target.checked)}
                    className="w-4 h-4 accent-[#FFDE00] rounded cursor-pointer"
                  />
                </div>

                {config.gradientEnabled && (
                  <div className="flex items-center space-x-2 pt-1 border-t border-white/5">
                    <span className="text-[11px] text-neutral-400">End Color:</span>
                    {['#FFDE00', '#F472B6', '#38BDF8', '#10B981', '#EF4444'].map((c2) => (
                      <button
                        key={c2}
                        onClick={() => updateConfig('gradientColor2', c2)}
                        className={`w-6 h-6 rounded-full border ${
                          config.gradientColor2 === c2 ? 'ring-2 ring-white scale-110' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: c2 }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Glow / Luminescence Slider */}
              <div className="p-3 rounded-2xl bg-[#18181c] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">OLED Neon Bloom Glow</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.glowEnabled || false}
                    onChange={(e) => updateConfig('glowEnabled', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>

                {config.glowEnabled && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>Glow Intensity</span>
                      <span className="text-cyan-400">{config.glowIntensity || 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={config.glowIntensity || 50}
                      onChange={(e) => updateConfig('glowIntensity', parseInt(e.target.value))}
                      className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WIDGETS & COMPLICATIONS */}
          {activeTab === 'widgets' && (
            <div className="space-y-4 pt-1">
              {/* Top Complication */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Top Complication (Above Clock)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'date', label: '📅 Date String' },
                    { id: 'weather', label: '⛅ Weather (24°C)' },
                    { id: 'battery', label: '🔋 Battery (88%)' },
                    { id: 'steps', label: '👟 Steps (8,420)' },
                    { id: 'event', label: '⏳ Meeting in 45m' },
                    { id: 'none', label: '🚫 Hidden' },
                  ].map((w) => {
                    const isSelected = (config.topWidget || 'date') === w.id;
                    return (
                      <button
                        key={w.id}
                        onClick={() => updateConfig('topWidget', w.id)}
                        className={`p-2 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFDE00] text-black border-[#FFDE00]'
                            : 'bg-[#161619] text-neutral-300 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Complications Row */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Bottom Lock Screen Widgets Row
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'battery', label: 'Battery Level Gauge (88%)' },
                    { id: 'weather', label: 'Weather Forecast (Sunny 24°)' },
                    { id: 'activity', label: 'Fitness Activity (420 kcal)' },
                    { id: 'calendar', label: 'Next Calendar Event' },
                  ].map((item) => {
                    const activeList = config.bottomWidgets || [];
                    const isIncluded = activeList.includes(item.id as any);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          const updated = isIncluded
                            ? activeList.filter((x) => x !== item.id)
                            : [...activeList, item.id as any];
                          updateConfig('bottomWidgets', updated);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isIncluded
                            ? 'bg-[#1a1e28] border-sky-400/50 text-white'
                            : 'bg-[#151518] border-white/5 text-neutral-400'
                        }`}
                      >
                        <span className="text-xs font-semibold">{item.label}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isIncluded
                              ? 'bg-sky-400 border-sky-400 text-black'
                              : 'border-neutral-600'
                          }`}
                        >
                          {isIncluded && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 3D DEPTH & FILTERS */}
          {activeTab === 'depth' && (
            <div className="space-y-4 pt-1">
              {/* Depth Layer Behind Subject Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#1b1b22] border border-[#FFDE00]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-[#FFDE00]" />
                    <span>3D Depth Layering (Behind Subject)</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Places the clock behind the extracted foreground subject
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.depthBehindSubject}
                  onChange={(e) => updateConfig('depthBehindSubject', e.target.checked)}
                  className="w-5 h-5 accent-[#FFDE00] rounded cursor-pointer"
                />
              </div>

              {/* Parallax Sensitivity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-300">Parallax 3D Sensitivity</span>
                  <span className="text-[#FFDE00] font-mono">{config.depthSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={config.depthSensitivity}
                  onChange={(e) => updateConfig('depthSensitivity', parseInt(e.target.value))}
                  className="w-full accent-[#FFDE00] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Subject 3D Pop Scale */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-300">Subject 3D Pop (Foreground Zoom)</span>
                  <span className="text-[#FFDE00] font-mono">{(config.depthPop || 1.05).toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="1.25"
                  step="0.02"
                  value={config.depthPop || 1.05}
                  onChange={(e) => updateConfig('depthPop', parseFloat(e.target.value))}
                  className="w-full accent-[#FFDE00] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Background Blur Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-300">Background Gaussian Bokeh</span>
                  <span className="text-[#FFDE00] font-mono">{config.blurBackground}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={config.blurBackground}
                  onChange={(e) => updateConfig('blurBackground', parseInt(e.target.value))}
                  className="w-full accent-[#FFDE00] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Color Grading & Photo Filters */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Cinematic Color Grading
                </label>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                  {filterPresets.map((fp) => {
                    const isSelected = (config.imageFilter || 'none') === fp.id;
                    return (
                      <button
                        key={fp.id}
                        onClick={() => updateConfig('imageFilter', fp.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                          isSelected
                            ? 'bg-[#FFDE00] text-black border-[#FFDE00]'
                            : 'bg-[#161619] text-neutral-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {fp.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOM PHOTO UPLOAD & SMART AI DEPTH */}
          {activeTab === 'photo' && (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c1c24] to-[#121216] border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FFDE00]/10 border border-[#FFDE00]/30 flex items-center justify-center mx-auto text-[#FFDE00]">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Upload Your Personal Photo</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Client-side neural edge depth extraction automatically separates foreground from background!
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onUploadCustomPhoto}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-[#FFDE00] hover:bg-yellow-300 active:scale-98 text-black font-extrabold text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo from Device</span>
                </button>
              </div>

              {customBgUrl && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Custom 3D Depth Photo Loaded</span>
                  </div>
                  <button
                    onClick={() => {
                      onResetConfig();
                    }}
                    className="text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 border-t border-white/10 flex items-center space-x-2">
            <button
              onClick={() => {
                sound.playPop();
                onSetWallpaper();
              }}
              className="flex-1 bg-[#FFDE00] hover:bg-yellow-300 text-black font-black text-xs py-3 px-4 rounded-2xl shadow-xl flex items-center justify-center space-x-2 cursor-pointer transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Apply As Live Wallpaper</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                onExportJson();
              }}
              className="bg-[#1c1c22] hover:bg-[#282830] text-white p-3 rounded-2xl border border-white/10 cursor-pointer transition-colors"
              title="Export JSON Configuration"
            >
              <Download className="w-4 h-4 text-neutral-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
