import React, { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ParallaxPhoneSimulator } from './components/ParallaxPhoneSimulator';
import { ArchitectureBlueprint } from './components/ArchitectureBlueprint';
import { CodeHub } from './components/CodeHub';
import { WALLPAPER_PRESETS, WallpaperPreset } from './data/presets';
import { ANDROID_FILES } from './data/androidCodebase';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Cpu,
  Smartphone,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'blueprint' | 'code'>('simulator');
  const [selectedPreset, setSelectedPreset] = useState<WallpaperPreset>(WALLPAPER_PRESETS[0]);
  const [depthStrength, setDepthStrength] = useState<number>(WALLPAPER_PRESETS[0].defaultDepth);
  const [sensitivity, setSensitivity] = useState<number>(WALLPAPER_PRESETS[0].defaultSensitivity);
  const [isBatterySaver, setIsBatterySaver] = useState<boolean>(false);

  // Custom photo upload state
  const [customFgUrl, setCustomFgUrl] = useState<string | null>(null);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<boolean>(false);
  const [promptCopied, setPromptCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle preset selection
  const handleSelectPreset = (preset: WallpaperPreset) => {
    setSelectedPreset(preset);
    setDepthStrength(preset.defaultDepth);
    setSensitivity(preset.defaultSensitivity);
    setCustomFgUrl(null);
    setCustomBgUrl(null);
  };

  // Handle custom image upload with procedural client-side depth separation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create an offscreen canvas to process the foreground cut
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessingUpload(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // 1. Background image (full image)
        const bgDataUrl = event.target?.result as string;

        // 2. Foreground subject simulation: create a focal center cutout with radial feathering
        // mimicking subject segmentation for any uploaded photo!
        ctx.drawImage(img, 0, 0);

        // Apply a radial gradient alpha mask to center/bottom area
        const fgCanvas = document.createElement('canvas');
        fgCanvas.width = img.width;
        fgCanvas.height = img.height;
        const fgCtx = fgCanvas.getContext('2d');

        if (fgCtx) {
          fgCtx.drawImage(img, 0, 0);
          fgCtx.globalCompositeOperation = 'destination-in';

          const gradient = fgCtx.createRadialGradient(
            img.width * 0.5,
            img.height * 0.55,
            img.width * 0.15,
            img.width * 0.5,
            img.height * 0.55,
            img.width * 0.45
          );
          gradient.addColorStop(0, 'rgba(0,0,0,1)');
          gradient.addColorStop(0.7, 'rgba(0,0,0,0.9)');
          gradient.addColorStop(1, 'rgba(0,0,0,0)');

          fgCtx.fillStyle = gradient;
          fgCtx.fillRect(0, 0, img.width, img.height);

          const fgDataUrl = fgCanvas.toDataURL('image/png');
          setCustomBgUrl(bgDataUrl);
          setCustomFgUrl(fgDataUrl);
          setIsProcessingUpload(false);
          setUploadSuccessToast(true);
          setTimeout(() => setUploadSuccessToast(false), 3000);
        } else {
          setIsProcessingUpload(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCopyMasterPrompt = () => {
    const promptFile = ANDROID_FILES.find((f) => f.category === 'prompt') || ANDROID_FILES[0];
    navigator.clipboard.writeText(promptFile.content);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-sky-500 selection:text-white" dir="rtl">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCopyMasterPrompt={handleCopyMasterPrompt}
        promptCopied={promptCopied}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* TAB 1: SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-10">
            {/* Hero Subtitle */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>محاكي الجيروسكوب وتأثير العمق Parallax ثلاثي الأبعاد</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                اختبر حركة الخلفية الحية وكأنك تحمل الهاتف بيدك
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                حرك مؤشر الفأرة (أو أمِل هاتفك) لمشاهدة استجابة المستشعرات في الوقت الفعلي. يتم فصل طبقة المقدمة عن الخلفية بحسابات رياضية دقيقة تحاكي خدمة <span className="font-mono text-sky-300">WallpaperService</span> في أندرويد.
              </p>
            </div>

            {/* Presets & Custom Upload Selector */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>نماذج الخلفيات ثلاثية الأبعاد الجاهزة (Presets):</span>
                </div>

                {/* Upload Button */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    id="upload-custom-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingUpload}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isProcessingUpload ? 'جاري العزل والتجهيز...' : 'جرب صورتك الخاصة'}</span>
                  </button>

                  {(customFgUrl || customBgUrl) && (
                    <button
                      id="reset-to-presets-btn"
                      onClick={() => handleSelectPreset(selectedPreset)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 text-xs flex items-center gap-1"
                      title="العودة للنماذج الجاهزة"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WALLPAPER_PRESETS.map((p) => {
                  const isCurrent = !customFgUrl && selectedPreset.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className={`relative overflow-hidden rounded-2xl p-3 text-right border transition-all flex flex-col justify-end min-h-[110px] group ${
                        isCurrent
                          ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-lg'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Background Thumbnail Image */}
                      <img
                        src={p.bgUrl}
                        alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-50"
                      />
                      <div className="relative z-10 space-y-0.5">
                        <span className="text-[10px] font-bold text-sky-300 block">
                          {p.category}
                        </span>
                        <span className="text-xs font-black text-white block">
                          {p.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Upload Success Banner */}
              {uploadSuccessToast && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-200 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تم استخراج طبقة المقدمة وتجهيز قناع العمق لصورتك بنجاح! حرك الفأرة لمشاهدة النتيجة.</span>
                </div>
              )}
            </div>

            {/* The Live Interactive Parallax Device Simulator */}
            <ParallaxPhoneSimulator
              preset={selectedPreset}
              depthStrength={depthStrength}
              sensitivity={sensitivity}
              isBatterySaver={isBatterySaver}
              onToggleBatterySaver={setIsBatterySaver}
              onDepthChange={setDepthStrength}
              onSensitivityChange={setSensitivity}
              customFgUrl={customFgUrl}
              customBgUrl={customBgUrl}
            />

            {/* Quick Feature Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">معالجة أوفلاين بالكامل</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يعتمد التطبيق على Google ML Kit Subject Segmentation التي تعمل محلياً بنسبة 100% دون الحاجة لأي اتصال بالإنترنت أو استهلاك للبيانات.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">استهلاك بطارية شبه منعدم</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يتم فصل مستشعر الحركة فور إخفاء الشاشة أو قفلها، مع كبح معدل الإطارات عند 60 FPS وتطبيق مرشح Low-Pass لتنعيم البيانات.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">أمان وخصوصية تامة</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    استخدام PhotoPicker الحديث في Android 13/14+ يتيح للمستخدم اختيار الصور دون الحاجة لمنح التطبيق أذونات قراءة الذاكرة الحساسة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BLUEPRINT */}
        {activeTab === 'blueprint' && <ArchitectureBlueprint />}

        {/* TAB 3: CODE & PROMPT */}
        {activeTab === 'code' && <CodeHub />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Kotlin 2.0+</span>
          <span>•</span>
          <span>Jetpack Compose (Material 3)</span>
          <span>•</span>
          <span>WallpaperService + Canvas</span>
          <span>•</span>
          <span>Google ML Kit Subject Segmentation</span>
          <span>•</span>
          <span>StateFlow + MVVM</span>
        </div>
        <p>© مشروع DepthMotion — هندسة معمارية متكاملة وجاهزة للنشر المباشر على متجر Google Play.</p>
      </footer>
    </div>
  );
}
