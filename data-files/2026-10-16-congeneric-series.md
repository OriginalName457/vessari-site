# Ranking one scaffold: 14 published congeneric series

Written 16 October 2026. The numbers come from
`benchmarks/results/fep15-control.json` and
`benchmarks/results/fep-benchmark.json`, which were produced by earlier runs,
so this is a report of an existing retrospective result rather than a
confirmatory test of a hypothesis written today. It is labelled that way
because the analysis plan did not precede the data.

## The question this answers

A medicinal chemist has forty analogues of one scaffold and wants them ranked.
Our corpus median of 0.607 does not answer it, because those held-out sets
span four log units of potency and contain no two compounds sharing a scaffold.
We measured a narrow potency window cut from our own ChEMBL corpus and got
0.314. This is the same question asked on data that looks like a real series.

## The sets

Fourteen congeneric series from the Open Force Field protein and ligand
benchmark, which is the set the free energy field uses. Three hundred and fifty
nine compounds in total, 10 to 42 per series.

They are series rather than windows. Median pairwise ligand similarity inside a
set is **0.569**, so the compounds share a scaffold. Median potency spread is
**0.75 log units**, which is narrower than the 1.0 log window we cut from
ChEMBL and far narrower than the four log units our corpus spans.

Each series carries a crystal structure and a single assay protocol from one
paper. The comparison below turns on that single protocol.

## What the structure arm scores

**Median Spearman 0.660**, mean 0.629, 95 percent bootstrap interval over
series 0.529 to 0.724. Eleven of 14 score above 0.5 and one falls below 0.3.

Give a chemist who brings a series measured in one assay that number.

## What the ligand arm scores on the same sets

Median 0.567, mean 0.596, interval 0.519 to 0.671. Eleven of 14 above 0.5.

The paired difference is **plus 0.0334 with an interval of minus 0.097 to plus
0.159**, which contains zero. The structure arm is ahead on 8 of 14. We cannot
tell the two apart on these sets either, which is the same answer the narrow
window gave and the same answer the data-poor experiment gave.

A fingerprint model needs known actives for that target. The structure arm
needs a sequence. They differ there, not in accuracy on a target where both
can be run.

## The contrast that explains our window result

| What was ranked | Potency span | Compounds | Structure Spearman |
|---|---|---|---|
| 14 congeneric series, one assay each | 0.75 log | 359 | 0.660 |
| ChEMBL held-out sets, our corpus | 4.15 log | 2,462 | 0.607 |
| ChEMBL compounds in a 1.5 log window | 1.5 log | 336 | 0.314 |
| ChEMBL compounds in a 1.0 log window | 1.0 log | 151 | 0.165 |

Narrowing the potency range of a ChEMBL set takes the correlation to 0.165. A
real series spanning less than that reaches 0.660. Both rows ask the model to
order compounds inside a narrow potency band, so the difference between them
comes from the measurements rather than the task.

A congeneric set from one paper has one assay, one protocol and one
laboratory. Our ChEMBL windows pool IC50 and Ki across many
papers, and we measured what that costs: **33 percent of the compounds inside
those windows have their own ChEMBL assays disagreeing with each other by more
than our prediction error on that target**. On one target we counted 923
compounds measured by IC50 only, 311 by Ki only and 45 by both, with no
Cheng-Prusoff correction available for any of them.

So mixed public literature puts its own ceiling on within-window ranking. The
same model on the same kind of task, with one assay behind it, reaches 0.660.

## Against the physics

On the four series where FEP+ has published values, 71 compounds and 700
within-set pairs, FEP+ reaches Pearson 0.792 and a centred mean absolute error
of 0.52 kcal/mol. Across all 15 series we reach Pearson 0.664 and a centred MAE
of 0.599 kcal/mol, on 364 compounds and 4,899 pairs.

Our centred error is 0.08 kcal/mol wider than a method that needs hand
parameterisation and orders of magnitude more compute. On the three of their
four series we also hold, our Pearson is 0.593 against the 0.66 the model's own
authors report for that subset, so our reproduction runs slightly below their
figure.

## Why this number carries a leakage control our corpus number does not

The model's authors filtered their affinity training set to exclude proteins
with 90 percent or higher sequence identity to any protein in the FEP+
benchmark, stating that this ensures the benchmark is on unseen proteins. These
series are that benchmark. Our own 123 ChEMBL targets were not, so nothing
excluded them, which is the subject of
`benchmarks/results/2026-10-16-training-overlap.md`.

The paper does not list which exact protein set the filter used, and the Open
Force Field benchmark is wider than the original FEP+ set, so whether all 14
were covered is not established. The ones that certainly were are CDK2, p38 and
TYK2.

## What to say to a chemist

Bring a series measured in one assay and expect a rank correlation near 0.66,
with a centred error near 0.6 kcal/mol, in 62 seconds a compound. A fingerprint
model trained on your own prior actives will do about as well, and we cannot
show otherwise on 14 series.

Ask us to rank compounds pulled from mixed public literature inside a narrow
potency band and expect near 0.3, because a third of those measurements
disagree with themselves by more than the error we are trying to resolve.

## Files

- `benchmarks/results/fep15-control.json`, both arms per series.
- `benchmarks/results/fep15-features.json`, the similarity and spread of each.
- `benchmarks/results/fep-benchmark.json`, the aggregate against FEP+.
- `benchmarks/results/within-series.jsonl`, the ChEMBL window rows.
