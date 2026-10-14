/* The protein table and what opens underneath a row.
 *
 * Everything is loaded in two stages. proteins.json is 150 KB and holds one
 * summary row per target, which is what the table needs. The compounds and the
 * structure for a single target are another file each, fetched when a row is
 * opened, because 121 targets of compound detail is 1.2 MB and nobody opens
 * 121 rows.
 *
 * The structure viewer builds its WebGL context on first open and keeps it.
 * Opening ten rows leaves ten contexts alive, which a browser will eventually
 * refuse, so a stage is disposed when its row closes.
 */
(function () {
  "use strict";

  var SIM_TARGETS = { P30556: "../sim/" };

  var state = {
    targets: [],
    summary: null,
    sort: "spearman",
    dir: -1,
    q: "",
    family: "",
    onlyPose: false,
    showFailed: false,
    open: null,
    stage: null,
    cache: {}
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function cell(k, v, note) {
    var c = el("div", "d-cell");
    c.appendChild(el("div", "d-k", k));
    c.appendChild(el("div", "d-v", v));
    if (note) c.appendChild(el("div", "comp-n", note));
    return c;
  }

  function fmtNm(v) {
    if (v === undefined || v === null) return "n/a";
    if (v >= 1e6) return (v / 1e6).toFixed(1) + " mM";
    if (v >= 1000) return (v / 1000).toFixed(2) + " µM";
    if (v >= 1) return v.toFixed(1) + " nM";
    return v.toFixed(3) + " nM";
  }

  function fold(m, p) {
    if (!m || !p) return null;
    return m > p ? m / p : p / m;
  }

  function fmtFold(f) {
    if (f === null || f === undefined) return "n/a";
    if (f >= 100) return Math.round(f).toLocaleString() + "x";
    return f.toFixed(1) + "x";
  }

  /* ---------- composition ---------- */

  function composition() {
    var s = state.summary;
    var wrap = document.getElementById("comp");
    wrap.innerHTML = "";
    wrap.appendChild(cell("proteins scored", s.scored,
      "of " + s.attempted + " attempted"));
    wrap.appendChild(cell("compounds predicted", s.compounds.toLocaleString(),
      "held out from the model"));
    wrap.appendChild(cell("structures kept", s.with_pose,
      "one predicted complex each"));
    wrap.appendChild(cell("gpu hours", s.gpu_hours.toLocaleString(),
      "three RTX 3090 cards"));
  }

  /* ---------- table ---------- */

  function visible() {
    var q = state.q.toLowerCase();
    return state.targets.filter(function (t) {
      if (!state.showFailed && !t.scored) return false;
      if (state.showFailed && t.scored) return false;
      if (state.onlyPose && !t.pose) return false;
      if (state.family && t.family !== state.family) return false;
      if (!q) return true;
      return (t.name + " " + (t.gene || "") + " " + t.accession + " " +
              t.short).toLowerCase().indexOf(q) >= 0;
    });
  }

  function sorted(rows) {
    var k = state.sort, dir = state.dir;
    return rows.slice().sort(function (a, b) {
      var x = a[k], y = b[k];
      if (k === "name") return dir * a.name.localeCompare(b.name);
      if (x === undefined || x === null) return 1;
      if (y === undefined || y === null) return -1;
      // Fold error reads the other way round. Lower is better, so the default
      // descending sort would put the worst target at the top of the list.
      if (k === "median_fold") return -dir * (x - y);
      return dir * (x - y);
    });
  }

  function corrBar(t) {
    var wrap = el("div");
    wrap.appendChild(el("span", "", t.spearman.toFixed(3) +
      (t.ci ? "  [" + t.ci[0].toFixed(2) + ", " + t.ci[1].toFixed(2) + "]" : "")));
    var bar = el("div", "bar");
    var zero = el("u");
    zero.style.left = "50%";
    var fill = el("i");
    var w = Math.min(Math.abs(t.spearman), 1) * 50;
    if (t.spearman >= 0) { fill.style.left = "50%"; }
    else { fill.className = "neg"; fill.style.left = (50 - w) + "%"; }
    fill.style.width = w + "%";
    bar.appendChild(fill);
    bar.appendChild(zero);
    wrap.appendChild(bar);
    return wrap;
  }

  function shownChips(t) {
    var wrap = el("div");
    if (t.pose) wrap.appendChild(el("span", "chip chip--pose", "structure"));
    if (SIM_TARGETS[t.accession]) {
      wrap.appendChild(el("span", "chip chip--sim", "simulated"));
    }
    if (!t.pose && !SIM_TARGETS[t.accession]) {
      wrap.appendChild(el("span", "chip chip--none", "numbers only"));
    }
    return wrap;
  }

  function render() {
    var rows = sorted(visible());
    var body = document.getElementById("rows");
    body.innerHTML = "";
    state.open = null;
    disposeStage();

    rows.forEach(function (t) {
      var tr = el("tr");
      tr.tabIndex = 0;

      var nameTd = el("td");
      nameTd.appendChild(el("div", "pname", t.name));
      var sub = t.accession + (t.gene ? "  ·  " + t.gene : "") +
        (t.residues ? "  ·  " + t.residues + " aa" : "");
      nameTd.appendChild(el("div", "pgene", sub));
      if (t.disease && t.disease.keywords && t.disease.keywords.length) {
        nameTd.appendChild(el("div", "pgene", "UniProt disease: " +
          t.disease.keywords.join(", ")));
      }
      tr.appendChild(nameTd);

      tr.appendChild(el("td", "fam", t.family));
      tr.appendChild(el("td", "fam", shortOrganism(t.organism)));

      var cTd = el("td", "num-cell");
      if (t.scored) {
        cTd.appendChild(el("div", "", String(t.n)));
        cTd.appendChild(el("div", "pgene",
          "of " + (t.chembl_compounds || "?") + " measured"));
      } else {
        cTd.appendChild(el("div", "pgene", "not scored"));
      }
      tr.appendChild(cTd);

      if (t.scored) {
        var sTd = el("td", "num-cell");
        sTd.appendChild(corrBar(t));
        tr.appendChild(sTd);
        tr.appendChild(el("td", "num-cell", fmtFold(t.median_fold)));
        tr.appendChild(el("td", "num-cell",
          t.within_10x + " of " + t.n));
      } else {
        var rTd = el("td", "fam");
        rTd.colSpan = 3;
        rTd.textContent = t.reason || "no reason recorded";
        tr.appendChild(rTd);
      }

      tr.appendChild(el("td", "", "")).appendChild(shownChips(t));

      if (t.scored) {
        tr.addEventListener("click", function () { toggle(t, tr); });
        tr.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(t, tr);
          }
        });
      } else {
        tr.style.cursor = "default";
      }
      body.appendChild(tr);
    });

    var scored = state.targets.filter(function (t) { return t.scored; }).length;
    document.getElementById("count").textContent = state.showFailed
      ? rows.length + " unscored targets shown"
      : rows.length + " of " + scored + " scored proteins shown";
  }

  function shortOrganism(name) {
    if (!name) return "";
    return name.replace(/ \(strain.*\)$/, "");
  }

  /* ---------- detail ---------- */

  function toggle(t, tr) {
    var existing = tr.nextSibling;
    if (existing && existing.classList && existing.classList.contains("detail")) {
      existing.remove();
      tr.classList.remove("open");
      state.open = null;
      disposeStage();
      return;
    }
    var prior = document.querySelector("tr.detail");
    if (prior) {
      var priorRow = prior.previousSibling;
      if (priorRow && priorRow.classList) priorRow.classList.remove("open");
      prior.remove();
      disposeStage();
    }
    tr.classList.add("open");
    state.open = t.accession;

    var row = el("tr", "detail");
    var td = el("td");
    td.colSpan = 8;
    var inner = el("div", "d-in");
    inner.appendChild(el("p", "d-sub", "Loading compounds…"));
    td.appendChild(inner);
    row.appendChild(td);
    tr.parentNode.insertBefore(row, tr.nextSibling);

    detail(t).then(function (d) {
      inner.innerHTML = "";
      buildDetail(inner, t, d);
    }).catch(function (err) {
      inner.innerHTML = "";
      inner.appendChild(el("p", "d-sub", "Could not load this target: " + err.message));
    });
  }

  function detail(t) {
    if (state.cache[t.accession]) return Promise.resolve(state.cache[t.accession]);
    return fetch("t/" + t.accession + ".json").then(function (r) {
      if (!r.ok) throw new Error("no detail file (" + r.status + ")");
      return r.json();
    }).then(function (d) {
      state.cache[t.accession] = d;
      return d;
    });
  }

  function buildDetail(inner, t, d) {
    var stats = el("div", "d-full");
    stats.appendChild(el("h3", "d-h", t.name));
    var bits = [];
    if (t.n_pdb) {
      bits.push(t.n_pdb + " experimental structures in the PDB (" +
        t.pdb_ids.join(", ") + (t.n_pdb > t.pdb_ids.length ? " and others" : "") + ")");
    } else {
      bits.push("no experimental structure in the PDB");
    }
    if (t.disease && t.disease.comments && t.disease.comments.length) {
      bits.push("UniProt links it to " + t.disease.comments.join(", "));
    }
    stats.appendChild(el("p", "d-sub", bits.join(". ") + "."));

    var g = el("div", "d-grid");
    g.appendChild(cell("rank correlation", t.spearman.toFixed(3),
      t.ci ? "95% CI " + t.ci[0].toFixed(2) + " to " + t.ci[1].toFixed(2) : ""));
    g.appendChild(cell("median error", fmtFold(t.median_fold), "fold, against measurement"));
    g.appendChild(cell("within 10x", t.within_10x + " of " + t.n, "compounds"));
    g.appendChild(cell("mean log error", t.mae_log.toFixed(3), "log10 units"));
    g.appendChild(cell("chemical clusters", t.clusters || "n/a",
      "one compound per cluster"));
    g.appendChild(cell("closest pair", t.max_tanimoto !== undefined &&
      t.max_tanimoto !== null ? t.max_tanimoto.toFixed(3) : "n/a",
      "Tanimoto, highest in the set"));
    g.appendChild(cell("gpu time", (t.gpu_hours || 0).toFixed(2) + " h",
      "to predict this target"));
    g.appendChild(cell("pool", (t.chembl_compounds || "?") + " measured",
      "in ChEMBL before selection"));
    stats.appendChild(g);
    inner.appendChild(stats);

    inner.appendChild(scatterPanel(t, d));
    inner.appendChild(structurePanel(t, d));
    inner.appendChild(compoundPanel(t, d));
  }

  /* ---------- scatter ---------- */

  function scatterPanel(t, d) {
    var box = el("div");
    box.appendChild(el("h3", "d-h", "Predicted against measured"));
    box.appendChild(el("p", "d-sub",
      "Both axes are log scale in nanomolar. The dashed line is where a perfect "
      + "prediction would sit. Points above it are predicted too tight, points "
      + "below too weak."));
    var cs = d.compounds.filter(function (c) {
      return c.measured_nm > 0 && c.predicted_nm > 0;
    });
    if (!cs.length) {
      box.appendChild(el("p", "d-sub", "No compound detail stored for this target."));
      return box;
    }
    var W = 420, H = 320, P = 42;
    var xs = cs.map(function (c) { return Math.log10(c.measured_nm); });
    var ys = cs.map(function (c) { return Math.log10(c.predicted_nm); });
    var lo = Math.floor(Math.min(Math.min.apply(null, xs), Math.min.apply(null, ys)));
    var hi = Math.ceil(Math.max(Math.max.apply(null, xs), Math.max.apply(null, ys)));
    if (hi - lo < 2) { hi = lo + 2; }

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "scatter");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label",
      "Predicted against measured affinity for " + cs.length + " compounds");

    function sx(v) { return P + (v - lo) / (hi - lo) * (W - P - 12); }
    function sy(v) { return H - P - (v - lo) / (hi - lo) * (H - P - 14); }

    function node(name, attrs, text) {
      var n = document.createElementNS("http://www.w3.org/2000/svg", name);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      if (text !== undefined) n.textContent = text;
      return n;
    }

    for (var v = lo; v <= hi; v++) {
      svg.appendChild(node("line", { x1: sx(v), y1: sy(lo), x2: sx(v), y2: sy(hi),
        "class": "ax" }));
      svg.appendChild(node("line", { x1: sx(lo), y1: sy(v), x2: sx(hi), y2: sy(v),
        "class": "ax" }));
      svg.appendChild(node("text", { x: sx(v), y: H - P + 14,
        "text-anchor": "middle" }, tick(v)));
      svg.appendChild(node("text", { x: P - 6, y: sy(v) + 3,
        "text-anchor": "end" }, tick(v)));
    }
    svg.appendChild(node("line", { x1: sx(lo), y1: sy(lo), x2: sx(hi), y2: sy(hi),
      "class": "ideal" }));
    svg.appendChild(node("text", { x: W / 2, y: H - 6, "text-anchor": "middle" },
      "measured"));
    svg.appendChild(node("text", { x: 11, y: H / 2, "text-anchor": "middle",
      transform: "rotate(-90 11 " + (H / 2) + ")" }, "predicted"));

    cs.forEach(function (c) {
      var f = fold(c.measured_nm, c.predicted_nm);
      var pt = node("circle", {
        cx: sx(Math.log10(c.measured_nm)),
        cy: sy(Math.log10(c.predicted_nm)),
        r: 4.5
      });
      pt.appendChild(node("title", {}, c.id + "\nmeasured " +
        fmtNm(c.measured_nm) + "\npredicted " + fmtNm(c.predicted_nm) +
        "\noff by " + fmtFold(f)));
      svg.appendChild(pt);
    });
    box.appendChild(svg);
    return box;
  }

  function tick(log10nm) {
    if (log10nm >= 3) return (Math.pow(10, log10nm - 3)) + "µM";
    if (log10nm < 0) return Math.pow(10, log10nm).toFixed(2);
    return String(Math.pow(10, log10nm));
  }

  /* ---------- structure ---------- */

  function disposeStage() {
    if (state.stage) {
      try { state.stage.dispose(); } catch (e) { /* already gone */ }
      state.stage = null;
    }
  }

  function structurePanel(t, d) {
    var box = el("div");
    box.appendChild(el("h3", "d-h", "A predicted complex"));
    if (!d.pose) {
      box.appendChild(el("p", "d-sub",
        "No structure kept for this target. Poses were archived for 28 of the "
        + "121 and the rest hold numbers only, because the full pose archive is "
        + "163 MB and would not deploy."));
      return box;
    }
    var p = d.pose;
    box.appendChild(el("p", "d-sub", p.compound + ", chosen as the " +
      p.selected_as + ". Measured " + fmtNm(p.measured_nm) + ", predicted " +
      fmtNm(p.predicted_nm) + ", off by " +
      fmtFold(fold(p.measured_nm, p.predicted_nm)) + "."));

    var stage = el("div", "stage3d");
    var note = el("div", "note", "Loading structure…");
    stage.appendChild(note);
    box.appendChild(stage);

    var legend = el("div", "legend3");
    legend.appendChild(el("span", "lg-l", "compound"));
    legend.appendChild(el("span", "lg-p", "pocket side chains"));
    legend.appendChild(el("span", "lg-b", "backbone"));
    box.appendChild(legend);

    box.appendChild(el("p", "d-note", "Backbone plus every side chain with an "
      + "atom within 6 angstrom of the compound. The rest of the side chains "
      + "are stripped, which takes the file from 295 KB to " +
      Math.round((p.n_protein_atoms + p.n_ligand_atoms) / 1000) +
      "k atoms and keeps the pocket readable."));

    if (SIM_TARGETS[t.accession]) {
      var link = el("p", "d-note");
      var a = el("a", "", "This target has a molecular dynamics run");
      a.href = SIM_TARGETS[t.accession];
      link.appendChild(a);
      link.appendChild(document.createTextNode(
        ", two predictions in explicit water, one right and one wrong."));
      box.appendChild(link);
    }

    if (typeof NGL === "undefined") {
      note.textContent = "The structure viewer did not load.";
      return box;
    }

    disposeStage();
    var ngl = new NGL.Stage(stage, {
      backgroundColor: "#0D1210",
      clipNear: 0, clipFar: 100, fogNear: 100, fogFar: 100
    });
    state.stage = ngl;
    window.addEventListener("resize", function () {
      if (state.stage === ngl) ngl.handleResize();
    });

    ngl.loadFile(p.file, { ext: "pdb" }).then(function (comp) {
      note.remove();
      comp.addRepresentation("cartoon", {
        sele: "polymer", color: "#8E9A93", opacity: 0.62, side: "front"
      });
      comp.addRepresentation("licorice", {
        sele: "sidechainAttached and not LIG", color: "#6FA8C7",
        radiusScale: 0.5, opacity: 0.85
      });
      comp.addRepresentation("ball+stick", {
        sele: "LIG", color: "#E8A33D", radiusScale: 1.1, multipleBond: "symmetric"
      });
      comp.autoView("LIG");
      ngl.viewerControls.zoom(-0.25);
    }).catch(function (err) {
      note.textContent = "Could not load the structure: " + err.message;
    });
    return box;
  }

  /* ---------- compounds ---------- */

  function compoundPanel(t, d) {
    var box = el("div", "d-full");
    box.appendChild(el("h3", "d-h", "The held-out compounds"));
    box.appendChild(el("p", "d-sub", d.compounds.length +
      " compounds, each one measured in ChEMBL and none of them seen by the "
      + "model. Sorted by how far the prediction fell from the measurement."));

    var rows = d.compounds.slice().sort(function (a, b) {
      return (fold(b.measured_nm, b.predicted_nm) || 0) -
             (fold(a.measured_nm, a.predicted_nm) || 0);
    });

    var scroll = el("div", "cmp-scroll");
    var tbl = el("table", "cmp");
    var thead = el("thead");
    var htr = el("tr");
    ["ChEMBL", "measured", "predicted", "off by", "assays", "pose trust", "SMILES"]
      .forEach(function (h) { htr.appendChild(el("th", "", h)); });
    thead.appendChild(htr);
    tbl.appendChild(thead);
    var tb = el("tbody");
    rows.forEach(function (c) {
      var tr = el("tr");
      tr.appendChild(el("td", "", c.id));
      tr.appendChild(el("td", "", fmtNm(c.measured_nm)));
      tr.appendChild(el("td", "", fmtNm(c.predicted_nm)));
      var f = fold(c.measured_nm, c.predicted_nm);
      tr.appendChild(el("td", f >= 10 ? "off-hi" : "", fmtFold(f)));
      tr.appendChild(el("td", "", c.n_assays === undefined ? "?" : String(c.n_assays)));
      tr.appendChild(el("td", "", c.ligand_iptm === undefined ||
        c.ligand_iptm === null ? "n/a" : c.ligand_iptm.toFixed(3)));
      var smi = el("td", "smi", c.smiles || "");
      smi.title = c.smiles || "";
      tr.appendChild(smi);
      tb.appendChild(tr);
    });
    tbl.appendChild(tb);
    scroll.appendChild(tbl);
    box.appendChild(scroll);
    box.appendChild(el("p", "d-note", "Pose trust is ligand_iptm, the model's "
      + "own confidence in where it put the compound. We tested whether it "
      + "predicts affinity error and it does not, so it is reported and not "
      + "used. The number is here because it was measured, not because it works."));
    return box;
  }

  /* ---------- unscored ---------- */

  function fails() {
    var counts = {};
    state.targets.filter(function (t) { return !t.scored; }).forEach(function (t) {
      var r = (t.reason || "no reason recorded");
      var m = r.match(/only (\d+) compounds survived/);
      var key;
      if (m) {
        var k = parseInt(m[1], 10);
        key = k === 0 ? "no compound survived the clustering rule"
            : k === 1 ? "only 1 compound survived the clustering rule"
            : "only " + k + " compounds survived the clustering rule";
      } else {
        key = r.split(";")[0].slice(0, 90);
      }
      counts[key] = (counts[key] || 0) + 1;
    });
    var out = document.getElementById("fails");
    var ul = el("ul");
    Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })
      .forEach(function (k) {
        ul.appendChild(el("li", "", counts[k] + " targets: " + k));
      });
    out.appendChild(ul);
    out.appendChild(el("p", "d-note", "Tick “show the 189 unscored” "
      + "above to read them by name."));
  }

  /* ---------- wiring ---------- */

  function families() {
    var sel = document.getElementById("fam");
    var counts = {};
    state.targets.filter(function (t) { return t.scored; }).forEach(function (t) {
      counts[t.family] = (counts[t.family] || 0) + 1;
    });
    sel.appendChild(new Option("all families", ""));
    Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })
      .forEach(function (f) {
        sel.appendChild(new Option(f + " (" + counts[f] + ")", f));
      });
  }

  function wire() {
    document.getElementById("q").addEventListener("input", function (e) {
      state.q = e.target.value;
      render();
    });
    document.getElementById("fam").addEventListener("change", function (e) {
      state.family = e.target.value;
      render();
    });
    document.getElementById("sort").addEventListener("change", function (e) {
      state.sort = e.target.value;
      state.dir = e.target.value === "name" ? 1 : -1;
      render();
    });
    document.getElementById("onlyPose").addEventListener("change", function (e) {
      state.onlyPose = e.target.checked;
      render();
    });
    document.getElementById("showFailed").addEventListener("change", function (e) {
      state.showFailed = e.target.checked;
      render();
    });
  }

  fetch("proteins.json").then(function (r) { return r.json(); }).then(function (d) {
    state.targets = d.targets;
    state.summary = d.summary;
    composition();
    families();
    wire();
    render();
    fails();
  }).catch(function (err) {
    document.getElementById("count").textContent =
      "Could not load the database: " + err.message;
  });
})();
