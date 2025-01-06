from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.auth.auth import router as auth_router, get_user_from_token
import json
import os
from pydantic import BaseModel
from typing import List
from app.services.diagram_service import execute_process_from_diagram, generate_diagram_from_description

# Initialisation de l'application avec configuration des slashes
app = FastAPI(
    title="Box8 API",
    description="API Backend pour Box8",
    version="1.0.0",
    redirect_slashes=True
)

# Configuration CORS avec support des cookies
origins = [
    "http://localhost:3000",  # Frontend React
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Inclusion des routes d'authentification
app.include_router(auth_router)

# Modèle pour les données de diagramme
class DiagramData(BaseModel):
    name: str
    diagram: str

class DiagramDescription(BaseModel):
    name: str
    description: str

class DiagramSave(BaseModel):
    name: str
    diagram: str

def get_absolute_path(relative_path: str) -> str:
    """Fonction utilitaire pour obtenir le chemin absolu d'un fichier"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, relative_path)

def get_user_folder(user_email: str) -> str:
    """Obtient le chemin du dossier de l'utilisateur"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    user_folder = os.path.join(base_dir, 'sharepoint', user_email)
    if not os.path.exists(user_folder):
        os.makedirs(user_folder)
    return user_folder

# Routes pour la gestion des diagrammes
@app.get("/designer/list-json-files")
async def designer_list_json_files():
    """Liste tous les fichiers JSON dans le dossier designer"""
    try:
        designer_path = get_absolute_path('sharepoint/designer')
        if not os.path.exists(designer_path):
            os.makedirs(designer_path)
        
        files = [f for f in os.listdir(designer_path) if f.endswith('.json')]
        return JSONResponse(files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/designer/get-diagram/{filename}")
async def designer_get_diagram(filename: str):
    """Récupère le contenu d'un diagramme spécifique"""
    try:
        if not filename.endswith('.json'):
            filename += '.json'
        
        file_path = get_absolute_path(f'sharepoint/designer/{filename}')
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
            
        with open(file_path, 'r', encoding='utf-8') as file:
            content = json.load(file)
        return JSONResponse(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/designer/save-diagram")
async def save_diagram(request: Request, data: DiagramSave):
    """Sauvegarde un diagramme au format JSON"""
    session = request.cookies.get("session")
    if not session:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    user = get_user_from_token(session)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide")
    
    try:
        # Vérifier que le diagramme est un JSON valide
        diagram_data = json.loads(data.diagram)
        
        # Créer le dossier diagrams s'il n'existe pas
        # diagrams_dir = os.path.join("sharepoint", "designer")
        diagrams_dir = get_absolute_path('sharepoint/designer')
        os.makedirs(diagrams_dir, exist_ok=True)
        
        # Sauvegarder le diagramme
        filename = f"{data.name.replace(' ', '_')}.json"
        filepath = os.path.join(diagrams_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(diagram_data, f, indent=2)
        
        return {"message": "Diagramme sauvegardé avec succès", "filename": filename}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Le diagramme n'est pas un JSON valide")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la sauvegarde: {str(e)}")

@app.delete("/designer/delete-diagram/{filename}")
async def designer_delete_diagram(filename: str):
    """Supprime un diagramme existant"""
    try:
        if not filename.endswith('.json'):
            filename += '.json'
        
        file_path = get_absolute_path(f'sharepoint/designer/{filename}')
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        os.remove(file_path)
        return JSONResponse({"success": True})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/designer/launch-crewai")
async def designer_launch_crewai(request: Request):
    """Lance le processus CrewAI à partir d'un diagramme"""
    session = request.cookies.get("session")
    if not session:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    user = get_user_from_token(session)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide")

    try:
        data = await request.json()
        user_folder = get_user_folder(user.email)
        llm = data.get('llm', 'openai')
        
        if not os.path.exists(user_folder):
            os.makedirs(user_folder)
            
        result = execute_process_from_diagram(data, user_folder, llm)
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/designer/generate-diagram")
async def generate_diagram(request: Request, data: DiagramDescription):
    """Génère un diagramme à partir d'une description textuelle"""
    session = request.cookies.get("session")
    if not session:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    user = get_user_from_token(session)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide")
    
    try:
        diagram_data = generate_diagram_from_description(data.description, data.name)
        return JSONResponse(content=diagram_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du diagramme: {str(e)}")

@app.get("/designer/get_user_files/")
async def get_user_files(request: Request):
    """Liste les fichiers de l'utilisateur"""
    session = request.cookies.get("session")
    if not session:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    user = get_user_from_token(session)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide")
    
    user_folder = get_user_folder(user.email)
    try:
        files = []
        for f in os.listdir(user_folder):
            if f.endswith(('.pdf', '.docx')):
                file_path = os.path.join(user_folder, f)
                files.append({
                    'name': f,
                    'size': os.path.getsize(file_path),
                    'modified': os.path.getmtime(file_path)
                })
        return JSONResponse(files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/designer/upload_user_file/")
async def upload_user_file(request: Request, file: UploadFile = File(...)):
    """Upload un fichier dans le dossier de l'utilisateur"""
    session = request.cookies.get("session")
    if not session:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    user = get_user_from_token(session)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide")
    
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Seuls les fichiers PDF et DOCX sont acceptés")
    
    user_folder = get_user_folder(user.email)
    try:
        file_path = os.path.join(user_folder, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        return {"success": True, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/designer/delete_user_file/{filename}")
async def delete_user_file(request: Request, filename: str):
    """Supprime un fichier de l'utilisateur"""
    session = request.cookies.get("session")
    if not session:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    user = get_user_from_token(session)
    if not user:
        raise HTTPException(status_code=401, detail="Session invalide")
    
    user_folder = get_user_folder(user.email)
    file_path = os.path.join(user_folder, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    
    try:
        os.remove(file_path)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route de test
@app.get("/")
async def root():
    return {"message": "Box8 API is running"}

# Point d'entrée pour lancer l'application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
