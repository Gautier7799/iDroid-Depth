import React, { useState } from 'react';
import { WallpaperItem } from '../types/wallpaper';
import { X, Lock, Home, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';

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
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setSuccessOption(type);
      setTimeout(() => {
        setSuccessOption(null);
        onClose();
      }, 1500);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#18181b] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 text-white text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Thumbnail preview */}
        <div className="w-20 h-28 mx-auto rounded-xl overflow-hidden border border-white/20 shadow-md mb-3 bg-neutral-900 relative">
          <img
            src={wallpaper.previewUrl}
            alt={wallpaper.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
            <span className="text-[9px] font-bold text-yellow-300 font-mono">02:36</span>
          </div>
        </div>

        <h3 className="font-extrabold text-base font-['Outfit'] mb-1">
          Set as Wallpaper
        </h3>
        <p className="text-xs text-neutral-400 mb-5">
          {wallpaper.title} (3D Live Depth Effect)
        </p>

        {successOption ? (
          <div className="py-4 text-center space-y-2 animate-scale-up">
            <CheckCircle2 className="w-10 h-10 text-yellow-400 mx-auto" />
            <p className="text-sm font-bold text-yellow-400">
              تم تعيين الخلفية بنجاح على {successOption}!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              disabled={isApplying}
              onClick={() => handleApply('شاشة القفل (Lock Screen)')}
              className="w-full py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 font-bold text-xs flex items-center justify-center space-x-2.5 rtl:space-x-reverse transition-transform active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-yellow-400" />
              <span>Set on Lock Screen</span>
            </button>

            <button
              disabled={isApplying}
              onClick={() => handleApply('الشاشة الرئيسية (Home Screen)')}
              className="w-full py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 font-bold text-xs flex items-center justify-center space-x-2.5 rtl:space-x-reverse transition-transform active:scale-95 cursor-pointer"
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
          </div>
        )}
      </div>
    </div>
  );
};
