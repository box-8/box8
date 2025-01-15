import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const AgentNode = ({ data }) => {
  // Fonction pour tronquer le texte aux premiers mots
  const truncateText = (text, wordCount = 10) => {
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const renderTooltip = (props) => (
    <Tooltip id={`agent-tooltip-${data.id}`} {...props}>
      <div className="text-start">
        <p><strong>Role:</strong> {data.role}</p>
        <p><strong>Goal:</strong> {data.goal}</p>
        <p><strong>Backstory:</strong> {data.backstory}</p>
        <p>{data.file}</p>
      </div>
    </Tooltip>
  );

  return (
    <div className={`agent-node ${data.selected ? 'selected' : ''} ${data.status === 'active' ? 'agent-active' : ''}`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ 
          background: '#28a745',
          width: '15px',
          height: '15px',
          top: '-8px'
        }}
      />
      <OverlayTrigger
        placement="auto"
        delay={{ show: 200, hide: 100 }}
        overlay={renderTooltip}
      >
        <div className="agent-content">
          <h6>{data.role}</h6>
          <p>{truncateText(data.goal, 8)}</p>
          <p>{truncateText(data.backstory, 8)}</p>
          {data.file && <p className="file-path">{data.file.split('/').pop()}</p>}
          <div className="agent-status">
            {data.status === 'active' && <span className="status-indicator">Active</span>}
          </div>
        </div>
      </OverlayTrigger>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ 
          background: '#a74528',
          width: '15px',
          height: '15px',
          bottom: '-8px'
        }}
      />
    </div>
  );
};

export default memo(AgentNode);
