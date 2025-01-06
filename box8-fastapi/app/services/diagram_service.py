import os
import json
from typing import Dict, List, Optional
from crewai import Agent, Crew, Task, Process
from ..utils.crewai_functions import choose_llm, choose_tool, reset_chroma
from ..utils.pdf_utils import extract_page_text_from_file
import networkx as nx

RED = '\033[31m'
GREEN = '\033[32m'
MAGENTA = '\033[35m'
END = '\033[0m'

def crewai_summarize_if_not_exists(pdf: str, pages: int = 6, history: Optional[str] = None, llm: str = "openai") -> str:
    """
    Récupère ou génère le résumé d'un document PDF.
    
    Args:
        pdf (str): Chemin vers le fichier PDF
        pages (int): Nombre de pages à traiter
        history (Optional[str]): Historique des interactions (non utilisé pour l'instant)
        llm (str): Modèle de langage à utiliser
        
    Returns:
        str: Résumé du document
    """
    txt_path = f"{pdf}.txt"
    if os.path.exists(txt_path):
        try:
            with open(txt_path, "r", encoding="utf-8") as file:
                return file.read()
        except Exception as e:
            print(f"Erreur lors de la lecture du fichier : {e}")
            return crewai_summarize(pdf, pages=pages, history=history, llm=llm)
    else:
        print(f"Le fichier {pdf} n'existe pas, on le génère.")
        return crewai_summarize(pdf, pages=pages, history=history, llm=llm)

def crewai_summarize(pdf: str, pages: int = 6, history: Optional[str] = None, llm: str = "openai") -> str:
    """
    Génère un résumé d'un document PDF en utilisant CrewAI.
    
    Args:
        pdf (str): Chemin vers le fichier PDF
        pages (int): Nombre de pages à traiter
        history (Optional[str]): Historique des interactions (non utilisé pour l'instant)
        llm (str): Modèle de langage à utiliser
        
    Returns:
        str: Résumé généré par CrewAI
    """
    firstpages = extract_page_text_from_file(src=pdf)
    try:
        content = "\n".join(firstpages[:int(pages)])
    except ValueError:
        content = "\n".join(firstpages[:6])

    # Définition des agents
    agents = {
        "title_extractor": Agent(
            name="Extracteur de Titres",
            role="Expert en identification de titres",
            goal="Identifier le titre du document",
            backstory="Un spécialiste dans l'identification rapide de titres et de sujets principaux à partir d'extraits de documents textuels.",
            llm=choose_llm(llm)
        ),
        "author_audience_extractor": Agent(
            name="Extracteur d'Auteurs et de Public Cible",
            role="Expert en analyse d'auteur et de public cible",
            goal="Identifier qui a écrit le document et à qui il est adressé",
            backstory="Un analyste expérimenté capable de déduire l'auteur et le public cible d'un texte en étudiant le style et le contenu.",
            llm=choose_llm(llm)
        ),
        "subject_purpose_extractor": Agent(
            name="Extracteur de Sujets et d'Objectifs",
            role="Expert en analyse de contenu",
            goal="Déterminer le sujet du document et son but",
            backstory="Un expert en compréhension et analyse de texte, capable de résumer les thèmes principaux et les objectifs sous-jacents d'un document.",
            llm=choose_llm(llm)
        )
    }

    # Définition des tâches
    tasks = [
        Task(
            name="Extraction du Titre",
            agent=agents["title_extractor"],
            description=f"À partir du texte suivant, identifie le titre du document :\n{content}",
            expected_output="Le titre du document."
        ),
        Task(
            name="Identification de l'Auteur et du Public Cible",
            agent=agents["author_audience_extractor"],
            description=f"En te basant sur le texte suivant, détermine qui a écrit le document et à quel public il s'adresse :\n{content}",
            expected_output="L'auteur du document et le public cible."
        ),
        Task(
            name="Analyse du Sujet et de l'Objectif",
            agent=agents["subject_purpose_extractor"],
            description=f"Analyse le texte suivant pour déterminer le sujet du document et son objectif :\n{content}",
            expected_output="Le sujet et l'objectif du document avec un titre des sous-titres les informations clés (chiffres conclusions) et structuré au format markdown."
        )
    ]

    # Création et exécution de l'équipe
    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks
    )

    result = crew.kickoff()
    return result.raw

def generate_diagram_from_description(description: str, name: str = "Nouveau Diagramme") -> Dict:
    """
    Génère un diagramme à partir d'une description textuelle en utilisant CrewAI
    """
    production = True
    if production:
        # Créer l'agent expert en conception de diagrammes
        diagram_expert = Agent(
            role='Expert en Conception de Diagrammes',
            goal='Créer un diagramme complet et bien structuré à partir de descriptions textuelles',
            backstory="""Vous êtes un expert dans la création de diagrammes qui représentent des workflows complexes. 
            Vous excellez dans l'identification des agents clés, leurs rôles et les relations entre eux.""",
            verbose=True,
            allow_delegation=False
        )

        # Créer l'agent expert en analyse de texte
        text_analyst = Agent(
            role='Expert en Analyse de Texte',
            goal='Extraire les composants clés et les relations à partir de descriptions textuelles',
            backstory="""Vous êtes spécialisé dans l'analyse de texte pour identifier les entités importantes, 
            leurs caractéristiques et la façon dont elles interagissent entre elles.""",
            verbose=True,
            allow_delegation=False
        )

        # Définir les tâches
        analyze_text = Task(
            description=f"""Analysez la description suivante et identifiez :
            1. Les agents/acteurs clés
            2. Leurs rôles et responsabilités
            3. Les relations et interactions entre eux
            
            Description : {description}
            
            Fournissez votre analyse dans un format structuré qui peut être utilisé pour créer un workflow avec CrewAI.""",
            agent=text_analyst,
            expected_output="""Une analyse structurée du texte contenant :
            1. Liste des agents identifiés avec leurs rôles
            2. Liste des tâches/relations entre les agents
            3. Toute information supplémentaire pertinente pour la création du workflow"""
        )

        create_diagram = Task(
            description=f"""À partir de l'analyse du workflow, créez une structure de diagramme avec :
            1. Des nœuds représentant les agents avec leurs propriétés
            2. Des liens représentant les tâches/relations entre les agents
            
            La sortie doit être une structure JSON valide suivant ce format :
            {{
                "name": "{name}",
                "description": "{description}",
                "nodes": [
                    {{
                        "key": "identifiant_unique",
                        "type": "agent",
                        "role": "Rôle de l'Agent",
                        "goal": "Objectif de l'Agent",
                        "backstory": "Histoire de l'Agent",
                        "file":""
                    }}
                ],
                "links": [
                    {{
                        "id": "identifiant_unique",
                        "from": "id_noeud_source",
                        "to": "id_noeud_cible",
                        "description": "Description de la Tâche",
                        "expected_output": "Sortie Attendue",
                        "type": "task"
                    }}
                ]
            }}""",
            agent=diagram_expert,
            expected_output="""Une chaîne JSON valide représentant la structure du diagramme avec :
            1. Un tableau de nœuds contenant les définitions des agents
            2. Un tableau de liens contenant les définitions des tâches/relations
            Le JSON doit suivre exactement le format spécifié."""
        )

        # Créer et exécuter le crew
        crew = Crew(
            agents=[text_analyst, diagram_expert],
            tasks=[analyze_text, create_diagram],
            verbose=True
        )

        kickoff = crew.kickoff()
        result = kickoff.raw
    else:
        # Exemple de diagramme de tâches et d'agents
        result = f"""{{
    "name": "{name}",
    "description": "{description}",
    "nodes": [
        {{
        "key": "output",
        "role": "Output",
        "goal": "output",
        "category": "output"
        }},
        {{
        "role": "poete",
        "goal": "écrire des poêmes",
        "backstory": "le poête écrit sur des thèmes variés selon son inspiration du moment ",
        "file": "",
        "key": "1735033913363"
        }}
    ],
    "links": [
        {{
        "from": "1735033913363",
        "to": "output",
        "relationship": "",
        "description": "écrire un sonnet",
        "expected_output": "un sonnet sur un thème au choix du poête"
        }}
    ]
    }}"""

    try:
        # Extraire le JSON de la réponse
        json_str = result.split("```json")[-1].split("```")[0].strip()
        diagram_data = json.loads(json_str)
        
        # Ajouter le nœud output s'il n'existe pas déjà
        has_output = False
        for node in diagram_data["nodes"]:
            if node["key"] == "output":
                has_output = True
                break
        
        if not has_output:
            output_node = {
                "key": "output",
                "type": "output",
                "role": "Output",
                "goal": "Collect and format the final output",
                "backstory": "I am responsible for collecting and formatting the final output of the process",
                "file": ""
            }
            diagram_data["nodes"].append(output_node)

            # Ajouter des liens vers le nœud output pour tous les nœuds qui n'ont pas de liens sortants
            nodes_with_outgoing = set(link["from"] for link in diagram_data["links"])
            for node in diagram_data["nodes"]:
                if node["key"] != "output" and node["key"] not in nodes_with_outgoing:
                    new_link = {
                        "id": f"link_{node['key']}_output",
                        "from": node["key"],
                        "to": "output",
                        "description": "Envoie les résultats à la sortie",
                        "expected_output": "Sortie finale de cet agent",
                        "type": "task"
                    }
                    diagram_data["links"].append(new_link)
        
        # S'assurer que le nom et la description sont présents
        if "name" not in diagram_data:
            diagram_data["name"] = name
        if "description" not in diagram_data:
            diagram_data["description"] = description
        
        return diagram_data
    except Exception as e:
        print(f"Erreur : {str(e)}")
        raise ValueError(f"Échec de la génération du diagramme : {str(e)}")

def execute_process_from_diagram(data: Dict, folder: str, llm: str = "openai") -> Dict:
    """
    Exécute un processus basé sur un diagramme de tâches et d'agents.
    
    Args:
        data (Dict): Données JSON décrivant les nœuds et les liens du diagramme
        folder (str): Répertoire contenant les fichiers associés aux agents
        llm (str): Modèle de langage à utiliser
        
    Returns:
        Dict: Résultat de l'exécution du processus
    """
    print(llm)
    reset_chroma()

    try:
        nodes = {node['key']: node for node in data['nodes']}
        links = data['links']
        agents_dict = {}
        all_results = []

        # Initialiser les agents
        for node in data['nodes']:
            agents_dict[node['key']] = Agent(
                role=node.get('role', ''),
                goal=node.get('goal', ''),
                backstory=node.get('backstory', ''),
                llm=choose_llm(llm)
            )
            
            if file := node.get('file', ''):
                src = os.path.join(folder, file)
                if os.path.exists(src):
                    agents_dict[node['key']].tools = [choose_tool(src=src)]
                    backstory = crewai_summarize_if_not_exists(pdf=src, llm=llm)
                    agents_dict[node['key']].backstory += f"\n\nContexte du fichier {file} :\n{backstory}"
                else:
                    print(f"Le fichier {file} n'existe pas.")

        # Construire le graphe des tâches
        task_graph = nx.DiGraph()
        for link in links:
            task_graph.add_edge(
                link['from'],
                link['to'],
                description=link.get('description', 'Effectuer une tâche'),
                expected_output=link.get('expected_output', '')
            )

        # Effectuer un tri topologique
        try:
            task_order = list(nx.topological_sort(task_graph))
        except nx.NetworkXUnfeasible:
            return {
                'status': 'error',
                'message': 'Le graphe contient des cycles, impossible de déterminer un ordre des tâches.'
            }

        roots = [node for node in task_graph.nodes if task_graph.in_degree(node) == 0]

        # Exécuter les tâches
        for node_key in task_order:
            current_node = nodes[node_key]
            outgoing_links = task_graph.out_edges(node_key, data=True)

            for from_key, to_key, link_data in outgoing_links:
                from_agent = agents_dict[from_key]
                to_agent = agents_dict[to_key]

                task = Task(
                    description=link_data['description'],
                    agent=from_agent,
                    expected_output=link_data.get('expected_output', ''),
                    tools=from_agent.tools
                )

                try:
                    crew = Crew(agents=[from_agent], tasks=[task])
                    print(f"{MAGENTA}KICKOFF FOR TASK DESCRIPTION{END} : \n{RED}{task.description}{END}")
                    print(f"{MAGENTA}EXPECTED OUTPUT{END} : \n{RED}{task.expected_output}{END}")
                    
                    kickoff = crew.kickoff()
                    result = (
                        f"\n\n***\n\n"
                        f"\n\n## {task.output.agent}\n\n"
                        f"\n\n### {task.output.description}\n\n"
                        f"\n\n{task.output.raw}\n\n"
                    )
                    
                    to_agent.backstory += f"\n\nRésultat de {from_agent.role} : {task.output.raw}"
                    all_results.append(result)
                    
                    print(f"RESULT : \n\n{MAGENTA}{result}{END}")
                    print(f"FROM BACKSTORY : \n\n{GREEN}{from_agent.backstory}{END}")
                    print(f"TO BACKSTORY : \n\n{GREEN}{to_agent.backstory}{END}")

                except Exception as e:
                    print(f"Erreur lors de l'exécution de la tâche : {str(e)}")

        return {
            'status': 'success',
            'message': "\n".join(all_results),
            'branches_count': len(roots)
        }

    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }
