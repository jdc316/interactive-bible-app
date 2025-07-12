import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Graph from './components/Graph';

const App = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    // Fetch default subgraph (e.g., Genesis)
    axios.get('http://localhost:3001/api/v1/subgraphs?filters={"book":"Genesis"}')
      .then(res => {
        const nodes = res.data.nodes.map(n => ({ id: n.id, reference: n.reference }));
        const links = res.data.edges.map(e => ({ source: e.from, target: e.to }));
        setGraphData({ nodes, links });
      })
      .catch(err => console.error('Error fetching subgraph:', err));
  }, []);

  return <Graph data={graphData} />;
};

export default App;