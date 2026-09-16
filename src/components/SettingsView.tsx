import React, { useState } from 'react';
import { AppSettings } from '../types/wallpaper';
import {
  Shield,
  Clock,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Share2,
  ChevronDown,
  ChevronRight,
  Star,
  Globe,
  Instagram,
  Play,
  ShoppingBag,
  Code2,
  CheckCircle2,
  BatteryCharging,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  appSettings: AppSettings;
  onUpdateAppSettings: (newSettings: AppSettings) => void;
  onOpenAndroidCode: () => void;
  onShareApp: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appSettings,
  onUpdateAppSettings,
  onOpenAndroidCode,
  onShareApp,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('permissions');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleShareClick = () => {
    onShareApp();
    if (navigator.share) {
      navigator.share({
        title: 'Depth Wallpapers Live Clock',
        text: 'تحقق من تطبيق خلفيات العمق ثلاثية الأبعاد وساعة شاشة القفل التفاعلية!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 pt-6 pb-28 max-w-md mx-auto sm:max-w-lg md:max-w-xl">
      {/* Top Bar matching Screenshot 4 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Outfit']">
          Settings
        </h1>

        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="bg-[#1c1c1f] text-neutral-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-700/60 flex items-center space-x-1">
            <span>All access</span>
          </div>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-yellow-400">
            <Star className="w-5 h-5 fill-yellow-400" />
          </button>
        </div>
      </div>

      {/* Accordion List matching Screenshots 4 & 5 */}
      <div className="space-y-3.5 mb-6">
        {/* 1. App & Permission */}
        <div className="bg-[#131316] rounded-2xl border border-white/5 overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('permissions')}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <Shield className="w-4 h-4 fill-yellow-400/30" />
              </div>
              <span className="font-bold text-sm tracking-wide text-neutral-200">
                App & Permission
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                expandedSection === 'permissions' ? 'rotate-180 text-yellow-400' : ''
              }`}
            />
          </button>

          {expandedSection === 'permissions' && (
            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 text-xs text-neutral-300">
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-semibold text-white">Live Wallpaper Service</div>
                  <div className="text-[11px] text-neutral-400">OpenGL & Hardware Canvas Active</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-bold text-[10px]">
                  ACTIVE (60 FPS)
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-semibold text-white">Battery Optimization Whitelist</div>
                  <div className="text-[11px] text-neutral-400">Prevents MIUI/OneUI killing wallpaper</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-400 font-bold text-[10px]">
                  UNRESTRICTED
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-semibold text-white">Storage & Media Access</div>
                  <div className="text-[11px] text-neutral-400">For importing user custom photos</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-neutral-200 font-bold text-[10px]">
                  GRANTED
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-semibold text-white">System Overlay (Superposition)</div>
                  <div className="text-[11px] text-neutral-400">Draw interactive iOS-style 3D clock depth over lockscreen</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-bold text-[10px]">
                  ENABLED
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-semibold text-white">Lockscreen Integration (Accessibilité)</div>
                  <div className="text-[11px] text-neutral-400">Deep system lock/wake event hook without background lag</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-400 font-bold text-[10px]">
                  ACTIVE
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Clock Settings */}
        <div className="bg-[#131316] rounded-2xl border border-white/5 overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('clock')}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wide text-neutral-200">
                Clock Settings
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                expandedSection === 'clock' ? 'rotate-180 text-yellow-400' : ''
              }`}
            />
          </button>

          {expandedSection === 'clock' && (
            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 text-xs text-neutral-300">
              <div className="flex items-center justify-between py-1">
                <span>24-Hour Time Format</span>
                <button
                  onClick={() =>
                    onUpdateAppSettings({ ...appSettings, language: appSettings.language })
                  }
                  className="px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-400 font-bold text-[11px]"
                >
                  24H ENABLED
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span>Language & Date Style</span>
                <span className="text-neutral-400 font-semibold">English (US) / العربية</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span>Lock Screen Clock Sync</span>
                <span className="text-green-400 font-semibold">Real-Time Sensor Sync</span>
              </div>

              {/* Overlap Solution Guide */}
              <div className="p-3 rounded-xl bg-[#1c1a14] border border-amber-500/30 space-y-1.5 mt-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>حل تداخل ساعة النظام (Overlap Fix)</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  خلفية الأندرويد الحية تعمل تحت شاشة القفل. لمنع تداخل أرقام الساعة مع ساعة النظام، يمكنك:
                </p>
                <ul className="text-[10px] text-neutral-400 space-y-1 list-disc list-inside">
                  <li><strong className="text-white">الخيار 1:</strong> إيقاف رسم الساعة من استوديو التخصيص أو إعدادات الساعة والاعتماد على ساعة النظام مع الاستمتاع بعمق 3D الكامل للخلفية.</li>
                  <li><strong className="text-white">الخيار 2:</strong> في أجهزة Samsung (Good Lock / LockStar) و Xiaomi و Pixel: إخفاء ساعة النظام من إعدادات شاشة القفل ليظهر ستايل iOS الأنيق بمفرده.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 3. Animation Settings */}
        <div className="bg-[#131316] rounded-2xl border border-white/5 overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('animation')}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wide text-neutral-200">
                Animation Settings
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                expandedSection === 'animation' ? 'rotate-180 text-yellow-400' : ''
              }`}
            />
          </button>

          {expandedSection === 'animation' && (
            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 text-xs text-neutral-300">
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-semibold text-white">3D Gyroscope Parallax</div>
                  <div className="text-[11px] text-neutral-400">Interactive device tilt response</div>
                </div>
                <button
                  onClick={() =>
                    onUpdateAppSettings({
                      ...appSettings,
                      parallaxEnabled: !appSettings.parallaxEnabled,
                    })
                  }
                  className={`px-3 py-1 rounded-full font-bold text-[11px] transition-colors cursor-pointer ${
                    appSettings.parallaxEnabled
                      ? 'bg-[#FFDE00] text-black'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {appSettings.parallaxEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-semibold text-white">Target Refresh Rate</div>
                  <div className="text-[11px] text-neutral-400">Ultra-smooth 60 / 120 Hz</div>
                </div>
                <button
                  onClick={() =>
                    onUpdateAppSettings({
                      ...appSettings,
                      targetFps: appSettings.targetFps === 60 ? 120 : 60,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-mono font-bold text-[11px]"
                >
                  {appSettings.targetFps} FPS
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-semibold text-white">Battery Saver Mode</div>
                  <div className="text-[11px] text-neutral-400">Disable sensor when battery &lt; 20%</div>
                </div>
                <button
                  onClick={() =>
                    onUpdateAppSettings({
                      ...appSettings,
                      batterySaver: !appSettings.batterySaver,
                    })
                  }
                  className={`px-3 py-1 rounded-full font-bold text-[11px] transition-colors cursor-pointer ${
                    appSettings.batterySaver
                      ? 'bg-[#FFDE00] text-black'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {appSettings.batterySaver ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Auto Wallpaper Settings */}
        <div className="bg-[#131316] rounded-2xl border border-white/5 overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('autowallpaper')}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wide text-neutral-200">
                Auto Wallpaper Settings
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                expandedSection === 'autowallpaper' ? 'rotate-180 text-yellow-400' : ''
              }`}
            />
          </button>

          {expandedSection === 'autowallpaper' && (
            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 text-xs text-neutral-300">
              <div className="flex items-center justify-between py-1">
                <span>Auto-Cycle Wallpaper</span>
                <button
                  onClick={() =>
                    onUpdateAppSettings({
                      ...appSettings,
                      autoChangeWallpaper: !appSettings.autoChangeWallpaper,
                    })
                  }
                  className={`px-3 py-1 rounded-full font-bold text-[11px] cursor-pointer ${
                    appSettings.autoChangeWallpaper
                      ? 'bg-[#FFDE00] text-black'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {appSettings.autoChangeWallpaper ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span>Cycle Frequency</span>
                <span className="text-yellow-400 font-semibold">Every 24 Hours (Daily)</span>
              </div>
            </div>
          )}
        </div>

        {/* 5. Support & About */}
        <div className="bg-[#131316] rounded-2xl border border-white/5 overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('support')}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02]"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wide text-neutral-200">
                Support & About
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                expandedSection === 'support' ? 'rotate-180 text-yellow-400' : ''
              }`}
            />
          </button>

          {expandedSection === 'support' && (
            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 text-xs text-neutral-300">
              <div className="flex items-center justify-between py-1">
                <span>App Version</span>
                <span className="font-mono text-neutral-400">v2.4.0 (Build 2026.09)</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span>Architecture</span>
                <span className="text-yellow-400 font-semibold">
                  Kotlin + Jetpack Compose + ML Kit
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenAndroidCode}
                  className="w-full py-2.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-xl border border-yellow-400/30 font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  <span>عرض كود أندرويد الكامل (Android Kotlin Code)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share it with Friend Card matching Screenshot 4 & 5 */}
      <div
        onClick={handleShareClick}
        className="mb-6 p-4 rounded-3xl bg-[#1c1c20] hover:bg-[#25252b] border border-white/10 flex items-center justify-between transition-colors cursor-pointer shadow-lg group"
      >
        <div className="flex items-center space-x-3.5 rtl:space-x-reverse">
          <div className="w-12 h-12 rounded-full bg-neutral-700/60 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-['Outfit']">
              Share it with Friend
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5 max-w-[210px] leading-snug">
              Spread the word and help others discover amazing wallpapers
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {copiedToast && (
        <div className="mb-4 text-center py-2 px-4 rounded-xl bg-yellow-400/20 text-yellow-300 text-xs font-bold border border-yellow-400/40 animate-fade-in">
          تم نسخ رابط المشاركة بنجاح!
        </div>
      )}

      {/* Social Connect row matching Screenshot 4 & 5 */}
      <div className="mb-8 text-center">
        <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase block mb-4">
          SOCIAL CONNECT
        </span>
        <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse text-neutral-400">
          {/* X / Twitter */}
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors cursor-pointer font-bold text-lg"
            title="X (Twitter)"
          >
            𝕏
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors cursor-pointer"
            title="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>

          {/* Play Store / YouTube */}
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors cursor-pointer"
            title="Google Play Store"
          >
            <Play className="w-5 h-5 fill-current" />
          </a>

          {/* Web */}
          <a
            href="https://google.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors cursor-pointer"
            title="Website"
          >
            <Globe className="w-5 h-5" />
          </a>

          {/* Store */}
          <a
            href="https://justnewdesigns.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors cursor-pointer"
            title="Theme Store"
          >
            <ShoppingBag className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Brand Footer matching Screenshot 4 & 5 */}
      <div className="text-center mb-10 relative">
        <div className="flex items-center justify-center relative inline-block">
          {/* Yellow overlapping circles logo from the screenshot */}
          <span className="text-2xl font-black text-white font-['Outfit'] tracking-tight relative z-10">
            Depth Wallpapers
          </span>
          <div className="absolute -top-1 left-12 w-6 h-6 rounded-full bg-[#FFDE00] opacity-80 mix-blend-screen pointer-events-none" />
          <div className="absolute top-1 left-16 w-5 h-5 rounded-full bg-[#FFDE00] opacity-80 mix-blend-screen pointer-events-none" />
        </div>
        <p className="text-[9px] tracking-[0.25em] text-neutral-500 font-bold uppercase mt-1">
          J U S T  N E W  D E S I G N S
        </p>
      </div>

      {/* Floating CTA Pill: "✨ More Apps by Us" matching Screenshot 4 & 5 */}
      <div className="flex justify-end mb-4">
        <a
          href="https://play.google.com"
          target="_blank"
          rel="noreferrer"
          className="bg-[#FFDE00] hover:bg-yellow-300 text-black font-extrabold text-xs px-4 py-2.5 rounded-full shadow-[0_8px_20px_rgba(255,222,0,0.3)] flex items-center space-x-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>More Apps by Us</span>
        </a>
      </div>
    </div>
  );
};
