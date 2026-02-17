
import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';
import { PYTHON_SCRIPT_TEMPLATE } from '../constants';

const CodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(PYTHON_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([PYTHON_SCRIPT_TEMPLATE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="ml-2 text-sm font-medium text-slate-400 font-mono">main.py</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-600 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={downloadScript}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>
      
      <div className="p-6 overflow-auto max-h-[600px] custom-scrollbar">
        <pre className="code-font text-sm leading-relaxed text-blue-100">
          <code>{PYTHON_SCRIPT_TEMPLATE}</code>
        </pre>
      </div>

      <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Requires: kivy, img2pdf, PyPDF2
          </div>
          <a 
            href="https://kivy.org/doc/stable/gettingstarted/installation.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            Kivy Documentation <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
