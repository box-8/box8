import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import '../styles/LoadingModal.css';

const LoadingModal = ({ show }) => {
  return (
    <Modal
      show={show}
      backdrop={false}
      className="loading-modal"
      dialogClassName="loading-modal"
      contentClassName="loading-modal"
      animation={true}
      onHide={() => {}}
    >
      <Modal.Body className="text-center p-3">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-2 mb-0">Flux CrewAI en cours...</p>
      </Modal.Body>
    </Modal>
  );
};

export default LoadingModal;
