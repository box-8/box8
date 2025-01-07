import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { marked } from 'marked';
import { downloadAsWord } from '../utils/documentUtils';
import '../styles/markdown.css';

const ResponseModal = ({ show, handleClose, message, diagramName = 'response' }) => {
  // Configuration de marked pour une meilleure sécurité
  marked.setOptions({
    breaks: true, // Convertit les retours à la ligne en <br>
    gfm: true, // GitHub Flavored Markdown
    sanitize: true // Nettoie le HTML dangereux
  });

  // Conversion du markdown en HTML
  const createMarkup = () => {
    return { __html: marked(message || '') };
  };

  // Fonction pour télécharger le contenu en Word
  const handleDownload = () => {
    if (message) {
      const fileName = `${diagramName.replace(/\.json$/, '')}-response`;
      downloadAsWord(message, fileName);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title>CrewAI Process Response</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={createMarkup()}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={handleDownload}
          disabled={!message}
        >
          Download as Word
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResponseModal;
