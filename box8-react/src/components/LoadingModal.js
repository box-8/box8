import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import '../styles/LoadingModal.css';

const LoadingModal = ({ show }) => {
  return (
    <Modal
      show={show}
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="loading-modal"
    >
      <Modal.Body className="text-center p-4">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-3 mb-0">Flux CrewAI en cours de création ...</p>
      </Modal.Body>
    </Modal>
  );
};

export default LoadingModal;
