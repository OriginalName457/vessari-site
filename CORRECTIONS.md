# Corrections

Numbers in this repository that were published and later found wrong, with what
changed and why. A result that moves without a record of having moved is worse
than one that was never published, so this file exists to make the movement
visible rather than to tidy it away.

## ABL1 affinity ranking, corrected twice

**Reported first:** Spearman 0.563 on 30 held-out compounds, commit `85703ae`.

**Corrected to:** Spearman 0.284, 95% CI [-0.121, 0.636], commit `b29006b`.
Regenerate with `scripts/score_holdout.py`.

Bemis-Murcko scaffold splitting, the field-standard rule and the default in most
benchmark suites, admitted eight members of one congeneric series into the
held-out set. The eight share a benzamide, a piperazinylmethyl, a
trifluoromethyl and an alkyne, and differ only in a fused heteroaryl cap. That
cap is part of the ring system, so Murcko sees eight scaffolds where a chemist
sees one series. The eight took every sub-nanomolar slot, and most of the
reported correlation was that series being told apart from a bag of unrelated
weak compounds.

Two further defects were found and fixed in the same pass. Medians were taken
in linear nanomolar on log-normal data, which for a compound measured three
times at 2 nM and three times at 18 nM returns 10 nM where the correct central
value is 6; nineteen of the thirty compounds had an even number of assays and
were therefore affected. And two compounds carried three identical records each
of exactly 10,000 and exactly 20,000 nM, which is an assay ceiling deposited
three times rather than three assays agreeing.

Selection is now single-linkage ECFP4 Tanimoto at 0.6, one compound per series.

## The training split leaked in the same way

**Found while rebuilding.** Training compounds were excluded from the split if
they shared a Murcko scaffold with a held-out compound, which removed 111 of
2,983. Excluding by ECFP4 Tanimoto at 0.6 instead removes 441. So 330 near
neighbours of held-out compounds were sitting in the training set, and every
ligand-baseline number measured on that split is inflated, including the ones
that beat us. Both arms were re-measured on the corrected split.

## The crossover claim

**Claimed in `b5fe27d`:** "Structure is the better move below roughly ten
compounds and is behind above sixty."

**Withdrawn.** That curve compared the ligand model against a hardcoded
structure score of 0.546, which came from the superseded set. Against the
corrected 0.284 there is no training-set size at which structure is preferable
for this target: a random forest given five compounds already ranks better than
zero-shot structure prediction on more than half of random draws.

The threshold is no longer a constant. `scripts/crossover_rf.py` reads it from
the stats file at run time and records the file's digest in every result, so a
claim cannot outlive the number beneath it.

## What did not change

The pipeline reproduces the published regime when given a published-style
benchmark: 52 FEP+ compounds, Pearson 0.596 and Kendall 0.433, against Boltz-2's
reported 0.66 and 0.48. The corrections above are about what we measured and
claimed, not about whether the code runs correctly.

## The paired intervals were too narrow

**Published:** direction right 85.3% of the time on pairs whose measured change
exceeds 1 kcal/mol, 95% interval 83.8 to 86.7.

**Corrected to:** the same 85.3%, interval 83.1 to 87.3. Regenerate with
`scripts/paired_validation.py`.

364 compounds generate 4,899 within-target pairs, so each compound appears in
about twenty-seven of them and the pairs are nowhere near independent.
Resampling pairs for the interval treats them as though they were, and returns
a precision the evidence does not support. The interval now resamples compounds
and keeps every pair among those drawn.

The point estimate did not move. Only the claimed precision did, and only by
about a point at each end. It is recorded here because a number that was on a
public page for a day and then changed is exactly what this file is for.
