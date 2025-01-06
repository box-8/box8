import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const DiagramModal = ({ show, handleClose, onSave, initialData = {} }) => {
  const [diagramName, setDiagramName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (show && initialData) {
      setDiagramName(initialData.name || '');
      if (!description) {
        setDescription(initialData.description || '');
      }
    }
  }, [show, initialData]);

  const handleSave = () => {
    const diagramData = {
      name: diagramName,
      description: description,
    };
    onSave(diagramData);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData.id ? 'Modifier le Diagramme' : 'Nouveau Diagramme'}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nom du diagramme</Form.Label>
            <Form.Control
              type="text"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              placeholder="Entrez le nom du diagramme"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le but et le fonctionnement du diagramme"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={!diagramName.trim()}
        >
          Enregistrer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DiagramModal;
