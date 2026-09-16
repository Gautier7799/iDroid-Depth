import React, { useState } from 'react';
import { TabType, WallpaperItem, WallpaperConfig, AppSettings } from './types/wallpaper';
import { WALLPAPERS_DATABASE } from './data/wallpapersData';
import { WallpapersView } from './components/WallpapersView';
import { CollectionView } from './components/CollectionView';
import { StudioView } from './components/StudioView';
import { SettingsView } from './components/SettingsView';
import { BottomNavBar } from './components/BottomNavBar';
import { SetWallpaperModal } from './components/SetWallpaperModal';
import { ExportJsonModal } from './components/ExportJsonModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('wallpapers');
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperItem>(WALLPAPERS_DATABASE[0]);
  const [config, setConfig] = useState<WallpaperConfig>(WALLPAPERS_DATABASE[0].defaultConfig);

  // Custom user photo uploads
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [customFgUrl, setCustomFgUrl] = useState<string | null>(null);

  // Modals
  const [isSetWallpaperModalOpen, setIsSetWallpaperModalOpen] = useState<boolean>(false);
  const [isExportJsonModalOpen, setIsExportJsonModalOpen] = useState<boolean>(false);
  const [isAndroidCodeModalOpen, setIsAndroidCodeModalOpen] = useState<boolean>(false);

  // Global settings
  const [appSettings, setAppSettings] = useState<AppSettings>({
    autoChangeWallpaper: false,
    autoChangeInterval: '24h',
    parallaxEnabled: true,
    batterySaver: false,
    targetFps: 60,
    hapticFeedback: true,
    language: 'ar',
  });

  // Switch to a new wallpaper preset
  const handleSelectWallpaper = (wp: WallpaperItem) => {
    setSelectedWallpaper(wp);
    setConfig(wp.defaultConfig);
    setCustomBgUrl(null);
    setCustomFgUrl(null);
  };

  const handleOpenStudio = (wp: WallpaperItem) => {
    handleSelectWallpaper(wp);
    setActiveTab('studio');
  };

  const handleSetWallpaperDirect = (wp: WallpaperItem) => {
    setSelectedWallpaper(wp);
    setConfig(wp.defaultConfig);
    setIsSetWallpaperModalOpen(true);
  };

  const handleResetConfig = () => {
    setConfig(selectedWallpaper.defaultConfig);
  };

  // Upload custom photo with automatic depth separation
  const handleUploadCustomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Create an offscreen canvas to generate a soft-edge foreground mask
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Crop lower 60% with gentle vertical gradient mask
        const fgCanvas = document.createElement('canvas');
        const fgCtx = fgCanvas.getContext('2d');
        if (fgCtx) {
          fgCanvas.width = img.width;
          fgCanvas.height = img.height;
          fgCtx.drawImage(img, 0, 0);

          fgCtx.globalCompositeOperation = 'destination-in';
          const gradient = fgCtx.createLinearGradient(0, img.height * 0.35, 0, img.height * 0.65);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
          fgCtx.fillStyle = gradient;
          fgCtx.fillRect(0, 0, img.width, img.height);

          setCustomFgUrl(fgCanvas.toDataURL('image/png'));
        }

        setCustomBgUrl(imgUrl);
        setActiveTab('studio');
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#FFDE00] selection:text-black font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Screen Views based on activeTab */}
      {activeTab === 'wallpapers' && (
        <WallpapersView
          wallpapers={WALLPAPERS_DATABASE}
          selectedWallpaper={selectedWallpaper}
          onSelectWallpaper={handleSelectWallpaper}
          onOpenStudio={handleOpenStudio}
          onSetWallpaperDirect={handleSetWallpaperDirect}
        />
      )}

      {activeTab === 'collection' && (
        <CollectionView
          wallpapers={WALLPAPERS_DATABASE}
          onSelectWallpaper={handleSelectWallpaper}
          onOpenStudio={handleOpenStudio}
          onSetWallpaperDirect={handleSetWallpaperDirect}
        />
      )}

      {activeTab === 'studio' && (
        <StudioView
          wallpaper={selectedWallpaper}
          config={config}
          onChangeConfig={setConfig}
          onResetConfig={handleResetConfig}
          onSetWallpaper={() => setIsSetWallpaperModalOpen(true)}
          onExportJson={() => setIsExportJsonModalOpen(true)}
          onUploadCustomPhoto={handleUploadCustomPhoto}
          customBgUrl={customBgUrl}
          customFgUrl={customFgUrl}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsView
          appSettings={appSettings}
          onUpdateAppSettings={setAppSettings}
          onOpenAndroidCode={() => setIsAndroidCodeModalOpen(true)}
          onShareApp={() => {}}
        />
      )}

      {/* Floating Bottom Navigation Bar matching the exact screenshots */}
      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Modals */}
      <SetWallpaperModal
        isOpen={isSetWallpaperModalOpen}
        onClose={() => setIsSetWallpaperModalOpen(false)}
        wallpaper={selectedWallpaper}
      />

      <ExportJsonModal
        isOpen={isExportJsonModalOpen}
        onClose={() => setIsExportJsonModalOpen(false)}
        wallpaper={selectedWallpaper}
        config={config}
      />

      <AndroidCodeModal
        isOpen={isAndroidCodeModalOpen}
        onClose={() => setIsAndroidCodeModalOpen(false)}
      />
    </main>
  );
}
