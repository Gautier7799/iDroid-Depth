export type TabType = 'wallpapers' | 'collection' | 'studio' | 'settings';

export type ClockFontStyle =
  | 'capsule'
  | 'outline'
  | 'condensed'
  | 'stencil'
  | 'serif'
  | 'neon'
  | 'digital'
  | 'thin';

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
  isClockVisible?: boolean;
  blurBackground: number;

  // Professional customization upgrades
  gradientEnabled?: boolean;
  gradientColor2?: string;
  glowEnabled?: boolean;
  glowIntensity?: number; // 0 to 100
  letterSpacing?: number; // -5 to 20
  shadowBlur?: number; // 0 to 30
  imageFilter?: 'none' | 'cinematic' | 'bw' | 'cyberpunk' | 'warm' | 'amoled' | 'vintage';
  topWidget?: 'date' | 'weather' | 'battery' | 'steps' | 'event' | 'none';
  bottomWidgets?: ('battery' | 'weather' | 'activity' | 'calendar')[];
  depthPop?: number; // 1.0 to 1.3
  depthCutoutThreshold?: number; // 0 to 100
}

export interface AppSettings {
  autoChangeWallpaper: boolean;
  autoChangeInterval: '1h' | '6h' | '24h' | 'lock';
  parallaxEnabled: boolean;
  batterySaver: boolean;
  targetFps: 60 | 120;
  hapticFeedback: boolean;
  language: 'ar' | 'en';
  soundEffects?: boolean;
}

