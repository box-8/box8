import React from 'react';
import { Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FloatingButtons = ({ 
  onAddAgent, 
  onAddTask, 
  onCreateCrewAI, 
  onSaveDiagram, 
  onLoadDiagram,
  onNewDiagram
}) => {
  return (
    <div className="floating-buttons">
      <Button
        variant="primary"
        className="floating-button"
        onClick={onNewDiagram}
        title="New Diagram"
      >
        <i className="bi bi-file-earmark-plus"></i>
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
        variant="success"
        className="floating-button"
        onClick={onAddTask}
        title="Add Task"
      >
        <i className="bi bi-link"></i>
      </Button>

      <Button
        variant="info"
        className="floating-button"
        onClick={onSaveDiagram}
        title="Save Diagram"
      >
        <i className="bi bi-save"></i>
      </Button>

      <Button
        variant="secondary"
        className="floating-button"
        onClick={onLoadDiagram}
        title="Load Diagram"
      >
        <i className="bi bi-folder2-open"></i>
      </Button>

      <Button
        variant="warning"
        className="floating-button"
        onClick={onCreateCrewAI}
        title="Launch CrewAI Process"
      >
        <i className="bi bi-play-fill"></i>
      </Button>
    </div>
  );
};

export default FloatingButtons;
