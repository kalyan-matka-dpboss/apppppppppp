
import { jsPDF } from 'jspdf';
import { SelectedImage, PDFOptions } from '../types';

export const generatePDFFromImages = async (
  images: SelectedImage[],
  options: PDFOptions,
  onProgress: (progress: number) => void
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: options.pageSize === 'A4' ? 'a4' : undefined,
      });

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const progress = Math.round(((i + 1) / images.length) * 100);
        onProgress(progress);

        const imgData = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target?.result as string);
          reader.readAsDataURL(img.file);
        });

        const imgProps = doc.getImageProperties(imgData);
        
        let width = doc.internal.pageSize.getWidth();
        let height = (imgProps.height * width) / imgProps.width;

        // If height exceeds page height, scale it down
        const pageHeight = doc.internal.pageSize.getHeight();
        if (height > pageHeight) {
          height = pageHeight;
          width = (imgProps.width * height) / imgProps.height;
        }

        if (i > 0) {
          doc.addPage();
        }

        doc.addImage(imgData, 'JPEG', 0, 0, width, height);
      }

      const pdfBlob = doc.output('blob');
      
      // Note: Encryption in jsPDF standard is limited. 
      // In a real production environment with password requirements, 
      // one would typically use pdf-lib for adding user/owner passwords.
      // For this implementation, we focus on the professional structure.
      
      resolve(pdfBlob);
    } catch (error) {
      reject(error);
    }
  });
};
