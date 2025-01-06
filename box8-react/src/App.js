import React, { useState, useCallback, useEffect, useRef } from 'react';
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

const nodeTypes = {
  agent: AgentNode,
  output: OutputNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes = [
  {
    id: 'output',
    type: 'output',
    data: { 
      label: 'Output',
      name: 'Output',
      role: 'output',
      goal: 'Collect and format the final output',
      backstory: 'I am responsible for collecting and formatting the final output of the process',
      tools: [],
      selected: false
    },
    position: { x: 250, y: 250 },
    draggable: true,
    connectable: false,
  }
];

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
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
  const [diagramData, setDiagramData] = useState({ name: '', description: '' });
  const [currentDiagramName, setCurrentDiagramName] = useState('');
  const [currentDiagramDescription, setCurrentDiagramDescription] = useState('');
  const [isNewDiagram, setIsNewDiagram] = useState(false);
  const { fitView } = useReactFlow();

  // État pour suivre si le diagramme a été chargé initialement
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
      const response = await fetch('http://localhost:8000/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        setShowProfileModal(false);
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
      setSelectedAgent({
        key: node.id,
        ...node.data
      });
      setShowAgentModal(true);
    }
  }, []);

  // Gestionnaire de double-clic sur les edges
  const onEdgeDoubleClick = useCallback((event, edge) => {
    setSelectedTask({
      id: edge.id,
      from: edge.source,
      to: edge.target,
      ...edge.data
    });
    setShowTaskModal(true);
  }, []);

  const handleAddAgent = (agentData) => {
    const newNode = {
      id: agentData.key,
      type: 'agent',
      data: { 
        ...agentData,
        label: agentData.role 
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
          ? { ...node, data: { ...agentData, label: agentData.role } }
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
              expectedOutput: taskData.expectedOutput,
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
        expectedOutput: taskData.expectedOutput,
        type: taskData.type
      }
    };
    setEdges((eds) => [...eds, newEdge]);
  }, [setEdges]);

  const handleDeleteTask = (taskId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== taskId));
  };

  const handleLoadDiagram = (diagramData, fileName) => {
    console.log('Diagram Data:', diagramData);
    setCurrentDiagramName(fileName);
    if (diagramData.nodes && diagramData.links) {
      console.log('Nodes:', diagramData.nodes);
      console.log('Links:', diagramData.links);
      
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
        x: 350, // Augmentation de l'espacement horizontal
        y: 300  // Augmentation de l'espacement vertical
      };

      const startX = 150; // Augmentation de la marge gauche
      const startY = 150; // Augmentation de la marge supérieure

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
            goal: node.goal || 'Collect and format the final output',
            backstory: node.backstory || 'I am responsible for collecting and formatting the final output of the process',
            tools: node.tools || [],
            selected: false,
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
  };

  const handleCreateCrewAI = useCallback(() => {
    // Récupérer les données du diagramme
    const diagramData = {
      nodes: nodes.map(node => ({
        key: node.id,
        ...node.data
      })),
      links: edges.map(edge => ({
        from: edge.source,
        to: edge.target,
        ...edge.data
      }))
    };
    console.log(diagramData);
    var csrf = Cookies.get('csrftoken');

    // return false
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
        setShowResponseModal(true);
      } else {
        alert('Error creating CrewAI Process: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error creating CrewAI Process: ' + error.message);
    });
  }, [nodes, edges]);

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
        goal: 'Collect and format the final output',
        backstory: 'I am responsible for collecting and formatting the final output of the process',
        tools: [],
        selected: false
      },
      position: { x: 250, y: 250 },
    };
    setNodes([outputNode]);
    setEdges([]);
    setDiagramData({
      name: data.name,
      description: data.description
    });
    setCurrentDiagramName(data.name);
    setCurrentDiagramDescription(data.description || '');
    setShowNewDiagramModal(false);
  };

  const handleSaveDiagram = (data) => {
    // Préparer les données du diagramme
    const diagramContent = {
      name: data.name,
      description: data.description || currentDiagramDescription,
      nodes: nodes.map(node => ({
        key: node.id,
        ...node.data
      })),
      links: edges.map(edge => ({
        from: edge.source,
        to: edge.target,
        ...edge.data
      }))
    };

    // Envoyer la requête au serveur
    fetch('http://localhost:8000/designer/save-diagram', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description || currentDiagramDescription,
        diagram: JSON.stringify(diagramContent)
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du diagramme');
      }
      return response.json();
    })
    .then(() => {
      setCurrentDiagramName(data.name);
      setCurrentDiagramDescription(data.description || currentDiagramDescription);
      setShowDiagramModal(false);
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde du diagramme: ' + error.message);
    });
  };

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
  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
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
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  // Ajouter l'écouteur d'événements pour les touches
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  // Effet pour le chargement initial du diagramme
  useEffect(() => {
    if (isInitialLoad && nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2 });
        setIsInitialLoad(false);
      }, 100);
    }
  }, [nodes, isInitialLoad]);

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
          {currentDiagramName}
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
        onSaveDiagram={() => setShowDiagramModal(true)}
        onLoadDiagram={() => setShowJsonFilesModal(true)}
        onCreateCrewAI={handleCreateCrewAI}
        onNewDiagram={handleNewDiagram}
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
        initialData={{ name: currentDiagramName, description: currentDiagramDescription }}
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
      />

      <JsonFilesModal
        show={showJsonFilesModal}
        handleClose={() => setShowJsonFilesModal(false)}
        onFileSelect={handleLoadDiagram}
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
