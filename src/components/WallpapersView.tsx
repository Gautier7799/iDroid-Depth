import React, { useState, useEffect, useMemo, memo } from 'react';
import { WallpaperItem } from '../types/wallpaper';
import { sound } from '../utils/haptics';
import {
  Star,
  Heart,
  Flame,
  Search,
  Sparkles,
  Sliders,
  Check,
  Play,
  Share2,
  X,
} from 'lucide-react';

interface WallpapersViewProps {
  wallpapers: WallpaperItem[];
  selectedWallpaper: WallpaperItem;
  onSelectWallpaper: (wp: WallpaperItem) => void;
  onOpenStudio: (wp: WallpaperItem) => void;
  onSetWallpaperDirect: (wp: WallpaperItem) => void;
}

type FilterTab = 'all' | 'favorites' | 'recent' | 'popular' | 'trending';

export const WallpapersView: React.FC<WallpapersViewProps> = ({
  wallpapers,
  selectedWallpaper,
  onSelectWallpaper,
  onOpenStudio,
  onSetWallpaperDirect,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('depth_favorites');
      return saved ? JSON.parse(saved) : ['showroom-motorcycle'];
    } catch {
      return ['showroom-motorcycle'];
    }
  });

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sound.playPop();
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('depth_favorites', JSON.stringify(next));
      return next;
    });
  };

  const filteredWallpapers = useMemo(() => {
    return wallpapers.filter((wp) => {
      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          wp.title.toLowerCase().includes(q) ||
          wp.category.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Filter tabs
      if (activeFilter === 'favorites') return favoriteIds.includes(wp.id);
      if (activeFilter === 'popular') return wp.isPopular;
      if (activeFilter === 'trending') return wp.isTrending;
      if (activeFilter === 'recent') return wp.isRecent !== false;
      return true;
    });
  }, [wallpapers, activeFilter, searchQuery, favoriteIds]);

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 pt-6 pb-28 max-w-md mx-auto sm:max-w-lg md:max-w-2xl font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top App Bar matching global flagship style */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-['Outfit']">
            Wallpapers
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400">
            Apple iOS 17 & Material You 3D Depth Engine
          </p>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="bg-[#18181c] text-[#FFDE00] border border-[#FFDE00]/30 text-xs font-black px-2.5 py-1 rounded-full flex items-center space-x-1">
            <Sparkles className="w-3 h-3 fill-[#FFDE00]" />
            <span>VIP 4K</span>
          </div>
        </div>
      </div>

      {/* Live Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="ابحث عن خلفيات أو سيارات أو طبيعة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#141417] border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FFDE00] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs matching Screenshot 1 */}
      <div className="flex items-center space-x-6 rtl:space-x-reverse border-b border-white/10 pb-2 mb-4 px-1">
        {/* Heart / Favorites */}
        <button
          onClick={() => {
            sound.playPop();
            setActiveFilter('favorites');
          }}
          className={`relative flex items-center justify-center py-2 transition-colors cursor-pointer ${
            activeFilter === 'favorites' ? 'text-yellow-400' : 'text-neutral-500 hover:text-white'
          }`}
          title="Favorites"
        >
          <Heart
            className={`w-5 h-5 ${activeFilter === 'favorites' ? 'fill-yellow-400 text-yellow-400' : ''}`}
          />
          {favoriteIds.length > 0 && (
            <span className="absolute -top-1 -right-2 text-[9px] font-black bg-[#FFDE00] text-black w-4 h-4 rounded-full flex items-center justify-center">
              {favoriteIds.length}
            </span>
          )}
        </button>

        {/* Recent with Yellow Underline Indicator */}
        <button
          onClick={() => {
            sound.playPop();
            setActiveFilter('recent');
          }}
          className={`relative pb-2 font-bold text-sm tracking-wide transition-colors cursor-pointer ${
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
          onClick={() => {
            sound.playPop();
            setActiveFilter('popular');
          }}
          className={`flex items-center justify-center py-2 transition-colors cursor-pointer ${
            activeFilter === 'popular' ? 'text-yellow-400' : 'text-neutral-500 hover:text-white'
          }`}
          title="Popular"
        >
          <Star className={`w-5 h-5 ${activeFilter === 'popular' ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>

        {/* Flame / Trending */}
        <button
          onClick={() => {
            sound.playPop();
            setActiveFilter('trending');
          }}
          className={`flex items-center justify-center py-2 transition-colors cursor-pointer ${
            activeFilter === 'trending' ? 'text-yellow-400' : 'text-neutral-500 hover:text-white'
          }`}
          title="Trending"
        >
          <Flame className={`w-5 h-5 ${activeFilter === 'trending' ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>
      </div>

      {/* Wallpapers Grid - 2 Column Performance Optimized */}
      {filteredWallpapers.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 text-xs">
          لا توجد خلفيات تطابق بحثك حالياً
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {filteredWallpapers.map((wp) => {
            const isSelected = selectedWallpaper.id === wp.id;
            const isFav = favoriteIds.includes(wp.id);
            const cfg = wp.defaultConfig;

            return (
              <div
                key={wp.id}
                onClick={() => {
                  sound.playPop();
                  onSelectWallpaper(wp);
                }}
                className={`group relative aspect-[9/18.5] rounded-3xl overflow-hidden bg-neutral-900 border transition-all duration-200 cursor-pointer shadow-xl will-change-transform ${
                  isSelected
                    ? 'border-yellow-400 ring-2 ring-yellow-400/40'
                    : 'border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                {/* Background Image with optimized loading */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105 will-change-transform"
                  style={{ backgroundImage: `url(${wp.bgUrl})` }}
                  loading="lazy"
                />

                {/* Ambient Top & Bottom Shadow Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/70 pointer-events-none" />

                {/* Clock Preview Overlay (Lightweight & Zero-Lag) */}
                <div
                  className="absolute inset-x-0 top-[28%] flex flex-col items-center justify-center text-center pointer-events-none drop-shadow-lg select-none"
                  style={{ opacity: (cfg.opacity || 100) / 100 }}
                >
                  <div
                    className="text-[9px] font-bold tracking-widest uppercase mb-0.5 text-white/80"
                    style={{ color: cfg.color }}
                  >
                    {cfg.customDateText || '25 NOV 2028'}
                  </div>
                  <div
                    className="text-3xl font-extrabold leading-none tracking-tight font-['Outfit']"
                    style={{
                      color: cfg.color,
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    }}
                  >
                    {cfg.customTimeText || '02:36'}
                  </div>
                </div>

                {/* Foreground Cutout Layer */}
                {wp.fgUrl && (
                  <div
                    className="absolute inset-0 z-20 bg-contain bg-bottom bg-no-repeat pointer-events-none"
                    style={{
                      backgroundImage: `url(${wp.fgUrl})`,
                      filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))',
                    }}
                  />
                )}

                {/* Top Left Category Pill */}
                <div className="absolute top-3 left-3 z-30">
                  <span className="text-[9px] font-bold bg-black/60 backdrop-blur-md text-white/80 px-2 py-0.5 rounded-full border border-white/10">
                    {wp.category}
                  </span>
                </div>

                {/* Top Right Heart Favorite Toggle */}
                <button
                  onClick={(e) => toggleFavorite(e, wp.id)}
                  className={`absolute top-3 right-3 z-30 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform active:scale-90 cursor-pointer ${
                    isFav
                      ? 'bg-[#FFDE00] text-black border-[#FFDE00]'
                      : 'bg-black/50 text-white border-white/10 hover:bg-black/80'
                  }`}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-black' : ''}`} />
                </button>

                {/* Live Wallpaper badge if hasVideo */}
                {wp.hasVideo && (
                  <div className="absolute bottom-3 right-3 z-30 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                    <Play className="w-3 h-3 fill-white" />
                  </div>
                )}

                {/* Bottom Card Label */}
                <div className="absolute inset-x-3 bottom-3 z-25 pointer-events-none">
                  <div className="text-xs font-black text-white drop-shadow-md truncate">
                    {wp.title}
                  </div>
                </div>

                {/* Interactive Action Buttons on Selection / Hover */}
                <div
                  className={`absolute inset-x-2.5 bottom-2.5 z-40 transition-all duration-200 flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playPop();
                      onSetWallpaperDirect(wp);
                    }}
                    className="w-full bg-[#FFDE00] hover:bg-yellow-300 active:scale-95 text-black font-extrabold text-[11px] py-2 px-2.5 rounded-full shadow-lg flex items-center justify-center space-x-1 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3 h-3 fill-black" />
                    <span>Set As Wallpaper</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playPop();
                      onOpenStudio(wp);
                    }}
                    className="w-full bg-black/80 hover:bg-black active:scale-95 backdrop-blur-md text-white font-bold text-[10px] py-1.5 px-2 rounded-full border border-white/20 text-center cursor-pointer transition-all flex items-center justify-center space-x-1"
                  >
                    <Sliders className="w-3 h-3 text-[#FFDE00]" />
                    <span>Customize in Studio</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
