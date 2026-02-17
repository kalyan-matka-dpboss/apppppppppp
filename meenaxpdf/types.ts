
export interface SelectedImage {
  id: string;
  file: File;
  preview: string;
}

export interface PDFOptions {
  pageSize: 'A4' | 'Original';
  passwordProtected: boolean;
  password?: string;
  quality: number;
}

export interface AppState {
  images: SelectedImage[];
  isGenerating: boolean;
  progress: number;
  options: PDFOptions;
}
