const { getGraph, setGraph, buildGraphFromExtraction, buildComplexGraphFromExtraction, resolveGraphEntities } = require('../graph/graphStore');
const { explainGraph, explainAssetMapInteractive } = require('../ai/graphExplainer');

/**
 * GET /api/assets/graph?familyId=demo
 *
 * Returns the full JSON knowledge graph + Claude AI explanation.
 * Normalises the graph for React Flow (source/target edges, positions, field names).
 */
async function handleGetGraph(req, res) {
  try {
    const familyId = req.query.familyId || 'demo';
    const language  = req.query.lang    || 'English';

    const rawGraph = getGraph(familyId);

    // ── Normalise nodes for React Flow ────────────────────────────────────────
    // Auto-assign positions (hierarchical layout: persons on top, assets below)
    const personNodes = rawGraph.nodes.filter(n => n.type === 'person');
    const assetNodes  = rawGraph.nodes.filter(n => n.type === 'asset');
    const otherNodes  = rawGraph.nodes.filter(n => n.type !== 'person' && n.type !== 'asset');

    const PERSON_Y = 60;
    const ASSET_Y  = 300;
    const COL_W    = 240;
    const START_X  = 60;

    const layoutNode = (node, index, total, rowY) => {
      const totalWidth = (total - 1) * COL_W;
      const centreX    = 400; // canvas centre estimate
      const startX     = centreX - totalWidth / 2;
      return {
        ...node,
        position: node.position || { x: startX + index * COL_W, y: rowY },
        data: {
          ...node.data,
          // Map assetType → asset_type so AssetNode renders the type label
          asset_type: node.data?.asset_type || node.data?.assetType || '',
        },
      };
    };

    const normalisedNodes = [
      ...personNodes.map((n, i) => layoutNode(n, i, personNodes.length, PERSON_Y)),
      ...assetNodes.map((n, i)  => layoutNode(n, i, assetNodes.length,  ASSET_Y)),
      ...otherNodes.map((n, i)  => layoutNode(n, i, otherNodes.length,  ASSET_Y + 240)),
    ];

    // ── Normalise edges for React Flow ────────────────────────────────────────
    // Backend stores from/to; React Flow requires source/target
    const normalisedEdges = rawGraph.edges.map(e => ({
      ...e,
      source: e.source || e.from,
      target: e.target || e.to,
    }));

    const graph = { nodes: normalisedNodes, edges: normalisedEdges };

    // ── Build Claude explanation (best-effort) ─────────────────────────────────
    let explanation = '';
    try {
      explanation = await explainGraph(rawGraph, language);
    } catch {
      explanation = 'Varasat AI has identified multiple unclaimed financial assets linked to the deceased. Upload additional documents to expand the discovery graph and begin the recovery process.';
    }

    // ── Summary stats ──────────────────────────────────────────────────────────
    const assets     = normalisedNodes.filter(n => n.type === 'asset');
    const persons    = normalisedNodes.filter(n => n.type === 'person');
    const totalValue = assets.reduce((s, a) => s + (a.data?.amount || 0), 0);

    return res.json({
      success:     true,
      familyId,
      graph,
      summary: {
        totalAssets:         assets.length,
        totalPersons:        persons.length,
        totalValue,
        totalValueFormatted: formatINR(totalValue),
      },
      explanation,
    });
  } catch (error) {
    console.error('[AssetsController] GetGraph error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/assets/graph
 *
 * Save or update a family's asset graph.
 * Body: { familyId, graph }
 */
async function handleSaveGraph(req, res) {
  try {
    const { familyId = 'demo', graph } = req.body;
    if (!graph) return res.status(400).json({ success: false, error: 'graph is required' });

    const saved = setGraph(familyId, graph);
    return res.json({ success: true, graph: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/assets/build-from-extraction
 *
 * Accepts a document extraction result and auto-builds graph nodes.
 * Body: { familyId, deceasedName, extractedData }
 */
async function handleBuildFromExtraction(req, res) {
  try {
    const { familyId, deceasedName, extractedData } = req.body;
    if (!familyId || !extractedData) {
      return res.status(400).json({ success: false, error: 'familyId and extractedData are required' });
    }

    const graph = buildGraphFromExtraction(familyId, deceasedName, extractedData);
    return res.json({ success: true, graph });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleBuildComplexFromExtraction(req, res) {
  try {
    const { familyId, complexData } = req.body;
    if (!familyId || !complexData) {
      return res.status(400).json({ success: false, error: 'familyId and complexData required' });
    }

    const graph = buildComplexGraphFromExtraction(familyId, complexData);
    return res.json({ success: true, graph });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

const { runComputationalReasoning } = require('../wolfram/wolframEngineService');
const { generateLegalGuidance } = require('../ai/legalGuidance');

async function handleFinalEnhancementData(req, res) {
  try {
    const { familyId } = req.params;
    const graph = getGraph(familyId);
    if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' });
    
    const reasoning = await runComputationalReasoning(graph);
    const guidance = generateLegalGuidance(graph);

    return res.json({ success: true, reasoning, guidance });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function formatINR(amount) {
  const num = Math.abs(Math.round(amount));
  const str = num.toString();
  if (str.length <= 3) return `₹${str}`;
  let result = str.slice(-3);
  let rem    = str.slice(0, -3);
  while (rem.length > 2) { result = rem.slice(-2) + ',' + result; rem = rem.slice(0, -2); }
  return `₹${rem},${result}`;
}

/**
 * POST /api/assets/explain-map
 *
 * Generates an interactive, structured, rural-friendly explanation of the graph.
 * Body: { graph, language }
 */
async function handleExplainMap(req, res) {
  try {
    const { graph, language = 'English' } = req.body;
    if (!graph || !graph.nodes) {
      return res.status(400).json({ success: false, error: 'graph is required' });
    }

    const explanation = await explainAssetMapInteractive(graph, language);
    return res.json({ success: true, explanation });
  } catch (error) {
    console.error('[AssetsController] handleExplainMap error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  handleGetGraph,
  handleSaveGraph,
  handleBuildFromExtraction,
  handleBuildComplexFromExtraction,
  handleFinalEnhancementData,
  handleExplainMap,
};
