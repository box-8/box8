import React from 'react';
import { Modal } from 'react-bootstrap';

const ProcessProgress = ({ show, progress }) => {
  const progressBarStyle = {
    height: '20px',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    marginBottom: '20px',
    overflow: 'hidden'
  };

  const progressStyle = {
    width: `${progress}%`,
    height: '100%',
    backgroundColor: '#007bff',
    transition: 'width 0.5s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '0.875rem'
  };

  return (
    <Modal 
      show={show} 
      centered
      backdrop="static"
      keyboard={false}
      size="sm"
    >
      <Modal.Header>
        <Modal.Title>Exécution en cours...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={progressBarStyle}>
          <div style={progressStyle}>
            {progress}%
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProcessProgress;
