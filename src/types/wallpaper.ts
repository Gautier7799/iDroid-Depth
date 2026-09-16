export type TabType = 'wallpapers' | 'collection' | 'studio' | 'settings';

export type ClockFontStyle = 'capsule' | 'outline' | 'condensed' | 'stencil' | 'serif' | 'neon';

export interface WallpaperItem {
  id: string;
  title: string;
  category: 'Abstract' | 'Aerospace' | 'Nature' | 'Vehicles' | 'Portraits' | 'Cyberpunk';
  bgUrl: string;
  fgUrl: string;
  previewUrl: string;
  hasVideo?: boolean;
  isFavorite?: boolean;
  isPopular?: boolean;
  isTrending?: boolean;
  isRecent?: boolean;
  defaultConfig: WallpaperConfig;
}

export interface WallpaperConfig {
  fontSize: number; // percentage, e.g. 27.1
  horizontalPos: number; // percentage, e.g. 50
  verticalPos: number; // percentage, e.g. 32
  fontStyle: ClockFontStyle;
  color: string;
  opacity: number;
  depthBehindSubject: boolean;
  depthSensitivity: number;
  showDate: boolean;
  customDateText: string;
  useLiveTime: boolean;
  customTimeText: string;
  is24Hour: boolean;
  showSeconds: boolean;
  blurBackground: number;
}

export interface AppSettings {
  autoChangeWallpaper: boolean;
  autoChangeInterval: '1h' | '6h' | '24h' | 'lock';
  parallaxEnabled: boolean;
  batterySaver: boolean;
  targetFps: 60 | 120;
  hapticFeedback: boolean;
  language: 'ar' | 'en';
}
