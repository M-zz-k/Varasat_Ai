'use strict';

/**
 * graphStore.js
 *
 * In-memory JSON graph store for the Varasat Family Asset Knowledge Graph.
 * Stores nodes (persons, assets, institutions) and edges (relationships).
 *
 * Replace with a graph DB (Neo4j / ArangoDB) in Phase 2.
 * The data shape is intentionally compatible with React Flow's node/edge format.
 */

// ─── In-memory graph (keyed by sessionId / familyId) ─────────────────────────
const graphs = {};

// ─── Default demo graph ───────────────────────────────────────────────────────
const DEMO_GRAPH = {
  nodes: [
    {
      id:           'person-ramesh',
      type:         'person',
      label:        'Ramesh Kumar',
      data: {
        name:         'Ramesh Kumar',
        relation:     'Deceased',
        dob:          '1948-03-15',
        dod:          '2022-11-10',
        idProof:      'Aadhaar XXXX-XXXX-4521',
        status:       'deceased',
      },
    },
    {
      id:           'person-sunita',
      type:         'person',
      label:        'Sunita Devi',
      data: {
        name:         'Sunita Devi',
        relation:     'Spouse / Nominee',
        status:       'claimant',
      },
    },
    {
      id:           'asset-sbi',
      type:         'asset',
      label:        'SBI Savings Account',
      data: {
        institution:  'State Bank of India',
        assetType:    'Savings Account',
        accountNum:   'XXXX1234',
        amount:       180000,
        branch:       'Bengaluru Main Branch',
        status:       'unclaimed',
        claimPath:    'nomination',
      },
    },
    {
      id:           'asset-lic',
      type:         'asset',
      label:        'LIC Policy',
      data: {
        institution:  'Life Insurance Corporation',
        assetType:    'LIC Policy',
        policyNum:    'LIC-88990022',
        amount:       500000,
        maturityDate: '2025-03-15',
        status:       'unclaimed',
        claimPath:    'nominee_claim',
      },
    },
    {
      id:           'asset-mf',
      type:         'asset',
      label:        'Mutual Fund Units',
      data: {
        institution:  'SBI Mutual Fund',
        assetType:    'Mutual Fund',
        folioNum:     'SBIMF-7781',
        amount:       200000,
        units:        1250,
        status:       'unclaimed',
        claimPath:    'transmission',
      },
    },
    {
      id:           'asset-ppf',
      type:         'asset',
      label:        'PPF Account',
      data: {
        institution:  'Post Office (India Post)',
        assetType:    'PPF Account',
        accountNum:   'PPF-55678',
        amount:       320000,
        status:       'unclaimed',
        claimPath:    'legal_heir',
      },
    },
    {
      id:           'institution-sbi',
      type:         'institution',
      label:        'State Bank of India',
      data: {
        name:     'State Bank of India',
        type:     'bank',
        contact:  '1800-11-2211',
        website:  'sbi.co.in',
      },
    },
  ],

  edges: [
    { id: 'e1', from: 'person-ramesh', to: 'asset-sbi',       relation: 'owns',           label: 'Account Holder' },
    { id: 'e2', from: 'person-ramesh', to: 'asset-lic',       relation: 'owns',           label: 'Policyholder'   },
    { id: 'e3', from: 'person-ramesh', to: 'asset-mf',        relation: 'owns',           label: 'Unit Holder'    },
    { id: 'e4', from: 'person-ramesh', to: 'asset-ppf',       relation: 'owns',           label: 'Account Holder' },
    { id: 'e5', from: 'person-sunita', to: 'asset-sbi',       relation: 'nominee',        label: 'Nominee'        },
    { id: 'e6', from: 'person-sunita', to: 'asset-lic',       relation: 'nominee',        label: 'Nominee'        },
    { id: 'e7', from: 'asset-sbi',     to: 'institution-sbi', relation: 'held_at',        label: 'Held At'        },
  ],

  meta: {
    familyId:       'demo',
    deceasedName:   'Ramesh Kumar',
    totalAssets:    4,
    totalValue:     1200000,
    createdAt:      new Date().toISOString(),
    lastUpdated:    new Date().toISOString(),
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * getGraph — retrieve the graph for a family/session ID.
 * Falls back to the demo graph if none exists yet.
 */
function getGraph(familyId = 'demo') {
  return graphs[familyId] || DEMO_GRAPH;
}

/**
 * setGraph — store or replace the graph for a family/session ID.
 */
function setGraph(familyId, graph) {
  graph.meta = graph.meta || {};
  graph.meta.lastUpdated = new Date().toISOString();
  graphs[familyId] = graph;
  return graphs[familyId];
}

/**
 * addAssetNode — add a discovered asset node and link it to a person node.
 */
function addAssetNode(familyId, personNodeId, assetData) {
  const graph = getGraph(familyId);
  const assetId = `asset-${Date.now()}`;

  graph.nodes.push({
    id:    assetId,
    type:  'asset',
    label: assetData.assetType || 'Asset',
    data:  assetData,
  });

  graph.edges.push({
    id:       `e-${Date.now()}`,
    from:     personNodeId,
    to:       assetId,
    relation: 'owns',
    label:    'Account Holder',
  });

  graph.meta.totalAssets = (graph.meta.totalAssets || 0) + 1;
  graph.meta.totalValue  = (graph.meta.totalValue  || 0) + (assetData.amount || 0);
  graph.meta.lastUpdated = new Date().toISOString();

  graphs[familyId] = graph;
  return { assetId, graph };
}

/**
 * buildGraphFromExtraction
 *
 * Converts Claude document extraction output → graph nodes + edges.
 * Called after POST /api/document/analyze succeeds.
 *
 * @param {string} familyId
 * @param {string} deceasedName
 * @param {Object} extractedData  — data field from documentExtractor
 * @returns {Object} updated graph
 */
function buildGraphFromExtraction(familyId, deceasedName, extractedData) {
  let graph = graphs[familyId];

  if (!graph) {
    if (familyId === 'demo') {
      // Deep clone the default demo graph so we build on top of it
      graph = JSON.parse(JSON.stringify(DEMO_GRAPH));
    } else {
      // Bootstrap a new graph for this family
      const personId = `person-${familyId}`;
      graph = {
        nodes: [
          {
            id:    personId,
            type:  'person',
            label: deceasedName || 'Deceased Person',
            data: {
              name:   deceasedName,
              status: 'deceased',
            },
          },
        ],
        edges: [],
        meta: {
          familyId,
          deceasedName,
          totalAssets: 0,
          totalValue:  0,
          createdAt:   new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      };
    }
    graphs[familyId] = graph;
  }

  // Find or create the person node
  const personNode = graph.nodes.find(n => n.type === 'person' && n.data?.status === 'deceased');
  if (personNode && extractedData) {
    addAssetNode(familyId, personNode.id, {
      institution: extractedData.institution,
      assetType:   extractedData.asset_type,
      accountNum:  extractedData.account_number,
      policyNum:   extractedData.policy_number,
      amount:      parseAmount(extractedData.amount),
      nominee:     extractedData.nominee,
      status:      'unclaimed',
    });
  }

  return graphs[familyId];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmount(str) {
  if (!str) return 0;
  // Strip ₹, commas, spaces — parse to number
  const cleaned = String(str).replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

module.exports = {
  getGraph,
  setGraph,
  addAssetNode,
  buildGraphFromExtraction,
  DEMO_GRAPH,
};
