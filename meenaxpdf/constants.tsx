
export const PYTHON_SCRIPT_TEMPLATE = `
import os
import img2pdf
from PyPDF2 import PdfReader, PdfWriter
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.label import Label
from kivy.uix.filechooser import FileChooserIconView
from kivy.uix.popup import Popup
from kivy.uix.progressbar import ProgressBar
from kivy.uix.scrollview import ScrollView
from kivy.core.window import Window
from kivy.utils import get_color_from_hex

# Window Styling for Desktop Testing
Window.clearcolor = get_color_from_hex('#fdfaff')
Window.size = (400, 700)

class MeenaxPDFApp(App):
    def build(self):
        self.title = "MEENAXPDF Mobile Pro"
        self.selected_files = []
        
        # Main Layout
        self.main_layout = BoxLayout(orientation='vertical', padding=20, spacing=15)
        
        # Header
        header = Label(
            text="MEENAX[color=d81b60]PDF[/color]", 
            markup=True,
            font_size='32sp', 
            bold=True, 
            color=get_color_from_hex('#1e293b'),
            size_hint_y=None,
            height=50
        )
        sub_header = Label(
            text="BY MEENAX PRIVATE LIMITED",
            font_size='10sp',
            bold=True,
            color=get_color_from_hex('#8e24aa'),
            size_hint_y=None,
            height=20
        )
        self.main_layout.add_widget(header)
        self.main_layout.add_widget(sub_header)

        # File Chooser Section (Integrated)
        self.file_chooser = FileChooserIconView(
            filters=['*.jpg', '*.png', '*.jpeg'],
            multiselect=True,
            path=os.path.expanduser("~")
        )
        self.main_layout.add_widget(self.file_chooser)

        # Selection Status
        self.status_label = Label(
            text="No images selected",
            color=get_color_from_hex('#64748b'),
            size_hint_y=None,
            height=30
        )
        self.main_layout.add_widget(self.status_label)

        # Buttons Row
        btn_layout = BoxLayout(size_hint_y=None, height=50, spacing=10)
        
        select_btn = Button(
            text="ADD SELECTED",
            background_normal='',
            background_color=get_color_from_hex('#8e24aa'),
            bold=True
        )
        select_btn.bind(on_release=self.add_selected)
        
        clear_btn = Button(
            text="CLEAR ALL",
            background_normal='',
            background_color=get_color_from_hex('#ef4444'),
            bold=True
        )
        clear_btn.bind(on_release=self.clear_files)
        
        btn_layout.add_widget(select_btn)
        btn_layout.add_widget(clear_btn)
        self.main_layout.add_widget(btn_layout)

        # Password Input
        self.password_input = TextInput(
            hint_text="Enter PDF Password (Optional)",
            password=True,
            multiline=False,
            size_hint_y=None,
            height=50,
            padding=[10, 15],
            background_color=[1, 1, 1, 1]
        )
        self.main_layout.add_widget(self.password_input)

        # Progress Bar
        self.progress = ProgressBar(max=100, size_hint_y=None, height=20)
        self.main_layout.add_widget(self.progress)

        # Convert Button
        convert_btn = Button(
            text="GENERATE MEENAXPDF",
            background_normal='',
            background_color=get_color_from_hex('#fb8c00'),
            bold=True,
            size_hint_y=None,
            height=60
        )
        convert_btn.bind(on_release=self.convert_to_pdf)
        self.main_layout.add_widget(convert_btn)

        return self.main_layout

    def add_selected(self, instance):
        selection = self.file_chooser.selection
        if not selection:
            self.show_popup("Warning", "Please click on images to select them first.")
            return
        
        for file in selection:
            if file not in self.selected_files:
                self.selected_files.append(file)
        
        self.status_label.text = f"{len(self.selected_files)} images in queue"

    def clear_files(self, instance):
        self.selected_files = []
        self.status_label.text = "No images selected"
        self.progress.value = 0

    def convert_to_pdf(self, instance):
        if not self.selected_files:
            self.show_popup("Error", "No images to convert!")
            return

        output_name = "MEENAX_Export.pdf"
        try:
            self.progress.value = 30
            
            # 1. Convert Images to PDF Bytes
            pdf_bytes = img2pdf.convert(self.selected_files)
            
            temp_pdf = "temp_unlocked.pdf"
            with open(temp_pdf, "wb") as f:
                f.write(pdf_bytes)

            self.progress.value = 60
            
            # 2. Add Password if provided
            password = self.password_input.text.strip()
            final_file = "Meenax_Protected.pdf" if password else "Meenax_Export.pdf"
            
            if password:
                reader = PdfReader(temp_pdf)
                writer = PdfWriter()
                for page in reader.pages:
                    writer.add_page(page)
                writer.encrypt(user_password=password, owner_password=None)
                
                with open(final_file, "wb") as f:
                    writer.write(f)
                os.remove(temp_pdf)
            else:
                os.rename(temp_pdf, final_file)

            self.progress.value = 100
            self.show_popup("Success", f"PDF Exported as: {final_file}")
            
        except Exception as e:
            self.show_popup("Conversion Error", str(e))
        finally:
            self.progress.value = 0 if self.progress.value != 100 else 100

    def show_popup(self, title, message):
        content = BoxLayout(orientation='vertical', padding=10, spacing=10)
        content.add_widget(Label(text=message, halign="center", text_size=(250, None)))
        
        btn = Button(text="CLOSE", size_hint_y=None, height=40)
        content.add_widget(btn)
        
        popup = Popup(title=title, content=content, size_hint=(0.8, 0.4))
        btn.bind(on_release=popup.dismiss)
        popup.open()

if __name__ == "__main__":
    MeenaxPDFApp().run()
`;
