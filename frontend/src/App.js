import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Graph from './components/Graph';

const App = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch default subgraph (e.g., Genesis with limited nodes)
    setLoading(true);
    axios.get('http://localhost:3001/api/v1/subgraphs?filters={"book":"Genesis","maxNodes":10}')
      .then(res => {
        console.log('API Response:', res.data);
        
        // Safely handle the response data
        const nodes = (res.data.nodes || []).map(n => ({ 
          id: n.id || n.reference, 
          reference: n.reference,
          label: n.reference 
        }));

        console.log('Nodes:', nodes);
        
        const links = (res.data.edges || []).map(e => ({ 
          source: e.from, 
          target: e.to,
          weight: e.weight || 1,
          type: e.type || 'cross-reference'
        }));
        
        console.log(`Loaded ${nodes.length} nodes and ${links.length} links`);
        setGraphData({ nodes, links });
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching subgraph:', err);
        setError('Failed to load Bible data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{padding: '20px', textAlign: 'center'}}>Loading Bible connections...</div>;
  }

  if (error) {
    return <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Error: {error}</div>;
  }

  return <Graph data={graphData} />;
};

export default App;