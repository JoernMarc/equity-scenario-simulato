
import React from 'react';
import ReactFlow, { Background, ReactFlowProvider } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import WorkflowCustomNode from './WorkflowCustomNode';
import { useLocalization } from '../contexts/LocalizationContext';

const nodeTypes = {
  custom: WorkflowCustomNode,
};

interface WorkflowDiagramProps {
  onNodeClick: (nodeId: string) => void;
}

function WorkflowDiagram({ onNodeClick }: WorkflowDiagramProps) {
    const { t: translations } = useLocalization();
    const initialNodes: Node[] = [
      { id: '1', type: 'custom', data: { title: translations.workflowNodeFoundingTitle, description: translations.workflowNodeFoundingDesc, isClickable: true, isDisabled: false, ctaText: translations.workflowStartHere }, position: { x: 50, y: 50 } },
      { id: '2', type: 'custom', data: { title: translations.workflowNodeEarlyFinanceTitle, description: translations.workflowNodeEarlyFinanceDesc, isClickable: false, isDisabled: true }, position: { x: 400, y: 50 } },
      { id: '3', type: 'custom', data: { title: translations.workflowNodeGrowthTitle, description: translations.workflowNodeGrowthDesc, isClickable: false, isDisabled: true }, position: { x: 50, y: 250 } },
      { id: '4', type: 'custom', data: { title: translations.workflowNodeOngoingTitle, description: translations.workflowNodeOngoingDesc, isClickable: false, isDisabled: true }, position: { x: 400, y: 250 } },
      { id: '5', type: 'custom', data: { title: translations.workflowNodeExitTitle, description: translations.workflowNodeExitDesc, isClickable: false, isDisabled: true }, position: { x: 50, y: 450 } },
    ];
    
    const initialEdges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: { strokeWidth: 2 } },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true, style: { strokeWidth: 2 } },
      { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', animated: true, style: { strokeWidth: 2 } },
      { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', animated: true, style: { strokeWidth: 2 } },
    ];
    
    const handleNodeClick = (_: React.MouseEvent, node: Node) => {
        if(node.data.isClickable && !node.data.isDisabled) {
            onNodeClick(node.id);
        }
    };

  return (
    <div style={{ height: '600px', width: '750px' }} className="bg-background-subtle rounded-lg border border-subtle shadow-md">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} color="rgb(var(--color-border-strong) / 0.2)" />
      </ReactFlow>
    </div>
  );
}

// ReactFlow needs to be wrapped in a provider
function WorkflowDiagramWrapper(props: WorkflowDiagramProps) {
    return (
        <ReactFlowProvider>
            <WorkflowDiagram {...props} />
        </ReactFlowProvider>
    )
}

export default WorkflowDiagramWrapper;
