import React, { useState } from 'react';
import { ARCHITECTURE_PILLARS } from '../data/androidCodebase';
import {
  Layers,
  Cpu,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  Workflow,
  Sparkles,
  Zap,
  Clock,
  FolderTree
} from 'lucide-react';

export const ArchitectureBlueprint: React.FC = () => {
  const [activePillar, setActivePillar] = useState<string>('depth_sandwich');

  return (
    <div id="architecture-blueprint-section" className="w-full max-w-6xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
          <Workflow className="w-3.5 h-3.5" />
          <span>هيكلية تطبيق قفل الشاشة ثلاثي الأبعاد: com.example.depthlockscreen</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          مخطط المعمارية الشامل (Architecture Blueprint)
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          تصميم هندسي متكامل يجمع بين عزل العناصر محلياً بـ ML Kit، تأثير ساندوتش العمق لساعة القفل، وإلغاء تسجيل الحساسات في دورة الحياة لتوفير 100% من البطارية.
        </p>
      </div>

      {/* Visual Layer Flow Diagram */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          مخطط تدفق الطبقات والملفات (Project Architecture Flow)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Layer 1: Data & Model */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-pink-500/50 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="text-sm font-bold text-white">طبقة البيانات (Data Layer)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                نموذج ClockConfig لحفظ نوع الخط، الحجم، اللون، وموقع الساعة (خلف العنصر)، مع مستودع تخزين الطبقات كملفات WebP.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/50 text-[11px] font-mono text-pink-300">
              ClockConfig.kt & Repo
            </div>
          </div>

          {/* Layer 2: ML Kit AI */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-emerald-500/50 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="text-sm font-bold text-white">الذكاء الاصطناعي (ML Kit)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                عزل الشخصية أو العنصر محلياً بدون إنترنت في خيط Coroutine، وتوليد Foreground Bitmap الشفاف مع تصغير الحجم بـ BitmapUtils.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/50 text-[11px] font-mono text-emerald-300">
              SubjectSegmenterHelper.kt
            </div>
          </div>

          {/* Layer 3: UI Layer */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-sky-500/50 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="text-sm font-bold text-white">واجهات Compose المودرن</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                شاشة HomeScreen لاختيار الصور بـ PhotoPicker، وشاشة EditorScreen مع ClockPicker لتخصيص الساعة والمعاينة الحية الفورية.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/50 text-[11px] font-mono text-sky-300">
              HomeScreen & EditorScreen
            </div>
          </div>

          {/* Layer 4: Wallpaper Service Engine */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-amber-500/50 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                4
              </div>
              <h4 className="text-sm font-bold text-white">المحرك الرسومي والساندوتش</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                خدمة DepthWallpaperService: ترسم الخلفية، ثم الساعة في الوسط، ثم العنصر المعزول فوق الساعة، مع استجابة للجيروسكوب.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/50 text-[11px] font-mono text-amber-300">
              DepthWallpaperService.kt
            </div>
          </div>
        </div>
      </div>

      {/* The 4 Architectural Pillars */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          الركائز الهندسية الأربع لتطبيقات الشركات الكبرى
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ARCHITECTURE_PILLARS.map((pillar) => {
            const isSelected = activePillar === pillar.id;
            return (
              <div
                key={pillar.id}
                onClick={() => setActivePillar(pillar.id)}
                className={`cursor-pointer rounded-3xl p-6 border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500/60 shadow-xl shadow-sky-500/5'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    {pillar.id === 'depth_sandwich' && <Clock className="w-6 h-6" />}
                    {pillar.id === 'battery' && <BatteryCharging className="w-6 h-6" />}
                    {pillar.id === 'offline_ai' && <Cpu className="w-6 h-6" />}
                    {pillar.id === 'compose_m3' && <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{pillar.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
                  </div>
                </div>

                <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-800">
                  {pillar.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Dive: Mathematical Formulas and Magic Touch */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          المعادلات الرياضية واللمسات السحرية في كود DepthWallpaperService
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formula 1: Sensor Low-Pass Filter */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold text-sky-400 block uppercase tracking-wider">
              1. تنعيم حركة الحساس (Low-Pass Filter Equation)
            </span>
            <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800">
              filteredValue = filteredValue + α × (rawValue - filteredValue)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              تم ضبط معامل التنعيم (α = 0.12). هذا يمتص الرعشات الدقيقة في اليدين (Micro-tremors) ويمنح حركة هادئة وانسيابية، مع حماية البطارية من عمليات إعادة الرسم غير المبررة.
            </p>
          </div>

          {/* Formula 2: Depth Sandwich Layering */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold text-purple-400 block uppercase tracking-wider">
              2. سر تأثير ساندوتش العمق (Depth Sandwich Rendering)
            </span>
            <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-purple-300 border border-slate-800">
              Draw(Background) ➔ Draw(Clock) ➔ Draw(Foreground Subject)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              عندما يرسم المحرك الساعة على نفس الـ Canvas قبل رسم العنصر المعزول، تقوم بكسلات الشخصية غير الشفافة بتغطية أجزاء من النص تلقائياً، محققة المظهر ثلاثي الأبعاد الأصيل لهواتف Apple وأندرويد الحديثة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
