import React, { useEffect, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';

const Graph = ({ data }) => {
  const graphRef = useRef();

  useEffect(() => {
    if (!data.nodes.length) return;

    const fg = ForceGraph3D()(graphRef.current)
      .graphData(data)
      .nodeLabel('reference')
      .linkDirectionalArrowLength(3.5)
      .onNodeClick(node => alert(`Verse: ${node.reference}`));  // Placeholder for details

    fg.d3Force('link').distance(link => 30 / (link.value || 1));  // Based on weight
    fg.tickFrame(200);  // Warmup for layout

    return () => fg._destructor();
  }, [data]);

  return <div ref={graphRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Graph;