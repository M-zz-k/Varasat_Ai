import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Custom Node Components ──────────────────────────────────────────────────

function PersonNode({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f1f3d, #1a3560)',
      border: '2px solid #3b82f6',
      borderRadius: '12px',
      padding: '1rem',
      color: '#f0f4ff',
      minWidth: '180px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
    }}>
      <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6' }} />
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👤</div>
      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{data.name}</div>
      <div style={{ fontSize: '0.8rem', color: '#8fa4c8', marginTop: '0.2rem' }}>
        {data.role || 'Family Member'}
      </div>
      <Handle type="target" position={Position.Top} style={{ background: '#3b82f6' }} />
    </div>
  );
}

function AssetNode({ data }) {
  const getIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('bank')) return '🏦';
    if (t.includes('lic') || t.includes('insurance')) return '📋';
    if (t.includes('mutual') || t.includes('share')) return '📊';
    return '💰';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #10b981, #059669)',
      border: '2px solid #047857',
      borderRadius: '12px',
      padding: '1rem',
      color: '#ffffff',
      minWidth: '200px',
      textAlign: 'left',
      boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#ffffff' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '2rem' }}>{getIcon(data.asset_type || data.type)}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{data.institution}</div>
          <div style={{ fontSize: '0.8rem', color: '#d1fae5' }}>{data.asset_type || data.type}</div>
        </div>
      </div>
      {data.amount && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.4rem 0.5rem',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '6px',
          fontWeight: 700,
          textAlign: 'center'
        }}>
          ₹{Number(data.amount).toLocaleString('en-IN')}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: '#ffffff' }} />
    </div>
  );
}

const nodeTypes = {
  person: PersonNode,
  asset: AssetNode,
};

// ─── Main Graph Component ─────────────────────────────────────────────────────

export default function AssetGraph({ graphData }) {
  // Use React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(graphData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData?.edges || []);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const onNodeClick = useCallback((event, node) => {
    if (node.type === 'asset') {
      setSelectedAsset(node.data);
    } else {
      setSelectedAsset(null);
    }
  }, []);

  if (!graphData || nodes.length === 0) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8fa4c8', background: '#0f1f3d', borderRadius: '16px' }}>
        No asset data available to map.
      </div>
    );
  }

  return (
    <div style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(59,130,246,0.3)', position: 'relative', background: '#080f1e' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls style={{ display: 'flex', flexDirection: 'column' }} />
        <MiniMap nodeStrokeColor={() => '#3b82f6'} nodeColor={() => '#0f1f3d'} maskColor="rgba(8,15,30,0.7)" />
        <Background color="#1e3a8a" gap={24} size={2} />
      </ReactFlow>

      {/* Asset Details Panel */}
      {selectedAsset && (
        <div style={{
          position: 'absolute', bottom: '20px', left: '20px', right: '20px',
          background: 'rgba(10,22,40,0.95)', backdropFilter: 'blur(10px)',
          border: '1px solid #10b981', borderRadius: '12px', padding: '1.25rem',
          color: '#f0f4ff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.3s ease', zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Asset Details</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedAsset.institution}</div>
            </div>
            <button onClick={() => setSelectedAsset(null)} style={{ background: 'none', border: 'none', color: '#8fa4c8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#8fa4c8' }}>Type</div>
              <div style={{ fontWeight: 600 }}>{selectedAsset.asset_type || selectedAsset.type || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#8fa4c8' }}>Amount</div>
              <div style={{ fontWeight: 600, color: '#10b981', fontSize: '1.1rem' }}>
                {selectedAsset.amount ? `₹${Number(selectedAsset.amount).toLocaleString('en-IN')}` : 'Unknown'}
              </div>
            </div>
            {selectedAsset.account_number && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.8rem', color: '#8fa4c8' }}>Account Number</div>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedAsset.account_number}</div>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
