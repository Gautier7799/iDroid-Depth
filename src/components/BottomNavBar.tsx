import React from 'react';
import { TabType } from '../types/wallpaper';
import { sound } from '../utils/haptics';
import { LayoutGrid, Image as ImageIcon, SlidersHorizontal, Sliders } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'wallpapers',
      label: 'Wallpapers',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: 'collection',
      label: 'Collection',
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      id: 'studio',
      label: 'Studio',
      icon: <SlidersHorizontal className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Sliders className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-2 bg-[#121215]/90 backdrop-blur-2xl px-3 py-2 rounded-full border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playPop();
                onSelectTab(item.id);
              }}
              className={`relative flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? 'w-12 h-12 bg-[#FFDE00] text-black shadow-[0_0_20px_rgba(255,222,0,0.4)] scale-105'
                  : 'w-11 h-11 text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};

