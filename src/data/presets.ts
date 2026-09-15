export interface WallpaperPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  bgUrl: string;
  fgUrl: string;
  defaultDepth: number;
  defaultSensitivity: number;
  accentColor: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'cyberpunk',
    title: 'متجول النيون (Cyberpunk Nomad)',
    category: 'خيال علمي وفن رقمي',
    description: 'شخصية ترتدي سترة هولوجرافية متوهجة أمام أفق مدينة مستقبلية ممطرة بأنوار النيون.',
    bgUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    fgUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    defaultDepth: 42,
    defaultSensitivity: 2.8,
    accentColor: '#38bdf8',
  },
  {
    id: 'mountain_eagle',
    title: 'نسر القمم الألبية (Alpine Eagle)',
    category: 'طبيعة وحياة برية',
    description: 'نسر مهيب يحلق في فضاء سماء الغروب فوق قمم الجبال الجليدية المغطاة بالضباب.',
    bgUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    fgUrl: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=800&q=80',
    defaultDepth: 36,
    defaultSensitivity: 2.4,
    accentColor: '#f59e0b',
  },
  {
    id: 'cinematic_portrait',
    title: 'بورتريه سينمائي (Cinematic Elegance)',
    category: 'بورتريه وإضاءة استوديو',
    description: 'عزل بصري مذهل لملامح الوجه مع إضاءة حافة دافئة تفصل الشخص عن بوكيه أضواء المدينة الخلفية.',
    bgUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    fgUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    defaultDepth: 48,
    defaultSensitivity: 3.0,
    accentColor: '#ec4899',
  },
  {
    id: 'hypercar',
    title: 'سيارة السباق الليلية (Neon Hypercar)',
    category: 'سيارات وسرعة',
    description: 'سيارة خارقة تطفو فوق مضمار أسفلتي مبتل يعكس أضواء حلبة السباق بزاوية رؤية ديناميكية.',
    bgUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
    fgUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    defaultDepth: 38,
    defaultSensitivity: 2.5,
    accentColor: '#10b981',
  },
];
