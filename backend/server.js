const express = require('express');
const cors = require('cors');
const { fetchPage, normalizeUrl } = require('./utils');
const { analyzeTechnical } = require('./analyzers/technical');
const { analyzeContent } = require('./analyzers/content');
const { analyzeQueryMatch } = require('./analyzers/queryMatch');
const { analyzeVisibility } = require('./analyzers/visibility');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ============================================================
// TOOL 1: Technical AEO Audit
// Analyzes schema, crawlability, structure, accessibility
// ============================================================
app.post('/api/technical', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const targetUrl = normalizeUrl(url);
    console.log(`\n[Technical Audit] Analyzing: ${targetUrl}`);
    
    const { $ } = await fetchPage(targetUrl);
    const results = analyzeTechnical($, targetUrl);
    
    console.log(`[Technical Audit] Complete. Score: ${results.overallScore}/100`);
    
    res.json({
      tool: 'Technical AEO Audit',
      url: targetUrl,
      analyzedAt: new Date().toISOString(),
      ...results,
    });

  } catch (error) {
    console.error('[Technical Audit] Error:', error.message);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error.message,
      url 
    });
  }
});

// ============================================================
// TOOL 2: Content Quality Analyzer
// Analyzes readability, Q&A patterns, citation-worthiness
// ============================================================
app.post('/api/content', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const targetUrl = normalizeUrl(url);
    console.log(`\n[Content Analysis] Analyzing: ${targetUrl}`);
    
    const { $ } = await fetchPage(targetUrl);
    const results = analyzeContent($, targetUrl);
    
    console.log(`[Content Analysis] Complete. Score: ${results.overallScore}/100`);
    
    res.json({
      tool: 'Content Quality Analyzer',
      url: targetUrl,
      analyzedAt: new Date().toISOString(),
      ...results,
    });

  } catch (error) {
    console.error('[Content Analysis] Error:', error.message);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error.message,
      url 
    });
  }
});

// ============================================================
// TOOL 3: Query Match Analyzer
// Analyzes how well content matches target queries
// ============================================================
app.post('/api/query-match', async (req, res) => {
  const { url, queries } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  if (!queries || !Array.isArray(queries) || queries.length === 0) {
    return res.status(400).json({ error: 'At least one query is required' });
  }

  // Limit queries
  const targetQueries = queries.slice(0, 10).map(q => q.trim()).filter(q => q.length > 0);
  
  if (targetQueries.length === 0) {
    return res.status(400).json({ error: 'At least one valid query is required' });
  }

  try {
    const targetUrl = normalizeUrl(url);
    console.log(`\n[Query Match] Analyzing: ${targetUrl}`);
    console.log(`[Query Match] Queries: ${targetQueries.join(', ')}`);
    
    const { $ } = await fetchPage(targetUrl);
    const results = analyzeQueryMatch($, targetUrl, targetQueries);
    
    console.log(`[Query Match] Complete. Overall Match: ${results.overallScore}/100`);
    
    res.json({
      tool: 'Query Match Analyzer',
      url: targetUrl,
      analyzedAt: new Date().toISOString(),
      ...results,
    });

  } catch (error) {
    console.error('[Query Match] Error:', error.message);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error.message,
      url 
    });
  }
});

// ============================================================
// TOOL 4: AI Visibility Checker
// Overall AI visibility and citation potential
// ============================================================
app.post('/api/visibility', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const targetUrl = normalizeUrl(url);
    console.log(`\n[Visibility Check] Analyzing: ${targetUrl}`);
    
    const { $ } = await fetchPage(targetUrl);
    const results = analyzeVisibility($, targetUrl);
    
    console.log(`[Visibility Check] Complete. Score: ${results.overallScore}/100`);
    
    res.json({
      tool: 'AI Visibility Checker',
      url: targetUrl,
      analyzedAt: new Date().toISOString(),
      ...results,
    });

  } catch (error) {
    console.error('[Visibility Check] Error:', error.message);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error.message,
      url 
    });
  }
});

// ============================================================
// FULL AUDIT: Run all tools at once
// ============================================================
app.post('/api/full-audit', async (req, res) => {
  const { url, queries } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const targetUrl = normalizeUrl(url);
    console.log(`\n[Full Audit] Analyzing: ${targetUrl}`);
    
    const { $ } = await fetchPage(targetUrl);
    
    // Run all analyzers
    const technical = analyzeTechnical($, targetUrl);
    const content = analyzeContent($, targetUrl);
    const visibility = analyzeVisibility($, targetUrl);
    
    // Query match only if queries provided
    let queryMatch = null;
    if (queries && Array.isArray(queries) && queries.length > 0) {
      const targetQueries = queries.slice(0, 10).map(q => q.trim()).filter(q => q.length > 0);
      if (targetQueries.length > 0) {
        queryMatch = analyzeQueryMatch($, targetUrl, targetQueries);
      }
    }
    
    // Calculate combined score
    const scores = [
      technical.overallScore,
      content.overallScore,
      visibility.overallScore,
    ];
    if (queryMatch) scores.push(queryMatch.overallScore);
    
    const combinedScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    console.log(`[Full Audit] Complete. Combined Score: ${combinedScore}/100`);
    
    res.json({
      tool: 'Full AEO Audit',
      url: targetUrl,
      analyzedAt: new Date().toISOString(),
      combinedScore,
      technical: {
        score: technical.overallScore,
        scores: technical.scores,
        recommendations: technical.recommendations.slice(0, 5),
      },
      content: {
        score: content.overallScore,
        scores: content.scores,
        recommendations: content.recommendations.slice(0, 5),
      },
      visibility: {
        score: visibility.overallScore,
        verdict: visibility.verdict,
        quickWins: visibility.quickWins,
        recommendations: visibility.recommendations.slice(0, 5),
      },
      queryMatch: queryMatch ? {
        score: queryMatch.overallScore,
        queries: queryMatch.queries.map(q => ({
          query: q.query,
          score: q.matchScore,
          level: q.matchLevel.level,
        })),
        recommendations: queryMatch.recommendations.slice(0, 5),
      } : null,
      topRecommendations: getTopRecommendations(technical, content, visibility, queryMatch),
    });

  } catch (error) {
    console.error('[Full Audit] Error:', error.message);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error.message,
      url 
    });
  }
});

function getTopRecommendations(technical, content, visibility, queryMatch) {
  const allRecs = [
    ...technical.recommendations,
    ...content.recommendations,
    ...visibility.recommendations,
    ...(queryMatch?.recommendations || []),
  ];

  // Deduplicate and prioritize
  const seen = new Set();
  return allRecs
    .filter(rec => {
      const key = rec.action.substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const priority = { critical: 0, high: 1, medium: 2, low: 3 };
      return priority[a.priority] - priority[b.priority];
    })
    .slice(0, 10);
}

// ============================================================
// Health check
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// Start server
// ============================================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    AEO AUDIT SUITE                            ║
║                 Backend Server v1.0                           ║
╠═══════════════════════════════════════════════════════════════╣
║  Running on: http://localhost:${PORT}                           ║
╠═══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                   ║
║                                                               ║
║  POST /api/technical    - Technical AEO Audit                 ║
║       └─ Schema, crawlability, structure, accessibility       ║
║                                                               ║
║  POST /api/content      - Content Quality Analyzer            ║
║       └─ Readability, Q&A patterns, citation-worthiness       ║
║                                                               ║
║  POST /api/query-match  - Query Match Analyzer                ║
║       └─ Match content to target queries/prompts              ║
║       └─ Body: { url, queries: ["query1", "query2", ...] }    ║
║                                                               ║
║  POST /api/visibility   - AI Visibility Checker               ║
║       └─ Overall AI visibility and citation potential         ║
║                                                               ║
║  POST /api/full-audit   - Run All Tools                       ║
║       └─ Complete analysis with all tools                     ║
║                                                               ║
║  GET  /api/health       - Health check                        ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});
