# Result: does folding a complex beat a random forest on fingerprints

Run 16 October 2026 under the registration at
`benchmarks/preregistered/2026-10-16-ligand-baseline.md`, with a stopping rule
added at 66 of 123 targets and before the run ended. The numbers are in
`benchmarks/results/ligand-baseline.jsonl`, one row per target.

**The registered decision rule fires against the structure arm.** The front
page changes because of it.

## Method

Three arms on the same held-out compounds, for every target in the published
corpus.

The structure arm is the prediction already recorded by the corpus run, folded
with Boltz-2 and read off the affinity head. No compound was refolded.

The ligand arm is a random forest, 100 trees, ECFP4 at 2048 bits, trained on
that target's ChEMBL pool with the held-out compounds removed. It is the same
model and the same code as the published ABL1 crossover, chosen before these
targets were seen.

The combination is the rank average of the two with nothing fitted, because a
blend fitted on the held-out set is not a held-out result.

Scored on Spearman rank correlation against the measured affinity, per target.
Intervals resample targets, 40,000 draws.

## What was excluded

**121 of 123 targets were scored.** The two excluded are P25929, neuropeptide
Y receptor type 1, and P37058, 17-beta-hydroxysteroid dehydrogenase type 1.
Both carry fewer than five compounds with both a prediction and a measurement,
three and four, which is below a floor that was in the code before the run
started. Their corpus entries rest on the same three and four compounds.

No target was excluded for a fetch failure. The stopping rule allowed six
failures per target before exclusion and none reached it.

## The primary outcome

Structure minus ligand, paired over 121 targets.

**Mean difference minus 0.1445, 95 percent bootstrap interval minus 0.191 to
minus 0.0992.** The interval lies entirely below zero.

The structure arm ranks better on **33 of 121** targets. The ligand model
ranks better by more than 0.1 on 65 targets and the structure arm does so on
18.

| Arm | Median Spearman | Mean | 95 percent interval on the mean |
|---|---|---|---|
| Structure | 0.607 | 0.552 | 0.503 to 0.597 |
| Ligand | 0.736 | 0.696 | 0.662 to 0.729 |
| Combination | 0.756 | 0.700 | 0.665 to 0.733 |

Median absolute fold error is 4.6x for the structure arm and **3.13x** for the
ligand model.

## The combination

The combination does not beat the better of the two single arms. Mean minus
0.0339, interval minus 0.053 to minus 0.0158, better on 48 of 121. The
registration said to report that plainly if it happened, and it happened.

The combination does beat the structure arm alone by **plus 0.1481**, interval
0.1227 to 0.1743. So the ligand model carries information the structure arm
does not, across almost every target.

## What the decision rule says, and what changes

The registration fixed this before the run: if the interval lies entirely
below zero, the front page stops describing the corpus number as evidence that
folding helps, and says instead that a ligand model does better on the targets
we have scored. The number itself stays with that sentence beside it.

That is now done. The corpus median of 0.607 and the 4.6 fold error remain
published and unchanged. Beside them the site now says that on these 121
targets a random forest on fingerprints, trained on each target's own prior
actives, ranks better.

## What this does not say

It does not say the structure arm is worthless. It says the structure arm
loses to a cheaper model **on targets where that cheaper model can be
trained**, and every target in this corpus has at least 190 known compounds.
A protein with no measured compounds has no training set, and the structure
arm still returns a ranking with a calibrated interval there. That case has
never been tested here, because a protein with nothing measured has nothing to
score against, and testing it needs a laboratory.

It does not transfer to a congeneric series. On 14 published congeneric sets
the two arms cannot be told apart, 0.660 against 0.567 with a paired
difference of plus 0.033 and an interval containing zero. The corpus held-out
sets span a median of 4.15 log units of potency and a series spans 0.75.

It does not establish why. The within-window experiment and the assay type
counts point at measurement provenance rather than task width, and that is
argued in `benchmarks/results/2026-10-16-congeneric-series.md`.

## Where this sits beside the other registered results

Four registered experiments have now compared these two arms.

- This one, 121 corpus targets: the ligand model wins, interval excluding zero.
- Within a 1.5 log potency window, 68 qualifying targets: the ligand model
  wins, interval excluding zero, and the run is still going.
- Fourteen congeneric series: cannot be told apart, interval containing zero.
- Data poor targets with 15 to 45 measured compounds, 18 targets: unresolved,
  interval containing zero.

The pattern is consistent. Where a ligand model has enough of a target's own
data to train on, it ranks at least as well as folding the complex.

## Files

- `benchmarks/results/ligand-baseline.jsonl`, one row per target with all
  three arms, the pool size, the fold errors and the run time.
- `benchmarks/preregistered/2026-10-16-ligand-baseline.md`, the registration
  and its stopping rule amendment.
