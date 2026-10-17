# Ranking inside one potency window

Registered at `benchmarks/preregistered/2026-10-16-within-series.md` before the
comparison was run. Interim, 31 targets of a possible 123. The run continues as
the ligand baseline fetches the remaining ChEMBL pools.

## The question

A medicinal chemist with forty analogues of one scaffold and potencies spanning
a log and a half wants them ranked. Our headline of 0.607 is measured on
held-out sets spanning a median of 4.15 log units with no two compounds sharing
a Murcko scaffold, so it has never answered that. This measures both arms again
with the potency range held fixed.

## What we measured

For each target, take the median measured potency of its held-out compounds and
keep the compounds within 0.75 log of it. That is a 1.5 log window. Both arms
predict the same compounds. The structure arm is the prediction already on disk
from the corpus run, with no new folding. The ligand arm is a random forest on
ECFP4 trained on the target's ChEMBL pool with the held-out compounds removed,
which is the same model and the same code as the registered ligand baseline.

Thirty one targets have 8 or more compounds inside the window and a pool the
ligand arm can train on. The median window holds 10 compounds.

## The primary outcome

Structure minus ligand, inside the window, paired over targets.

**Mean difference minus 0.0856, 95 percent bootstrap interval minus 0.2195 to
plus 0.0478.** The interval contains zero. The structure arm is ahead on 13 of
31 targets.

Inside a potency window we cannot tell the two arms apart. Median Spearman is
0.318 for the structure arm and 0.336 for the ligand arm.

## What the window costs, and what it costs the other arm

Both arms lose accuracy when the potency range narrows. The structure arm falls
from 0.474 to 0.318 in median Spearman, a paired mean change of minus 0.203
with an interval of minus 0.311 to minus 0.093. The ligand arm falls further,
from 0.673 to 0.336, a paired mean change of minus 0.292 with an interval of
minus 0.388 to minus 0.195.

So the structure arm loses less than the fingerprint model does. The difference
between the two losses is plus 0.089 with an interval of minus 0.021 to plus
0.199, which contains zero, so we cannot establish that the structure arm is
more robust to a narrow window. We can say that its position relative to the
fingerprint model improves inside one.

On the full held-out sets of these same 31 targets the ligand arm is ahead by
0.174 with an interval of minus 0.287 to minus 0.067, which excludes zero.
Inside the window that advantage is gone.

## The sample size control

A narrow window holds fewer compounds, and fewer compounds alone moves a rank
correlation. For each target we drew 200 random subsets of the full held-out
set, each the same size as that target's window subset, with no restriction on
potency range, and averaged the structure arm Spearman across them. Median
0.449, against 0.318 inside the window. The paired difference is minus 0.183
with an interval of minus 0.290 to minus 0.075.

Narrowing the range costs 0.18 Spearman beyond what losing compounds costs.
Range restriction attenuates a rank correlation arithmetically for any
predictor. The ligand arm loses more than the structure arm does over the same
restriction. So 0.18 is the size of the effect on our predictions, and part of
it is arithmetic rather than the model.

## Fold error inside the window

Structure 3.0x, ligand 3.11x, both median absolute. The headline number on the
full sets is 4.6x, so the error is smaller inside the window while the ranking
is worse. A narrow window compresses the quantity being predicted, which makes
the error smaller and the order harder.

## The ground truth disagrees with itself

One hundred and ten of the 336 compounds inside the windows, 33 percent, have
their own ChEMBL assays disagreeing with each other by more than the structure
arm's median fold error on that target. A third of the data cannot distinguish
our prediction from the measurement it is scored against.

## The tighter window

A 1.0 log window qualifies 15 targets. Structure median 0.143, ligand median
0.370, mean difference minus 0.231 with an interval of minus 0.401 to minus
0.058, which excludes zero and favours the ligand arm. This was registered as a
secondary outcome and it rests on 15 targets. It is reported and it does not
decide anything.

## Update, 16 October, at 91 of 123 targets

The primary has crossed below zero as the sample grew. At 68 qualifying
targets the mean difference is **minus 0.1118 with a 95 percent interval of
minus 0.1995 to minus 0.0268**, which excludes zero. Median Spearman is 0.291
for the structure arm and 0.352 for the fingerprint arm.

The readings as the run has grown: minus 0.0856 at 31 qualifying targets,
minus 0.0627 at 35, minus 0.0516 at 38, minus 0.1118 at 68. The estimate moved
away from zero and the interval tightened past it.

This is still interim. The registration applies its decision rule when every
target with a fetched pool has been scored and 32 of the 123 have not been
reached. Both branches of that rule lead to the same published sentence, so
what the completion changes is the strength of the claim rather than its
direction.

The sentence on the explainer that reads this interval is now computed from
the interval rather than typed beside it. The figures on that page refresh at
every deploy and the prose did not, so for part of today the page said the
interval contained zero while printing an interval that excluded it, which
understated a result that runs against us.

## Status

Interim. The registration applies its decision rule when every target with a
fetched pool has been scored, and 76 of the 123 are still waiting on the fetch.
We have reported an interim reading as a conclusion twice before and been wrong
both times, so the front page does not move on this yet.

The number a chemist should expect from us inside a 1.5 log window is a rank
correlation near 0.32, which is the same as a fingerprint model trained on the
same target gets.

## What this does not cover

The window is cut around each target's median potency, not around one scaffold,
because the held-out sets contain no scaffold pairs to cut around. It holds
potency range fixed and leaves chemical diversity wide. A congeneric series is
narrow in both. `benchmarks/results/fep15-control.json` holds 14 sets that are
narrow in both, where the mean difference is plus 0.033 with an interval of
minus 0.093 to plus 0.155 and the ligand arm is ahead on 6 of 14.

## Files

- `benchmarks/results/within-series.jsonl`, one row per target with both arms,
  both windows, the sample size control and the assay spread count.
- `scripts/within_series.py`, the run.
