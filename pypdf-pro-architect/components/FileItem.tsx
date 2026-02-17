
import React from 'react';
import { X, GripVertical, FileImage } from 'lucide-react';
import { SelectedImage } from '../types';

interface FileItemProps {
  image: SelectedImage;
  onRemove: (id: string) => void;
  index: number;
}

const FileItem: React.FC<FileItemProps> = ({ image, onRemove, index }) => {
  return (
    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
      <div className="text-slate-400 cursor-grab active:cursor-grabbing">
        <GripVertical size={20} />
      </div>
      
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
        <img 
          src={image.preview} 
          alt={image.file.name} 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-grow min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{image.file.name}</p>
        <p className="text-xs text-slate-400">
          {(image.file.size / 1024).toFixed(1)} KB • Image {index + 1}
        </p>
      </div>

      <button
        onClick={() => onRemove(image.id)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default FileItem;
