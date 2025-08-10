import React, { useEffect, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';

const Graph = ({ data }) => {
  const graphRef = useRef();

  useEffect(() => {
    // Defensive checks for data validity
    if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
      console.log('Graph: No data available to render');
      return;
    }

    console.log(`Graph: Rendering ${data.nodes.length} nodes and ${data.links.length} links`);

    try {
      const fg = ForceGraph3D()(graphRef.current)
        .graphData(data)
        .nodeLabel(node => node.reference || node.label || node.id)
        .nodeVal(node => 4) // Fixed node size
        .linkDirectionalArrowLength(3.5)
        .linkWidth(link => Math.max(1, (link.weight || 0.1) * 5))
        .onNodeClick(node => {
          console.log('Clicked node:', node);
          alert(`Verse: ${node.reference || node.id}`);
        });

      // Adjust force simulation parameters
      fg.d3Force('link').distance(link => Math.max(30, 50 / (link.weight || 0.1)));
      fg.d3Force('charge').strength(-100);
      fg.cooldownTicks(200);  // Warmup for layout

      return () => {
        try {
          // Proper cleanup - clear data and remove from DOM
          fg.graphData({ nodes: [], links: [] });
        } catch (cleanupError) {
          console.warn('Graph cleanup error:', cleanupError);
        }
      };
    } catch (error) {
      console.error('Graph rendering error:', error);
    }
  }, [data]);

  // Show message if no data
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '18px',
        color: '#666'
      }}>
        No graph data available
      </div>
    );
  }

  return <div ref={graphRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Graph;