// ========== Tab Switching ==========
document.addEventListener('DOMContentLoaded', () => {
  // Generic tab handler
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      const target = btn.dataset.target;

      // Deactivate siblings
      document.querySelectorAll(`.tab-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`.result-panel[data-group="${group}"]`).forEach(p => p.classList.remove('active'));

      // Activate clicked
      btn.classList.add('active');
      document.querySelector(`.result-panel[data-group="${group}"][data-panel="${target}"]`)?.classList.add('active');
    });
  });

  // ========== Copy Citation ==========
  document.querySelector('.copy-btn')?.addEventListener('click', () => {
    const text = document.querySelector('.citation-block code')?.textContent;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });
    }
  });

  // ========== Render Sign Agreement Charts ==========
  renderSignAgreementCharts();

  // ========== Render Benchmarking Table ==========
  renderBenchmarkTable();

  // ========== Conversation Examples ==========
  initExamples();

  // ========== Per-Turn Before/After IU Graphs ==========
  renderPerturnGraphs();
});

// ========== Chart Data ==========
const signAgreementData = {
  math: {
    title: 'MathQA',
    levels: ['Novice', 'Intermediate', 'Advanced'],
    values: [100, 50, 70],
    counts: ['13/13', '7/14', '7/10'],
  },
  expertqa: {
    title: 'ExpertQA',
    levels: ['Novice', 'Intermediate', 'Advanced'],
    values: [83, 80, 62],
    counts: ['10/12', '8/10', '8/13'],
  }
};

function renderSignAgreementCharts() {
  Object.keys(signAgreementData).forEach(key => {
    const container = document.getElementById(`chart-sign-${key}`);
    if (!container) return;

    const d = signAgreementData[key];
    const w = 320, h = 200, pad = { top: 30, right: 20, bottom: 40, left: 45 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    const barW = plotW / d.levels.length * 0.6;
    const gap = plotW / d.levels.length;

    const colors = ['#f59e0b', '#2563eb', '#6366f1'];

    let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="font-family:'IBM Plex Sans',sans-serif">`;

    // Title
    svg += `<text x="${w/2}" y="16" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">${d.title}</text>`;

    // Y axis
    for (let tick = 0; tick <= 100; tick += 25) {
      const y = pad.top + plotH - (tick / 100) * plotH;
      svg += `<line x1="${pad.left}" y1="${y}" x2="${pad.left + plotW}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
      svg += `<text x="${pad.left - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${tick}%</text>`;
    }

    // 50% reference line
    const y50 = pad.top + plotH - (50 / 100) * plotH;
    svg += `<line x1="${pad.left}" y1="${y50}" x2="${pad.left + plotW}" y2="${y50}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>`;

    // Bars
    d.levels.forEach((label, i) => {
      const x = pad.left + gap * i + (gap - barW) / 2;
      const barH = (d.values[i] / 100) * plotH;
      const y = pad.top + plotH - barH;

      svg += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${colors[i]}" opacity="0.85"/>`;
      // Value label
      svg += `<text x="${x + barW/2}" y="${y - 8}" text-anchor="middle" font-size="11" font-weight="700" fill="${colors[i]}">${d.values[i]}%</text>`;
      // Count label
      svg += `<text x="${x + barW/2}" y="${y - 20}" text-anchor="middle" font-size="9" fill="#94a3b8">${d.counts[i]}</text>`;
      // X label
      svg += `<text x="${x + barW/2}" y="${pad.top + plotH + 16}" text-anchor="middle" font-size="10" fill="#64748b">${label}</text>`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  });
}

// ========== Benchmark Table Data ==========
const benchmarkData = [
  { model: 'Gemini 3.1 Pro',    novice: { kg: 13.2, co: 0.875, dc: 0.121, iq: 8.39, r: 3.25 }, intermediate: { kg: 5.4, co: 0.750, dc: 0.098, iq: 8.35, r: 4.75 }, advanced: { kg: 0.7, co: 0.873, dc: 0.123, iq: 7.96, r: 1.75 }},
  { model: 'Claude Opus 4.7',   novice: { kg: 14.3, co: 0.882, dc: 0.126, iq: 7.80, r: 3.25 }, intermediate: { kg: 5.6, co: 0.807, dc: 0.137, iq: 8.39, r: 2.50 }, advanced: { kg: 0.6, co: 0.879, dc: 0.110, iq: 8.30, r: 3.00 }},
  { model: 'DeepSeek V4',       novice: { kg: 15.5, co: 0.945, dc: 0.130, iq: 6.50, r: 4.00 }, intermediate: { kg: 5.7, co: 0.835, dc: 0.133, iq: 7.53, r: 4.25 }, advanced: { kg: 0.5, co: 0.890, dc: 0.111, iq: 7.74, r: 4.50 }},
  { model: 'Gemini 3.1 Flash',  novice: { kg: 15.1, co: 0.936, dc: 0.132, iq: 6.83, r: 3.25 }, intermediate: { kg: 5.6, co: 0.838, dc: 0.127, iq: 7.73, r: 5.75 }, advanced: { kg: 0.5, co: 0.912, dc: 0.113, iq: 7.64, r: 5.75 }},
  { model: 'Claude Sonnet 4.6', novice: { kg: 12.9, co: 0.877, dc: 0.118, iq: 7.06, r: 4.75 }, intermediate: { kg: 5.4, co: 0.791, dc: 0.105, iq: 7.87, r: 5.00 }, advanced: { kg: 0.6, co: 0.866, dc: 0.102, iq: 8.00, r: 3.50 }},
  { model: 'GPT-5.4',           novice: { kg: 14.9, co: 0.940, dc: 0.123, iq: 5.24, r: 5.50 }, intermediate: { kg: 5.6, co: 0.792, dc: 0.133, iq: 6.86, r: 5.25 }, advanced: { kg: 0.4, co: 0.903, dc: 0.103, iq: 7.05, r: 7.75 }},
  { model: 'Qwen-3.6-35B',     novice: { kg: 14.4, co: 0.934, dc: 0.119, iq: 5.68, r: 5.25 }, intermediate: { kg: 5.7, co: 0.829, dc: 0.137, iq: 6.89, r: 4.50 }, advanced: { kg: 0.5, co: 0.892, dc: 0.084, iq: 7.39, r: 7.00 }},
  { model: 'GPT-5.4 mini',     novice: { kg: 12.6, co: 0.946, dc: 0.110, iq: 5.41, r: 8.00 }, intermediate: { kg: 5.4, co: 0.809, dc: 0.130, iq: 7.13, r: 6.25 }, advanced: { kg: 0.5, co: 0.901, dc: 0.116, iq: 7.24, r: 5.75 }},
  { model: 'Llama-4-Maverick',  novice: { kg: 11.8, co: 0.927, dc: 0.106, iq: 4.58, r: 7.75 }, intermediate: { kg: 5.4, co: 0.767, dc: 0.114, iq: 5.64, r: 6.75 }, advanced: { kg: 0.3, co: 0.882, dc: 0.121, iq: 6.07, r: 6.00 }},
];

function renderBenchmarkTable() {
  const container = document.getElementById('benchmark-table');
  if (!container) return;

  // Find best values per (level, metric)
  const levels = ['novice', 'intermediate', 'advanced'];
  const metrics = ['kg', 'co', 'dc', 'iq'];
  const best = {};
  levels.forEach(l => {
    best[l] = {};
    metrics.forEach(m => {
      if (m === 'co') {
        best[l][m] = Math.min(...benchmarkData.map(r => r[l][m]));
      } else {
        best[l][m] = Math.max(...benchmarkData.map(r => r[l][m]));
      }
    });
    best[l].r = Math.min(...benchmarkData.map(r => r[l].r));
  });

  let html = `<table class="data-table">
    <thead>
      <tr>
        <th rowspan="2" style="text-align:left">Model</th>
        <th colspan="5" class="level-header">Novice</th>
        <th colspan="5" class="level-header" style="border-left:2px solid #cbd5e1;">Intermediate</th>
        <th colspan="5" class="level-header" style="border-left:2px solid #cbd5e1;">Advanced</th>
      </tr>
      <tr>
        ${levels.map((l, li) => {
          const border = li > 0 ? ' style="border-left:2px solid #cbd5e1;"' : '';
          return `<th${border}>KG</th><th>CO&#8595;</th><th>DC</th><th>IQ</th><th>R&#773;</th>`;
        }).join('')}
      </tr>
    </thead>
    <tbody>`;

  benchmarkData.forEach(row => {
    html += `<tr><td class="model-name">${row.model}</td>`;
    levels.forEach((l, li) => {
      metrics.forEach((m, mi) => {
        const val = row[l][m];
        const isBest = (m === 'co') ? val === best[l][m] : val === best[l][m];
        const borderClass = (mi === 0 && li > 0) ? ' level-border' : '';
        html += `<td class="${isBest ? 'best' : ''}${borderClass}">${val.toFixed(m === 'kg' ? 1 : 3).replace(/\.?0+$/, val.toFixed(m === 'kg' ? 1 : 3).includes('.') ? '' : '')}</td>`;
      });
      const rVal = row[l].r;
      const isBestR = rVal === best[l].r;
      html += `<td class="${isBestR ? 'best' : ''}">${rVal.toFixed(2)}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// ========== Conversation Examples ==========

let currentQuestionIdx = 0;
let currentLevel = 'novice';
let currentBaselineKey = 'zero-shot';

function initExamples() {
  if (typeof SAMPLE_QUESTIONS === 'undefined' || !SAMPLE_QUESTIONS.length) return;

  const qSelect = document.getElementById('question-select');
  const lvSelect = document.getElementById('level-select');
  const blSelect = document.getElementById('baseline-select');
  if (!qSelect || !lvSelect || !blSelect) return;

  // Populate question dropdown
  SAMPLE_QUESTIONS.forEach((q, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = q.label;
    qSelect.appendChild(opt);
  });

  qSelect.addEventListener('change', () => {
    currentQuestionIdx = parseInt(qSelect.value);
    renderExample();
  });

  lvSelect.addEventListener('change', () => {
    currentLevel = lvSelect.value;
    renderExample();
  });

  blSelect.addEventListener('change', () => {
    currentBaselineKey = blSelect.value;
    renderExample();
  });

  renderExample();
}

function renderExample() {
  const question = SAMPLE_QUESTIONS[currentQuestionIdx];
  if (!question) return;

  const levelData = question.levels[currentLevel] || {};

  // Context
  const ctx = document.getElementById('example-context');
  ctx.innerHTML = `
    <div class="ctx-label">Question <span class="ctx-level ${currentLevel}">${currentLevel}</span></div>
    <div>${question.question}</div>
  `;

  // KnowSim conversation
  const ksConv = levelData.knowsim;
  const blConv = levelData[currentBaselineKey];

  renderConvPanel('knowsim-conv', ksConv);
  renderConvPanel('baseline-conv', blConv);

  // Metrics
  renderMetrics('knowsim-metrics', ksConv);
  renderMetrics('baseline-metrics', blConv);

  // Baseline label & header styling
  const blLabel = document.getElementById('baseline-label');
  blLabel.textContent = METHOD_LABELS[currentBaselineKey] || currentBaselineKey;

  // IU graph
  renderIUGraph(question);

  // Knowledge state progression
  renderKSProgression(ksConv);
}

function renderConvPanel(containerId, convData) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!convData) {
    el.innerHTML = '<div style="padding:2rem; text-align:center; color:var(--text-muted);">No conversation data available for this method.</div>';
    return;
  }

  let html = '';
  convData.turns.forEach(turn => {
    html += `
      <div class="chat-bubble ${turn.role}">
        <div class="cb-role">${turn.role === 'user' ? 'Simulated User' : 'Assistant'}</div>
        <div class="cb-content">${turn.content}</div>
      </div>
    `;
  });

  // Stop reason
  if (convData.stop_reason) {
    html += `<div style="text-align:center; font-size:0.75rem; color:var(--text-muted); padding:0.5rem; border-top:1px dashed var(--border); margin-top:0.5rem;">
      End: ${convData.stop_reason} (${convData.num_turns} turns)
    </div>`;
  }

  el.innerHTML = html;
  el.scrollTop = 0;
}

function renderMetrics(containerId, convData) {
  const el = document.getElementById(containerId);
  if (!el || !convData) { if (el) el.innerHTML = ''; return; }

  const m = convData.metrics || {};
  let badges = '';
  if (m.IQ != null) badges += `<span class="m-badge">IQ: ${m.IQ}</span>`;
  if (m.KG != null) badges += `<span class="m-badge">KG: ${m.KG}</span>`;
  if (m.DC != null) badges += `<span class="m-badge">DC: ${m.DC}</span>`;
  if (m.CO != null) badges += `<span class="m-badge">CO: ${m.CO}</span>`;
  el.innerHTML = badges;
}

// ========== Knowledge State Progression ==========

let ksActiveTurn = -1; // -1 means show all columns (heatmap mode)

function renderKSProgression(convData) {
  const gridEl = document.getElementById('ks-grid');
  if (!gridEl) return;

  const prog = convData?.knowledge_progression;
  if (!prog || !prog.length) {
    gridEl.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:1rem;">No knowledge state data available.</div>';
    return;
  }

  ksActiveTurn = -1;
  drawKSGrid(prog, gridEl);
}

function drawKSGrid(prog, gridEl) {
  const iuNames = Object.keys(prog[0].states);
  const stateLabels = { unaware: 'Unaware', struggling: 'Struggling', partial_understanding: 'Partial', knows_well: 'Knows Well' };
  const stateOrder = { unaware: 0, struggling: 1, partial_understanding: 2, knows_well: 3 };

  if (ksActiveTurn === -1) {
    // Heatmap mode: all turns as columns
    const nCols = prog.length + 1; // IU label + turns
    let html = `<div class="ks-grid" style="grid-template-columns: minmax(180px, 1fr) repeat(${prog.length}, minmax(60px, 1fr));">`;

    // Header row
    html += `<div class="ks-cell header"></div>`;
    prog.forEach(p => {
      html += `<div class="ks-cell header">${p.label}</div>`;
    });

    // IU rows
    iuNames.forEach(iu => {
      html += `<div class="ks-cell iu-label" title="${stripHtml(iu)}">${iu}</div>`;
      let prevState = null;
      prog.forEach(p => {
        const state = p.states[iu] || 'unaware';
        const stateClass = state.replace('partial_understanding', 'partial');
        const changed = prevState !== null && state !== prevState ? ' changed' : '';
        const shortLabel = stateLabels[state] || state;
        html += `<div class="ks-cell ${stateClass}${changed}" title="${shortLabel}">${shortLabel}</div>`;
        prevState = state;
      });
    });

    html += `</div>`;

    // Legend
    html += `<div class="ks-legend">
      <div class="ks-legend-item"><div class="ks-legend-swatch" style="background:#f1f5f9;border:1px solid #e2e8f0;"></div> Unaware</div>
      <div class="ks-legend-item"><div class="ks-legend-swatch" style="background:#fee2e2;"></div> Struggling</div>
      <div class="ks-legend-item"><div class="ks-legend-swatch" style="background:#fef3c7;"></div> Partial</div>
      <div class="ks-legend-item"><div class="ks-legend-swatch" style="background:#d1fae5;"></div> Knows Well</div>
      <div class="ks-legend-item"><div class="ks-legend-swatch" style="background:#fff;outline:2px solid var(--accent);"></div> Changed</div>
    </div>`;

    gridEl.innerHTML = html;
  } else {
    // Single-turn detail view
    const turnData = prog.find(p => p.turn === ksActiveTurn);
    const prevData = prog.find(p => p.turn === ksActiveTurn - 1) || (ksActiveTurn === 0 ? null : prog[0]);
    if (!turnData) return;

    let html = `<div class="ks-grid" style="grid-template-columns: minmax(180px, 1fr) 100px 100px;">`;
    html += `<div class="ks-cell header">Information Unit</div>`;
    html += `<div class="ks-cell header">State</div>`;
    html += `<div class="ks-cell header">Change</div>`;

    iuNames.forEach(iu => {
      const state = turnData.states[iu] || 'unaware';
      const prevState = prevData ? (prevData.states[iu] || 'unaware') : state;
      const stateClass = state.replace('partial_understanding', 'partial');
      const changed = state !== prevState;
      const changeText = changed ? `${stateLabels[prevState] || prevState} → ${stateLabels[state] || state}` : '—';
      const shortLabel = stateLabels[state] || state;

      html += `<div class="ks-cell iu-label" title="${stripHtml(iu)}">${iu}</div>`;
      html += `<div class="ks-cell ${stateClass}${changed ? ' changed' : ''}">${shortLabel}</div>`;
      html += `<div class="ks-cell" style="font-size:0.73rem; color:${changed ? 'var(--accent-dark)' : 'var(--text-muted)'};">${changeText}</div>`;
    });

    html += `</div>`;

    // Show analysis if available
    if (turnData.analysis && turnData.analysis.length) {
      html += `<div style="margin-top:1rem; font-size:0.82rem;">
        <strong style="color:var(--accent-dark);">Turn ${ksActiveTurn} Signal Extraction:</strong>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:0.5rem; margin-top:0.5rem;">`;
      turnData.analysis.forEach(a => {
        const tqColor = a.teaching_quality === 'well_explained' ? '#065f46' : a.teaching_quality === 'shallow' ? '#92400e' : '#94a3b8';
        html += `<div style="padding:0.4rem 0.6rem; background:var(--bg-alt); border-radius:5px; border:1px solid var(--border);">
          <div style="font-weight:600; font-size:0.78rem;">${a.id}: ${a.concept}</div>
          <div style="font-size:0.72rem; color:${tqColor};">Teaching: ${a.teaching_quality || 'N/A'}</div>
        </div>`;
      });
      html += `</div></div>`;
    }

    gridEl.innerHTML = html;
  }
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, '');
}

// ========== IU Graph Visualization ==========

function renderIUGraph(question) {
  const wrapper = document.getElementById('iu-graph-wrapper');
  const container = document.getElementById('iu-graph');
  if (!wrapper || !container) return;

  const graph = question.iu_graph;
  if (!graph || !graph.nodes.length) {
    wrapper.style.display = 'none';
    return;
  }
  wrapper.style.display = '';

  const nodes = graph.nodes;
  const edges = graph.edges;
  const n = nodes.length;

  // Layout: use topological sort to assign layers, then spread within layers
  const adj = {};
  const inDeg = {};
  nodes.forEach(nd => { adj[nd.id] = []; inDeg[nd.id] = 0; });
  edges.forEach(e => { adj[e.from].push(e.to); inDeg[e.to] = (inDeg[e.to] || 0) + 1; });

  // Topological layering (Kahn's algorithm)
  const layers = [];
  let queue = nodes.filter(nd => inDeg[nd.id] === 0).map(nd => nd.id);
  const layerOf = {};
  while (queue.length) {
    layers.push([...queue]);
    queue.forEach(id => { layerOf[id] = layers.length - 1; });
    const next = [];
    queue.forEach(id => {
      adj[id].forEach(to => {
        inDeg[to]--;
        if (inDeg[to] === 0) next.push(to);
      });
    });
    queue = next;
  }

  // SVG dimensions — sized for readability, container scrolls if needed
  const nodeW = 180, nodeH = 50, layerGapX = 220, yGap = 68;
  const maxLayerSize = Math.max(...layers.map(l => l.length));
  const svgW = layers.length * layerGapX + 80;
  const svgH = Math.max(maxLayerSize * yGap + 50, 140);

  // Compute positions
  const pos = {};
  layers.forEach((layer, li) => {
    const x = 40 + li * layerGapX;
    const totalH = layer.length * yGap;
    const startY = (svgH - totalH) / 2 + yGap / 2;
    layer.forEach((id, yi) => {
      pos[id] = { x: x + nodeW / 2, y: startY + yi * yGap };
    });
  });

  // Build SVG — use fixed pixel width so it doesn't shrink via viewBox
  let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="font-family:'IBM Plex Sans',sans-serif; width:${svgW}px; height:${svgH}px; max-width:none;">`;

  // Arrow marker
  svg += `<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/></marker></defs>`;

  // Draw edges
  edges.forEach(e => {
    const from = pos[e.from];
    const to = pos[e.to];
    if (!from || !to) return;
    const x1 = from.x + nodeW / 2 - 4;
    const x2 = to.x - nodeW / 2 + 4;
    svg += `<line x1="${x1}" y1="${from.y}" x2="${x2}" y2="${to.y}" stroke="#cbd5e1" stroke-width="1.5" marker-end="url(#arrowhead)"/>`;
  });

  // Draw nodes
  nodes.forEach(nd => {
    const p = pos[nd.id];
    if (!p) return;
    const label = stripHtml(nd.concept);
    const truncLabel = label.length > 26 ? label.slice(0, 24) + '…' : label;
    svg += `<g>`;
    svg += `<rect x="${p.x - nodeW/2}" y="${p.y - nodeH/2}" width="${nodeW}" height="${nodeH}" rx="7" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>`;
    svg += `<text x="${p.x}" y="${p.y - 6}" text-anchor="middle" font-size="12" font-weight="700" fill="#1e40af">${nd.id}</text>`;
    svg += `<text x="${p.x}" y="${p.y + 12}" text-anchor="middle" font-size="11.5" fill="#334155"><title>${label}</title>${truncLabel}</text>`;
    svg += `</g>`;
  });

  svg += `</svg>`;
  container.innerHTML = svg;
}

// ========== Per-Turn Before/After IU Graphs ==========

function renderPerturnGraphs() {
  const beforeEl = document.getElementById('perturn-graph-before');
  const afterEl = document.getElementById('perturn-graph-after');
  if (!beforeEl || !afterEl) return;

  const NODES = [
    { id: 'A', x: 40,  y: 12,  label: 'Chunking' },
    { id: 'B', x: 40,  y: 36,  label: 'Embed.' },
    { id: 'C', x: 120, y: 12,  label: 'Sim. search' },
    { id: 'D', x: 120, y: 36,  label: 'Prompt' },
    { id: 'E', x: 80,  y: 60,  label: 'Ctx retrieval' },
    { id: 'F', x: 80,  y: 84,  label: 'Grounded gen.' },
  ];
  const EDGES = [['A','B'],['A','C'],['B','E'],['C','E'],['D','E'],['E','F']];
  const nodeW = 68, nodeH = 16, vbW = 160, vbH = 98;

  function stClass(s) {
    return ({ unaware:'st-unaware', struggling:'st-struggling', partial:'st-partial', known:'st-known' })[s] || 'st-unaware';
  }

  function drawGraph(el, stateMap, markerId, highlights) {
    highlights = highlights || {};
    const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));
    let svg = `<svg viewBox="0 0 ${vbW} ${vbH}" style="width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>`;
    for (const [from, to] of EDGES) {
      const a = nodeMap[from], b = nodeMap[to];
      const path = Math.abs(a.y - b.y) < 1
        ? `M ${a.x + (b.x>a.x?1:-1)*nodeW/2} ${a.y} L ${b.x - (b.x>a.x?1:-1)*nodeW/2} ${b.y}`
        : `M ${a.x} ${a.y+nodeH/2} L ${b.x} ${b.y-nodeH/2}`;
      svg += `<path marker-end="url(#${markerId})" d="${path}" stroke="#94a3b8" stroke-width="0.9" fill="none"/>`;
    }
    const stFill = { unaware:'#f1f5f9', struggling:'#fee2e2', partial:'#fef3c7', known:'#d1fae5' };
    const stStroke = { unaware:'#94a3b8', struggling:'#991b1b', partial:'#92400e', known:'#065f46' };
    for (const n of NODES) {
      const st = stateMap[n.id] || 'unaware';
      const hl = highlights[n.id];
      const sw = hl ? 2.5 : 1.2;
      svg += `<g>
        <rect x="${n.x-nodeW/2}" y="${n.y-nodeH/2}" width="${nodeW}" height="${nodeH}" rx="4" ry="4"
          fill="${stFill[st]||stFill.unaware}" stroke="${stStroke[st]||stStroke.unaware}" stroke-width="${sw}"/>
        <text x="${n.x}" y="${n.y+1}" text-anchor="middle" dominant-baseline="middle"
          font-family="'IBM Plex Sans',sans-serif" font-size="9" font-weight="600" fill="#0f172a">${n.label}</text>
      </g>`;
    }
    svg += `</svg>`;
    el.innerHTML = svg;
  }

  // Before: embeddings & prompt struggling, rest unaware
  drawGraph(beforeEl,
    { A:'unaware', B:'struggling', C:'unaware', D:'struggling', E:'unaware', F:'unaware' },
    'arr-before', {});

  // After: embeddings advanced to partial (highlighted)
  drawGraph(afterEl,
    { A:'unaware', B:'partial', C:'unaware', D:'struggling', E:'unaware', F:'unaware' },
    'arr-after', { B: true });
}
