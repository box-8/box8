import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AgentModal = ({ show, onHide, onAdd, onUpdate, onDelete, onSave, selectedNode }) => {
  const [formData, setFormData] = useState({
    key: '',
    role: '',
    goal: '',
    backstory: '',
    file: ''
  });
  const [sharePointFiles, setSharePointFiles] = useState({ files: [] });
  const [selectedFile, setSelectedFile] = useState('');
  const [error, setError] = useState(null);

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
          setError('Erreur lors du chargement des fichiers');
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
        file: currentFile
      });
      setSelectedFile(currentFile);
    } else {
      setFormData({
        key: `agent-${Date.now()}`,
        role: '',
        goal: '',
        backstory: '',
        file: ''
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
      file: ''
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
        ...selectedNode.data,
        name: formData.name,
        role: formData.role,
        goals: formData.goals,
        backstory: formData.backstory,
        allowedTools: formData.allowedTools,
        file: selectedFile
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
        <Form onSubmit={handleSubmit}>
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
          <Form.Group className="mb-3">
            <Form.Label>Fichier source</Form.Label>
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
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary">
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
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AgentModal;
