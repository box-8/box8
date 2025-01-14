import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';

const AgentModal = ({ show, onHide, onAdd, onUpdate, onDelete, onSave, selectedNode }) => {
  const [formData, setFormData] = useState({
    key: '',
    role: '',
    goal: '',
    backstory: '',
    file: '',
    summarize: 'Yes',
    rag: 'No'
  });
  const [sharePointFiles, setSharePointFiles] = useState({ files: [] });
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    if (show) {
      // Charger la liste des fichiers de l'utilisateur
      fetch('http://localhost:8000/designer/get_user_files/', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          setSharePointFiles({ files: data });
        })
        .catch(error => {
          console.error('Erreur lors du chargement des fichiers:', error);
        });
    }
  }, [show]);

  useEffect(() => {
    if (selectedNode) {
      // Si un fichier est déjà associé, on le conserve
      const currentFile = selectedNode.data.file || '';
      setFormData({
        key: selectedNode.id,
        ...selectedNode.data,
        file: currentFile,
        summarize: selectedNode.data.summarize ?? 'Yes',
        rag: selectedNode.data.rag ?? 'No'
      });
      setSelectedFile(currentFile);
    } else {
      setFormData({
        key: `agent-${Date.now()}`,
        role: '',
        goal: '',
        backstory: '',
        file: '',
        summarize: 'Yes',
        rag: 'No'
      });
    }
  }, [selectedNode, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedNode) {
      onUpdate(formData);
    } else {
      onAdd({
        ...formData,
        key: formData.key || `agent-${Date.now()}`
      });
    }
    onHide();
    // Reset form
    setFormData({
      key: `agent-${Date.now()}`,
      role: '',
      goal: '',
      backstory: '',
      file: '',
      summarize: 'Yes',
      rag: 'No'
    });
  };

  const handleDelete = () => {
    onDelete(formData.key);
    onHide();
  };

  const handleSave = () => {
    const updatedData = {
      id: selectedNode.id,
      type: selectedNode.type,
      position: selectedNode.position,
      data: {
        label: formData.role,
        name: formData.name,
        role: formData.role,
        goals: formData.goals,
        backstory: formData.backstory,
        allowedTools: formData.allowedTools,
        file: selectedFile,
        summarize: formData.summarize ?? 'Yes',
        rag: formData.rag ?? 'No'
      }
    };
    onSave(updatedData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>{selectedNode ? 'Edit Agent' : 'Add Agent'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="agent" className="mb-3">
          <Tab eventKey="agent" title="Agent">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Goal</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Backstory</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.backstory}
                  onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Tab>
          <Tab eventKey="file" title="Fichier source">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Sélection du fichier</Form.Label>
                <Form.Select
                  value={selectedFile}
                  onChange={(e) => {
                    const newFile = e.target.value;
                    setSelectedFile(newFile);
                    setFormData(prev => ({
                      ...prev,
                      file: newFile
                    }));
                  }}
                >
                  <option value="">Sélectionner un fichier</option>
                  {sharePointFiles.files && sharePointFiles.files.map((file, index) => (
                    <option key={index} value={file.name}>
                      {file.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Utiliser le résumé du fichier</Form.Label>
                <div className="d-flex gap-2">
                  <Button
                    variant={formData.summarize === 'No' ? 'primary' : 'outline-primary'}
                    onClick={() => setFormData({ ...formData, summarize: 'No' })}
                  >
                    Non
                  </Button>
                  <Button
                    variant={formData.summarize === 'Yes' ? 'primary' : 'outline-primary'}
                    onClick={() => setFormData({ ...formData, summarize: 'Yes' })}
                  >
                    Oui
                  </Button>
                  <Button
                    variant={formData.summarize === 'Force' ? 'primary' : 'outline-primary'}
                    onClick={() => setFormData({ ...formData, summarize: 'Force' })}
                  >
                    Oui avec génération forcée
                  </Button>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Utiliser RAG sur le fichier</Form.Label>
                <div className="d-flex gap-2">
                  <Button
                    variant={formData.rag === 'Yes' ? 'success' : 'outline-secondary'}
                    onClick={() => setFormData({ ...formData, rag: 'Yes' })}
                  >
                    Oui
                  </Button>
                  <Button
                    variant={formData.rag === 'No' ? 'danger' : 'outline-secondary'}
                    onClick={() => setFormData({ ...formData, rag: 'No' })}
                  >
                    Non
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Tab>
        </Tabs>
        <div className="d-flex gap-2 mt-3">
          <Button type="button" variant="primary" onClick={handleSubmit}>
            {selectedNode ? 'Update' : 'Add'} Agent
          </Button>
          {selectedNode && (
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}
          {selectedNode && (
            <Button variant="secondary" onClick={handleSave}>
              Save
            </Button>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AgentModal;
