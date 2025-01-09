import React from 'react';
import { BaseEdge, getBezierPath, getSmoothStepPath } from 'reactflow';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const renderTooltip = (props) => (
    <Tooltip id={`edge-tooltip-${id}`} {...props}>
      <div className="text-start">
        {data?.description && (
          <><strong>Task:</strong> {data.description}<br/></>
        )}
        {data?.expected_output && (
          <><strong>Expected Output:</strong> {data.expected_output}<br/></>
        )}
        {data?.type && (
          <><strong>Relationship:</strong> {data.type}<br/></>
        )}
      </div>
    </Tooltip>
  );

  return (
    <>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#999" />
        </marker>
      </defs>
      <BaseEdge 
        path={edgePath} 
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#999',
        }} 
        markerEnd="url(#arrow)"
      />
      {data?.description && (
        <OverlayTrigger
          placement="auto"
          delay={{ show: 200, hide: 100 }}
          overlay={renderTooltip}
        >
          <foreignObject
            x={labelX - 75}
            y={labelY - 15}
            width={150}
            height={30}
            className="edge-label"
            requiredExtensions="http://www.w3.org/1999/xhtml"
          >
            <div
              style={{
                background: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                border: '1px solid #ccc',
                textAlign: 'center',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {data.description}
            </div>
          </foreignObject>
        </OverlayTrigger>
      )}
    </>
  );
};

export default CustomEdge;
