/* The simulation gallery. One viewer per protein, built on demand.

   Every entry is read from ../sim/library/library.json. A card renders with
   its numbers immediately and loads its structure only when the viewer is
   opened, because eleven NGL stages holding 190,000 atom systems at once will
   exhaust a laptop. */
(function gallery() {
  var DATA = "../sim/library/library.json";
  var FILES = "../sim/library/";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function stat(dl, label, value) {
    dl.appendChild(el("dt", "g-k", label));
    dl.appendChild(el("dd", "g-v", value));
  }

  function openViewer(card, entry) {
    var holder = card.querySelector(".g-stage");
    if (holder.dataset.loaded) return;
    holder.dataset.loaded = "1";
    var note = el("p", "g-note", "loading " + entry.accession);
    holder.appendChild(note);

    var stage = new NGL.Stage(holder, {
      backgroundColor: "#0D1210", quality: "medium", impostor: true,
      clipNear: 0, cameraType: "perspective"
    });
    window.addEventListener("resize", function () { stage.handleResize(); });

    fetch(FILES + entry.accession + ".json")
      .then(function (r) { return r.json(); })
      .then(function (meta) {
        return stage.loadFile(FILES + entry.accession + ".pdb",
                              { ext: "pdb", asTrajectory: true })
          .then(function (comp) {
            note.remove();
            comp.addRepresentation("tube", {
              sele: ".CA", color: "#8E9A93", opacity: 0.5, radius: 0.25
            });
            comp.addRepresentation("licorice", {
              sele: "sidechainAttached and not .CA",
              color: "#6FA8C7", radiusScale: 0.28, opacity: 0.95
            });
            comp.addRepresentation("ball+stick", {
              sele: "LIG or LIG1 or UNL", color: "#E8A33D",
              radiusScale: 0.55, multipleBond: "symmetric"
            });
            comp.autoView("LIG or LIG1 or UNL", 1200);
            var traj = comp.addTrajectory().trajectory;
            new NGL.TrajectoryPlayer(traj, {
              step: 1, timeout: 80, start: 0,
              end: (meta.frames || 40) - 1, mode: "loop", direction: "forward"
            }).play();
          });
      })
      .catch(function () {
        note.textContent = "this structure did not load";
      });
  }

  function card(entry) {
    var li = el("li", "g-card");
    var head = el("div", "g-head");
    head.appendChild(el("p", "g-acc", entry.accession));
    var env = el("p", "g-env",
      entry.n_lipids ? entry.n_lipids + " lipids, POPC bilayer" : "water");
    env.classList.add(entry.n_lipids ? "g-env--lipid" : "g-env--water");
    head.appendChild(env);
    li.appendChild(head);

    var holder = el("div", "g-stage");
    li.appendChild(holder);

    var open = el("button", "g-open", "play this one");
    open.type = "button";
    open.addEventListener("click", function () {
      open.remove();
      openViewer(li, entry);
    });
    li.appendChild(open);

    var dl = el("dl", "g-stats");
    stat(dl, "compound", entry.chembl_id);
    stat(dl, "error on this compound", entry.fold_error.toFixed(2) + "x");
    stat(dl, "atoms simulated", entry.n_atoms.toLocaleString());
    stat(dl, "built in", entry.minutes + " min");
    li.appendChild(dl);
    return li;
  }

  fetch(DATA, { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var list = document.getElementById("g-list");
      var count = document.getElementById("g-count");
      var entries = (d.entries || []).slice()
        .sort(function (a, b) { return a.fold_error - b.fold_error; });
      if (!entries.length) return;
      count.textContent = entries.length;
      var lipid = entries.filter(function (e) { return e.n_lipids > 0; }).length;
      document.getElementById("g-lipid").textContent = lipid;
      entries.forEach(function (e) { list.appendChild(card(e)); });
    })
    .catch(function () {});
})();
