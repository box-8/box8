import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ResponseModal = ({ show, handleClose, message }) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>CrewAI Process Response</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {message}
        </pre>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResponseModal;
