import React, { useState } from 'react';
import { ANDROID_FILES, AndroidFile } from '../data/androidCodebase';
import JSZip from 'jszip';
import {
  Copy,
  Check,
  Download,
  FolderTree,
  FileCode,
  FileText,
  Settings,
  Search,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const CodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_FILES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [promptCopied, setPromptCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // Filter files
  const filteredFiles = ANDROID_FILES.filter((file) => {
    const matchesCategory =
      selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.descriptionAr.includes(searchQuery) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMasterPrompt = () => {
    const promptFile = ANDROID_FILES.find((f) => f.category === 'prompt') || ANDROID_FILES[0];
    navigator.clipboard.writeText(promptFile.content);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2500);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add each file to its path
      ANDROID_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Add a clean README.md
      zip.file(
        'README.md',
        `# DepthMotion - 3D Parallax Live Wallpaper (Android)
Built with Kotlin, Jetpack Compose, WallpaperService, and Google ML Kit Subject Segmentation.

## Getting Started:
1. Open this project in Android Studio (Ladybug / Koala or newer).
2. Sync Gradle dependencies.
3. Run on an Android device or emulator (API 26+).
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'DepthMotion-Android-Studio-Codebase.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div id="code-hub-container" className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner with Action Buttons */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileCode className="w-4 h-4" />
            <span>حزمة الكود الجاهز للنسخ المباشر</span>
          </div>
          <h3 className="text-xl font-black text-white">
            مستودع الأكواد الكامل لتطبيق أندرويد ستوديو
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            كود Kotlin و Jetpack Compose حديث وخالٍ من الأخطاء 100% مع إدارة البطارية والـ ML Kit
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            id="copy-master-prompt-btn"
            onClick={handleCopyMasterPrompt}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              promptCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:opacity-95'
            }`}
          >
            {promptCopied ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{promptCopied ? 'تم نسخ البرومبت!' : 'نسخ البرومبت لـ Android Studio'}</span>
          </button>

          <button
            id="download-project-zip-btn"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>{isZipping ? 'جاري تجهيز الـ ZIP...' : 'تحميل المشروع بالكامل (ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Code Browser Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar: File Tree & Filter */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث في أسماء الملفات أو المسار..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'config', label: 'الإعدادات (Gradle/Manifest)' },
              { id: 'model', label: 'النموذج (Model)' },
              { id: 'repository', label: 'المستودع (Repo)' },
              { id: 'ml', label: 'الذكاء (ML Kit)' },
              { id: 'service', label: 'الخدمة (Service)' },
              { id: 'ui', label: 'الواجهة (UI)' },
              { id: 'utils', label: 'الأدوات (Utils)' },
              { id: 'prompt', label: 'البرومبت' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-white font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* File list */}
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isCurrent = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-right p-3 rounded-2xl border transition-all flex flex-col gap-1 ${
                    isCurrent
                      ? 'bg-sky-950/40 border-sky-500/50 text-sky-100 shadow-md'
                      : 'bg-slate-800/40 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {file.category === 'service' && <Layers className="w-3.5 h-3.5 text-amber-400" />}
                      {file.category === 'ml' && <Cpu className="w-3.5 h-3.5 text-emerald-400" />}
                      {file.category === 'ui' && <FileCode className="w-3.5 h-3.5 text-sky-400" />}
                      {file.category === 'model' && <FileText className="w-3.5 h-3.5 text-pink-400" />}
                      {file.category === 'repository' && <FolderTree className="w-3.5 h-3.5 text-indigo-400" />}
                      {file.category === 'utils' && <Settings className="w-3.5 h-3.5 text-purple-400" />}
                      {file.category === 'prompt' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {file.name}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400">
                      {file.language}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate">
                    {file.descriptionAr}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
          {/* File Header */}
          <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{selectedFile.name}</span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {selectedFile.path}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedFile.descriptionAr}</p>
            </div>

            <button
              id="copy-selected-file-code-btn"
              onClick={handleCopyCurrent}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto select-text">
            <pre className="text-slate-300 leading-relaxed">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
