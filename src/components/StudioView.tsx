import React, { useState, useRef } from 'react';
import { WallpaperItem, WallpaperConfig, ClockFontStyle } from '../types/wallpaper';
import { PhoneMockup } from './PhoneMockup';
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

type StudioTab = 'basics' | 'typography' | 'effects' | 'transform';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateConfig = (key: keyof WallpaperConfig, value: any) => {
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  const fontOptions: { id: ClockFontStyle; label: string; preview: string }[] = [
    { id: 'capsule', label: 'Tall Capsule', preview: '02:36' },
    { id: 'outline', label: 'Outline iOS', preview: '02:36' },
    { id: 'condensed', label: 'Condensed Bold', preview: '02:36' },
    { id: 'stencil', label: 'Cyber Stencil', preview: '02:36' },
    { id: 'neon', label: 'Neon Bloom', preview: '02:36' },
    { id: 'serif', label: 'Classic Serif', preview: '02:36' },
  ];

  const colorPresets = [
    '#FFFFFF',
    '#FFDE00',
    '#EF4444',
    '#38BDF8',
    '#10B981',
    '#F472B6',
    '#A78BFA',
    '#9A6B46',
    '#FB923C',
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 pt-6 pb-28 max-w-md mx-auto sm:max-w-lg md:max-w-xl">
      {/* Top Studio Bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Outfit']">
          Studio
        </h1>
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <button
            onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
            className="w-10 h-10 rounded-full bg-[#1c1c1f] hover:bg-[#28282c] flex items-center justify-center text-yellow-400 border border-white/5 transition-colors cursor-pointer"
            title="Toggle View Mode"
          >
            {isFullscreenPreview ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onResetConfig}
            className="w-10 h-10 rounded-full bg-[#1c1c1f] hover:bg-[#28282c] flex items-center justify-center text-yellow-400 border border-white/5 transition-colors cursor-pointer"
            title="Reset to Default"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Phone Simulator Container */}
      <div className="flex justify-center my-3 transition-all duration-300">
        <PhoneMockup
          wallpaper={wallpaper}
          config={config}
          customBgUrl={customBgUrl}
          customFgUrl={customFgUrl}
          scale={isFullscreenPreview ? 1.08 : 0.88}
          showDismissNotice={!isFullscreenPreview}
        />
      </div>

      {/* Studio Customizer Controls Sheet matching Screenshot 3 */}
      {!isFullscreenPreview && (
        <div className="mt-4 bg-[#111113] rounded-3xl p-4 border border-white/10 shadow-2xl space-y-4">
          {/* Studio Tabs Header */}
          <div className="flex items-center justify-around border-b border-white/10 pb-2">
            {(['basics', 'typography', 'effects', 'transform'] as StudioTab[]).map((tab) => {
              const isActive = activeTab === tab;
              const labels: Record<StudioTab, string> = {
                basics: 'Basics',
                typography: 'Typography',
                effects: 'Effects',
                transform: 'Transform',
              };

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-2 font-bold text-sm tracking-wide capitalize transition-colors cursor-pointer ${
                    isActive ? 'text-[#FFDE00]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {labels[tab]}
                  {isActive && (
                    <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#FFDE00] shadow-[0_0_8px_rgba(255,222,0,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Basics (Font Size, Horizontal Pos, Vertical Pos) matching Screenshot 3 */}
          {activeTab === 'basics' && (
            <div className="space-y-4 pt-1">
              {/* Font Size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>Font Size</span>
                  <div className="flex items-center space-x-1.5 text-neutral-400">
                    <span className="text-[#FFDE00] font-mono font-bold">
                      {config.fontSize.toFixed(1)}%
                    </span>
                    <button
                      onClick={() => updateConfig('fontSize', wallpaper.defaultConfig.fontSize)}
                      className="hover:text-white cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="14"
                  max="45"
                  step="0.5"
                  value={config.fontSize}
                  onChange={(e) => updateConfig('fontSize', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FFDE00]"
                />
              </div>

              {/* Horizontal Position */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>Horizontal Position</span>
                  <div className="flex items-center space-x-1.5 text-neutral-400">
                    <span className="text-[#FFDE00] font-mono font-bold">
                      {Math.round(config.horizontalPos)}%
                    </span>
                    <button
                      onClick={() => updateConfig('horizontalPos', 50)}
                      className="hover:text-white cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="1"
                  value={config.horizontalPos}
                  onChange={(e) => updateConfig('horizontalPos', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FFDE00]"
                />
              </div>

              {/* Vertical Position */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>Vertical Position</span>
                  <div className="flex items-center space-x-1.5 text-neutral-400">
                    <span className="text-[#FFDE00] font-mono font-bold">
                      {Math.round(config.verticalPos)}%
                    </span>
                    <button
                      onClick={() => updateConfig('verticalPos', wallpaper.defaultConfig.verticalPos)}
                      className="hover:text-white cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="15"
                  max="70"
                  step="1"
                  value={config.verticalPos}
                  onChange={(e) => updateConfig('verticalPos', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FFDE00]"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Typography (Font Style, Color, Opacity) */}
          {activeTab === 'typography' && (
            <div className="space-y-4 pt-1">
              {/* Font Style Selection */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-300">Clock Font Style</span>
                <div className="grid grid-cols-3 gap-2">
                  {fontOptions.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => updateConfig('fontStyle', f.id)}
                      className={`p-2 rounded-xl text-center border text-xs font-medium transition-all cursor-pointer ${
                        config.fontStyle === f.id
                          ? 'border-[#FFDE00] bg-yellow-400/10 text-yellow-400 font-bold'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-bold">{f.preview}</div>
                      <div className="text-[10px] mt-0.5 truncate">{f.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>Digit Color</span>
                  <span className="text-[11px] font-mono text-neutral-400">{config.color}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto pb-1">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateConfig('color', c)}
                      className={`w-7 h-7 rounded-full flex-shrink-0 transition-transform cursor-pointer border ${
                        config.color === c ? 'ring-2 ring-white scale-110' : 'border-neutral-700 opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  {/* Custom Hex Color input */}
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) => updateConfig('color', e.target.value)}
                    className="w-7 h-7 rounded-full overflow-hidden border border-neutral-700 cursor-pointer bg-transparent"
                    title="Custom Color"
                  />
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>Clock Opacity</span>
                  <span className="text-[#FFDE00] font-mono font-bold">{config.opacity}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={config.opacity}
                  onChange={(e) => updateConfig('opacity', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FFDE00]"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Effects (Depth Behind Subject, Parallax Sensitivity, Blur) */}
          {activeTab === 'effects' && (
            <div className="space-y-4 pt-1">
              {/* Depth Layer Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                  <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">3D Depth (Behind Subject)</div>
                    <div className="text-[10px] text-neutral-400">Layer clock behind foreground objects</div>
                  </div>
                </div>
                <button
                  onClick={() => updateConfig('depthBehindSubject', !config.depthBehindSubject)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    config.depthBehindSubject ? 'bg-[#FFDE00]' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      config.depthBehindSubject ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 3D Parallax Tilt Sensitivity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>3D Parallax Tilt Sensitivity</span>
                  <span className="text-[#FFDE00] font-mono font-bold">{config.depthSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={config.depthSensitivity}
                  onChange={(e) => updateConfig('depthSensitivity', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FFDE00]"
                />
              </div>

              {/* Background Scenery Blur */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>Background Blur</span>
                  <span className="text-[#FFDE00] font-mono font-bold">{config.blurBackground}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={config.blurBackground}
                  onChange={(e) => updateConfig('blurBackground', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FFDE00]"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Transform (Real-time vs Mockup, Date text, 24h format) */}
          {activeTab === 'transform' && (
            <div className="space-y-3.5 pt-1">
              {/* Live Real-time Clock Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                  <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Live Real-time Clock</div>
                    <div className="text-[10px] text-neutral-400">Sync with current system time</div>
                  </div>
                </div>
                <button
                  onClick={() => updateConfig('useLiveTime', !config.useLiveTime)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    config.useLiveTime ? 'bg-[#FFDE00]' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      config.useLiveTime ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Show Date Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <div className="text-xs font-bold text-white">Show Date Header</div>
                <button
                  onClick={() => updateConfig('showDate', !config.showDate)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    config.showDate ? 'bg-[#FFDE00]' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      config.showDate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 24-Hour Format */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <div className="text-xs font-bold text-white">24-Hour Military Format</div>
                <button
                  onClick={() => updateConfig('is24Hour', !config.is24Hour)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    config.is24Hour ? 'bg-[#FFDE00]' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      config.is24Hour ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions Row */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            {/* Set As Wallpaper Main Button */}
            <button
              onClick={onSetWallpaper}
              className="flex-1 bg-[#FFDE00] hover:bg-yellow-300 text-black font-extrabold text-sm py-3 px-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Set As Wallpaper</span>
            </button>

            {/* Export JSON configuration */}
            <button
              onClick={onExportJson}
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs py-3 px-3.5 rounded-2xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-neutral-700"
              title="Export Settings as JSON"
            >
              <Download className="w-4 h-4 text-yellow-400" />
              <span>Export JSON</span>
            </button>

            {/* Upload Custom Image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs py-3 px-3.5 rounded-2xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-neutral-700"
              title="Upload Photo"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Upload</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onUploadCustomPhoto}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};
