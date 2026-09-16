import React, { useState } from 'react';
import { WallpaperItem } from '../types/wallpaper';
import { sound } from '../utils/haptics';
import { X, Lock, Home, Smartphone, CheckCircle2, Sparkles, Download } from 'lucide-react';

interface SetWallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaper: WallpaperItem;
}

export const SetWallpaperModal: React.FC<SetWallpaperModalProps> = ({
  isOpen,
  onClose,
  wallpaper,
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [successOption, setSuccessOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = (type: string) => {
    sound.playPop();
    setIsApplying(true);
    setTimeout(() => {
      sound.playUnlock();
      setIsApplying(false);
      setSuccessOption(type);
      setTimeout(() => {
        setSuccessOption(null);
        onClose();
      }, 1400);
    }, 600);
  };

  const handleDownloadAssets = () => {
    sound.playPop();
    // Download config JSON
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(wallpaper.defaultConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${wallpaper.id}-depth-config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // Trigger image download in new tab
    window.open(wallpaper.bgUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-[#161619] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 text-white text-center relative">
        <button
          onClick={() => {
            sound.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Thumbnail preview */}
        <div className="w-20 h-32 mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-xl mb-3 bg-neutral-900 relative">
          <img
            src={wallpaper.previewUrl}
            alt={wallpaper.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex items-center justify-center">
            <span
              className="text-[11px] font-black font-['Outfit']"
              style={{ color: wallpaper.defaultConfig.color }}
            >
              {wallpaper.defaultConfig.customTimeText || '02:36'}
            </span>
          </div>
        </div>

        <h3 className="font-black text-lg font-['Outfit'] mb-0.5 text-white">
          Apply 3D Depth Wallpaper
        </h3>
        <p className="text-xs text-neutral-400 mb-4">
          {wallpaper.title} • OpenGL Live Wallpaper
        </p>

        {successOption ? (
          <div className="py-4 text-center space-y-2 animate-scale-up">
            <CheckCircle2 className="w-12 h-12 text-[#FFDE00] mx-auto animate-bounce" />
            <p className="text-sm font-bold text-[#FFDE00]">
              تم تعيين الخلفية بنجاح على {successOption}!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              disabled={isApplying}
              onClick={() => handleApply('شاشة القفل (Lock Screen)')}
              className="w-full py-3 px-4 rounded-2xl bg-[#1f1f24] hover:bg-[#282830] font-bold text-xs flex items-center justify-center space-x-2.5 rtl:space-x-reverse transition-transform active:scale-95 cursor-pointer border border-white/5"
            >
              <Lock className="w-4 h-4 text-yellow-400" />
              <span>Set on Lock Screen</span>
            </button>

            <button
              disabled={isApplying}
              onClick={() => handleApply('الشاشة الرئيسية (Home Screen)')}
              className="w-full py-3 px-4 rounded-2xl bg-[#1f1f24] hover:bg-[#282830] font-bold text-xs flex items-center justify-center space-x-2.5 rtl:space-x-reverse transition-transform active:scale-95 cursor-pointer border border-white/5"
            >
              <Home className="w-4 h-4 text-sky-400" />
              <span>Set on Home Screen</span>
            </button>

            <button
              disabled={isApplying}
              onClick={() => handleApply('كلا الشاشتين (Both)')}
              className="w-full py-3 px-4 rounded-2xl bg-[#FFDE00] hover:bg-yellow-300 text-black font-extrabold text-xs flex items-center justify-center space-x-2.5 rtl:space-x-reverse transition-transform active:scale-95 cursor-pointer shadow-lg"
            >
              <Smartphone className="w-4 h-4 fill-black" />
              <span>Set on Both Screens</span>
            </button>

            <button
              onClick={handleDownloadAssets}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold text-[11px] flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-white/5"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Download 4K Assets & Config JSON</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
