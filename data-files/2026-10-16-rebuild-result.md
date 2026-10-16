# Rescoring every published protein under the corrected clustering rule

Run 14 to 15 October 2026. Numbers in `benchmarks/results/corpus-123-targets.json`,
reproduce with `scripts/rebuild_corpus.py` then `scripts/summarise_corpus.py`.

## Why we ran it

Every figure on the site was computed before two defects were fixed. One was a
clustering rule documented one way and implemented another. The other was a
corpus gate comparing against the wrong variable. Fixing a defect and leaving
the old numbers up is the same as not fixing it, so we recomputed all of them.

## The headline moved

| | published | rebuilt |
|---|---|---|
| proteins | 121 | 123 |
| compounds held out | 2,777 | 2,462 |
| median fold error | 4.4x | **4.6x** |
| 95 percent interval | 4.0 to 4.8 | 4.3 to 5.0 |
| median rank correlation | 0.607 | 0.607 |
| mean rank correlation | 0.577 | 0.555 |
| ranked in the right direction | 117 of 121 | 116 of 123 |

The site now reads 4.6x. The old figure stays in `CORRECTIONS.md` with what
moved it.

## Like for like

The table above changes two things at once, the pipeline and the target set, so
it is not the clean comparison. The rebuild logged both scores for each target
as it went, and on the same 123 targets:

- median fold error 4.50x under the old rule, 4.60x under the corrected one
- mean per-target rank correlation changed by minus 0.0177, 95 percent interval
  minus 0.039 to plus 0.004
- worse on 62 targets, better on 54, unchanged on 7

The interval on that change contains zero. The corrected pipeline is not
measurably better or worse at ranking. It is slightly worse at absolute error,
by a tenth of a fold.

We reported this interval as excluding zero twice while the run was in
progress, at 106 and at 119 targets. The last four targets moved it back across
zero. That is what an interim reading on a partial run is worth, and it is why
the registered experiments in this project state a stopping rule before they
start.

## Why the compound count fell

2,777 compounds became 2,462 across more proteins. The corrected clustering
rule keeps one compound per chemical cluster over the whole candidate pool
rather than over the selected set, so it admits fewer compounds per target. The
sets are smaller and the compounds in them are less related to each other.

A smaller set with less internal similarity is a harder test, which is the
direction the error moved.

## Seven targets were not rescored

Two for environmental reasons: one hit the host running out of memory, one hit
a ChEMBL outage. Those are not results and they are not recorded as any.

Two no longer qualify. Under the corrected rule only 8 compounds survive
clustering where a scored set needs 12, so they are declined rather than
scored. That is the rule working.

Three were in the original corpus and were not reached before the run ended.

## What this does not change

The controls. The ligand only model still beats the structure arm on ABL1, and
that comparison was rerun as part of this. The direction of change against FEP+
is unaffected, because that benchmark is scored separately.
