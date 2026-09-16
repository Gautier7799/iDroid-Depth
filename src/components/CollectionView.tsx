import React from 'react';
import { WallpaperItem } from '../types/wallpaper';
import { DepthClock } from './DepthClock';
import { Star, ArrowRight, Sparkles } from 'lucide-react';

interface CollectionViewProps {
  wallpapers: WallpaperItem[];
  onSelectWallpaper: (wp: WallpaperItem) => void;
  onOpenStudio: (wp: WallpaperItem) => void;
  onSetWallpaperDirect: (wp: WallpaperItem) => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  wallpapers,
  onSelectWallpaper,
  onOpenStudio,
  onSetWallpaperDirect,
}) => {
  const categories: { id: string; name: string; items: WallpaperItem[] }[] = [
    {
      id: 'abstract',
      name: 'Abstract',
      items: wallpapers.filter((w) => w.category === 'Abstract'),
    },
    {
      id: 'aerospace',
      name: 'Aerospace',
      items: wallpapers.filter((w) => w.category === 'Aerospace'),
    },
    {
      id: 'nature',
      name: 'Nature & Landscape',
      items: wallpapers.filter((w) => w.category === 'Nature'),
    },
    {
      id: 'vehicles',
      name: 'Vehicles & Speed',
      items: wallpapers.filter((w) => w.category === 'Vehicles' || w.category === 'Cyberpunk'),
    },
    {
      id: 'portraits',
      name: 'Portraits & Noir',
      items: wallpapers.filter((w) => w.category === 'Portraits'),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 pt-6 pb-28 max-w-md mx-auto sm:max-w-lg md:max-w-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Outfit']">
          Collection
        </h1>

        {/* Badges top right matching Screenshot 2 */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="bg-[#1c1c1f] text-neutral-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-700/60 flex items-center space-x-1">
            <span>All access</span>
          </div>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-yellow-400">
            <Star className="w-5 h-5 fill-yellow-400" />
          </button>
        </div>
      </div>

      {/* Categories Horizontal Sections */}
      <div className="space-y-7">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-3">
            {/* Category title + View All link */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-white font-['Outfit']">
                {cat.name}
              </h2>
              <button
                onClick={() => {
                  if (cat.items.length > 0) onSelectWallpaper(cat.items[0]);
                }}
                className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center space-x-1 group cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div className="flex space-x-3.5 rtl:space-x-reverse overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
              {cat.items.map((wp) => {
                const cfg = wp.defaultConfig;
                return (
                  <div
                    key={wp.id}
                    onClick={() => onSelectWallpaper(wp)}
                    className="relative flex-shrink-0 w-36 sm:w-40 aspect-[9/18.5] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-yellow-400/80 transition-all cursor-pointer shadow-lg group snap-start"
                  >
                    {/* Background */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${wp.bgUrl})` }}
                    />

                    {/* Depth Clock */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                      <DepthClock
                        fontSize={cfg.fontSize * 0.75}
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

                    {/* Foreground subject layer */}
                    {wp.fgUrl && (
                      <div
                        className="absolute inset-0 z-20 bg-contain bg-bottom bg-no-repeat pointer-events-none"
                        style={{
                          backgroundImage: `url(${wp.fgUrl})`,
                          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
                        }}
                      />
                    )}

                    {/* Title label at bottom */}
                    <div className="absolute inset-x-0 bottom-0 z-30 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                      <p className="text-[11px] font-semibold text-white truncate text-center">
                        {wp.title}
                      </p>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute inset-0 z-40 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenStudio(wp);
                        }}
                        className="w-full py-1.5 bg-[#FFDE00] text-black text-[10px] font-extrabold rounded-full flex items-center justify-center space-x-1 cursor-pointer hover:bg-yellow-300"
                      >
                        <Sparkles className="w-3 h-3 fill-black" />
                        <span>Customize</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetWallpaperDirect(wp);
                        }}
                        className="w-full py-1 bg-white/20 text-white text-[10px] font-medium rounded-full hover:bg-white/30 cursor-pointer"
                      >
                        Quick Apply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
