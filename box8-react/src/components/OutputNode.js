import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const OutputNode = ({ data }) => {
  return (
    <div className={`output-node ${data.selected ? 'selected' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={true}
        style={{ 
          background: '#28a745',
          width: '15px',
          height: '15px',
          top: '-8px'
        }}
      />
      Output
    </div>
  );
};

export default memo(OutputNode);
