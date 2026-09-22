// Vessari, design two: Strip Chart.
// One fetch, one object, every figure computed from it. Nothing is typed into
// the markup. If the fetch or the parse fails, no axis is drawn and every
// figure reads SOURCE NOT AVAILABLE.

const DATA_URL = 'data/site-data.json';
const CIF_URL = 'data/specimen.cif';
// The ES module above re-exports from an extensionless specifier that no
// browser can resolve on the CDN, so the packaged viewer build is the fallback.
const MOLSTAR_BUNDLE_URL = 'https://cdn.jsdelivr.net/npm/molstar@4.9.0/build/viewer/molstar.js';

const INK = {
  graphite: 0x191f1d,
  clay: 0x9c4a2f,
  paperLit: 0xeef0ea,
  penFill: 0xb9c0b8,
  pocketFill: 0xd3d8d0
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- formatting ---------- */

const NOT_RECORDED = '<span class="missing">NOT RECORDED</span>';
const UNAVAILABLE = 'SOURCE NOT AVAILABLE';

function isNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function fixed(v, d) {
  return v.toFixed(d);
}

function signed(v, d) {
  const s = v.toFixed(d);
  return v > 0 ? '+' + s : s;
}

// The paired renderer. It takes a value and an error together. Passing no
// second argument at all is a programming error and prints NOT RECORDED
// rather than a bare number; passing null says out loud that there is no
// repeat to quote.
function pair(value, error, digits, noErrorNote) {
  if (!isNum(value)) return NOT_RECORDED;
  if (error === undefined) return NOT_RECORDED;
  const val = '<span class="val">' + fixed(value, digits) + '</span>';
  const err = error === null
    ? '<span class="err err-none">' + (noErrorNote || 'no repeat run') + '</span>'
    : '<span class="err"><span class="pm">&#177;</span> ' + fixed(error, digits) + '</span>';
  return val + err;
}

function halfRange(a, b) {
  if (!isNum(a) || !isNum(b)) return null;
  return Math.abs(a - b) / 2;
}

/* ---------- path lookup ---------- */

function at(obj, path) {
  return path.split('.').reduce((acc, k) => (acc === undefined || acc === null ? undefined : acc[k]), obj);
}

function fillWalker(root) {
  document.querySelectorAll('[data-num]').forEach((el) => {
    const value = at(root, el.dataset.num);
    const fmt = el.dataset.fmt || 'text';
    if (value === undefined || value === null || (fmt !== 'text' && !isNum(value))) {
      el.innerHTML = NOT_RECORDED;
      return;
    }
    if (fmt === 'pct') el.textContent = (value * 100).toFixed(1) + '%';
    else if (fmt === 'text') el.textContent = String(value);
    else if (fmt === 'int') el.textContent = String(Math.round(value));
    else el.textContent = fixed(value, parseInt(fmt, 10));
  });
}

function declareUnavailable() {
  document.body.classList.add('is-void');
  document.querySelectorAll('[data-num]').forEach((el) => {
    el.textContent = UNAVAILABLE;
    el.classList.add('missing');
  });
  document.querySelectorAll('[data-prov]').forEach((el) => { el.hidden = true; });
  ['rail-hero', 'residual-lanes'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const wrap = el.closest('.lanes-scroll');
    (wrap || el).hidden = true;
  });
  [['admet-rows', 3], ['control-rows', 3], ['paired-rows', 4], ['conformal-rows', 3], ['readout-list', 0]].forEach(([id, cols]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = cols
      ? '<tr><td colspan="' + cols + '" class="missing">' + UNAVAILABLE + '</td></tr>'
      : '<div class="rrow"><dt>all fields</dt><dd class="missing">' + UNAVAILABLE + '</dd></div>';
  });
  const banner = document.getElementById('fail-banner');
  if (banner) banner.hidden = false;
}

function revealProvenance() {
  document.querySelectorAll('[data-prov]').forEach((el) => {
    if (el.dataset.suppress === '1') return;
    el.hidden = false;
  });
}

// A figure that was not drawn does not get a provenance credit for the
// collection it could not read.
function suppressFigure(host) {
  if (!host) return;
  const wrap = host.closest('.lanes-scroll');
  (wrap || host).hidden = true;
  const fig = host.closest('.rail-fig');
  const prov = fig && fig.querySelector('[data-prov]');
  if (prov) prov.dataset.suppress = '1';
}

/* ---------- rail geometry, shared by channel 01 and channel 03 ---------- */

function niceTicks(lo, hi, step) {
  const out = [];
  const first = Math.ceil((lo - 1e-9) / step) * step;
  for (let v = first; v <= hi + 1e-9; v += step) out.push(Math.round(v / step) * step);
  return out;
}

// Tick spacing is chosen from the width the axis actually has, so labels
// never print on top of each other on a narrow screen.
function fitStep(host, lo, hi, step) {
  const hostWidth = host.clientWidth || 760;
  const gutter = hostWidth < 560 ? 78 : 116;
  const field = Math.max(140, hostWidth - gutter - 60);
  let out = step;
  let guard = 0;
  while (((hi - lo) / out + 1) * 46 > field && guard < 6) { out *= 2; guard += 1; }
  return out;
}

function drawRail(host, spec) {
  const [lo, hi] = spec.domain;
  const span = hi - lo;
  const pos = (v) => ((v - lo) / span) * 100;
  const clampPos = (v) => Math.max(0, Math.min(100, pos(v)));

  const gutter = document.createElement('div');
  gutter.className = 'rail-gutter';

  const field = document.createElement('div');
  field.className = 'rail-field';

  const rules = document.createElement('div');
  rules.className = 'rail-rules';
  const ticks = niceTicks(lo, hi, fitStep(host, lo, hi, spec.step));
  ticks.forEach((t) => {
    const r = document.createElement('div');
    r.className = 'rail-rule is-major';
    r.style.left = pos(t) + '%';
    rules.appendChild(r);
  });
  field.appendChild(rules);

  spec.lanes.forEach((laneSpec) => {
    const label = document.createElement('div');
    label.className = 'lane-label ' + (laneSpec.ink === 'violet' ? 'is-violet' : 'is-clay');
    label.innerHTML = '<span class="lane-ink">' + laneSpec.label + '</span><span>' + laneSpec.sub + '</span>';
    gutter.appendChild(label);

    const lane = document.createElement('div');
    lane.className = 'lane';

    if (laneSpec.band) {
      const band = document.createElement('div');
      band.className = 'band' + (laneSpec.ink === 'clay' ? ' is-clay' : '');
      band.style.left = clampPos(laneSpec.band[0]) + '%';
      band.style.width = (clampPos(laneSpec.band[1]) - clampPos(laneSpec.band[0])) + '%';
      band.dataset.from = laneSpec.bandFrom || 'center';
      lane.appendChild(band);
    }

    if (laneSpec.bracketTo !== undefined && laneSpec.bracketTo !== null) {
      const a = Math.min(laneSpec.value, laneSpec.bracketTo);
      const b = Math.max(laneSpec.value, laneSpec.bracketTo);
      const br = document.createElement('div');
      br.className = 'bracket';
      br.style.left = clampPos(a) + '%';
      br.style.width = (clampPos(b) - clampPos(a)) + '%';
      lane.appendChild(br);
      const bl = document.createElement('div');
      bl.className = 'bracket-label';
      bl.style.left = ((clampPos(a) + clampPos(b)) / 2) + '%';
      bl.textContent = laneSpec.bracketLabel || '';
      lane.appendChild(bl);
    }

    const pen = document.createElement('div');
    pen.className = 'pen' + (laneSpec.ink === 'clay' ? ' is-clay' : '');
    pen.style.left = clampPos(laneSpec.value) + '%';
    lane.appendChild(pen);

    const flag = document.createElement('div');
    const onRight = pos(laneSpec.value) > 70;
    flag.className = 'pen-flag' + (laneSpec.ink === 'clay' ? ' is-clay' : '') + (onRight ? ' is-left' : '');
    flag.style.left = 'calc(' + clampPos(laneSpec.value) + '% ' + (onRight ? '- 5px' : '+ 5px') + ')';
    flag.textContent = laneSpec.flag;
    lane.appendChild(flag);

    field.appendChild(lane);
  });

  const spacer = document.createElement('div');
  spacer.className = 'lane-label';
  spacer.style.height = '26px';
  spacer.style.borderBottom = '0';
  spacer.innerHTML = '<span class="axis-title">' + spec.axisName + '</span>';
  gutter.appendChild(spacer);

  const axis = document.createElement('div');
  axis.className = 'rail-axis';
  const line = document.createElement('div');
  line.className = 'axis-line';
  axis.appendChild(line);
  ticks.forEach((t, i) => {
    const mark = document.createElement('div');
    mark.className = 'axis-tick';
    mark.style.left = pos(t) + '%';
    axis.appendChild(mark);
    const num = document.createElement('div');
    num.className = 'axis-num' + (i === 0 ? ' at-start' : (i === ticks.length - 1 ? ' at-end' : ''));
    num.style.left = pos(t) + '%';
    num.textContent = t.toFixed(spec.tickDigits);
    axis.appendChild(num);
  });
  field.appendChild(axis);

  const grid = document.createElement('div');
  grid.className = 'rail-grid';
  grid.appendChild(gutter);
  grid.appendChild(field);

  host.innerHTML = '';
  host.appendChild(grid);
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', spec.altText);
}

/* ---------- residual strip ---------- */

const railSpecs = [];

function drawRailTracked(host, spec) {
  railSpecs.push({ host: host, spec: spec });
  drawRail(host, spec);
}

function watchRailWidth() {
  let last = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - last) < 40) return;
    last = window.innerWidth;
    railSpecs.forEach((entry) => {
      drawRail(entry.host, entry.spec);
      if (entry.host.dataset.revealed === '1') {
        entry.host.querySelectorAll('.band').forEach((b) => b.classList.add('is-drawn'));
      }
    });
    armReveals();
  }, { passive: true });
}

function drawResiduals(host, points) {
  /* The evaluation set is 119 compounds with a prediction each, and the strip
   * was drawing ten of them because ten was all the data file carried. Drawing
   * all of them is the honest figure and it also looks like what it is: a chart
   * recorder trace where the pen wanders further from the line as the compounds
   * get weaker.
   *
   * Identifiers are dropped past a threshold. A hundred and nineteen ChEMBL ids
   * stacked in a column is noise, and the ids are in the raw file for anyone who
   * wants one. The lanes thin out instead, which is what a dense trace looks
   * like on paper. */
  const dense = points.length > 24;
  host.classList.toggle('rlanes--dense', dense);

  const values = points.flatMap((p) => [p.measured, p.predicted]);
  const lo = Math.floor(Math.min.apply(null, values));
  const hi = Math.ceil(Math.max.apply(null, values));
  const span = hi - lo;
  const pos = (v) => ((v - lo) / span) * 100;

  host.innerHTML = '';

  points.forEach((p) => {
    const delta = p.predicted - p.measured;

    const row = document.createElement('div');
    row.className = 'rlane';

    const id = document.createElement('div');
    id.className = 'rlane-id';
    if (dense) {
      // The grid needs its first column to exist. A hundred and nineteen ChEMBL
      // ids stacked in it is noise, so the column stays and empties, and the id
      // moves to the row's tooltip.
      row.title = p.id + ': measured ' + p.measured + ', predicted ' + p.predicted;
    } else {
      id.textContent = p.id;
    }
    row.appendChild(id);

    const track = document.createElement('div');
    track.className = 'rlane-track';

    const base = document.createElement('div');
    base.className = 'rlane-base';
    track.appendChild(base);

    const conn = document.createElement('div');
    conn.className = 'rlane-conn';
    const a = Math.min(p.measured, p.predicted);
    const b = Math.max(p.measured, p.predicted);
    conn.style.left = pos(a) + '%';
    conn.style.width = (pos(b) - pos(a)) + '%';
    // The trace leaves the measured mark and runs toward the prediction.
    conn.dataset.from = delta < 0 ? 'right' : 'left';
    track.appendChild(conn);

    const meas = document.createElement('div');
    meas.className = 'rmark rmark--meas';
    meas.style.left = pos(p.measured) + '%';
    track.appendChild(meas);

    const pred = document.createElement('div');
    pred.className = 'rmark rmark--pred';
    pred.style.left = pos(p.predicted) + '%';
    track.appendChild(pred);

    row.appendChild(track);

    const d = document.createElement('div');
    d.className = 'rlane-d' + (Math.abs(delta) < 0.2 ? ' is-small' : '');
    d.textContent = signed(delta, 2);
    row.appendChild(d);

    host.appendChild(row);
  });

  const axisRow = document.createElement('div');
  axisRow.className = 'rlane raxis';
  const axisPad = document.createElement('div');
  axisPad.className = 'rlane-id';
  axisPad.textContent = '';
  axisRow.appendChild(axisPad);

  const axisTrack = document.createElement('div');
  axisTrack.className = 'rlane-track';
  const axis = document.createElement('div');
  axis.className = 'rail-axis';
  const line = document.createElement('div');
  line.className = 'axis-line';
  axis.appendChild(line);
  for (let t = lo; t <= hi + 1e-9; t += 1) {
    const mark = document.createElement('div');
    mark.className = 'axis-tick';
    mark.style.left = pos(t) + '%';
    axis.appendChild(mark);
    const num = document.createElement('div');
    num.className = 'axis-num' + (t === lo ? ' at-start' : (t === hi ? ' at-end' : ''));
    num.style.left = pos(t) + '%';
    num.textContent = t > 0 ? '+' + t.toFixed(1) : t.toFixed(1);
    axis.appendChild(num);
  }
  axisTrack.appendChild(axis);
  axisRow.appendChild(axisTrack);
  const axisEnd = document.createElement('div');
  axisEnd.className = 'rlane-d is-small';
  axisEnd.textContent = 'delta';
  axisRow.appendChild(axisEnd);
  host.appendChild(axisRow);

  const legend = document.createElement('div');
  legend.className = 'rlane-legend';
  legend.innerHTML =
    '<span><span class="inkmark is-violet"></span>measured, log&#8321;&#8320; &#181;M</span>' +
    '<span><span class="inkmark is-clay"></span>predicted</span>' +
    '<span>' + points.length + ' compounds from the held-out set</span>';
  host.appendChild(legend);

  host.setAttribute('role', 'img');
  host.setAttribute('aria-label',
    'Residual strip. ' + points.map((p) =>
      p.id + ' measured ' + fixed(p.measured, 2) + ', predicted ' + fixed(p.predicted, 2) +
      ', difference ' + signed(p.predicted - p.measured, 2)).join('. ') + '.');
}

/* ---------- tables and readout ---------- */


function drawVerification(list, results) {
  /* Each row states what the verifier did and whether that was the right answer.
   * The interesting one is the genuine quote attributed to the wrong document:
   * both halves are real, so it is the case a model judge lets through. */
  list.innerHTML = '';
  (results || []).forEach((r) => {
    const li = document.createElement('li');
    li.className = 'vcase' + (r.verified ? ' vcase--pass' : ' vcase--drop');

    const head = document.createElement('p');
    head.className = 'vcase-head';
    const verdict = document.createElement('span');
    verdict.className = 'vcase-verdict';
    verdict.textContent = r.verified ? 'accepted' : 'dropped';
    const name = document.createElement('span');
    name.className = 'vcase-name';
    name.textContent = r.name;
    head.append(verdict, name);

    const why = document.createElement('p');
    why.className = 'vcase-why';
    why.textContent = r.why;

    li.append(head, why);
    list.appendChild(li);
  });
}

function drawAdmetTable(tbody, endpoints) {
  tbody.innerHTML = '';
  if (!endpoints.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="missing">NOT RECORDED</td></tr>';
    return;
  }
  endpoints.forEach((e, i) => {
    const tr = document.createElement('tr');

    const idx = document.createElement('td');
    idx.className = 'idx';
    idx.textContent = String(i + 1).padStart(2, '0');

    const id = document.createElement('td');
    id.textContent = String(e.endpoint != null ? e.endpoint : e.id);

    const metric = document.createElement('td');
    metric.textContent = String(e.metric);

    // The metric differs by endpoint and the direction differs with it. Saying
    // which way is good beside each row is the difference between a table a
    // reader can use and a column of numbers they have to look up.
    const score = document.createElement('td');
    score.className = 'num';
    score.textContent = e.score != null ? fixed(e.score, 3) : '—';

    const dir = document.createElement('td');
    dir.className = 'dir';
    dir.textContent = e.better === 'lower' ? 'lower is better'
      : e.better === 'higher' ? 'higher is better' : '';

    tr.append(idx, id, metric, score, dir);
    tbody.appendChild(tr);
  });
}

function nm(v) {
  // Affinities on this page span four orders of magnitude, so a fixed number of
  // decimals is wrong at one end or the other.
  if (v == null) return '\u2014';
  if (v < 10) return fixed(v, 1) + ' nM';
  if (v < 1000) return String(Math.round(v)) + ' nM';
  return fixed(v / 1000, 1) + ' \u00b5M';
}

function drawAssessment(tbody, cap, a) {
  tbody.innerHTML = '';
  if (!a || !a.compounds || !a.compounds.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="missing">NOT RECORDED</td></tr>';
    if (cap) cap.textContent = '';
    return;
  }

  // Strongest binder first, which is the order the pipeline ranked them in.
  const rows = a.compounds.slice().sort((x, y) => {
    if (x.predicted_nm == null) return 1;
    if (y.predicted_nm == null) return -1;
    return x.predicted_nm - y.predicted_nm;
  });

  rows.forEach((c) => {
    const tr = document.createElement('tr');

    const name = document.createElement('td');
    name.textContent = c.name;

    const pred = document.createElement('td');
    pred.className = 'num';
    pred.textContent = nm(c.predicted_nm);

    const meas = document.createElement('td');
    meas.className = 'num';
    meas.textContent = nm(c.measured_nm);

    const n = document.createElement('td');
    n.className = 'num';
    n.textContent = c.measured_n != null ? String(c.measured_n) : '\u2014';

    // How far off, in fold rather than log units, because fold is the unit a
    // chemist reads an affinity error in.
    const off = document.createElement('td');
    off.className = 'num';
    if (c.predicted_nm != null && c.measured_nm) {
      const f = c.predicted_nm / c.measured_nm;
      off.textContent = (f >= 1 ? f : 1 / f).toFixed(1) + '\u00d7';
    } else {
      off.textContent = '\u2014';
      // A compound with no prediction carries the reason, because absent and
      // failed are different claims.
      if (c.error) { tr.classList.add('row--failed'); off.title = c.error; }
    }

    tr.append(name, pred, meas, n, off);
    tbody.appendChild(tr);
  });

  if (!cap) return;
  const odds = a.chance_of_this_order
    ? ' Three compounds land in the correct order by chance one time in '
      + Math.round(1 / a.chance_of_this_order) + '.'
    : '';
  cap.textContent =
    'Predicted against the median of every equality-relation assay in ChEMBL for '
    + 'the same compound and target, ' + a.assays_behind_comparison
    + ' in total. The pipeline ranked all ' + a.n_compared
    + ' in the correct order, with a median error of '
    + a.median_fold_error + ' fold.' + odds;
}

function drawControls(tbody, cap, c) {
  tbody.innerHTML = '';
  if (!c || !c.arms) {
    tbody.innerHTML = '<tr><td colspan="3" class="missing">NOT RECORDED</td></tr>';
    return;
  }
  const WHAT = {
    'ligand_gbm': 'the molecule alone, no protein',
    'nearest_neighbour': 'the label of the most similar training compound',
    'molecular_weight': 'molecular weight, the floor',
    'Boltz-2 structure + affinity': 'the folded complex',
  };
  // Strongest first, so the reader meets the result rather than hunting for it.
  Object.entries(c.arms).sort((a, b) => b[1] - a[1]).forEach(([name, rho]) => {
    const tr = document.createElement('tr');
    const ours = name.indexOf('Boltz') === 0;
    const n = document.createElement('td');
    n.textContent = ours ? 'structure + affinity (ours)' : name.replace(/_/g, ' ');
    if (ours) n.className = 'is-ours';
    const w = document.createElement('td');
    w.textContent = WHAT[name] || '';
    const v = document.createElement('td');
    v.className = 'num';
    v.textContent = fixed(rho, 3);
    tr.append(n, w, v);
    tbody.appendChild(tr);
  });
  if (cap) {
    cap.textContent = 'Every arm is fitted on the same training compounds and scored on the '
      + 'same held-out compounds as the pipeline. The verdict is '
      + (c.outcome === 'loses' ? 'a loss' : c.outcome)
      + ': the strongest control beats the structure arm by '
      + Math.abs(c.delta).toFixed(3) + ' Spearman, 95% interval '
      + c.ci[0] + ' to ' + c.ci[1] + '. An interval that clears zero resolves; '
      + 'this one resolves against us.';
  }
}

function drawPaired(tbody, cap, p) {
  tbody.innerHTML = '';
  if (!p || !p.by_effect_size) {
    tbody.innerHTML = '<tr><td colspan="4" class="missing">NOT RECORDED</td></tr>';
    return;
  }
  const LABEL = {
    '0': 'any', '0.5': 'over 0.5 kcal/mol',
    '1': 'over 1 kcal/mol', '2': 'over 2 kcal/mol',
  };
  p.by_effect_size.forEach((b) => {
    const tr = document.createElement('tr');
    const t = document.createElement('td');
    t.textContent = LABEL[String(b.threshold_kcal)] || String(b.threshold_kcal);
    const n = document.createElement('td');
    n.className = 'num';
    n.textContent = String(b.n);
    const a = document.createElement('td');
    a.className = 'num';
    a.textContent = (b.sign_accuracy * 100).toFixed(1) + '%';
    // Error beside the baseline it has to beat. A number that does not beat
    // "nothing changed" has not said anything, and on a set where most
    // differences are small that baseline is stronger than it looks.
    const e = document.createElement('td');
    e.className = 'num';
    e.textContent = b.rmse_kcal.toFixed(2) + ' vs ' + b.rmse_predict_zero_kcal.toFixed(2);
    tr.append(t, n, a, e);
    tbody.appendChild(tr);
  });
  if (!cap) return;
  const big = p.by_effect_size.filter((b) => b.threshold_kcal === 1)[0];
  cap.textContent = big
    ? 'Error is root mean square in kcal/mol, shown against predicting that '
      + 'nothing changed. Where the real change exceeds 1 kcal/mol, the size a '
      + 'programme is built on, the direction is right '
      + (big.sign_accuracy * 100).toFixed(1) + '% of the time across '
      + big.n + ' pairs, with a 95% interval of '
      + (big.sign_accuracy_ci[0] * 100).toFixed(0) + ' to '
      + (big.sign_accuracy_ci[1] * 100).toFixed(0) + '%.'
    : '';
}

function drawConformal(tbody, cap, c) {
  tbody.innerHTML = '';
  if (!c || !c.within_target) {
    tbody.innerHTML = '<tr><td colspan="3" class="missing">NOT RECORDED</td></tr>';
    return;
  }
  // Narrowest first: the targets where a prediction is worth acting on.
  const rows = c.within_target.per_target.slice()
    .sort((a, b) => a.width_fold - b.width_fold);
  rows.forEach((r) => {
    const tr = document.createElement('tr');
    const t = document.createElement('td');
    t.textContent = r.target;
    const cov = document.createElement('td');
    cov.className = 'num';
    cov.textContent = (r.coverage * 100).toFixed(0) + '%';
    const w = document.createElement('td');
    w.className = 'num';
    // Fold, because that is the unit an affinity is argued about in, and
    // rounded hard because the difference between 14,000 and 15,000 fold is
    // not a difference anyone acts on.
    // Rounded hard, because the difference between 14,000 and 15,000 fold is
    // not one anyone acts on, and grouped properly: dividing by a thousand and
    // appending ",000" rendered 1.32 million as "1324,000".
    const f = r.width_fold;
    const rounded = f < 100 ? Math.round(f)
      : f < 10000 ? Math.round(f / 100) * 100
      : Math.round(f / 1000) * 1000;
    w.textContent = rounded.toLocaleString('en-US') + '\u00d7';
    tr.append(t, cov, w);
    tbody.appendChild(tr);
  });
  if (cap) {
    const w = c.within_target;
    cap.textContent = 'Asked to cover ' + (c.target_coverage * 100).toFixed(0)
      + '%, these intervals cover between ' + (w.min_coverage * 100).toFixed(0)
      + ' and ' + (w.max_coverage * 100).toFixed(0) + '%, with '
      + w.n_under_covering + ' of ' + w.per_target.length
      + ' targets falling short. The median width is '
      + Math.round(w.median_width_fold) + ' fold.';
  }
}

function drawReadout(list, specimen) {
  const aff = specimen.affinity || {};
  const conf = specimen.confidence || {};

  const rows = [
    {
      k: 'affinity_pred_value',
      html: pair(aff.affinity_pred_value, halfRange(aff.affinity_pred_value1, aff.affinity_pred_value2), 3, 'no repeat run')
    },
    {
      k: 'affinity_probability_binary',
      html: pair(aff.affinity_probability_binary, halfRange(aff.affinity_probability_binary1, aff.affinity_probability_binary2), 4, 'no repeat run')
    },
    { k: 'confidence_score', html: pair(conf.confidence_score, null, 4, 'single run') },
    { k: 'ptm', html: pair(conf.ptm, null, 4, 'single run') },
    { k: 'iptm', html: pair(conf.iptm, null, 4, 'single run') },
    { k: 'ligand_iptm', html: pair(conf.ligand_iptm, null, 4, 'single run') },
    { k: 'protein_iptm', html: pair(conf.protein_iptm, null, 4, 'single run'), flagged: true },
    { k: 'complex_plddt', html: pair(conf.complex_plddt, null, 4, 'single run') }
  ];

  list.innerHTML = '';
  rows.forEach((r) => {
    const div = document.createElement('div');
    div.className = 'rrow' + (r.flagged ? ' is-flagged' : '');
    div.innerHTML = '<dt>' + r.k + '</dt><dd>' + r.html + '</dd>';
    list.appendChild(div);
  });

  const flag = document.getElementById('readout-flag');
  if (flag) {
    const v = conf.protein_iptm;
    if (isNum(v)) {
      flag.innerHTML = '&#9873; protein_iptm reads ' + fixed(v, 4) +
        ' because Boltz-2 returns zero for a structure with one protein chain. There is no second protein chain to score against. The field is printed as returned.';
      flag.hidden = false;
    }
  }

  const spread = halfRange(aff.affinity_pred_value1, aff.affinity_pred_value2);
  const affNote = document.getElementById('readout-affnote');
  if (affNote && spread !== null) {
    affNote.textContent = 'The error on the two affinity fields is the half range across the two ensemble members the run returned. The fields below them come from a single run and say so.';
  }
}

/* ---------- animation 1 and 2: reveals, once each ---------- */

let bandObserver = null;
let laneObserver = null;
let revealTimer = null;

function armReveals() {
  if (bandObserver) bandObserver.disconnect();
  if (laneObserver) laneObserver.disconnect();
  window.clearTimeout(revealTimer);

  const bands = Array.from(document.querySelectorAll('.band'));
  bands.forEach((b) => {
    if (b.classList.contains('is-drawn')) return;
    b.classList.add(b.dataset.from === 'right' ? 'is-armed-right' : 'is-armed');
  });
  const lanes = Array.from(document.querySelectorAll('.rlane-conn'));
  lanes.forEach((c) => {
    if (c.classList.contains('is-drawn')) return;
    c.classList.add(c.dataset.from === 'right' ? 'is-armed-r' : 'is-armed-l');
  });

  const markSpent = (el) => {
    const plot = el.closest('.rail-plot');
    if (plot) plot.dataset.revealed = '1';
  };

  if (reduceMotion.matches) {
    bands.concat(lanes).forEach((el) => {
      el.classList.remove('is-armed', 'is-armed-right', 'is-armed-l', 'is-armed-r');
      el.classList.add('is-drawn');
      markSpent(el);
    });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    bands.concat(lanes).forEach((el) => {
      el.classList.add('is-animated', 'is-drawn');
      markSpent(el);
    });
    return;
  }

  // Purpose: explanation. The band is seen to be generated outward from the
  // point estimate, so the reader reads the estimate and then its width.
  bandObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      bandObserver.unobserve(entry.target);
      const el = entry.target;
      const plot = el.closest('.rail-plot');
      if (plot) plot.dataset.revealed = '1';
      el.classList.add('is-animated');
      requestAnimationFrame(() => el.classList.add('is-drawn'));
    });
  }, { threshold: 0.4 });
  bands.forEach((b) => bandObserver.observe(b));

  // Purpose: explanation. Channels are laid down one at a time, the way a
  // recorder writes them, so ten traces do not read as one block.
  laneObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      laneObserver.unobserve(entry.target);
      const el = entry.target;
      const i = lanes.indexOf(el);
      el.classList.add('is-animated');
      el.style.transitionDelay = Math.max(0, i % 10) * 45 + 'ms';
      requestAnimationFrame(() => el.classList.add('is-drawn'));
    });
  }, { threshold: 0.4 });
  lanes.forEach((c) => laneObserver.observe(c));

  // Safety net. If an observer never reports, anything already on screen is
  // drawn anyway: a figure that never appears would be worse than one that
  // appears without its reveal.
  revealTimer = window.setTimeout(() => {
    bands.concat(lanes).forEach((el) => {
      if (el.classList.contains('is-drawn')) return;
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      el.classList.add('is-animated');
      requestAnimationFrame(() => el.classList.add('is-drawn'));
    });
  }, 1400);
}

/* ---------- animation 5: channel rail marker ---------- */

function trackRail() {
  const marker = document.getElementById('rail-marker');
  const links = Array.from(document.querySelectorAll('.rail-tick'));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!marker || sections.length === 0) return;

  let activeIndex = 0;
  const visible = new Set();

  const place = () => {
    const tick = links[activeIndex];
    if (!tick) return;
    const horizontal = window.matchMedia('(max-width: 959px)').matches;
    if (horizontal) {
      marker.style.transform = 'translateX(' + tick.offsetLeft + 'px) scaleX(' + tick.offsetWidth + ')';
    } else {
      marker.style.transform = 'translateY(' + tick.offsetTop + 'px) scaleY(' + tick.offsetHeight + ')';
    }
    links.forEach((a, i) => {
      if (i === activeIndex) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window) {
    const head = document.querySelector('.masthead');
    const railEl = document.querySelector('.rail');
    const stacked = window.matchMedia('(max-width: 959px)').matches;
    const top = (head ? head.offsetHeight : 56) + (stacked && railEl ? railEl.offsetHeight : 0);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const i = sections.indexOf(entry.target);
        if (i < 0) return;
        if (entry.isIntersecting) visible.add(i);
        else visible.delete(i);
      });
      if (visible.size) {
        const next = Math.min.apply(null, Array.from(visible));
        if (next !== activeIndex) { activeIndex = next; place(); }
      }
    }, { rootMargin: '-' + top + 'px 0px -55% 0px', threshold: 0 });
    sections.forEach((s) => observer.observe(s));
  }

  place();
  window.addEventListener('resize', place, { passive: true });
}

/* ---------- specimen viewer ---------- */

const viewerState = { plugin: null, viewer: null, components: null, preset: 'pen', loading: false, loaded: false };
let capTimer = null;

const PRESET_CAPTIONS = {
  pen: 'Flat plotter inks. Protein drawn in outline on the same stock, ligand in clay.',
  plddt: 'Coloured from the per residue pLDDT values the model wrote into the file, on the viewer\'s own scale.',
  pocket: 'Protein dropped back, ligand held in clay, camera moved onto the ligand.'
};

function setStatus(text) {
  const el = document.getElementById('viewer-status');
  if (el) el.textContent = text;
}

function classifyComponents(plugin) {
  const structures = plugin.managers.structure.hierarchy.current.structures;
  const all = [];
  structures.forEach((s) => (s.components || []).forEach((c) => all.push(c)));
  const labelOf = (c) => String((c.cell && c.cell.obj && c.cell.obj.label) || c.key || '').toLowerCase();
  return {
    all,
    ligand: all.filter((c) => labelOf(c).indexOf('ligand') >= 0),
    polymer: all.filter((c) => labelOf(c).indexOf('ligand') < 0)
  };
}

function themeExists(plugin, name) {
  try {
    const registry = plugin.representation.structure.themes.colorThemeRegistry;
    if (Array.isArray(registry.types)) return registry.types.some((t) => t[0] === name);
    const provider = registry.get(name);
    return !!provider && provider.name === name;
  } catch (err) {
    return false;
  }
}

function applyTheme(components, params) {
  if (!components || components.length === 0) return;
  try {
    viewerState.plugin.managers.structure.component.updateRepresentationsTheme(components, params);
  } catch (err) {
    /* leave the current colouring in place rather than clearing the view */
  }
}

async function applyPreset(name) {
  const plugin = viewerState.plugin;
  const comps = viewerState.components;
  if (!plugin || !comps) return;

  if (name === 'plddt') {
    const themeName = themeExists(plugin, 'plddt-confidence') ? 'plddt-confidence' : 'uncertainty';
    applyTheme(comps.polymer, { color: themeName });
    applyTheme(comps.ligand, { color: 'uniform', colorParams: { value: INK.clay } });
  } else if (name === 'pocket') {
    applyTheme(comps.polymer, { color: 'uniform', colorParams: { value: INK.pocketFill } });
    applyTheme(comps.ligand, { color: 'uniform', colorParams: { value: INK.clay } });
    try {
      const ligStructure = comps.ligand[0] && comps.ligand[0].cell.obj && comps.ligand[0].cell.obj.data;
      const sphere = ligStructure && ligStructure.boundary && ligStructure.boundary.sphere;
      const ms = reduceMotion.matches ? 0 : 260;
      if (sphere && typeof plugin.managers.camera.focusSphere === 'function') {
        plugin.managers.camera.focusSphere(sphere, { extraRadius: 6, durationMs: ms });
      } else {
        plugin.managers.camera.reset(undefined, ms);
      }
    } catch (err) { /* camera stays where it is */ }
  } else {
    applyTheme(comps.polymer, { color: 'uniform', colorParams: { value: INK.penFill } });
    applyTheme(comps.ligand, { color: 'uniform', colorParams: { value: INK.clay } });
    try { plugin.managers.camera.reset(undefined, reduceMotion.matches ? 0 : 260); } catch (err) { /* noop */ }
  }

  viewerState.preset = name;

  document.querySelectorAll('.preset').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.preset === name));
  });

  // Purpose: preventing a jarring change. The caption is the only text that
  // swaps with the preset, and a hard cut on a page about numeric trust reads
  // as a glitch. The readout numbers do not change with the preset, so they
  // are not touched.
  const cap = document.getElementById('preset-cap');
  const next = PRESET_CAPTIONS[name] || '';
  if (cap && cap.textContent !== next) {
    window.clearTimeout(capTimer);
    cap.classList.add('is-swapping');
    capTimer = window.setTimeout(() => {
      cap.textContent = next;
      cap.classList.remove('is-swapping');
    }, 180);
  }
}

// Pale fill plus a drawn outline, which is what a pen plotter produced when
// this field first drew molecules, and what keeps a light canvas legible.
function tunePlotterLook(plugin) {
  try {
    plugin.canvas3d.setProps({
      renderer: {
        backgroundColor: INK.paperLit,
        ambientIntensity: 0.95,
        light: [{ inclination: 150, azimuth: 320, color: 0xffffff, intensity: 0.35 }]
      },
      postprocessing: {
        outline: { name: 'on', params: { scale: 1, threshold: 0.25, color: INK.graphite, includeTransparent: true } },
        occlusion: { name: 'off', params: {} },
        shadow: { name: 'off', params: {} }
      },
      camera: { helper: { axes: { name: 'off', params: {} } } }
    });
  } catch (err) {
    try { plugin.canvas3d.setProps({ renderer: { backgroundColor: INK.paperLit } }); } catch (e2) { /* noop */ }
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = src;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error('script did not load'));
    document.head.appendChild(tag);
  });
}

async function loadMolstar() {
  /* The packaged build only. Mol*'s lib/ tree is ES modules with extensionless
   * relative imports, which a browser cannot resolve from a CDN: the entry file
   * fetches fine and then its own `./app` import returns 503. Trying it first
   * cost a failed round trip and bought nothing. */
  if (window.molstar && window.molstar.Viewer) return window.molstar.Viewer;
  await loadScript(MOLSTAR_BUNDLE_URL);
  if (window.molstar && window.molstar.Viewer) return window.molstar.Viewer;
  throw new Error('Mol* did not load');
}

async function loadViewer(specimen) {
  if (viewerState.loading || viewerState.loaded) return;
  viewerState.loading = true;
  const button = document.getElementById('viewer-load');
  const overlay = document.getElementById('viewer-overlay');
  const target = document.getElementById('viewer-canvas');
  if (button) button.disabled = true;

  const label = specimen && specimen.target_name && specimen.ligand
    ? specimen.target_name + ' with ' + specimen.ligand
    : 'specimen';

  try {
    setStatus('Fetching the model file.');
    const cifResponse = await fetch(CIF_URL);
    if (!cifResponse.ok) throw new Error('cif ' + cifResponse.status);
    const cifText = await cifResponse.text();

    setStatus('Loading the viewer module.');
    const Viewer = await loadMolstar();
    const viewer = await Viewer.create('viewer-canvas', {
      disabledExtensions: ['volseg', 'rcsb-assembly-symmetry', 'rcsb-validation-report'],
      layoutIsExpanded: false,
      layoutShowControls: false,
      layoutShowRemoteState: false,
      layoutShowSequence: false,
      layoutShowLog: false,
      layoutShowLeftPanel: false,
      viewportShowExpand: false,
      viewportShowControls: false,
      viewportShowSettings: false,
      viewportShowSelectionMode: false,
      viewportShowAnimation: false,
      viewportShowTrajectoryControls: false
    });
    viewerState.viewer = viewer;

    setStatus('Drawing.');
    await viewer.loadStructureFromData(cifText, 'mmcif', { dataLabel: label });

    viewerState.plugin = viewer.plugin;
    viewerState.components = classifyComponents(viewer.plugin);
    tunePlotterLook(viewer.plugin);
    await applyPreset('pen');

    viewerState.loaded = true;
    viewerState.loading = false;

    const resize = () => { try { viewer.handleResize(); } catch (err) { /* noop */ } };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    document.querySelectorAll('.preset').forEach((b) => { b.disabled = false; });
    const wasFocused = overlay && overlay.contains(document.activeElement);
    if (overlay) overlay.hidden = true;
    if (wasFocused) {
      const first = document.getElementById('preset-pen');
      if (first) first.focus();
    }
    if (target) {
      // Purpose: preventing a jarring change. Opacity and blur only, no
      // transform: a structure that appears to move into place would
      // misrepresent a static model.
      if (!reduceMotion.matches) target.classList.add('is-animated');
      requestAnimationFrame(() => target.classList.add('is-ready'));
    }
  } catch (err) {
    viewerState.loading = false;
    if (viewerState.viewer) {
      try { viewerState.viewer.dispose(); } catch (e2) { /* noop */ }
      viewerState.viewer = null;
      viewerState.plugin = null;
      viewerState.components = null;
    }
    if (target) target.innerHTML = '';
    if (button) {
      button.disabled = false;
      button.firstChild.textContent = 'Try again ';
    }
    setStatus('The viewer did not load. The frame is left empty rather than filled with a picture of something else. The model file is at ' + CIF_URL + '.');
  }
}

function setUpViewer(specimen) {
  const button = document.getElementById('viewer-load');
  if (button) button.addEventListener('click', () => loadViewer(specimen));

  document.querySelectorAll('.preset').forEach((b) => {
    b.addEventListener('click', () => {
      if (!viewerState.loaded) return;
      applyPreset(b.dataset.preset);
    });
  });

  if (!specimen) {
    if (button) button.disabled = true;
    setStatus(UNAVAILABLE + '. The source file did not parse, so the structure is not drawn either.');
    return;
  }

  const conn = navigator.connection || {};
  const wide = window.matchMedia('(min-width: 900px)').matches;
  const thrifty = conn.saveData === true;
  if (wide && !thrifty) {
    loadViewer(specimen);
  } else {
    setStatus('The model file and the viewer module are not fetched until you ask for them.');
  }
}

/* ---------- digest ---------- */

async function printDigest(text) {
  const line = document.getElementById('digest-line');
  const hex = document.getElementById('digest-hex');
  if (!line || !hex) return;
  if (!window.crypto || !window.crypto.subtle) return; // no digest, no line
  try {
    const bytes = new TextEncoder().encode(text);
    const buffer = await window.crypto.subtle.digest('SHA-256', bytes);
    const out = Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 12);
    hex.textContent = out;
    line.hidden = false;
  } catch (err) {
    /* the line stays off rather than showing a number nobody computed */
  }
}

/* ---------- boot ---------- */

async function boot() {
  trackRail();

  const broken = new URLSearchParams(window.location.search).get('break') === '1';

  let text;
  let data;
  try {
    if (broken) throw new Error('break requested');
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('http ' + response.status);
    text = await response.text();
    data = JSON.parse(text);
    if (!data || !data.holdout || !isNum(data.holdout.spearman) || !isNum(data.holdout.n)) {
      throw new Error('required fields missing');
    }
  } catch (err) {
    declareUnavailable();
    setUpViewer(null);
    return;
  }

  const holdout = data.holdout;
  const curve = Array.isArray(data.curve) ? data.curve : [];
  const points = Array.isArray(data.points) ? data.points : [];
  const pipeline = data.pipeline || {};
  const admet = data.admet || null;
  const endpoints = (admet && admet.endpoints) || [];

  const se = 1 / Math.sqrt(holdout.n - 1);

  const view = Object.assign({}, data, {
    derived: {
      se: se,
      admet_count: endpoints.length,
      points_count: points.length,
      lane_count: 1
    }
  });

  try {
    fillWalker(view);

    const errEl = document.getElementById('meter-rho-err');
    if (errEl) {
      errEl.innerHTML = '<span class="pm">&#177;</span> ' + fixed(se, 2) +
        ' standard error at n = ' + Math.round(holdout.n);
    }

    // Channel 01 rail, and channel 03 rail, from one function.

    const heroHost = document.getElementById('rail-hero');
    if (heroHost) {
      const lo = Math.floor((holdout.spearman - se * 3) * 20) / 20;
      const hi = Math.min(1, Math.ceil((holdout.spearman + se * 3) * 20) / 20);
      drawRailTracked(heroHost, {
        domain: [lo, hi],
        step: 0.05,
        tickDigits: 2,
        axisName: 'Spearman ρ',
        altText: 'Spearman rho on one axis from ' + fixed(lo, 2) + ' to ' + fixed(hi, 2) +
          '. Held out ' + fixed(holdout.spearman, 3) + ' plus or minus ' + fixed(se, 2) + '. ' +
          'The shaded band is one standard error, drawn to scale.',
        lanes: [
          {
            label: 'held out',
            sub: 'n = ' + Math.round(holdout.n),
            value: holdout.spearman,
            ink: 'violet',
            band: [holdout.spearman - se, holdout.spearman + se],
            bandFrom: 'center',
            flag: fixed(holdout.spearman, 3)
          }
        ]
      });
    }


    const residualHost = document.getElementById('residual-lanes');
    if (residualHost && points.length) drawResiduals(residualHost, points);
    else if (residualHost) suppressFigure(residualHost);

    const vcases = document.getElementById('vcases');
    if (vcases && data.verification) drawVerification(vcases, data.verification.results);
    else if (vcases) vcases.innerHTML = '<li class="missing">NOT RECORDED</li>';

    const admetRows = document.getElementById('admet-rows');
    if (admetRows) drawAdmetTable(admetRows, endpoints);

    const readoutList = document.getElementById('readout-list');
    if (readoutList && data.specimen) drawReadout(readoutList, data.specimen);

    const conformalRows = document.getElementById('conformal-rows');
    if (conformalRows) {
      drawConformal(conformalRows, document.getElementById('conformal-cap'),
                    data.conformal);
    }

    const pairedRows = document.getElementById('paired-rows');
    if (pairedRows) {
      drawPaired(pairedRows, document.getElementById('paired-cap'), data.paired);
    }

    const controlRows = document.getElementById('control-rows');
    if (controlRows) {
      drawControls(controlRows, document.getElementById('control-cap'),
                   data.abl1_controls);
    }

    const assessRows = document.getElementById('assess-rows');
    if (assessRows) {
      drawAssessment(assessRows, document.getElementById('assess-cap'),
                     data.assessment);
    }

    revealProvenance();
    armReveals();
    watchRailWidth();
    setUpViewer(data.specimen);
    printDigest(text);
  } catch (err) {
    // The file parsed but one field did not hold up. The page says so with
    // the same banner it uses for a file that never arrived.
    declareUnavailable();
    setUpViewer(null);
  }
}

boot().catch(() => declareUnavailable());
