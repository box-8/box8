import os
import shutil
import PyPDF2
from PyPDF2 import PdfWriter
from docx import Document

def extract_page_text_from_file(src: str) -> list:
    """
    Extrait le texte d'un fichier PDF ou DOCX page par page.
    
    Args:
        src (str): Chemin vers le fichier source
        
    Returns:
        list: Liste des textes extraits par page
    """
    texte_pages = []
    try:
        extension = os.path.splitext(src)[1].lower()

        if extension == '.pdf':
            with open(src, 'rb') as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)

                for page_num, page in enumerate(reader.pages):
                    try:
                        texte = page.extract_text()
                        if texte:
                            texte_pages.append(texte)
                        else:
                            print(f"Le texte de la page {page_num + 1} est vide ou illisible.")
                    except Exception as e:
                        print(f"Erreur lors de l'extraction du texte de la page {page_num + 1}: {e}")

        elif extension == '.docx':
            try:
                doc = Document(src)
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]

                # Grouper les paragraphes par blocs de 11
                bloc = []
                for i, paragraphe in enumerate(paragraphs, start=1):
                    bloc.append(paragraphe)
                    if i % 11 == 0:
                        texte_pages.append("\n".join(bloc))
                        bloc = []

                if bloc:
                    texte_pages.append("\n".join(bloc))

            except Exception as e:
                print(f"Erreur lors de l'extraction du texte du fichier DOCX : {e}")

        else:
            print("Format de fichier non pris en charge. Seuls les fichiers PDF et DOCX sont acceptés.")

    except FileNotFoundError:
        print(f"Le fichier {src} est introuvable.")
    except Exception as e:
        print(f"Une erreur s'est produite : {e}")
    
    return texte_pages
