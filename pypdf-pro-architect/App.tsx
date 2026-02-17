
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
  Trash2
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
    quality: 0.8,
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Cast to File[] to ensure correct type inference for SelectedImage and URL.createObjectURL
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
      setErrorMsg("Please add at least one image.");
      return;
    }

    if (options.passwordProtected && !options.password) {
      setErrorMsg("Please enter a password for protection.");
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
      a.download = `combined_images_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMsg("PDF generated and download started successfully!");
    } catch (err: any) {
      setErrorMsg("Failed to generate PDF: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Files size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">PyPDF Pro</h1>
                <p className="text-[10px] uppercase tracking-widest font-bold text-blue-600">Architect Suite</p>
              </div>
            </div>

            <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('converter')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'converter' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <ImageIcon size={18} />
                Converter
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'code' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Code size={18} />
                Python Script
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'converter' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: File Management */}
            <div className="lg:col-span-8 space-y-6">
              <div 
                className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FilePlus className="text-blue-600" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Upload high-quality images</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Drag and drop your images here or click to browse. Supports JPG, PNG, and JPEG.
                </p>
              </div>

              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      Selected Files
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-mono">
                        {images.length}
                      </span>
                    </h2>
                    <button 
                      onClick={clearAll}
                      className="text-sm font-medium text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={14} />
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {images.map((img, idx) => (
                      <FileItem 
                        key={img.id} 
                        image={img} 
                        index={idx} 
                        onRemove={removeImage} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Files size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">No files selected yet</p>
                </div>
              )}
            </div>

            {/* Right: Configuration Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8 sticky top-24">
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                      <Settings size={16} className="text-blue-500" />
                      Output Settings
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Page Format</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setOptions(prev => ({ ...prev, pageSize: 'A4' }))}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
                              options.pageSize === 'A4'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            Standard A4
                          </button>
                          <button
                            onClick={() => setOptions(prev => ({ ...prev, pageSize: 'Original' }))}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
                              options.pageSize === 'Original'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            Original
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quality Optimization</label>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="1.0" 
                          step="0.1" 
                          value={options.quality}
                          onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span>Smallest File</span>
                          <span>High Definition</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                      <Shield size={16} className="text-emerald-500" />
                      Security & Privacy
                    </h4>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                          Enable Password Protection
                        </span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={options.passwordProtected}
                            onChange={(e) => setOptions(prev => ({ ...prev, passwordProtected: e.target.checked }))}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                      </label>

                      {options.passwordProtected && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Set PDF Password</label>
                          <input 
                            type="password"
                            placeholder="Min. 8 characters"
                            value={options.password || ''}
                            onChange={(e) => setOptions(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in zoom-in-95 duration-200">
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-medium">{errorMsg}</p>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-600 animate-in fade-in zoom-in-95 duration-200">
                      <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-medium">{successMsg}</p>
                    </div>
                  )}

                  <button
                    onClick={handleConvert}
                    disabled={isGenerating || images.length === 0}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                      isGenerating || images.length === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing ({progress}%)
                      </>
                    ) : (
                      <>
                        Generate PDF
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  
                  <p className="text-[10px] text-center text-slate-400 font-medium px-4">
                    High-performance client-side conversion. Your images never leave your device.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-black text-slate-900">Python Power Tool</h2>
              <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
                Need to automate this on your local machine? Use our production-ready Python template built with <span className="font-bold text-slate-700">CustomTkinter</span> and <span className="font-bold text-slate-700">img2pdf</span>.
              </p>
            </div>
            <CodeViewer />
          </div>
        )}
      </main>

      <footer className="mt-auto py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <Files size={16} />
              </div>
              <span className="text-sm font-bold text-slate-600">PyPDF Pro Architect v1.0.4</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Built for performance</span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">100% Privacy</span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Open Source Core</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
