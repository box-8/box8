import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import AgentNode from './components/AgentNode';
import OutputNode from './components/OutputNode';
import CustomEdge from './components/CustomEdge';
import AgentModal from './components/AgentModal';
import TaskModal from './components/TaskModal';
import FloatingButtons from './components/FloatingButtons';
import DiagramModal from './components/DiagramModal';
import DiagramModalNew from './components/DiagramModalNew';
import ResponseModal from './components/ResponseModal';
import JsonFilesModal from './components/JsonFilesModal';
import Button from 'react-bootstrap/Button';
import Cookies from 'js-cookie';
import LoginModal from './components/LoginModal';
import UserProfileModal from './components/UserProfileModal';
import LoadingModal from './components/LoadingModal'; // Import the LoadingModal component

const nodeTypes = {
  agent: AgentNode,
  output: OutputNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDiagramModal, setShowDiagramModal] = useState(false);
  const [showNewDiagramModal, setShowNewDiagramModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showJsonFilesModal, setShowJsonFilesModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseTitle, setResponseTitle] = useState('');
  const [backstories, setBackstories] = useState([]);
  const [currentDiagramName, setCurrentDiagramName] = useState('');
  const [currentDiagramDescription, setCurrentDiagramDescription] = useState('');
  const [currentLLM, setCurrentLLM] = useState('openai');
  const [isCreatingCrewAI, setIsCreatingCrewAI] = useState(false);
  const [currentTaskDescription, setCurrentTaskDescription] = useState("");
  const [ws, setWs] = useState(null);
  const { fitView, getNodes, getEdges } = useReactFlow();

  // WebSocket connection management
  useEffect(() => {
    let websocket = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      if (websocket?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }

      websocket = new WebSocket('ws://localhost:8000/ws/diagram');
      
      websocket.onopen = () => {
        console.log('WebSocket Connected');
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'agent_highlight') {
          setNodes((nds) => {
            const newNodes = nds.map((node) => {
              if (node.id === data.agent_id) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    status: data.status
                  }
                };
              }
              return node;
            });
            return newNodes;
          });

          if (data.task_description !== undefined) {
            console.log('Setting task description:', data.task_description);
            setCurrentTaskDescription(data.task_description);
          }
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      websocket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setWs(null);
        
        // Attempt to reconnect after 2 seconds
        reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connectWebSocket();
        }, 2000);
      };
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (websocket) {
        websocket.close();
      }
    };
  }, []); // Empty dependency array since we want this to run once on mount

  // Vérifier l'état de l'authentification au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fonction pour vérifier l'état de l'authentification
  const checkAuthStatus = async () => {
    console.log('Checking auth status...'); // Debug
    setIsAuthLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/check-auth/', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Auth status:', data); // Debug
      if (data.authenticated && data.user) {
        console.log('Setting authenticated state...'); // Debug
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        console.log('Setting unauthenticated state...'); // Debug
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      console.log('Auth check complete, setting loading to false'); // Debug
      setIsAuthLoading(false);
    }
  };

  // Debug des états
  useEffect(() => {
    console.log('Auth states updated:', {
      isAuthLoading,
      isAuthenticated,
      user
    });
  }, [isAuthLoading, isAuthenticated, user]);

  // Gestionnaire de connexion réussie
  const handleLoginSuccess = (data) => {
    console.log('Login success:', data); // Pour le débogage
    if (data.authenticated && data.user) {
      setIsAuthenticated(true);
      setUser(data.user);
    }
    setShowLoginModal(false);
  };

  // Gestionnaire de déconnexion
  const handleLogout = async () => {
    try {
      // Clear client-side state immediately
      setIsAuthenticated(false);
      setUser(null);
      setShowProfileModal(false);

      // Clear any session cookies manually
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Send logout request to server
      const response = await fetch('http://localhost:8000/auth/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Attendre 2 secondes avant de vérifier l'état de l'authentification
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Force a re-check of authentication status
        await checkAuthStatus();
        // Réinitialiser le diagramme
        setNodes([]);
        setEdges([]);
        setCurrentDiagramName('');
        setResponseMessage('');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const onConnect = useCallback((params) => {
    const edge = {
      ...params,
      type: 'custom',
      data: { description: 'New Task' }
    };
    setEdges((eds) => addEdge(edge, eds));
  }, [setEdges]);

  // Gestionnaire de double-clic sur les nœuds
  const onNodeDoubleClick = useCallback((event, node) => {
    if (node.type === 'agent') {
      setSelectedNode(node);
      setShowAgentModal(true);
    }
  }, []);

  // Gestionnaire de double-clic sur les edges
  const onEdgeDoubleClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setShowTaskModal(true);
  }, []);

  const handleAddAgent = (agentData) => {
    const newNode = {
      id: agentData.key,
      type: 'agent',
      data: { 
        ...agentData,
        label: agentData.role,
        summarize: agentData.summarize ?? 'Yes',
        rag: agentData.rag ?? 'No'
      },
      position: { 
        x: Math.random() * 500, 
        y: Math.random() * 500 
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleUpdateAgent = (agentData) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === agentData.key 
          ? { ...node, data: { ...agentData, label: agentData.role, summarize: agentData.summarize ?? 'Yes', rag: agentData.rag ?? 'No' } }
          : node
      )
    );
  };

  const handleDeleteAgent = (agentKey) => {
    setNodes((nds) => nds.filter((node) => node.id !== agentKey));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== agentKey && edge.target !== agentKey
    ));
  };

  const handleUpdateTask = useCallback((taskData) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === taskData.id) {
          return {
            ...edge,
            data: {
              description: taskData.description,
              expected_output: taskData.expectedOutput,
              type: taskData.type
            }
          };
        }
        return edge;
      })
    );
  }, [setEdges]);

  const handleAddTask = useCallback((taskData) => {
    const newEdge = {
      id: taskData.id,
      source: taskData.from,
      target: taskData.to,
      type: 'custom',
      data: {
        description: taskData.description,
        expected_output: taskData.expectedOutput,
        type: taskData.type
      }
    };
    setEdges((eds) => [...eds, newEdge]);
  }, [setEdges]);

  const handleDeleteTask = (taskId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== taskId));
  };

  const handleLoadDiagram = useCallback((diagramData, fileName) => {
    console.log('Diagram Data:', diagramData);
    console.log('File Name:', fileName);
    
    setCurrentDiagramName(fileName);
    if (diagramData.description) {
      setCurrentDiagramDescription(diagramData.description);
    }
    
    if (diagramData.nodes && diagramData.links) {
      console.log('Nodes:', diagramData.nodes);
      console.log('Links:', diagramData.links);
      
      // Ajouter la valeur par défaut pour summarize et rag si non définie
      diagramData.nodes = diagramData.nodes.map(node => ({
        ...node,
        summarize: node.summarize ?? 'Yes',
        rag: node.rag ?? 'No'
      }));
      
      // Créer un graphe pour analyser les relations
      const graph = {};
      const incomingEdges = {};
      diagramData.nodes.forEach(node => {
        graph[node.key] = [];
        incomingEdges[node.key] = 0;
      });

      // Construire le graphe et compter les arêtes entrantes
      diagramData.links.forEach(link => {
        if (graph[link.from]) {
          graph[link.from].push(link.to);
          incomingEdges[link.to] = (incomingEdges[link.to] || 0) + 1;
        }
      });

      // Trouver les nœuds de départ (sans arêtes entrantes)
      const startNodes = Object.keys(incomingEdges).filter(
        node => (incomingEdges[node] === 0 || !incomingEdges[node]) && node !== 'output'
      );

      // Organiser les nœuds en niveaux
      const levels = [];
      const visited = new Set();
      let currentLevel = [...startNodes];

      // Si aucun nœud de départ n'est trouvé, commencer avec tous les nœuds sauf output
      if (currentLevel.length === 0) {
        currentLevel = diagramData.nodes
          .map(node => node.key)
          .filter(key => key !== 'output');
      }

      while (currentLevel.length > 0) {
        levels.push([...currentLevel]);
        currentLevel.forEach(node => visited.add(node));
        
        // Trouver les nœuds du prochain niveau
        const nextLevel = new Set();
        currentLevel.forEach(node => {
          if (graph[node]) {
            graph[node].forEach(neighbor => {
              if (!visited.has(neighbor) && neighbor !== 'output') {
                nextLevel.add(neighbor);
              }
            });
          }
        });
        currentLevel = Array.from(nextLevel);
      }

      // Ajouter le nœud output au dernier niveau
      if (diagramData.nodes.find(node => node.key === 'output')) {
        levels.push(['output']);
      }

      // Calculer les positions en fonction des niveaux
      const nodeSpacing = {
        x: 350,
        y: 300
      };

      const startY = 150;

      // Créer les nœuds avec leurs positions calculées
      const newNodes = diagramData.nodes.map(node => {
        // Trouver le niveau du nœud
        let levelIndex = levels.findIndex(level => level.includes(node.key));
        let positionInLevel = 0;
        let totalNodesInLevel = 1;

        // Si le nœud n'est pas trouvé dans les niveaux (cas impossible normalement)
        if (levelIndex === -1) {
          levelIndex = levels.length - 1;
          levels[levelIndex] = levels[levelIndex] || [];
          levels[levelIndex].push(node.key);
        }

        positionInLevel = levels[levelIndex].indexOf(node.key);
        totalNodesInLevel = levels[levelIndex].length;

        // Calculer la position x pour centrer les nœuds du niveau
        const levelWidth = totalNodesInLevel * nodeSpacing.x;
        // Assurer un espace minimum sur les côtés
        const minSideSpace = 200;
        const availableWidth = window.innerWidth - (2 * minSideSpace);
        const levelStartX = minSideSpace + (Math.max(0, availableWidth - levelWidth) / 2);

        // Décaler légèrement les nœuds des niveaux pairs pour un meilleur agencement
        const horizontalOffset = levelIndex % 2 === 0 ? nodeSpacing.x / 4 : 0;

        const position = {
          x: levelStartX + positionInLevel * nodeSpacing.x + horizontalOffset,
          y: startY + levelIndex * nodeSpacing.y
        };

        const isOutputNode = node.key === 'output' || node.role === 'output';

        return {
          id: node.key,
          type: isOutputNode ? 'output' : 'agent',
          position: position,
          data: {
            label: node.role || 'Output',
            name: node.name || 'Output',
            role: node.role || 'output',
            goal: node.goal || 'Collecte et formate la sortie finale',
            backstory: node.backstory || 'Je suis responsable de collecter et de formater la sortie finale du processus',
            tools: node.tools || [],
            selected: false,
            summarize: node.summarize ?? 'Yes',
            rag: node.rag ?? 'No',
            ...(!isOutputNode && { file: node.file })
          },
          draggable: true,
          connectable: !isOutputNode
        };
      });
      
      const newEdges = diagramData.links.map(edge => {
        console.log('Processing edge:', edge);
        return {
          id: `${edge.from}-${edge.to}`,
          source: edge.from,
          target: edge.to,
          type: 'custom',
          data: {
            label: edge.description,
            description: edge.description,
            expected_output: edge.expected_output,
            relationship: edge.relationship
          }
        };
      });

      console.log('New Nodes:', newNodes);
      console.log('New Edges:', newEdges);
      console.log('Levels:', levels);
      
      setNodes(newNodes);
      setEdges(newEdges);
    } else {
      console.error('Invalid diagram data structure:', diagramData);
    }
  }, [setEdges, setNodes, setCurrentDiagramName, setCurrentDiagramDescription]); // No dependencies needed since we only use setState functions which are stable

  const handleCreateCrewAI = useCallback((chatInput) => {
    setIsCreatingCrewAI(true);
    // Récupérer les données du diagramme
    const diagramData = {
      nodes: nodes.map(node => ({
        key: node.id,
        type: node.type,
        role: node.data.role,
        goal: node.data.goal,
        backstory: node.data.backstory,
        tools: node.data.tools,
        file: node.data.file,
        summarize: node.data.summarize,
        rag: node.data.rag,
        position: node.position
      })),
      links: edges.map(edge => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        description: edge.data?.description,
        expected_output: edge.data?.expected_output,
        relationship: edge.data?.relationship
      })),
      chatInput: chatInput
    };
    
    var csrf = Cookies.get('csrftoken');

    // Envoyer la requête au serveur
    fetch('http://localhost:8000/designer/launch-crewai/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf,
      },
      body: JSON.stringify(diagramData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      if (data.status === 'success') {
        setResponseMessage(data.message);
        setBackstories(data.backstories.map(b => ({
          name: b.role,
          backstory: b.backstory
        })));
        setShowResponseModal(true);
      } else {
        alert('Error creating CrewAI Process: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error creating CrewAI Process: ' + error.message);
    })
    .finally(() => {
      setIsCreatingCrewAI(false);
    });
  }, [nodes, edges]);

  const handleEnhanceDiagram = useCallback((chatInput) => {
    setIsCreatingCrewAI(true);
    // Récupérer les données du diagramme
    const diagramData = {
      nodes: nodes.map(node => ({
        key: node.id,
        type: node.type,
        role: node.data.role,
        goal: node.data.goal,
        backstory: node.data.backstory,
        tools: node.data.tools,
        file: node.data.file,
        summarize: node.data.summarize,
        rag: node.data.rag,
        position: node.position
      })),
      links: edges.map(edge => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        description: edge.data?.description,
        expected_output: edge.data?.expected_output,
        relationship: edge.data?.relationship
      })),
      chatInput: chatInput
    };
    
    var csrf = Cookies.get('csrftoken');

    // Envoyer la requête au serveur
    fetch('http://localhost:8000/designer/enhance-diagram/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf,
      },
      body: JSON.stringify(diagramData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(enhancedDiagram => {
      console.log('Enhanced diagram data:', enhancedDiagram);
      if (enhancedDiagram.nodes && enhancedDiagram.links) {
        // Créer les nouveaux nœuds
        const newNodes = enhancedDiagram.nodes.map(node => {
          const isOutputNode = node.key === 'output' || node.role === 'output';
          return {
            id: node.key,
            type: isOutputNode ? 'output' : 'agent',
            position: node.position || { x: Math.random() * 500, y: Math.random() * 500 },
            data: {
              label: node.role || 'Output',
              name: node.name || 'Output',
              role: node.role || 'output',
              goal: node.goal || 'Collecte et formate la sortie finale',
              backstory: node.backstory || 'Je suis responsable de collecter et de formater la sortie finale du processus',
              tools: node.tools || [],
              selected: false,
              summarize: node.summarize ?? 'Yes',
              rag: node.rag ?? 'No',
              ...(!isOutputNode && { file: node.file })
            },
            draggable: true,
            connectable: !isOutputNode
          };
        });

        // Créer les nouveaux liens
        const newEdges = enhancedDiagram.links.map(edge => ({
          id: edge.id || `${edge.from}-${edge.to}`,
          source: edge.from,
          target: edge.to,
          type: 'custom',
          data: {
            label: edge.description,
            description: edge.description,
            expected_output: edge.expected_output,
            relationship: edge.relationship
          }
        }));

        // Mettre à jour le diagramme
        setNodes(newNodes);
        setEdges(newEdges);
      } else {
        throw new Error('Invalid diagram structure in response');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error enhancing diagram: ' + error.message);
    })
    .finally(() => {
      setIsCreatingCrewAI(false);
    });
  }, [nodes, edges, setNodes, setEdges]);

  const handleNewDiagram = useCallback(() => {
    setShowNewDiagramModal(true);
  }, []);

  const handleSaveNewDiagram = (data) => {
    // Réinitialiser le diagramme avec seulement le nœud Output
    const outputNode = {
      id: 'output',
      type: 'output',
      data: { 
        label: 'Output',
        name: 'Output',
        role: 'output',
        goal: 'Collecte et formate la sortie finale',
        backstory: 'Je suis responsable de collecter et de formater la sortie finale du processus',
        tools: [],
        selected: false
      },
      position: { x: 250, y: 250 },
    };
    setNodes([outputNode]);
    setEdges([]);
    setCurrentDiagramName(data.name);
    setCurrentDiagramDescription(data.description || '');
    setShowNewDiagramModal(false);
  };

  const handleSaveDiagram = async (diagramData) => {
    try {
      // S'assurer que le nom du fichier a l'extension .json
      const fileName = diagramData.name.endsWith('.json')
        ? diagramData.name
        : `${diagramData.name}.json`;

      // Préparer les données du diagramme
      const nodes = getNodes().map(node => ({
        key: node.id,
        type: node.type,
        role: node.data.role,
        goal: node.data.goal,
        backstory: node.data.backstory,
        tools: node.data.tools,
        file: node.data.file,
        summarize: node.data.summarize,
        rag: node.data.rag,
        position: node.position
      }));

      const edges = getEdges().map(edge => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        description: edge.data?.description,
        expected_output: edge.data?.expected_output,
        relationship: edge.data?.relationship
      }));

      const diagramJson = {
        name: diagramData.name,
        description: diagramData.description,
        nodes: nodes,
        links: edges
      };

      const response = await fetch('http://localhost:8000/designer/save-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: fileName,
          diagram: JSON.stringify(diagramJson)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erreur lors de la sauvegarde');
      }

      setCurrentDiagramName(fileName);
      setCurrentDiagramDescription(diagramData.description);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error.message);
    }
  };

  const handleDeleteDiagram = async () => {
    try {
      setNodes([]);
      setEdges([]);
      setCurrentDiagramName('');
      setCurrentDiagramDescription('');
      setShowDiagramModal(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du diagramme:', error);
      alert(error.message);
    }
  };

  // Fonction pour rafraîchir le diagramme actuel
  const handleRefreshDiagram = useCallback(() => {
    if (!currentDiagramName) return;

    fetch(`http://localhost:8000/designer/get-diagram/${currentDiagramName}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        // Nettoyage des liaisons invalides
        if (data.nodes && data.links) {
          // Créer un ensemble des clés de nœuds valides
          const validNodeKeys = new Set(data.nodes.map(node => node.key));
          
          // Filtrer les liaisons pour ne garder que celles avec des nœuds valides
          data.links = data.links.filter(link => 
            validNodeKeys.has(link.from) && validNodeKeys.has(link.to)
          );
        }

        handleLoadDiagram(data, currentDiagramName);
        // Ajout du fitView après un court délai pour laisser le temps au diagramme de se charger
        setTimeout(() => {
          fitView({ padding: 0.2 });
        }, 100);
      })
      .catch(error => console.error('Error refreshing diagram:', error));
  }, [currentDiagramName, handleLoadDiagram, fitView]);

  // Gestionnaire de sélection des nœuds
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null); // Désélectionner l'edge si un nœud est sélectionné
    // Mettre à jour les données des nœuds pour refléter la sélection
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selected: n.id === node.id
        }
      }))
    );
  }, [setNodes]);

  // Gestionnaire de sélection des edges
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null); // Désélectionner le nœud si un edge est sélectionné
  }, []);

  // Gestionnaire de désélection
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    // Réinitialiser la sélection de tous les nœuds
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selected: false
        }
      }))
    );
  }, [setNodes]);

  // Gestionnaire d'appui sur les touches
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      // Ne pas traiter les touches si une modale est ouverte
      if (showAgentModal || showTaskModal || showDiagramModal || showNewDiagramModal || showJsonFilesModal || showResponseModal) {
        return;
      }

      if (key === 'Delete' || key === 'Backspace') {
        if (selectedNode && selectedNode.id !== 'output') { // Empêcher la suppression du nœud output
          setNodes((nodes) => nodes.filter((n) => n.id !== selectedNode.id));
          // Supprimer également les edges connectés au nœud
          setEdges((edges) => edges.filter((e) => 
            e.source !== selectedNode.id && e.target !== selectedNode.id
          ));
          setSelectedNode(null);
        }
        if (selectedEdge) {
          setEdges((edges) => edges.filter((e) => e.id !== selectedEdge.id));
          setSelectedEdge(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, showAgentModal, showTaskModal, showDiagramModal, showNewDiagramModal, showJsonFilesModal, showResponseModal, selectedNode, selectedEdge, setNodes, setEdges]);

  // Effet pour le chargement initial du diagramme
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 100);
    }
  }, [nodes, fitView]);

  // Fonction pour mettre à jour le LLM courant
  const updateCurrentLLM = (llm) => {
    setCurrentLLM(llm);
  };

  // Intercepteur global pour les réponses 401
  useEffect(() => {
    const interceptor = async (response) => {
      if (response.status === 401) {
        // Vérifier si la session est réellement expirée
        try {
          const authCheck = await fetch('http://localhost:8000/auth/check-auth/', {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          
          if (!authCheck.ok || !(await authCheck.json()).authenticated) {
            console.log('Session expirée confirmée, déconnexion automatique');
            await handleLogout();
            return null;
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de session:', error);
          return response; // En cas d'erreur, on laisse passer la réponse originale
        }
      }
      return response;
    };

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      return interceptor(response);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Charger le LLM actuel au démarrage
  useEffect(() => {
    const fetchCurrentLLM = async () => {
      try {
        const response = await fetch('http://localhost:8000/designer/get-llms', {
          credentials: 'include'
        });
        const data = await response.json();
        updateCurrentLLM(data.current);
      } catch (error) {
        console.error('Error fetching current LLM:', error);
      }
    };

    fetchCurrentLLM();
  }, []);

  const handleImportDiagram = useCallback((diagramData, fileName) => {
    console.log('Importing Diagram Data:', diagramData);
    
    if (diagramData.nodes && diagramData.links) {
      // Récupérer les positions maximales actuelles
      const currentNodes = getNodes();
      let maxX = 0;
      let maxY = 0;
      
      currentNodes.forEach(node => {
        maxX = Math.max(maxX, node.position.x);
        maxY = Math.max(maxY, node.position.y);
      });
      
      // Ajouter un décalage pour le nouveau diagramme
      const offsetX = maxX + 400; // 400px de décalage horizontal
      
      // Créer les nouveaux nœuds avec un décalage
      const importedNodes = diagramData.nodes
        .filter(node => node.key !== 'output' && node.role !== 'output') // Exclure le nœud output du diagramme importé
        .map(node => ({
          id: `imported_${node.key}`,
          type: 'agent',
          position: {
            x: offsetX + (node.position?.x || Math.random() * 500),
            y: (node.position?.y || Math.random() * 500)
          },
          data: {
            label: node.role,
            name: node.name,
            role: node.role,
            goal: node.goal,
            backstory: node.backstory,
            tools: node.tools || [],
            selected: false,
            summarize: node.summarize ?? 'Yes',
            rag: node.rag ?? 'No',
            file: node.file
          },
          draggable: true,
          connectable: true
        }));
      
      // Créer les nouvelles connexions avec les IDs mis à jour
      const importedEdges = diagramData.links
        .map(edge => {
          // Si la connexion va vers output, connecter au nœud output existant
          const targetNode = edge.to === 'output' ? 'output' : `imported_${edge.to}`;
          // Si la connexion vient de output, ignorer cette connexion
          if (edge.from === 'output') return null;
          
          return {
            id: `imported_${edge.from}-${targetNode}`,
            source: `imported_${edge.from}`,
            target: targetNode,
            type: 'custom',
            data: {
              label: edge.description,
              description: edge.description,
              expected_output: edge.expected_output,
              relationship: edge.relationship
            }
          };
        })
        .filter(edge => edge !== null); // Filtrer les connexions nulles

      // Ajouter les nouveaux nœuds et connexions aux existants
      setNodes(nds => [...nds, ...importedNodes]);
      setEdges(eds => [...eds, ...importedEdges]);
      
      // Ajuster la vue pour montrer tous les nœuds
      setTimeout(() => {
        if (fitView) {
          fitView({ padding: 0.2 });
        }
      }, 100);
    }
  }, [getNodes, setNodes, setEdges, fitView]);

  // Écouteur pour l'événement showResponse
  useEffect(() => {
    const handleShowResponse = (event) => {
      console.log('Received showResponse event:', event.detail);
      setResponseTitle(event.detail.title);
      setResponseMessage(event.detail.content);
      setShowResponseModal(true);
    };

    window.addEventListener('showResponse', handleShowResponse);
    return () => window.removeEventListener('showResponse', handleShowResponse);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff' }}>
      {!isAuthLoading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 999,
          padding: '5px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {isAuthLoading ? (
            <Button variant="outline-secondary" disabled>
              Chargement...
            </Button>
          ) : (
            <Button 
              variant={isAuthenticated ? "dark" : "primary"}
              onClick={() => isAuthenticated ? setShowProfileModal(true) : setShowLoginModal(true)}
              style={{ 
                minWidth: '120px',
                fontWeight: '500'
              }}
            >
              {isAuthenticated && user ? user.username : 'Se connecter'}
            </Button>
          )}
        </div>
      )}
      {currentDiagramName && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '5px 10px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {currentDiagramName} ({currentLLM})
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        deleteKeyCode={null}
        style={{ background: '#ffffff' }}
      >
        <Background />
        <Controls />
      </ReactFlow>

      <FloatingButtons 
        onAddAgent={() => setShowAgentModal(true)}
        onAddTask={() => setShowTaskModal(true)}
        onCreateCrewAI={handleCreateCrewAI}
        onEnhanceDiagram={handleEnhanceDiagram}
        onSaveDiagram={() => setShowDiagramModal(true)}
        onLoadDiagram={() => setShowJsonFilesModal(true)}
        onNewDiagram={handleNewDiagram}
        onRefreshDiagram={handleRefreshDiagram}
        onShowResponse={() => setShowResponseModal(true)}
        hasDiagram={nodes.length > 0}
        currentDiagramName={currentDiagramName}
        hasResponse={responseMessage !== ''}
        isAuthenticated={isAuthenticated}
        isLoading={isCreatingCrewAI}
      />

      <AgentModal
        show={showAgentModal}
        onHide={() => {
          setShowAgentModal(false);
          setSelectedNode(null);
        }}
        onAdd={handleAddAgent}
        onUpdate={handleUpdateAgent}
        onDelete={handleDeleteAgent}
        selectedNode={selectedNode}
      />

      <TaskModal
        show={showTaskModal}
        onHide={() => {
          setShowTaskModal(false);
          setSelectedEdge(null);
        }}
        onAdd={handleAddTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        selectedEdge={selectedEdge}
        nodes={nodes}
      />

      <DiagramModal
        show={showDiagramModal}
        handleClose={() => setShowDiagramModal(false)}
        onSave={handleSaveDiagram}
        onDelete={handleDeleteDiagram}
        onRefresh={handleRefreshDiagram}
        initialData={{
          name: currentDiagramName,
          description: currentDiagramDescription
        }}
      />

      <DiagramModalNew
        show={showNewDiagramModal}
        handleClose={() => setShowNewDiagramModal(false)}
        onSave={handleSaveNewDiagram}
        handleLoadDiagram={handleLoadDiagram}
      />

      <ResponseModal
        show={showResponseModal}
        handleClose={() => setShowResponseModal(false)}
        message={responseMessage}
        title={responseTitle}
        backstories={backstories}
        diagramName={currentDiagramName}
      />

      <JsonFilesModal
        show={showJsonFilesModal}
        handleClose={() => setShowJsonFilesModal(false)}
        onFileSelect={handleLoadDiagram}
        onImportDiagram={handleImportDiagram}
        onNewDiagram={handleNewDiagram}
        reactFlowInstance={{ fitView }}
        hasCurrentDiagram={nodes.length > 1} // On vérifie s'il y a plus d'un nœud (car le nœud output est toujours présent)
      />

      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <UserProfileModal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        user={user}
        onLogout={handleLogout}
        onLLMChange={updateCurrentLLM}
      />

      <LoadingModal 
        show={isCreatingCrewAI} 
        taskDescription={currentTaskDescription} 
      />
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default App;
