import React, { useState } from 'react';
import { WallpaperItem } from '../types/wallpaper';
import { sound } from '../utils/haptics';
import { Star, ArrowRight, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    {
      id: 'nature',
      name: 'Nature & Landscapes',
      desc: 'Alpine Peaks, Wildflowers, Sunset Cabins',
      items: wallpapers.filter((w) => w.category === 'Nature'),
    },
    {
      id: 'vehicles',
      name: 'Supercars & Vehicles',
      desc: 'High-speed Superbikes, Aero concepts',
      items: wallpapers.filter((w) => w.category === 'Vehicles' || w.category === 'Cyberpunk'),
    },
    {
      id: 'aerospace',
      name: 'Aerospace & Rockets',
      desc: 'Orbital Shuttles, Deep Space Explorers',
      items: wallpapers.filter((w) => w.category === 'Aerospace'),
    },
    {
      id: 'portraits',
      name: 'Portraits & Noir Style',
      desc: 'Tailored Suits, Cinema Lighting',
      items: wallpapers.filter((w) => w.category === 'Portraits'),
    },
    {
      id: 'abstract',
      name: 'Abstract 3D Geometry',
      desc: 'Luminescent Shapes, Minimalist Solids',
      items: wallpapers.filter((w) => w.category === 'Abstract'),
    },
  ];

  const visibleCategories =
    selectedCategory === 'all'
      ? categories
      : categories.filter((c) => c.id === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 pt-6 pb-28 max-w-md mx-auto sm:max-w-lg md:max-w-2xl font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-['Outfit']">
            Collections
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400">
            Curated 3D Depth Photography Presets
          </p>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="bg-[#1c1c20] text-neutral-300 text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#FFDE00]" />
            <span>All Access</span>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 mb-5 no-scrollbar">
        <button
          onClick={() => {
            sound.playPop();
            setSelectedCategory('all');
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#FFDE00] text-black shadow-md'
              : 'bg-[#161619] text-neutral-400 hover:text-white border border-white/5'
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              sound.playPop();
              setSelectedCategory(c.id);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-[#FFDE00] text-black shadow-md'
                : 'bg-[#161619] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            {c.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Categories Horizontal Sections */}
      <div className="space-y-7">
        {visibleCategories.map((cat) => (
          <div key={cat.id} className="space-y-2.5">
            {/* Category title + Count */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white font-['Outfit']">
                  {cat.name}
                </h2>
                <p className="text-[10px] text-neutral-400 font-semibold">{cat.desc}</p>
              </div>
              <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">
                {cat.items.length} presets
              </span>
            </div>

            {/* Horizontal Carousel (Zero Lag with CSS scroll snap) */}
            <div className="flex space-x-3.5 rtl:space-x-reverse overflow-x-auto pb-3 pt-1 no-scrollbar snap-x">
              {cat.items.map((wp) => {
                const cfg = wp.defaultConfig;

                return (
                  <div
                    key={wp.id}
                    onClick={() => {
                      sound.playPop();
                      onSelectWallpaper(wp);
                    }}
                    className="relative flex-shrink-0 w-36 sm:w-44 aspect-[9/18] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-yellow-400/80 transition-all cursor-pointer shadow-xl group snap-start will-change-transform"
                  >
                    {/* Background */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105 will-change-transform"
                      style={{ backgroundImage: `url(${wp.bgUrl})` }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75 pointer-events-none" />

                    {/* Clock preview */}
                    <div
                      className="absolute inset-x-0 top-[26%] flex flex-col items-center justify-center text-center pointer-events-none drop-shadow-md"
                      style={{ opacity: (cfg.opacity || 100) / 100 }}
                    >
                      <div className="text-[8px] font-bold tracking-widest text-white/80 uppercase">
                        {cfg.customDateText || '25 NOV'}
                      </div>
                      <div
                        className="text-2xl font-black font-['Outfit'] leading-tight"
                        style={{ color: cfg.color }}
                      >
                        {cfg.customTimeText || '02:36'}
                      </div>
                    </div>

                    {/* Foreground Subject */}
                    {wp.fgUrl && (
                      <div
                        className="absolute inset-0 z-20 bg-contain bg-bottom bg-no-repeat pointer-events-none"
                        style={{
                          backgroundImage: `url(${wp.fgUrl})`,
                          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
                        }}
                      />
                    )}

                    {/* Title label */}
                    <div className="absolute inset-x-2.5 bottom-2.5 z-25">
                      <div className="text-[11px] font-black text-white truncate drop-shadow-md">
                        {wp.title}
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-x-2 bottom-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playPop();
                          onSetWallpaperDirect(wp);
                        }}
                        className="w-full bg-[#FFDE00] text-black font-extrabold text-[10px] py-1.5 rounded-full flex items-center justify-center space-x-1 shadow-md cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5 fill-black" />
                        <span>Set Wallpaper</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playPop();
                          onOpenStudio(wp);
                        }}
                        className="w-full bg-black/80 backdrop-blur-md text-white font-bold text-[9px] py-1 rounded-full border border-white/20 text-center cursor-pointer"
                      >
                        Studio ↗
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
