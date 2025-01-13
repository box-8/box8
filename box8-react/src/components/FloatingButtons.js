import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import LoadingModal from './LoadingModal';

const FloatingButtons = ({
  onAddAgent,
  onAddTask,
  onCreateCrewAI,
  onEnhanceDiagram,
  onSaveDiagram,
  onLoadDiagram,
  onNewDiagram,
  onRefreshDiagram,
  onShowResponse,
  hasDiagram,
  currentDiagramName,
  hasResponse,
  isAuthenticated,
  isLoading
}) => {
  const [chatInput, setChatInput] = useState('');

  const handleCreateCrewAI = () => {
    onCreateCrewAI(chatInput);
    setChatInput('');
  };

  const handleEnhanceDiagram = () => {
    onEnhanceDiagram(chatInput);
    setChatInput('');
  };

  return (
    <div className="floating-buttons">
      {isAuthenticated && (
        <Button
          variant="secondary"
          className="floating-button"
          onClick={onLoadDiagram}
          title="Load Diagram"
        >
          <i className="bi bi-folder2-open"></i>
        </Button>
      )}

      {/* Bouton New Diagram commenté car déplacé dans JsonFilesModal
      <Button
        variant="primary"
        className="floating-button"
        onClick={onNewDiagram}
        title="New Diagram"
      >
        <i className="bi bi-file-earmark-plus"></i>
      </Button>
      */}

      {hasDiagram && isAuthenticated && (
        <>
          <Button
            variant="info"
            className="floating-button"
            onClick={onSaveDiagram}
            title="Save Diagram"
          >
            <i className="bi bi-diagram-3"></i>
          </Button>

          <Button
            variant="warning"
            className="floating-button"
            onClick={onRefreshDiagram}
            title="Refresh Diagram"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>

          <Button
            variant="success"
            className="floating-button"
            onClick={onShowResponse}
            title="Show Response"
            disabled={!hasResponse}
          >
            <i className="bi bi-chat-text"></i>
          </Button>

          <Button
            variant="primary"
            className="floating-button"
            onClick={onAddAgent}
            title="Add Agent"
          >
            <i className="bi bi-person-plus"></i>
          </Button>

          <Button
            variant="primary"
            className="floating-button"
            onClick={onAddTask}
            title="Add Task"
          >
            <i className="bi bi-list-task"></i>
          </Button>
          <Button
            variant="warning"
            className="floating-button"
            onClick={handleCreateCrewAI}
            title="Create CrewAI"
          >
            <i className="bi bi-play-circle"></i>
          </Button>
          <div className="chat-input-container" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <Form.Control
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Enter your message..."
              style={{ width: '500px' }}
            />
            <Button
              variant="primary"
              onClick={handleEnhanceDiagram}
              title="Enhance Diagram"
            ><i className="bi bi-play"></i></Button>
          </div>
        </>
      )}
      <LoadingModal show={isLoading} />
    </div>
  );
};

export default FloatingButtons;
