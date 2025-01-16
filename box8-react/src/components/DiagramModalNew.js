import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import config from '../config';

const DiagramModalNew = ({ show, handleClose, onSave, handleLoadDiagram }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const closeModal = () => {
    setFormData({
      name: '',
      description: ''
    });
    setError('');
    setIsGenerating(false);
    handleClose();
  };

  // Réinitialiser le formulaire à l'ouverture de la modale
  useEffect(() => {
    if (show) {
      setError('');
      setIsGenerating(false);
    }
  }, [show]);

  const handleCreateEmpty = async () => {
    if (!formData.name.trim()) {
      setError('Veuillez entrer un nom pour le diagramme');
      return;
    }

    try {
      // Créer un diagramme vierge avec uniquement le nœud output
      const emptyDiagram = {
        nodes: [
          {
            key: 'output',
            type: 'output',
            role: 'Output',
            goal: 'Nœud de sortie',
            backstory: 'Représente la fin du workflow',
            file: ''
          }
        ],
        links: []
      };

      // Générer le diagramme dans React Flow
      handleLoadDiagram(emptyDiagram, formData.name);


      /*
      // Sauvegarder le diagramme vierge
      const saveResponse = await fetch(`${config.API_URL}/designer/save-diagram`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          diagram: JSON.stringify({
            ...emptyDiagram,
            name: formData.name,
            description: formData.description
          })
        })
      });

      if (!saveResponse.ok) {
        const data = await saveResponse.json();
        throw new Error(data.detail || 'Erreur lors de la sauvegarde du diagramme');
      }
      */

      onSave({
        name: formData.name,
        description: formData.description
      });
      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const generateResponse = await fetch(`${config.API_URL}/designer/generate-diagram`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description
        })
      });

      if (!generateResponse.ok) {
        const data = await generateResponse.json();
        throw new Error(data.detail || 'Erreur lors de la génération du diagramme');
      }

      const diagramData = await generateResponse.json();
      console.log(diagramData);

      // S'assurer que le nom du fichier a l'extension .json
      const fileName = formData.name.endsWith('.json')
        ? formData.name
        : `${formData.name}.json`;

      // Générer le diagramme dans React Flow
      handleLoadDiagram(diagramData, fileName);

      closeModal();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Nouveau Diagramme</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom du diagramme</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Entrez le nom du diagramme"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Description du workflow</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez le workflow que vous souhaitez créer..."
            />
            <Form.Text className="text-muted">
              Décrivez les agents, leurs rôles et les interactions entre eux.
              Le système générera automatiquement un diagramme basé sur votre description.
            </Form.Text>
          </Form.Group>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex justify-content-center gap-2">
              <Button
                variant="outline-primary"
                onClick={handleCreateEmpty}
                className="w-100"
              >
                Créer un diagramme vierge
              </Button>
            </div>

            <div className="text-center">
              <small className="text-muted">- ou -</small>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeModal}>
                Annuler
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Génération en cours...
                  </>
                ) : (
                  'Créer depuis la description'
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DiagramModalNew;
