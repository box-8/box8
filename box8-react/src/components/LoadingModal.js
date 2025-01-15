import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import '../styles/LoadingModal.css';

const LoadingModal = ({ show, taskDescription }) => {
  return (
    <Modal
      show={show}
      centered
      backdrop={false}
      keyboard={false}
      className="loading-modal"
      style={{ pointerEvents: 'none' }}
    >
      <Modal.Body className="text-center">
        <div className="loading-content">
          <Spinner animation="border" role="status" variant="primary" />
          <h4>Flux CrewAI en cours...</h4>
          <p className="task-description">
            {taskDescription || "Initialisation du processus..."}
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoadingModal;
