


import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import ChevronRightIcon from '../styles/icons/ChevronRightIcon';

interface CustomNodeData {
  title: string;
  description: string;
  isClickable: boolean;
  isDisabled: boolean;
  ctaText?: string;
}

function WorkflowCustomNode({ data, isConnectable }: NodeProps<CustomNodeData>) {
  const { title, description, isClickable, isDisabled, ctaText } = data;

  const nodeClasses = `
    w-64 rounded-xl shadow-md border-2
    ${isDisabled ? 'bg-background-subtle border-subtle' : 'bg-surface border-interactive'}
    ${isClickable && !isDisabled ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : 'cursor-default'}
    transition-all duration-200
  `;
  
  const textClasses = isDisabled ? 'text-subtle' : 'text-primary';
  const descClasses = isDisabled ? 'text-subtle' : 'text-secondary';
  const handleClasses = '!bg-strong !w-3 !h-3';

  return (
    <div className={nodeClasses}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className={handleClasses} />
      <div className="p-4">
        <h3 className={`font-bold text-lg ${textClasses}`}>{title}</h3>
        <p className={`text-sm mt-1 ${descClasses}`}>{description}</p>
        
        {isClickable && !isDisabled && ctaText && (
          <div className="mt-4 text-on-interactive bg-interactive rounded-lg p-2 flex items-center justify-center font-semibold">
            <span>{ctaText}</span>
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className={handleClasses} />
    </div>
  );
}

export default WorkflowCustomNode;