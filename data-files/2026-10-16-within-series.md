# Pre-registration: ranking inside one potency window

Written 16 October 2026, before the comparison this registers has been run.
Read the honesty note below first, because part of this question has already
been answered by accident.

## The question, in the words a chemist would use

A medicinal chemist has forty analogues of one scaffold, a crystal structure,
and potencies spanning a log and a half. They want them ranked. That is the
task they would pay for, and Vessari has never measured it.

Our published median rank correlation of 0.607 is measured on held-out sets
that span a median of 4.04 log units of potency, and where no two compounds in
the same set share a Murcko scaffold. The clustering rule that keeps the sets
honest also guarantees they contain no series. Ranking a weak fragment below a
clinical compound is a different task from ranking two analogues of the same
scaffold, and the second one is the job.

## Honesty note, written before the work

A critic agent given the repository on 16 October computed the structure arm
inside a narrow window on its own initiative, as an exploratory post hoc
analysis, and reported median per-target Spearman falling from 0.553 to 0.318
across 83 qualifying targets, with a mean paired change of minus 0.260 and a
95 percent interval over targets of minus 0.324 to minus 0.195.

That number exists and is recorded here. It is exploratory and it is not the
confirmatory result this registration is for, for two reasons. Restricting the
range of a variable attenuates rank correlation arithmetically, so some of that
fall is not the model failing. And nobody has run the ligand only control in
the same window, which is the comparison that decides anything.

This registration fixes the confirmatory question, which has not been run.

## Hypothesis

Inside a 1.5 log window of measured potency, the structure arm ranks compounds
better than a ligand only random forest on the same compounds.

## The arms

Both arms predict the same quantity on the same compounds.

1. **Structure.** The predictions already on disk at
   `~/.vessari/corpus/v2/<ACC>/predictions.json`, written by the corpus run.
   No new folding. No new GPU hours.
2. **Ligand.** A random forest, 100 trees, ECFP4 at 2048 bits, trained on the
   target's ChEMBL pool with the held-out compounds removed. The same model
   and the same code as the registered ligand baseline.

## The window

For each target, take the median of the measured log10 potencies of its
held-out compounds, and keep the compounds inside plus or minus 0.75 log of
it. That is a 1.5 log window, which is what a lead optimisation series spans.

A target enters the analysis if 8 or more of its held-out compounds fall
inside the window and the ligand arm can be trained on it.

Secondary window, fixed now: plus or minus 0.5 log, a 1.0 log window, with the
same floor of 8 compounds.

## Primary outcome

The paired difference in Spearman rank correlation inside the 1.5 log window,
structure minus ligand, averaged over qualifying targets, with a 95 percent
bootstrap interval resampling targets.

## Secondary outcomes

- Median Spearman per arm inside the window.
- Structure arm inside the window against the structure arm on the full
  held-out set, paired.
- **A sample size control.** For each target, draw a random subset of the
  held-out set the same size as its window subset, with no restriction on
  range, and compute the structure arm Spearman on it, averaged over 200
  draws. Comparing the window subset against this control separates the loss
  caused by a narrow potency range from the loss caused by having fewer
  compounds.
- Median absolute fold error per arm inside the window.
- The share of window compounds whose own ChEMBL assays disagree by more than
  the arm's median fold error, because a ranking cannot be judged below the
  disagreement in its ground truth.

## Decision rule, fixed now

- **The structure arm earns the window** if the primary difference is above
  zero with an interval excluding zero. We then publish the window number
  beside the headline and answer the chemist's question with it.
- **If the interval contains zero or lies below it**, we publish that inside a
  potency window the structure arm does not rank better than a fingerprint
  model, we put that sentence on the front page beside the headline, and the
  within-series task is named as something the platform does not do.
- Either way the window Spearman is published per target on the proteins page,
  so the headline cannot be read without it.

## Prior, stated

Three results already point against the hypothesis. The ABL1 crossover, where
the ligand model reached 0.871 and the structure arm 0.284. The ligand baseline
across the corpus, which at 38 targets stood at minus 0.161 with an interval
excluding zero and has not finished. And `benchmarks/results/fep15-control.json`,
which runs both arms on 14 FEP+ congeneric sets, the closest thing in this
repository to the task being registered here, and returns a mean difference of
plus 0.033 with a bootstrap interval of minus 0.093 to plus 0.155 and the
ligand arm ahead on 6 of 14.

The prior is that the structure arm does not win inside a window. The
registration exists because the number has to be measured rather than assumed,
and because publishing it before a customer finds it is the only version of
this that is worth anything.

## What this cannot show

The window is cut around each target's own median potency, not around one
scaffold, because the held-out sets contain no scaffold pairs to cut around.
It holds potency range fixed and leaves chemical diversity wide. A true
congeneric series is narrow in both. The FEP+ sets in `fep15-control.json` are
narrow in both and there are only 14 of them.

So this measures ranking inside a potency window, which is necessary for the
chemist's task and is not the whole of it. The congeneric case needs a
registered experiment on series pulled from the literature, and that is
written separately.
