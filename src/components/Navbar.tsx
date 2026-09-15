import React from 'react';
import { Layers, Sparkles, Code2, Workflow, Download, Smartphone } from 'lucide-react';

interface NavbarProps {
  activeTab: 'simulator' | 'blueprint' | 'code';
  onTabChange: (tab: 'simulator' | 'blueprint' | 'code') => void;
  onCopyMasterPrompt: () => void;
  promptCopied: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onCopyMasterPrompt,
  promptCopied,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                DepthMotion Studio
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold">
                Android 15 Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              خطة المعمارية والمحاكي التفاعلي لتطبيقات Live Wallpaper بالذكاء الاصطناعي
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
          <button
            id="nav-tab-simulator"
            onClick={() => onTabChange('simulator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'simulator'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>المحاكي التفاعلي</span>
          </button>

          <button
            id="nav-tab-blueprint"
            onClick={() => onTabChange('blueprint')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'blueprint'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>مخطط المعمارية</span>
          </button>

          <button
            id="nav-tab-code"
            onClick={() => onTabChange('code')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'code'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>كود المشروع والبرومبت</span>
          </button>
        </div>

        {/* Quick CTA */}
        <div className="hidden md:flex items-center gap-2">
          <button
            id="nav-quick-prompt-btn"
            onClick={onCopyMasterPrompt}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              promptCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{promptCopied ? 'تم نسخ البرومبت!' : 'نسخ برومبت Android Studio'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
