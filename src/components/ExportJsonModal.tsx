import React, { useState } from 'react';
import { WallpaperConfig, WallpaperItem } from '../types/wallpaper';
import { X, Copy, Check, Download, FileJson } from 'lucide-react';

interface ExportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaper: WallpaperItem;
  config: WallpaperConfig;
}

export const ExportJsonModal: React.FC<ExportJsonModalProps> = ({
  isOpen,
  onClose,
  wallpaper,
  config,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exportPayload = {
    appName: "Depth Wallpapers Live Clock",
    version: "2.4.0",
    wallpaperId: wallpaper.id,
    wallpaperTitle: wallpaper.title,
    category: wallpaper.category,
    backgroundUrl: wallpaper.bgUrl,
    foregroundUrl: wallpaper.fgUrl,
    depthEngineSettings: {
      depthStrength: config.depthBehindSubject ? config.depthSensitivity : 0,
      depthSensitivity: config.depthSensitivity,
      depthBehindSubject: config.depthBehindSubject,
      blurBackground: config.blurBackground,
    },
    clockTypography: {
      fontSizePercent: config.fontSize,
      horizontalPosPercent: config.horizontalPos,
      verticalPosPercent: config.verticalPos,
      fontStyle: config.fontStyle,
      colorHex: config.color,
      opacityPercent: config.opacity,
    },
    timeAndDate: {
      showDate: config.showDate,
      customDateText: config.customDateText,
      useLiveTime: config.useLiveTime,
      customTimeText: config.customTimeText,
      is24Hour: config.is24Hour,
      showSeconds: config.showSeconds,
    },
    exportedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wallpaper.id}-depth-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161619] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">تصدير إعدادات الخلفية (JSON)</h3>
              <p className="text-[11px] text-neutral-400">جاهز للاستيراد المباشر داخل تطبيق أندرويد</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-yellow-300/90 bg-[#0d0d0f]">
          <pre className="whitespace-pre-wrap break-all">{jsonString}</pre>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10 flex items-center justify-end space-x-2.5 rtl:space-x-reverse bg-[#141416]">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-[#FFDE00] hover:bg-yellow-300 text-black font-extrabold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل الملف (.json)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
