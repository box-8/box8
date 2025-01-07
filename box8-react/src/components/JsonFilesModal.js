import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

const JsonFilesModal = ({ 
  show, 
  handleClose, 
  onFileSelect, 
  onNewDiagram,
  reactFlowInstance 
}) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };

  useEffect(() => {
    if (show) {
      loadFiles();
    }
  }, [show]);

  const loadFiles = () => {
    fetch('http://localhost:8000/designer/list-json-files', fetchOptions)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setFiles(data || []);
      })
      .catch(error => console.error('Error loading files:', error));
  };

  const handleFileClick = (filename) => {
    setSelectedFile(filename);
    // Charger le contenu du fichier sélectionné
    fetch(`http://localhost:8000/designer/get-diagram/${filename}`, fetchOptions)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setFileContent(data);
      })
      .catch(error => console.error('Error loading file content:', error));
  };

  const handleFileDoubleClick = (filename) => {
    handleFileClick(filename);
    // Attendre que le contenu soit chargé avant de fermer le modal
    fetch(`http://localhost:8000/designer/get-diagram/${filename}`, fetchOptions)
      .then(response => response.json())
      .then(data => {
        onFileSelect(data, filename);
        handleClose();
        // Ajout du fitView après un court délai pour laisser le temps au diagramme de se charger
        setTimeout(() => {
          if (reactFlowInstance?.fitView) {
            reactFlowInstance.fitView({ padding: 0.2 });
          }
        }, 100);
      })
      .catch(error => console.error('Error loading file content:', error));
  };

  const handleLoadDiagram = () => {
    if (fileContent) {
      console.log(fileContent);
      onFileSelect(fileContent, selectedFile);
      handleClose();
      // Ajout du fitView après un court délai pour laisser le temps au diagramme de se charger
      setTimeout(() => {
        if (reactFlowInstance?.fitView) {
          reactFlowInstance.fitView({ padding: 0.2 });
        }
      }, 100);
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le diagramme "${selectedFile}" ?`)) {
      setIsDeleting(true);
      try {
        const response = await fetch(`http://localhost:8000/designer/delete-diagram/${selectedFile}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Erreur lors de la suppression du diagramme');
        }

        // Réinitialiser la sélection et recharger la liste
        setSelectedFile(null);
        setFileContent(null);
        loadFiles();
      } catch (error) {
        console.error('Erreur:', error);
        alert(error.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title>Load Diagram</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 'calc(90vh - 200px)', overflow: 'hidden' }}>
        <div className="row" style={{ height: '100%' }}>
          <div className="col-md-6" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Available Diagrams</h5>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleClose();
                  onNewDiagram();
                }}
                title="New Diagram"
              >
                <i className="bi bi-file-earmark-plus"></i> New
              </Button>
            </div>
            <ListGroup 
              style={{ 
                flexGrow: 1,
                overflowY: 'auto',
                maxHeight: '100%',
                marginBottom: '10px'
              }}
            >
              {files.map((file, index) => (
                <ListGroup.Item
                  key={index}
                  action
                  active={selectedFile === file}
                  onClick={() => handleFileClick(file)}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  style={{ cursor: 'pointer' }}
                >
                  {file}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
          <div className="col-md-6" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h5>Preview</h5>
            <div style={{ 
              flexGrow: 1,
              overflowY: 'auto',
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '10px'
            }}>
              {fileContent && (
                <pre style={{ 
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {JSON.stringify(fileContent, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {selectedFile && (
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="me-auto"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer le  diagramme'}
          </Button>
        )}
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleLoadDiagram}
          disabled={!selectedFile}
        >
          Charger le diagramme
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JsonFilesModal;
