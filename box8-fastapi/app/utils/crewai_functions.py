import os
from crewai import LLM, Agent, Task, Crew
from crewai_tools import (PDFSearchTool,
                         DOCXSearchTool,
                         TXTSearchTool,
                         CSVSearchTool)
import chromadb
from chromadb.config import Settings

# Configuration globale des LLMs
llm_configs = {
    "hosted": {
        "model": "hosted_vllm/cognitivecomputations/dolphin-2.9-llama3-8b",
        "base_url": "https://7j88lv8yvcrcsm-8000.proxy.runpod.net/v1",
        "api_key": "token-abc123"
    },
    "local": {
        "model": "ollama/gemma2:2b",
        "base_url": "http://localhost:11434"
    },
    "mistral": {
        "model": "mistral/mistral-medium-latest",
        "temperature": 0.2
    },
    "mistral-large": {
        "model": "mistral/mistral-large-latest",
        "temperature": 0.2
    },
    "mistral-8x7b": {
        "model": "mistral/open-mixtral-8x7b",
        "temperature": 0.2
    },
    "mistral-8x22b": {
        "model": "mistral/open-mixtral-8x22b",
        "temperature": 0.2
    },
    "groq": {
        "model": "groq/mixtral-8x7b-32768",
        "temperature": 0.2
    },
    "groq-llama": {
        "model": "groq/llama-3.1-70b-versatile",
        "temperature": 0.2
    },
    "groq-llama3": {
        "model": "groq/llama3-8b-8192",
        "temperature": 0.2
    },
    "openai": {
        "model": "gpt-4",
        "temperature": 0.2
    },
    "claude": {
        "model": "claude-3-5-sonnet-20240620",
        "temperature": 0.2
    }
}

def reset_chroma() -> bool:
    """
    Réinitialise la base de données ChromaDB.
    
    Returns:
        bool: True si la réinitialisation a réussi, False sinon
    """
    path = "db/"
    if os.path.isdir(path):
        client = chromadb.PersistentClient(path=path, settings=Settings(allow_reset=True))
        client.reset()
        state = True
    else:
        state = False
    print(f"Chromadb reset : {state}")
    return state

def choose_llm(name: str = "") -> LLM:
    """
    Sélectionne et configure un modèle de langage en fonction du nom fourni.
    
    Args:
        name (str): Nom du modèle à utiliser
    ollama run gemma2:2b
    Returns:
        LLM: Instance du modèle de langage configuré
    """
    if name == "":
        name = "openai"

    config = llm_configs.get(name, llm_configs["openai"])
    return LLM(**config)

def choose_tool(src: str):
    """
    Sélectionne l'outil approprié en fonction de l'extension du fichier.
    
    Args:
        src (str): Chemin vers le fichier source
        
    Returns:
        Tool: Instance de l'outil approprié pour le type de fichier
    """
    extension = os.path.splitext(src)[1].lower()
    tools = {
        '.pdf': PDFSearchTool,
        '.docx': DOCXSearchTool,
        '.txt': TXTSearchTool,
        '.csv': CSVSearchTool
    }
    
    tool_class = tools.get(extension)
    if tool_class:
        return tool_class(file_path=src)
    else:
        raise ValueError(f"Extension de fichier non prise en charge : {extension}")
