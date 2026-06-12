'use strict';

const { getGraph, setGraph, buildGraphFromExtraction } = require('../graph/graphStore');
const { explainGraph } = require('../ai/graphExplainer');

/**
 * GET /api/assets/graph?familyId=demo
 *
 * Returns the full JSON knowledge graph + Claude AI explanation.
 */
async function handleGetGraph(req, res) {
  try {
    const familyId = req.query.familyId || 'demo';
    const language  = req.query.lang    || 'English';

    const graph = getGraph(familyId);

    // Build Claude explanation in parallel (non-blocking to main graph data)
    let explanation = '';
    try {
      explanation = await explainGraph(graph, language);
    } catch {
      explanation = 'Graph explanation unavailable.';
    }

    // Compute summary stats
    const assets  = graph.nodes.filter(n => n.type  === 'asset');
    const persons = graph.nodes.filter(n => n.type  === 'person');
    const totalValue = assets.reduce((s, a) => s + (a.data?.amount || 0), 0);

    return res.json({
      success:     true,
      familyId,
      graph,
      summary: {
        totalAssets:   assets.length,
        totalPersons:  persons.length,
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

module.exports = { handleGetGraph, handleSaveGraph, handleBuildFromExtraction };
