/* The selection page.
 *
 * Every number drawn here is computed in the browser from targets.json, which
 * is what the prediction runs wrote. Nothing is precomputed into the markup,
 * so a figure on the page cannot drift away from the file behind it.
 */
(function () {
  "use strict";

  var TOPK = 5;
  var data = null;

  function el(t, c, x) {
    var n = document.createElement(t);
    if (c) n.className = c;
    if (x !== undefined) n.textContent = x;
    return n;
  }

  function nm(v) {
    if (v >= 1e6) return (v / 1e6).toFixed(1) + " mM";
    if (v >= 1000) return (v / 1000).toFixed(1) + " µM";
    if (v >= 1) return v.toFixed(1) + " nM";
    return v.toFixed(2) + " nM";
  }

  function ranks(t) {
    var cs = t.compounds;
    var byTrue = cs.map(function (c, i) { return i; })
      .sort(function (a, b) { return cs[a].m - cs[b].m; });
    var byPred = cs.map(function (c, i) { return i; })
      .sort(function (a, b) { return cs[a].p - cs[b].p; });
    return { byTrue: byTrue, byPred: byPred,
             trueTop: byTrue.slice(0, TOPK), predTop: byPred.slice(0, TOPK) };
  }

  function hits(t) {
    var r = ranks(t);
    var s = {};
    r.trueTop.forEach(function (i) { s[i] = true; });
    return r.predTop.filter(function (i) { return s[i]; }).length;
  }

  function summary() {
    var h = data.map(hits);
    var mean = h.reduce(function (a, b) { return a + b; }, 0) / h.length;
    var expected = data.reduce(function (a, t) {
      return a + (TOPK * TOPK) / t.compounds.length;
    }, 0) / data.length;
    var atLeastOne = h.filter(function (x) { return x >= 1; }).length;

    var box = el("div", "verdict");
    [[mean.toFixed(2), "of the best five, found"],
     [expected.toFixed(2), "what blind picking gives"],
     [(mean / expected).toFixed(1) + "x", "better than blind"],
     [Math.round(100 * atLeastOne / h.length) + "%", "proteins where we find at least one"]
    ].forEach(function (p) {
      var d = el("div");
      d.appendChild(el("div", "big", p[0]));
      d.appendChild(el("div", "lab", p[1]));
      box.appendChild(d);
    });
    var host = document.getElementById("summary");
    host.appendChild(box);

    // the distribution, drawn to the same scale as the counts it reports
    var counts = [0, 0, 0, 0, 0, 0];
    h.forEach(function (x) { counts[x]++; });
    var max = Math.max.apply(null, counts);
    var dist = el("div", "dist");
    counts.forEach(function (n, k) {
      dist.appendChild(el("div", "", k + " of 5"));
      var track = el("div");
      var bar = el("div", "bar");
      bar.style.width = max ? (100 * n / max) + "%" : "0";
      track.appendChild(bar);
      dist.appendChild(track);
      dist.appendChild(el("div", "cnt", n + " proteins"));
    });
    document.getElementById("dist").appendChild(dist);
  }

  function show(t) {
    var r = ranks(t);
    var trueSet = {}, predSet = {};
    r.trueTop.forEach(function (i) { trueSet[i] = true; });
    r.predTop.forEach(function (i) { predSet[i] = true; });
    var found = r.predTop.filter(function (i) { return trueSet[i]; }).length;

    var v = document.getElementById("verdict");
    v.textContent = "";
    [[found + " of 5", "genuinely best compounds we would have made"],
     [t.compounds.length, "compounds on the table"],
     [t.median_fold + "x", "median error on this protein"],
     [(t.spearman >= 0 ? "+" : "") + t.spearman.toFixed(3), "rank correlation"]
    ].forEach(function (p) {
      var d = el("div");
      d.appendChild(el("div", "big", String(p[0])));
      d.appendChild(el("div", "lab", p[1]));
      v.appendChild(d);
    });

    // every compound, ordered the way the laboratory would learn it
    var tbl = document.getElementById("table");
    tbl.textContent = "";
    var head = el("thead");
    var hr = el("tr");
    ["Compound", "Measured", "Predicted", "True rank", "Our rank", ""]
      .forEach(function (x, i) {
        var th = el("th", i >= 1 && i <= 4 ? "n" : "", x);
        hr.appendChild(th);
      });
    head.appendChild(hr);
    tbl.appendChild(head);

    var trueRankOf = {}, predRankOf = {};
    r.byTrue.forEach(function (idx, pos) { trueRankOf[idx] = pos + 1; });
    r.byPred.forEach(function (idx, pos) { predRankOf[idx] = pos + 1; });

    var body = el("tbody");
    r.byTrue.forEach(function (i) {
      var c = t.compounds[i];
      var inTrue = !!trueSet[i], inPred = !!predSet[i];
      var tr = el("tr", inTrue && inPred ? "hit" : (inTrue ? "miss" : ""));
      tr.appendChild(el("td", "", c.id));
      tr.appendChild(el("td", "n", nm(c.m)));
      tr.appendChild(el("td", "n", nm(c.p)));
      tr.appendChild(el("td", "n", String(trueRankOf[i])));
      tr.appendChild(el("td", "n", String(predRankOf[i])));
      var mk = el("td");
      if (inTrue && inPred) mk.appendChild(el("span", "mark m-both", "found"));
      else if (inTrue) mk.appendChild(el("span", "mark m-missed", "missed"));
      else if (inPred) mk.appendChild(el("span", "mark m-false", "picked anyway"));
      tr.appendChild(mk);
      body.appendChild(tr);
    });
    tbl.appendChild(body);

    var missed = r.trueTop.filter(function (i) { return !predSet[i]; });
    var wasted = r.predTop.filter(function (i) { return !trueSet[i]; });
    var cap = document.getElementById("caption");
    cap.textContent = t.name + " of " + (t.organism || "unknown organism") +
      ". Of the five compounds that actually bind most tightly, this method "
      + "would have nominated " + found + ". It would have missed " +
      missed.length + " and spent " + wasted.length +
      " of its five choices on compounds that were not in the true best five. "
      + "Rows shaded are the ones it got right.";
  }

  function mount() {
    var sel = document.getElementById("target");
    data.forEach(function (t, i) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = t.name.slice(0, 54) + "  (" + t.compounds.length +
        " compounds)";
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () {
      show(data[parseInt(sel.value, 10)]);
    });
    document.getElementById("random").addEventListener("click", function () {
      var i = Math.floor(Math.random() * data.length);
      sel.value = String(i);
      show(data[i]);
    });
    summary();
    // open on a protein in the middle of the range rather than the best one,
    // because a page that opens on its own best case is advertising
    var mid = data[Math.floor(data.length / 2)];
    sel.value = String(data.indexOf(mid));
    show(mid);
  }

  fetch("targets.json")
    .then(function (r) { return r.json(); })
    .then(function (d) { data = d; mount(); })
    .catch(function (e) {
      document.getElementById("caption").textContent =
        "The per-protein data could not be loaded: " + e;
    });
})();
