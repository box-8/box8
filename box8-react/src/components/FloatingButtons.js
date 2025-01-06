import React from 'react';
import { Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FloatingButtons = ({ 
  onAddAgent, 
  onAddTask, 
  onCreateCrewAI, 
  onSaveDiagram, 
  onLoadDiagram,
  onNewDiagram,
  hasDiagram
}) => {
  return (
    <div className="floating-buttons">

      <Button
        variant="secondary"
        className="floating-button"
        onClick={onLoadDiagram}
        title="Load Diagram"
      >
        <i className="bi bi-folder2-open"></i>
      </Button>

      <Button
        variant="primary"
        className="floating-button"
        onClick={onNewDiagram}
        title="New Diagram"
      >
        <i className="bi bi-file-earmark-plus"></i>
      </Button>

      {hasDiagram && (
        <Button
          variant="info"
          className="floating-button"
          onClick={onSaveDiagram}
          title="Save Diagram"
        >
          <i className="bi bi-diagram-3"></i>
        </Button>
      )}
      
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
