import React, { useState } from 'react';
import {
  Search, Code, FileText, Target, Eye, Zap, Plus, X,
  CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  ExternalLink, BarChart3, List, BookOpen, Sparkles
} from 'lucide-react';

const API_URL = 'http://localhost:3001';

// ============================================================
// SHARED COMPONENTS
// ============================================================
const ScoreBadge = ({ score, size = 'md' }) => {
  const getColor = (s) => {
    if (s >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (s >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };
  const sizeClass = size === 'lg' ? 'text-4xl px-4 py-2' : 'text-sm px-2 py-1';
  return <span className={`font-bold rounded border ${getColor(score)} ${sizeClass}`}>{score}</span>;
};

const StatusIcon = ({ value }) => (
  value ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />
);

const PriorityBadge = ({ priority }) => {
  const colors = { critical: 'bg-red-600 text-white', high: 'bg-orange-500 text-white', medium: 'bg-yellow-500 text-black', low: 'bg-blue-400 text-white' };
  return <span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${colors[priority] || 'bg-gray-400'}`}>{priority}</span>;
};

const Section = ({ title, icon: Icon, score, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <span className="font-semibold text-gray-900">{title}</span>
          {score !== undefined && <ScoreBadge score={score} />}
        </div>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
};

const RecommendationsList = ({ recommendations }) => (
  <div className="space-y-3">
    {recommendations.map((rec, i) => (
      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <PriorityBadge priority={rec.priority} />
          <span className="text-xs text-gray-500">{rec.category}</span>
        </div>
        <h4 className="font-medium text-gray-900">{rec.issue}</h4>
        <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
      </div>
    ))}
  </div>
);

const MetricRow = ({ label, value, good }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
    <span className="text-gray-700">{label}</span>
    {typeof value === 'boolean' ? <StatusIcon value={value} /> : <span className={`font-semibold ${good ? 'text-green-600' : ''}`}>{value}</span>}
  </div>
);

const UrlInput = ({ url, setUrl, onAnalyze, loading }) => (
  <div className="flex gap-3 mb-6">
    <input type="text" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && onAnalyze()}
      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
    <button onClick={onAnalyze} disabled={loading || !url}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 font-semibold">
      {loading ? <><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> Analyzing...</> : <><Search className="w-5 h-5" /> Analyze</>}
    </button>
  </div>
);

const ErrorDisplay = ({ error }) => error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <div className="flex items-center gap-2 text-red-800"><AlertTriangle className="w-5 h-5" /><span>{error}</span></div>
  </div>
);

// ============================================================
// TOOL 1: TECHNICAL AUDIT
// ============================================================
const TechnicalAudit = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/technical`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResults(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Technical AEO Audit</h2>
        <p className="text-gray-600">Analyze whether AI engines can properly access and parse your website</p>
      </div>
      <UrlInput url={url} setUrl={setUrl} onAnalyze={analyze} loading={loading} />
      <ErrorDisplay error={error} />
      {results && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div><h3 className="text-xl font-bold">Technical Score</h3>
                <a href={results.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">{results.url} <ExternalLink className="w-3 h-3" /></a>
              </div>
              <ScoreBadge score={results.overallScore} size="lg" />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6">
              {Object.entries(results.scores).map(([key, val]) => (<div key={key} className="text-center"><div className="text-2xl font-bold">{val}</div><div className="text-sm text-gray-600 capitalize">{key}</div></div>))}
            </div>
          </div>
          <Section title="Schema Markup" icon={Code} score={results.schema.score}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MetricRow label="Has Structured Data" value={results.schema.hasSchema} />
              <MetricRow label="Schema Count" value={results.schema.count} />
              <MetricRow label="FAQ Schema" value={results.schema.detected.hasFAQ} />
              <MetricRow label="Article Schema" value={results.schema.detected.hasArticle} />
              <MetricRow label="Organization Schema" value={results.schema.detected.hasOrganization} />
            </div>
            {results.schema.types.length > 0 && (<div><h4 className="font-medium mb-2">Types:</h4><div className="flex flex-wrap gap-2">{results.schema.types.map((t, i) => (<span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{t}</span>))}</div></div>)}
          </Section>
          <Section title="Crawlability" icon={Eye} score={results.crawlability.score}>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="Indexable" value={results.crawlability.isIndexable} />
              <MetricRow label="Followable" value={results.crawlability.isFollowable} />
              <MetricRow label="HTTPS" value={results.crawlability.hasHTTPS} />
              <MetricRow label="Canonical URL" value={results.crawlability.hasCanonical} />
            </div>
          </Section>
          <Section title="HTML Structure" icon={FileText} score={results.structure.score}>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="H1 Tags" value={results.structure.headers.h1.count} good={results.structure.headers.h1.count === 1} />
              <MetricRow label="H2 Tags" value={results.structure.headers.h2.count} good={results.structure.headers.h2.count >= 3} />
              <MetricRow label="Word Count" value={results.structure.wordCount.toLocaleString()} good={results.structure.wordCount >= 500} />
              <MetricRow label="Lists" value={results.structure.lists.items} />
            </div>
          </Section>
          <Section title={`Recommendations (${results.recommendations.length})`} icon={AlertTriangle}><RecommendationsList recommendations={results.recommendations} /></Section>
        </div>
      )}
    </div>
  );
};

// ============================================================
// TOOL 2: CONTENT ANALYZER
// ============================================================
const ContentAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/content`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResults(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Quality Analyzer</h2>
        <p className="text-gray-600">Analyze whether your content is optimized for AI extraction and citation</p>
      </div>
      <UrlInput url={url} setUrl={setUrl} onAnalyze={analyze} loading={loading} />
      <ErrorDisplay error={error} />
      {results && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div><h3 className="text-xl font-bold">Content Score</h3><p className="text-sm text-gray-500">{results.contentStats.wordCount.toLocaleString()} words</p></div>
              <ScoreBadge score={results.overallScore} size="lg" />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6">
              {Object.entries(results.scores).map(([key, val]) => (<div key={key} className="text-center"><div className="text-2xl font-bold">{val}</div><div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div></div>))}
            </div>
          </div>
          <Section title="Readability" icon={BookOpen} score={results.readability.score}>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="Flesch Score" value={results.readability.metrics.fleschScore} good={results.readability.metrics.fleschScore >= 60} />
              <MetricRow label="Grade Level" value={results.readability.metrics.gradeLevel} />
              <MetricRow label="Avg Words/Sentence" value={results.readability.metrics.avgWordsPerSentence} />
              <MetricRow label="Level" value={results.readability.metrics.readabilityLevel} />
            </div>
          </Section>
          <Section title="Q&A Patterns" icon={List} score={results.qaPatterns.score}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MetricRow label="Question Headers" value={results.qaPatterns.questionHeaders.count} good={results.qaPatterns.questionHeaders.count >= 3} />
              <MetricRow label="FAQ Section" value={results.qaPatterns.hasFAQSection} />
              <MetricRow label="Direct Answers" value={results.qaPatterns.directAnswers.count} />
              <MetricRow label="Step Content" value={results.qaPatterns.hasStepContent} />
            </div>
            {results.qaPatterns.questionHeaders.examples.length > 0 && (<div className="bg-gray-50 p-3 rounded"><h4 className="font-medium mb-2">Question Headers:</h4><ul className="space-y-1">{results.qaPatterns.questionHeaders.examples.map((h, i) => (<li key={i} className="text-sm text-gray-700 border-l-2 border-blue-300 pl-2">{h}</li>))}</ul></div>)}
          </Section>
          <Section title="Citation Worthiness" icon={BarChart3} score={results.citationWorthiness.score}>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="Has Author" value={results.citationWorthiness.authoritySignals.hasAuthor} />
              <MetricRow label="Has Publish Date" value={results.citationWorthiness.authoritySignals.hasPublishDate} />
              <MetricRow label="Source Citations" value={results.citationWorthiness.sources.count} good={results.citationWorthiness.sources.count >= 3} />
              <MetricRow label="Specificity Score" value={results.citationWorthiness.specificity.score} />
            </div>
          </Section>
          <Section title={`Recommendations (${results.recommendations.length})`} icon={AlertTriangle}><RecommendationsList recommendations={results.recommendations} /></Section>
        </div>
      )}
    </div>
  );
};

// ============================================================
// TOOL 3: QUERY MATCH ANALYZER
// ============================================================
const QueryMatchAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [queries, setQueries] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const addQuery = () => queries.length < 10 && setQueries([...queries, '']);
  const removeQuery = (i) => queries.length > 1 && setQueries(queries.filter((_, idx) => idx !== i));
  const updateQuery = (i, val) => setQueries(queries.map((q, idx) => idx === i ? val : q));

  const analyze = async () => {
    const validQueries = queries.filter(q => q.trim());
    if (!validQueries.length) { setError('Add at least one query'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/query-match`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, queries: validQueries }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResults(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const getMatchColor = (score) => {
    if (score >= 70) return 'bg-green-100 border-green-300';
    if (score >= 50) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Query Match Analyzer</h2>
        <p className="text-gray-600">See how well your content matches specific queries users might ask AI engines</p>
      </div>
      <UrlInput url={url} setUrl={setUrl} onAnalyze={analyze} loading={loading} />
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Target Queries (What you want to rank for)</h3>
        <div className="space-y-2">
          {queries.map((q, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" placeholder={`e.g., "What is ${i === 0 ? 'your product' : 'query ' + (i + 1)}?"`}
                value={q} onChange={(e) => updateQuery(i, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              {queries.length > 1 && <button onClick={() => removeQuery(i)} className="p-2 text-red-500 hover:bg-red-50 rounded"><X className="w-5 h-5" /></button>}
            </div>
          ))}
        </div>
        {queries.length < 10 && <button onClick={addQuery} className="mt-3 flex items-center gap-1 text-blue-600 hover:text-blue-800"><Plus className="w-4 h-4" /> Add Query</button>}
      </div>
      
      <ErrorDisplay error={error} />
      
      {results && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div><h3 className="text-xl font-bold">Overall Match Score</h3><p className="text-sm text-gray-500">{results.queriesAnalyzed} queries analyzed</p></div>
              <ScoreBadge score={results.overallScore} size="lg" />
            </div>
          </div>

          {/* Query Results */}
          {results.queries.map((q, i) => (
            <div key={i} className={`rounded-lg border-2 p-4 mb-4 ${getMatchColor(q.matchScore)}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">"{q.query}"</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${q.matchLevel.level === 'Strong' ? 'bg-green-200' : q.matchLevel.level === 'Good' ? 'bg-green-100' : q.matchLevel.level === 'Moderate' ? 'bg-yellow-200' : 'bg-red-200'}`}>{q.matchLevel.level}</span>
                  <ScoreBadge score={q.matchScore} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{q.matchLevel.description}</p>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center p-2 bg-white/50 rounded"><div className="font-bold">{q.scores.keywords}</div><div className="text-xs">Keywords</div></div>
                <div className="text-center p-2 bg-white/50 rounded"><div className="font-bold">{q.scores.semantic}</div><div className="text-xs">Semantic</div></div>
                <div className="text-center p-2 bg-white/50 rounded"><div className="font-bold">{q.scores.intent}</div><div className="text-xs">Intent</div></div>
                <div className="text-center p-2 bg-white/50 rounded"><div className="font-bold">{q.scores.answerQuality}</div><div className="text-xs">Answer</div></div>
              </div>

              {q.improvements.length > 0 && (
                <div className="bg-white/70 rounded p-3">
                  <h5 className="font-medium mb-2">Improvements:</h5>
                  <ul className="space-y-1">
                    {q.improvements.slice(0, 3).map((imp, j) => (
                      <li key={j} className="text-sm"><span className="font-medium text-orange-700">{imp.issue}</span> → {imp.action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Content Gaps */}
          {results.contentGaps.length > 0 && (
            <Section title="Content Gaps" icon={AlertTriangle}>
              <div className="space-y-2">
                {results.contentGaps.map((gap, i) => (
                  <div key={i} className="p-3 bg-orange-50 rounded border border-orange-200">
                    <h4 className="font-medium text-orange-800">{gap.issue}</h4>
                    <p className="text-sm text-orange-700">{gap.solution}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title={`Recommendations (${results.recommendations.length})`} icon={AlertTriangle}><RecommendationsList recommendations={results.recommendations} /></Section>
        </div>
      )}
    </div>
  );
};

// ============================================================
// TOOL 4: AI VISIBILITY CHECKER
// ============================================================
const VisibilityChecker = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/visibility`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResults(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Visibility Checker</h2>
        <p className="text-gray-600">Comprehensive analysis of your page's likelihood to be cited by AI engines</p>
      </div>
      <UrlInput url={url} setUrl={setUrl} onAnalyze={analyze} loading={loading} />
      <ErrorDisplay error={error} />
      {results && (
        <div>
          {/* Verdict Card */}
          <div className={`rounded-lg shadow p-6 mb-6 ${results.verdict.color === 'green' ? 'bg-green-50' : results.verdict.color === 'lightgreen' ? 'bg-green-50' : results.verdict.color === 'yellow' ? 'bg-yellow-50' : results.verdict.color === 'orange' ? 'bg-orange-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">{results.verdict.level}</h3>
                <p className="text-gray-700">{results.verdict.description}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold">{results.overallScore}</div>
                <div className="text-sm text-gray-600">AI Visibility Score</div>
              </div>
            </div>
            {results.verdict.weakestAreas.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Focus areas: </span>
                {results.verdict.weakestAreas.map((a, i) => (
                  <span key={i} className="inline-block bg-white/50 px-2 py-1 rounded mr-2">{a.name}: {a.score}</span>
                ))}
              </div>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold mb-4">Score Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(results.scores).map(([key, val]) => (
                <div key={key} className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{val}</div>
                  <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${val >= 70 ? 'bg-green-500' : val >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wins */}
          {results.quickWins.length > 0 && (
            <Section title="Quick Wins" icon={Zap} defaultOpen={true}>
              <div className="space-y-3">
                {results.quickWins.map((win, i) => (
                  <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-green-200 rounded">{win.effort} Effort</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-200 rounded">{win.impact} Impact</span>
                    </div>
                    <p className="font-medium text-green-900">{win.action}</p>
                    <p className="text-sm text-green-700">{win.reason}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Citation Potential" icon={Sparkles} score={results.citationPotential.score}>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="Quotable Sentences" value={results.citationPotential.quotableSentences.count} good={results.citationPotential.quotableSentences.count >= 10} />
              <MetricRow label="Quotable Ratio" value={`${results.citationPotential.quotableSentences.ratio}%`} good={results.citationPotential.quotableSentences.ratio >= 20} />
              <MetricRow label="Factual Density" value={results.citationPotential.factualDensity} good={results.citationPotential.factualDensity >= 1} />
              <MetricRow label="Direct Answers" value={results.citationPotential.directAnswers} />
              <MetricRow label="Original Content" value={results.citationPotential.hasOriginalContent} />
            </div>
          </Section>

          <Section title="Authority Signals" icon={BarChart3} score={results.authority.score}>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="Has Author" value={results.authority.authorship.hasAuthor} />
              <MetricRow label="Author Bio" value={results.authority.authorship.hasAuthorBio} />
              <MetricRow label="Source Citations" value={results.authority.sources.count} good={results.authority.sources.count >= 3} />
              <MetricRow label="Content Depth" value={`${results.authority.contentDepth} words`} good={results.authority.contentDepth >= 800} />
            </div>
          </Section>

          <Section title="Entity Recognition" icon={Target} score={results.entities.score}>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label="Organization Schema" value={results.entities.schemas.hasOrganization} />
              <MetricRow label="Person Schema" value={results.entities.schemas.hasPerson} />
              <MetricRow label="Product Schema" value={results.entities.schemas.hasProduct} />
              <MetricRow label="Entity Mentions" value={results.entities.entityMentions} />
            </div>
          </Section>

          <Section title={`Recommendations (${results.recommendations.length})`} icon={AlertTriangle}><RecommendationsList recommendations={results.recommendations} /></Section>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [activeTab, setActiveTab] = useState('technical');

  const tabs = [
    { id: 'technical', name: 'Technical Audit', icon: Code, description: 'Schema, crawlability, structure' },
    { id: 'content', name: 'Content Quality', icon: FileText, description: 'Readability, Q&A, citations' },
    { id: 'query', name: 'Query Match', icon: Target, description: 'Match content to prompts' },
    { id: 'visibility', name: 'AI Visibility', icon: Eye, description: 'Overall citation potential' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">AEO Audit Suite</h1>
          <p className="text-gray-600">Answer Engine Optimization Tools</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-xs opacity-70">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'technical' && <TechnicalAudit />}
        {activeTab === 'content' && <ContentAnalyzer />}
        {activeTab === 'query' && <QueryMatchAnalyzer />}
        {activeTab === 'visibility' && <VisibilityChecker />}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-gray-500 text-sm">
        AEO Audit Suite — Optimize for AI-powered search
      </div>
    </div>
  );
}
