
export const PYTHON_SCRIPT_TEMPLATE = `
import os
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import img2pdf
from PIL import Image
from pikepdf import Pdf, Encryption

class ImageToPdfConverter:
    def __init__(self, root):
        self.root = root
        self.root.title("Professional Image to PDF Converter")
        self.root.geometry("600x500")
        self.root.configure(bg="#f0f0f0")
        
        self.selected_images = []
        
        # UI Styles
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        self.setup_ui()

    def setup_ui(self):
        main_frame = tk.Frame(self.root, bg="#f0f0f0", padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Header
        tk.Label(main_frame, text="PyPDF Pro Converter", font=("Arial", 18, "bold"), 
                 bg="#f0f0f0", fg="#333").pack(pady=(0, 20))

        # Listbox for selected files
        self.list_frame = tk.Frame(main_frame, bg="#ffffff", bd=1, relief=tk.SOLID)
        self.list_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.file_listbox = tk.Listbox(self.list_frame, selectmode=tk.MULTIPLE, 
                                       font=("Arial", 10), borderwidth=0)
        self.file_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        scrollbar = tk.Scrollbar(self.list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.file_listbox.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.file_listbox.yview)

        # Buttons Frame
        btn_frame = tk.Frame(main_frame, bg="#f0f0f0")
        btn_frame.pack(fill=tk.X, pady=10)

        tk.Button(btn_frame, text="Add Images", command=self.add_images, 
                  bg="#4a90e2", fg="white", font=("Arial", 10, "bold"), 
                  padx=10, pady=5).pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="Clear List", command=self.clear_list, 
                  bg="#e74c3c", fg="white", font=("Arial", 10, "bold"), 
                  padx=10, pady=5).pack(side=tk.LEFT, padx=5)

        # Security Options
        self.pass_var = tk.BooleanVar()
        self.pass_check = tk.Checkbutton(main_frame, text="Enable Password Protection", 
                                          variable=self.pass_var, bg="#f0f0f0",
                                          command=self.toggle_password)
        self.pass_check.pack(anchor=tk.W)

        self.pass_entry = tk.Entry(main_frame, show="*", state=tk.DISABLED)
        self.pass_entry.pack(fill=tk.X, pady=5)

        # Progress
        self.progress = ttk.Progressbar(main_frame, orient=tk.HORIZONTAL, 
                                       length=100, mode='determinate')
        self.progress.pack(fill=tk.X, pady=15)

        # Convert Button
        tk.Button(main_frame, text="CONVERT TO PDF", command=self.convert_to_pdf, 
                  bg="#2ecc71", fg="white", font=("Arial", 12, "bold"), 
                  pady=10).pack(fill=tk.X)

    def toggle_password(self):
        if self.pass_var.get():
            self.pass_entry.config(state=tk.NORMAL)
        else:
            self.pass_entry.config(state=tk.DISABLED)

    def add_images(self):
        files = filedialog.askopenfilenames(
            title="Select Images",
            filetypes=[("Image files", "*.jpg *.png *.jpeg")]
        )
        for f in files:
            if f not in self.selected_images:
                self.selected_images.append(f)
                self.file_listbox.insert(tk.END, os.path.basename(f))

    def clear_list(self):
        self.selected_images = []
        self.file_listbox.delete(0, tk.END)

    def convert_to_pdf(self):
        if not self.selected_images:
            messagebox.showwarning("Warning", "Please select images first!")
            return

        save_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF files", "*.pdf")]
        )
        
        if not save_path:
            return

        try:
            self.progress['value'] = 20
            self.root.update_idletasks()

            # Using img2pdf to combine images
            # Ensures images fit A4 or maintain aspect ratio correctly
            pdf_bytes = img2pdf.convert(self.selected_images)
            
            with open(save_path, "wb") as f:
                f.write(pdf_bytes)

            self.progress['value'] = 60
            self.root.update_idletasks()

            # Handle Password Protection if enabled
            if self.pass_var.get():
                password = self.pass_entry.get()
                if not password:
                    messagebox.showerror("Error", "Password is required for protection!")
                    return
                
                with Pdf.open(save_path) as pdf:
                    pdf.save(save_path, encryption=Encryption(owner=password, user=password))

            self.progress['value'] = 100
            messagebox.showinfo("Success", f"PDF successfully created at:\\n{save_path}")
            
        except Exception as e:
            messagebox.showerror("Conversion Error", f"An error occurred: {str(e)}")
        finally:
            self.progress['value'] = 0

if __name__ == "__main__":
    root = tk.Tk()
    app = ImageToPdfConverter(root)
    root.mainloop()
`;
