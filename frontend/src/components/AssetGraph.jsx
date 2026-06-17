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
  NodeToolbar,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { maskAccountNumber } from '../utils/masking';

// ─── Inline SVG Icons ──────────────────────────────────────────────────────────

const IconPerson = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
  </svg>
);

const IconBank = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="11" rx="1" />
    <path d="M3 10l9-7 9 7" />
    <line x1="9" y1="10" x2="9" y2="21" />
    <line x1="15" y1="10" x2="15" y2="21" />
  </svg>
);

const IconInsurance = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5 4 9.3 9 10.7C17 20.3 21 16 21 12V7z" />
  </svg>
);

const IconMutual = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconAsset = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconExpand = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

// ─── Asset Type Helper ─────────────────────────────────────────────────────────

function getAssetIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('bank') || t.includes('savings') || t.includes('fd'))
    return <IconBank />;
  if (t.includes('lic') || t.includes('insurance') || t.includes('policy'))
    return <IconInsurance />;
  if (t.includes('mutual') || t.includes('share') || t.includes('equity'))
    return <IconMutual />;
  return <IconAsset />;
}

// ─── Custom Node: Person ───────────────────────────────────────────────────────

function PersonNode({ data, selected }) {
  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '6px 12px',
          color: '#1e3a8a',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {data.role || 'Family Member'}
        </div>
      </NodeToolbar>

      <div style={{
        background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
        border: selected ? '2px solid #3b82f6' : '1.5px solid #cbd5e1',
        borderRadius: '14px',
        padding: '0.9rem 1.1rem',
        color: '#0f172a',
        minWidth: '170px',
        textAlign: 'center',
        boxShadow: selected
          ? '0 0 0 3px rgba(59,130,246,0.15), 0 4px 20px rgba(59,130,246,0.15)'
          : '0 4px 14px rgba(0,0,0,0.03)',
        transition: 'all 0.2s',
      }}>
        <Handle type="target" position={Position.Top} style={{ background: '#3b82f6', width: 8, height: 8 }} />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.1)',
            border: '1.5px solid rgba(59,130,246,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconPerson />
          </div>
        </div>

        <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
          {data.name}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.2rem', fontWeight: 600 }}>
          {data.role || 'Family Member'}
        </div>

        {data.matchData && (
          <div style={{
            marginTop: '0.6rem',
            padding: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            fontSize: '0.65rem',
            color: '#047857',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 800, justifyContent: 'center' }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              <span>AI Identity Match</span>
            </div>
            <div style={{ textAlign: 'center', fontWeight: 700, marginTop: '0.2rem', marginBottom: '0.3rem' }}>
              {data.matchData.confidenceScore}% Confidence
            </div>
            <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: '0.3rem' }}>
              <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: '#065f46' }}>Reasons:</span>
              <ul style={{ paddingLeft: '0.8rem', marginTop: '0.1rem', marginBottom: 0, fontSize: '0.6rem', fontWeight: 600 }}>
                {data.matchData.matchingReasons?.map((r, i) => (
                  <li key={i} style={{ listStyleType: 'disc' }}>{r}</li>
                ))}
              </ul>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.55rem', fontStyle: 'italic', color: '#059669', marginTop: '0.3rem' }}>
              Requires verification
            </div>
          </div>
        )}

        <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6', width: 8, height: 8 }} />
      </div>
    </>
  );
}

// ─── Custom Node: Asset ────────────────────────────────────────────────────────

function AssetNode({ data, selected }) {
  const assetType = data.asset_type || data.type || '';

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '6px 12px',
          color: '#065f46',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {assetType}
          {data.account_number && ` · Acct: ${maskAccountNumber(data.account_number)}`}
        </div>
      </NodeToolbar>

      <div
        style={{
          background: 'linear-gradient(145deg, #f0fdf4 0%, #d1fae5 100%)',
          border: selected ? '2px solid #34d399' : '1.5px solid #a7f3d0',
          borderRadius: '14px',
          padding: '0.9rem 1rem',
          color: '#065f46',
          minWidth: '195px',
          textAlign: 'left',
          boxShadow: selected
            ? '0 0 0 3px rgba(16,185,129,0.15), 0 4px 20px rgba(16,185,129,0.15)'
            : '0 4px 14px rgba(0,0,0,0.03)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <Handle type="target" position={Position.Top} style={{ background: '#10b981', width: 8, height: 8 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '8px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#059669', flexShrink: 0,
          }}>
            {getAssetIcon(assetType)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>
              {data.institution}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#047857', marginTop: '0.15rem', fontWeight: 600 }}>
              {assetType}
            </div>
          </div>
        </div>

        {data.amount && (
          <div style={{
            marginTop: '0.4rem',
            padding: '0.35rem 0.6rem',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.88rem',
            textAlign: 'center',
            color: '#047857',
            letterSpacing: '-0.01em',
          }}>
            ₹{Number(data.amount).toLocaleString('en-IN')}
          </div>
        )}

        <Handle type="source" position={Position.Bottom} style={{ background: '#10b981', width: 8, height: 8 }} />
      </div>
    </>
  );
}

// ─── Custom Node: Group (collapsible) ─────────────────────────────────────────

function GroupNode({ data }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      background: collapsed ? 'rgba(219,234,254,0.4)' : 'rgba(219,234,254,0.15)',
      border: '1.5px dashed rgba(59,130,246,0.35)',
      borderRadius: '16px',
      padding: collapsed ? '0.6rem 1rem' : '0.75rem 1rem',
      minWidth: '220px',
      color: '#1e40af',
      transition: 'all 0.25s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {data.label || 'Group'}
        </span>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '6px',
            color: '#1e40af',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, padding: 0,
          }}
          title={collapsed ? 'Expand group' : 'Collapse group'}
        >
          <IconExpand />
        </button>
      </div>
      {!collapsed && data.description && (
        <div style={{ fontSize: '0.68rem', color: '#4b5563', marginTop: '0.35rem' }}>
          {data.description}
        </div>
      )}
    </div>
  );
}

// ─── Node Types Map ────────────────────────────────────────────────────────────

const nodeTypes = {
  person: PersonNode,
  asset:  AssetNode,
  group:  GroupNode,
};

// ─── Main Graph Component ──────────────────────────────────────────────────────

export default function AssetGraph({ graphData }) {
  const [nodes, , onNodesChange] = useNodesState(graphData?.nodes || []);
  const [edges, , onEdgesChange] = useEdgesState(graphData?.edges || []);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const onNodeClick = useCallback((_event, node) => {
    if (node.type === 'asset') {
      setSelectedAsset(prev => (prev?.id === node.id ? null : node.data));
    } else {
      setSelectedAsset(null);
    }
  }, []);

  // Summary stats
  const assetNodes   = nodes.filter(n => n.type === 'asset');
  const personNodes  = nodes.filter(n => n.type === 'person');
  const totalValue   = assetNodes.reduce((sum, n) => sum + (Number(n.data?.amount) || 0), 0);

  if (!graphData || nodes.length === 0) {
    return (
      <div style={{
        height: '400px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '0.75rem',
        color: '#64748b', background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
        borderRadius: '16px', border: '1px solid #cbd5e1',
      }}>
        <IconAsset />
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No asset data available to map.</span>
      </div>
    );
  }

  return (
    <div style={{
      height: '620px', width: '100%',
      borderRadius: '16px', overflow: 'hidden',
      border: '1px solid #cbd5e1',
      background: '#f8fafc',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Graph Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-right"
          defaultEdgeOptions={{
            style: { stroke: '#3b82f6', strokeWidth: 1.5 },
            animated: true,
          }}
        >
          <Controls
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(203,213,225,0.8)',
              borderRadius: '10px',
            }}
          />
          <MiniMap
            nodeStrokeColor={n => n.type === 'person' ? '#3b82f6' : '#10b981'}
            nodeColor={n => n.type === 'person' ? '#dbeafe' : '#d1fae5'}
            maskColor="rgba(255,255,255,0.75)"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(203,213,225,0.5)',
              borderRadius: '10px',
            }}
          />
          <Background color="#94a3b8" gap={28} size={1.5} style={{ opacity: 0.25 }} />

          {/* Summary Panel */}
          <Panel position="top-left">
            <div style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(203,213,225,0.8)',
              borderRadius: '10px',
              padding: '0.6rem 0.9rem',
              display: 'flex', gap: '1.2rem',
            }}>
              <Stat label="Heirs" value={personNodes.length} color="#1e40af" />
              <Stat label="Assets" value={assetNodes.length} color="#065f46" />
              {totalValue > 0 && (
                <Stat
                  label="Total"
                  value={`₹${(totalValue / 100000).toFixed(1)}L`}
                  color="#b45309"
                />
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Asset Details Drawer */}
      {selectedAsset && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid #10b981',
          padding: '1rem 1.25rem',
          color: '#0f172a',
          zIndex: 10,
          animation: 'slideUp 0.25s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#047857', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Asset Details
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.15rem' }}>
                {selectedAsset.institution}
              </div>
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              style={{
                background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '8px', color: '#475569', cursor: 'pointer',
                padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <IconClose />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <DetailCell label="Type" value={selectedAsset.asset_type || selectedAsset.type || 'N/A'} />
            <DetailCell
              label="Estimated Value"
              value={selectedAsset.amount ? `₹${Number(selectedAsset.amount).toLocaleString('en-IN')}` : 'Unknown'}
              valueColor="#047857"
            />
            {selectedAsset.account_number && (
              <DetailCell label="Account" value={maskAccountNumber(selectedAsset.account_number)} mono />
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Helper sub-components ─────────────────────────────────────────────────────

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.95rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  );
}

function DetailCell({ label, value, valueColor, mono }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.02)',
      border: '1px solid rgba(0,0,0,0.05)',
      borderRadius: '8px',
      padding: '0.5rem 0.75rem',
    }}>
      <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{
        fontWeight: 700,
        fontSize: '0.82rem',
        color: valueColor || '#0f172a',
        marginTop: '0.2rem',
        fontFamily: mono ? 'monospace' : 'inherit',
      }}>
        {value}
      </div>
    </div>
  );
}
