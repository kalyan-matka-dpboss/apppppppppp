
import React, { useState, useCallback, useRef } from 'react';
import { 
  FilePlus, 
  Files, 
  Code, 
  Shield, 
  Settings, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Instagram,
  ExternalLink,
  Sparkles,
  Lock,
  Zap
} from 'lucide-react';
import { SelectedImage, AppState, PDFOptions } from './types';
import FileItem from './components/FileItem';
import CodeViewer from './components/CodeViewer';
import { generatePDFFromImages } from './services/pdfService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'converter' | 'code'>('converter');
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState<PDFOptions>({
    pageSize: 'A4',
    passwordProtected: false,
    quality: 0.9,
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newImages: SelectedImage[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setSuccessMsg(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setErrorMsg("Please select images for your MEENAXPDF project.");
      return;
    }

    if (options.passwordProtected && !options.password) {
      setErrorMsg("Set a master key to enable encryption.");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const blob = await generatePDFFromImages(images, options, (p) => setProgress(p));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MEENAXPDF_EXPORT_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMsg("MEENAXPDF Export Successful!");
    } catch (err: any) {
      setErrorMsg("MEENAXPDF Engine Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const instagramUrl = "https://www.instagram.com/meenaxmedia?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

  // Custom Logo Component for aesthetic consistency
  const BrandLogoMark = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`relative ${className} flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 shadow-xl overflow-hidden`}>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] transform -rotate-12 translate-y-4"></div>
      <Files className="text-white relative z-10" size={24} strokeWidth={2.5} />
      <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-2xl border-b border-purple-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer" onClick={() => setActiveTab('converter')}>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-60 transition duration-500"></div>
                <BrandLogoMark className="w-12 h-12 relative" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                  MEENAX<span className="brand-gradient-text uppercase">PDF</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-purple-600/60 mt-1">MEENAX Private Limited</p>
              </div>
            </div>

            <nav className="hidden lg:flex gap-1.5 bg-purple-50/50 p-1.5 rounded-2xl border border-purple-100/30">
              <button
                onClick={() => setActiveTab('converter')}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-black tracking-tight transition-all duration-500 ${
                  activeTab === 'converter' 
                    ? 'bg-white text-purple-700 shadow-xl shadow-purple-200/50 scale-105' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <ImageIcon size={18} />
                CONVERTER
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-black tracking-tight transition-all duration-500 ${
                  activeTab === 'code' 
                    ? 'bg-white text-purple-700 shadow-xl shadow-purple-200/50 scale-105' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <Code size={18} />
                PYTHON SDK
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-pink-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-100 hover:shadow-purple-200 hover:-translate-y-0.5 transition-all"
              >
                <Instagram size={14} />
                @MEENAXMEDIA
              </a>
              <div className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                <Settings size={20} className="text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === 'converter' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Asset Management */}
            <div className="lg:col-span-8 space-y-8">
              <div 
                className="relative bg-white rounded-[3rem] border-2 border-dashed border-purple-100 p-16 text-center hover:border-brand-pink hover:shadow-2xl hover:shadow-purple-100 transition-all duration-700 cursor-pointer group shadow-xl shadow-slate-100/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple 
                  accept="image/jpeg,image/png,image/jpg" 
                  className="hidden" 
                />
                <div className="absolute top-10 right-10 text-purple-200 animate-pulse">
                  <Sparkles size={32} />
                </div>
                <div className="w-28 h-28 bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-xl border border-purple-50 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <FilePlus className="text-brand-purple relative z-10" size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Load High-Res Assets</h3>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed text-base font-medium">
                  Select your JPG, PNG, or JPEG files. MEENAXPDF handles professional exports with pixel-perfect precision.
                </p>
              </div>

              {images.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-4">
                      ASSET PIPELINE
                      <span className="brand-gradient-bg text-white text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest font-black shadow-lg shadow-purple-100">
                        {images.length} ACTIVE
                      </span>
                    </h2>
                    <button 
                      onClick={clearAll}
                      className="text-[10px] font-black text-slate-300 hover:text-red-500 flex items-center gap-2 uppercase tracking-widest transition-all"
                    >
                      <Trash2 size={16} />
                      CLEAR ALL
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-5 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar p-1">
                    {images.map((img, idx) => (
                      <div key={img.id} className="animate-in fade-in slide-in-from-left-8 duration-500" style={{ animationDelay: `${idx * 60}ms` }}>
                        <FileItem 
                          image={img} 
                          index={idx} 
                          onRemove={removeImage} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-slate-200 animate-float">
                  <Files size={100} strokeWidth={0.5} className="opacity-10 mb-6" />
                  <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Pipeline Empty</p>
                </div>
              )}
            </div>

            {/* Controller Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[3rem] shadow-2xl shadow-purple-200/40 border border-purple-50 p-10 space-y-12 sticky top-28">
                <div className="space-y-10">
                  <div>
                    <h4 className="flex items-center gap-4 text-xs font-black text-slate-900 mb-8 uppercase tracking-[0.2em]">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                        <Settings size={18} className="text-brand-orange" />
                      </div>
                      ENGINE CONFIG
                    </h4>
                    
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">EXPORT FORMAT</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setOptions(prev => ({ ...prev, pageSize: 'A4' }))}
                            className={`px-4 py-4 text-[10px] font-black rounded-[1.25rem] border transition-all duration-500 uppercase tracking-widest ${
                              options.pageSize === 'A4'
                                ? 'brand-gradient-bg text-white border-transparent shadow-2xl shadow-purple-200'
                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-purple-200 hover:bg-white'
                            }`}
                          >
                            ISO A4 (STD)
                          </button>
                          <button
                            onClick={() => setOptions(prev => ({ ...prev, pageSize: 'Original' }))}
                            className={`px-4 py-4 text-[10px] font-black rounded-[1.25rem] border transition-all duration-500 uppercase tracking-widest ${
                              options.pageSize === 'Original'
                                ? 'brand-gradient-bg text-white border-transparent shadow-2xl shadow-purple-200'
                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-purple-200 hover:bg-white'
                            }`}
                          >
                            PRO RENDER
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PIXEL FIDELITY</label>
                          <span className="text-[10px] font-black text-brand-pink tracking-widest">{Math.round(options.quality * 100)}%</span>
                        </div>
                        <div className="relative pt-1">
                          <input 
                            type="range" 
                            min="0.1" 
                            max="1.0" 
                            step="0.05" 
                            value={options.quality}
                            onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-pink"
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] px-1">
                          <span>FAST</span>
                          <span>ULTRA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-purple-50">
                    <h4 className="flex items-center gap-4 text-xs font-black text-slate-900 mb-8 uppercase tracking-[0.2em]">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 shadow-sm">
                        <Shield size={18} className="text-brand-purple" />
                      </div>
                      ENCRYPTION
                    </h4>
                    
                    <div className="space-y-6">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-brand-purple transition-colors uppercase tracking-tight">
                          VAULT PROTECTION
                        </span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={options.passwordProtected}
                            onChange={(e) => setOptions(prev => ({ ...prev, passwordProtected: e.target.checked }))}
                            className="sr-only peer" 
                          />
                          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-brand-purple peer-checked:to-brand-pink"></div>
                        </div>
                      </label>

                      {options.passwordProtected && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">MASTER KEY</label>
                          <div className="relative">
                            <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                              type="password"
                              placeholder="REQUIRED"
                              value={options.password || ''}
                              onChange={(e) => setOptions(prev => ({ ...prev, password: e.target.value }))}
                              className="w-full pl-12 pr-5 py-4 text-sm bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/10 focus:border-brand-purple outline-none transition-all font-mono tracking-widest"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {errorMsg && (
                    <div className="p-5 bg-red-50/70 border border-red-100 rounded-[1.5rem] flex items-start gap-4 text-red-600 animate-in zoom-in-95 duration-300">
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-black uppercase tracking-tight leading-relaxed">{errorMsg}</p>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-5 bg-emerald-50/70 border border-emerald-100 rounded-[1.5rem] flex items-start gap-4 text-emerald-600 animate-in zoom-in-95 duration-300">
                      <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-black uppercase tracking-tight leading-relaxed">{successMsg}</p>
                    </div>
                  )}

                  <button
                    onClick={handleConvert}
                    disabled={isGenerating || images.length === 0}
                    className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 transition-all duration-500 ${
                      isGenerating || images.length === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'brand-gradient-bg text-white shadow-2xl shadow-purple-300 hover:scale-[1.03] active:scale-[0.97] hover:brightness-110'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        EXPORTING... {progress}%
                      </>
                    ) : (
                      <>
                        GENERATE MEENAXPDF
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Shield size={10} className="text-emerald-500" />
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Secure Client-Side Engine</p>
                    </div>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-center">
                      Technology by MEENAX Private Limited
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="text-center space-y-8">
              <div className="inline-block relative group">
                <div className="absolute -inset-6 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-orange rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <BrandLogoMark className="w-32 h-32 mx-auto relative group-hover:rotate-6 transition-all duration-700" />
              </div>
              <div className="space-y-4">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">
                  MEENAX<span className="brand-gradient-text uppercase">PDF</span> SDK
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-xl font-medium">
                  Deploy professional-grade MEENAXPDF automation locally. Optimized for Python high-speed image processing pipelines.
                </p>
              </div>
              <div className="pt-6 flex flex-wrap justify-center gap-4">
                <a 
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 px-10 py-5 rounded-3xl bg-white border border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-purple-200 transition-all hover:-translate-y-2 group shadow-xl"
                >
                  <Instagram size={20} className="text-brand-pink group-hover:scale-125 transition-transform" />
                  MEENAX MEDIA CREATORS
                  <ExternalLink size={14} className="opacity-30" />
                </a>
              </div>
            </div>
            <CodeViewer />
          </div>
        )}
      </main>

      <footer className="mt-auto py-20 border-t border-purple-100/50 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-center">
            {/* Branding */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
                <BrandLogoMark className="w-14 h-14" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tighter">
                  MEENAX<span className="text-brand-pink">PDF</span>
                </span>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">
                  &copy; {new Date().getFullYear()} MEENAX PVT LTD
                </span>
              </div>
            </div>

            {/* Community */}
            <div className="flex justify-center">
              <a 
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 px-10 py-6 rounded-[2.5rem] bg-white border border-purple-50 hover:border-brand-pink hover:shadow-2xl hover:shadow-pink-100 transition-all duration-700 hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-tr from-brand-purple via-brand-pink to-brand-orange p-0.5 shadow-lg group-hover:shadow-pink-200 transition-shadow">
                    <div className="w-full h-full bg-white rounded-[1.15rem] flex items-center justify-center">
                      <Instagram size={24} className="text-brand-pink group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-800 tracking-tight italic">@meenaxmedia</span>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Official Community</span>
              </a>
            </div>

            {/* Status */}
            <div className="flex flex-col items-end gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <div className="flex items-center gap-4 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full border border-emerald-100 shadow-sm shadow-emerald-100/50">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-pulse delay-75" />
                  <span className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full animate-pulse delay-150" />
                </div>
                ENGINE STATUS: OPTIMAL
              </div>
              <div className="flex items-center gap-2 opacity-60">
                <Zap size={10} className="text-brand-orange" />
                <span>POWERED BY MEENAX CORE</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
