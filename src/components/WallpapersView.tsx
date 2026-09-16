import React, { useState } from 'react';
import { WallpaperItem } from '../types/wallpaper';
import { DepthClock } from './DepthClock';
import { Star, Heart, Flame, LayoutGrid, Check, Play, Sparkles } from 'lucide-react';

interface WallpapersViewProps {
  wallpapers: WallpaperItem[];
  selectedWallpaper: WallpaperItem;
  onSelectWallpaper: (wp: WallpaperItem) => void;
  onOpenStudio: (wp: WallpaperItem) => void;
  onSetWallpaperDirect: (wp: WallpaperItem) => void;
}

type FilterTab = 'favorites' | 'recent' | 'popular' | 'trending';

export const WallpapersView: React.FC<WallpapersViewProps> = ({
  wallpapers,
  selectedWallpaper,
  onSelectWallpaper,
  onOpenStudio,
  onSetWallpaperDirect,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('recent');

  const filteredWallpapers = wallpapers.filter((wp) => {
    if (activeFilter === 'favorites') return wp.isFavorite;
    if (activeFilter === 'recent') return wp.isRecent !== false;
    if (activeFilter === 'popular') return wp.isPopular;
    if (activeFilter === 'trending') return wp.isTrending;
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 pt-6 pb-28 max-w-md mx-auto sm:max-w-lg md:max-w-2xl">
      {/* Top App Bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Outfit']">
          Wallpapers
        </h1>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => setActiveFilter('popular')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-yellow-400 hover:bg-white/10 transition-colors"
            title="Popular & Featured"
          >
            <Star className="w-6 h-6 fill-yellow-400" />
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors"
            title="Grid View"
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Filter Tabs matching Screenshot 1 */}
      <div className="flex items-center space-x-6 rtl:space-x-reverse border-b border-white/10 pb-2 mb-5 px-1">
        {/* Heart / Favorites */}
        <button
          onClick={() => setActiveFilter('favorites')}
          className={`flex items-center justify-center py-2 transition-colors cursor-pointer ${
            activeFilter === 'favorites' ? 'text-yellow-400' : 'text-neutral-500 hover:text-white'
          }`}
          title="Favorites"
        >
          <Heart className={`w-5 h-5 ${activeFilter === 'favorites' ? 'fill-yellow-400' : ''}`} />
        </button>

        {/* Recent with Yellow Underline Indicator */}
        <button
          onClick={() => setActiveFilter('recent')}
          className={`relative pb-2 font-bold text-base tracking-wide transition-colors cursor-pointer ${
            activeFilter === 'recent' ? 'text-yellow-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Recent
          {activeFilter === 'recent' && (
            <div className="absolute bottom-[-9px] left-0 right-0 h-1 bg-[#FFDE00] rounded-full shadow-[0_0_8px_rgba(255,222,0,0.8)]" />
          )}
        </button>

        {/* Star / Popular */}
        <button
          onClick={() => setActiveFilter('popular')}
          className={`flex items-center justify-center py-2 transition-colors cursor-pointer ${
            activeFilter === 'popular' ? 'text-yellow-400' : 'text-neutral-500 hover:text-white'
          }`}
          title="Popular"
        >
          <Star className={`w-5 h-5 ${activeFilter === 'popular' ? 'fill-yellow-400' : ''}`} />
        </button>

        {/* Flame / Trending */}
        <button
          onClick={() => setActiveFilter('trending')}
          className={`flex items-center justify-center py-2 transition-colors cursor-pointer ${
            activeFilter === 'trending' ? 'text-yellow-400' : 'text-neutral-500 hover:text-white'
          }`}
          title="Trending"
        >
          <Flame className={`w-5 h-5 ${activeFilter === 'trending' ? 'fill-yellow-400' : ''}`} />
        </button>
      </div>

      {/* 2-Column Card Grid matching Screenshot 1 */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
        {filteredWallpapers.map((wp) => {
          const isSelected = selectedWallpaper.id === wp.id;
          const cfg = wp.defaultConfig;

          return (
            <div
              key={wp.id}
              onClick={() => onSelectWallpaper(wp)}
              className={`group relative aspect-[9/18.5] rounded-3xl overflow-hidden bg-neutral-900 border transition-all duration-200 cursor-pointer shadow-xl ${
                isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/40' : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Layer 1: Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${wp.bgUrl})` }}
              />

              {/* Layer 2: Depth Clock */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <DepthClock
                  fontSize={cfg.fontSize * 0.85}
                  horizontalPos={cfg.horizontalPos}
                  verticalPos={cfg.verticalPos}
                  fontStyle={cfg.fontStyle}
                  color={cfg.color}
                  opacity={cfg.opacity}
                  showDate={cfg.showDate}
                  customDateText={cfg.customDateText}
                  useLiveTime={false}
                  customTimeText={cfg.customTimeText}
                  is24Hour={true}
                  showSeconds={false}
                />
              </div>

              {/* Layer 3: Foreground Subject cutout */}
              {wp.fgUrl && (
                <div
                  className="absolute inset-0 z-20 bg-contain bg-bottom bg-no-repeat pointer-events-none"
                  style={{
                    backgroundImage: `url(${wp.fgUrl})`,
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                  }}
                />
              )}

              {/* Top Right Checkmark Badge */}
              <div className="absolute top-3 right-3 z-30">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-black shadow-md ${
                    isSelected ? 'bg-yellow-400' : 'bg-yellow-400/90'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Bottom Right Play Icon (for live video/animated wallpapers) */}
              {wp.hasVideo && (
                <div className="absolute bottom-3 right-3 z-30 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                  <Play className="w-3.5 h-3.5 fill-white" />
                </div>
              )}

              {/* Interactive Hover / Selection Overlay: "Set As Wallpaper" button like in Screenshot 1 */}
              <div
                className={`absolute inset-x-3 bottom-12 z-40 transition-all duration-200 ${
                  isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetWallpaperDirect(wp);
                  }}
                  className="w-full bg-[#FFDE00] hover:bg-yellow-300 text-black font-extrabold text-xs py-2.5 px-3 rounded-full shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Set As Wallpaper</span>
                </button>
              </div>

              {/* Open in Studio Button on hover */}
              <div className="absolute inset-x-3 bottom-3 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenStudio(wp);
                  }}
                  className="w-full bg-black/70 backdrop-blur-md hover:bg-black/90 text-white font-medium text-[11px] py-1.5 px-2 rounded-full border border-white/20 text-center cursor-pointer"
                >
                  Edit in Studio ↗
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
