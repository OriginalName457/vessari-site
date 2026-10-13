/* Playback for two protein-ligand trajectories.
 *
 * Smoothness is decided before this file runs. The simulation held about a
 * hundred thousand atoms, of which ninety thousand were water; what is loaded
 * here is under two thousand, because the exporter strips solvent and keeps
 * only the receptor backbone, the pocket residues in full, and the compound.
 * At that size a browser holds sixty frames per second without effort, and the
 * binding mode is actually visible, which it is not through thirty thousand
 * waters.
 *
 * Both players load lazily. Two WebGL contexts and two structures on page load
 * makes the page stutter on arrival, which is the first thing a viewer notices
 * and the easiest thing to avoid.
 */
(function () {
  "use strict";

  var PANELS = [
    { key: "low", tag: "Prediction was right",
      title: "A compound this receptor barely binds",
      badge: "" },
    { key: "high", tag: "Prediction was wrong", badge: "sim-tag--bad",
      title: "A compound it binds tightly" }
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function fmtNm(v) {
    if (v === undefined || v === null) return "unknown";
    if (v >= 1000) return (v / 1000).toFixed(1) + " µM";
    return v.toFixed(1) + " nM";
  }

  function numbers(m) {
    var wrap = el("div", "nums");
    [["measured", fmtNm(m.measured_nm)],
     ["predicted", fmtNm(m.predicted_nm)],
     ["off by", m.fold_error >= 100
        ? Math.round(m.fold_error).toLocaleString() + "x"
        : m.fold_error + "x"],
     ["contacts kept", (m.contact_persistence * 100).toFixed(0) + "%"]
    ].forEach(function (pair) {
      var c = el("div", "num");
      c.appendChild(el("div", "num-k", pair[0]));
      c.appendChild(el("div", "num-v", pair[1]));
      wrap.appendChild(c);
    });
    return wrap;
  }

  function build(panel, manifest) {
    var card = el("div", "sim");

    var head = el("div", "sim-head");
    head.appendChild(el("div", "sim-tag " + panel.badge, panel.tag));
    head.appendChild(el("h2", "sim-name", panel.title));
    head.appendChild(el("div", "sim-id",
      manifest.measurements.chembl_id + "  ·  " +
      manifest.atoms_shown.toLocaleString() + " of " +
      manifest.atoms_in_simulation.toLocaleString() + " atoms drawn"));
    card.appendChild(head);

    var stage = el("div", "stage");
    var note = el("div", "stage-note", "Loading the trajectory");
    stage.appendChild(note);
    card.appendChild(stage);

    card.appendChild(numbers(manifest.measurements));

    var ctl = el("div", "ctl");
    var play = el("button", "", "Pause");
    var slider = el("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = manifest.frames - 1;
    slider.value = 0;
    slider.setAttribute("aria-label", "frame");
    var counter = el("span", "frame", "1/" + manifest.frames);
    var style = el("button", "", "Surface");
    var reset = el("button", "", "Recentre");
    ctl.appendChild(play);
    ctl.appendChild(slider);
    ctl.appendChild(counter);
    ctl.appendChild(style);
    ctl.appendChild(reset);
    card.appendChild(ctl);

    return { card: card, stage: stage, note: note, play: play,
             slider: slider, counter: counter, style: style, reset: reset };
  }

  function render(ui, panel, manifest) {
    if (typeof NGL === "undefined") {
      ui.note.textContent =
        "The structure viewer could not load from its content network. " +
        "The measurements beside this panel are unaffected.";
      return;
    }
    var stage = new NGL.Stage(ui.stage, {
      backgroundColor: "#0D1210",
      quality: "medium",
      impostor: true,
      clipNear: 0,
      cameraType: "perspective"
    });
    window.addEventListener("resize", function () { stage.handleResize(); });

    stage.loadFile(panel.key + ".pdb", { ext: "pdb", asTrajectory: true })
      .then(function (comp) {
        ui.note.remove();

        // The rest of the receptor is an alpha carbon trace, so it gets a
        // tube. A cartoon is a spline through the alpha carbons but needs the
        // full backbone to orient its ribbon, and asking for one here draws
        // nothing at all.
        comp.addRepresentation("tube", {
          sele: ".CA", color: "#8E9A93", opacity: 0.5, radius: 0.25,
          quality: "medium"
        });
        // Pocket residues came through with every atom, so draw them in full.
        comp.addRepresentation("licorice", {
          sele: "sidechainAttached and not .CA",
          color: "#6FA8C7", radiusScale: 0.28, opacity: 0.95
        });
        // The compound is the subject.
        comp.addRepresentation("ball+stick", {
          sele: "LIG or LIG1 or UNL", color: "#E8A33D",
          radiusScale: 0.55, multipleBond: "symmetric"
        });
        // A surface over the pocket residues only. Over an alpha carbon
        // trace a molecular surface is meaningless, and over the whole
        // structure it would hide the compound, which is the subject.
        var surf = comp.addRepresentation("surface", {
          sele: "sidechainAttached and not .CA", opacity: 0.2,
          color: "#6FA8C7", surfaceType: "sas", probeRadius: 1.4,
          visible: false, quality: "low"
        });

        comp.autoView("LIG or LIG1 or UNL", 1200);

        var traj = comp.addTrajectory().trajectory;
        var player = new NGL.TrajectoryPlayer(traj, {
          step: 1, timeout: 70, start: 0, end: manifest.frames - 1,
          interpolateType: "linear", interpolateStep: 2, mode: "loop",
          direction: "forward"
        });
        player.play();

        traj.signals.frameChanged.add(function (i) {
          ui.slider.value = i;
          ui.counter.textContent = (i + 1) + "/" + manifest.frames;
        });

        ui.play.addEventListener("click", function () {
          if (player.isRunning) { player.pause(); ui.play.textContent = "Play"; }
          else { player.play(); ui.play.textContent = "Pause"; }
        });
        ui.slider.addEventListener("input", function () {
          player.pause();
          ui.play.textContent = "Play";
          traj.setFrame(parseInt(ui.slider.value, 10));
        });
        ui.style.addEventListener("click", function () {
          var on = !surf.visible;
          surf.setVisibility(on);
          ui.style.textContent = on ? "Hide surface" : "Surface";
        });
        ui.reset.addEventListener("click", function () {
          comp.autoView("LIG or LIG1 or UNL", 600);
        });
      })
      .catch(function (err) {
        ui.note.textContent =
          "The trajectory could not be loaded: " + err;
      });
  }

  function mount() {
    var host = document.getElementById("sims");
    if (!host) return;

    PANELS.forEach(function (panel) {
      fetch(panel.key + ".json")
        .then(function (r) { return r.json(); })
        .then(function (manifest) {
          var ui = build(panel, manifest);
          host.appendChild(ui.card);

          // Only build the WebGL context once the panel is actually on
          // screen. Two contexts at page load is what makes a page like this
          // stutter when it first appears.
          if ("IntersectionObserver" in window) {
            var seen = false;
            var obs = new IntersectionObserver(function (entries) {
              entries.forEach(function (e) {
                if (e.isIntersecting && !seen) {
                  seen = true;
                  obs.disconnect();
                  render(ui, panel, manifest);
                }
              });
            }, { rootMargin: "200px" });
            obs.observe(ui.stage);
          } else {
            render(ui, panel, manifest);
          }
        })
        .catch(function (err) {
          var card = el("div", "sim");
          card.appendChild(el("div", "sim-head", "Could not load " + panel.key));
          host.appendChild(card);
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
