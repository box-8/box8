import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

const JsonFilesModal = ({ show, handleClose, onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);

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
      // Charger la liste des fichiers quand le modal s'ouvre
      fetch('http://localhost:8000/designer/list-json-files', fetchOptions)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setFiles(data || []);
        })
        .catch(error => console.error('Error loading files:', error));
    }
  }, [show]);

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

  const handleLoadDiagram = () => {
    if (fileContent) {
      console.log(fileContent);
      onFileSelect(fileContent, selectedFile);
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Load Diagram</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflow: 'hidden' }}>
        <div className="row" style={{ height: '60vh' }}>
          <div className="col-md-6" style={{ height: '100%', overflowY: 'auto' }}>
            <h5>Available Diagrams</h5>
            <ListGroup style={{ height: 'calc(100% - 40px)', overflowY: 'auto' }}>
              {files.map((file, index) => (
                <ListGroup.Item
                  key={index}
                  action
                  active={selectedFile === file}
                  onClick={() => handleFileClick(file)}
                >
                  {file}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
          <div className="col-md-6" style={{ height: '100%', overflowY: 'auto' }}>
            <h5>Preview</h5>
            <div style={{ 
              height: 'calc(100% - 40px)',
              overflowY: 'auto',
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px'
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
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleLoadDiagram}
          disabled={!fileContent}
        >
          Load Diagram
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JsonFilesModal;
