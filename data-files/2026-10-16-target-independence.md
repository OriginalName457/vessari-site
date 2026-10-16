# Are our 123 targets 123 independent draws

Audited 16 October 2026 on the sequences and annotations already on disk. No
new prediction was run. This is an audit of how every interval this project
publishes is computed.

## Why it matters

Every interval here resamples targets. That treats the 123 targets as 123
independent draws. The corpus holds dihydrofolate reductase from five species
and five chemokine receptors, and a bootstrap that counts five orthologues as
five independent units reports an interval narrower than the evidence supports.

## What is actually related

Relatedness was measured as the fraction of one protein's distinct 6-mers that
also appear in the other, over the shorter sequence. It is a screen rather than
an alignment, and it is high for orthologues and near zero for unrelated
proteins. Across all 7,503 pairs the median is **0.0000** and **10 pairs** sit
at or above 0.25.

Those ten, in order: delta opioid receptor across two species at 0.875, the
5-HT1B receptor at 0.717, casein kinase I delta against epsilon at 0.656,
thymidylate synthase across species at 0.639, the GnRH receptor at 0.525,
dihydrofolate reductase at 0.516, MAPK3 against MAPK1 at 0.516, the PAF
receptor at 0.401, CCR2 against CCR5 at 0.329, and lactate dehydrogenase A
against B at 0.266.

Single linkage at 0.25 gives 113 groups from 123 targets, with no group larger
than two.

## Three groupings, because the choice is a judgement

**By sequence.** Only close orthologues and paralogues group. 113 units.

**By protein name, with the species and the isoform stripped.** The same
protein in five organisms becomes one draw. 87 units, and 21 of them hold more
than one target. Five dihydrofolate reductases from E. coli, human, Candida,
rat and Pneumocystis, scoring 0.680, 0.648, 0.607, 0.901 and 0.820. Five
chemokine receptors, four somatostatin receptors, four carbonic anhydrases,
four sphingosine 1-phosphate receptors, three MAP kinases, three casein
kinases, three cathepsins.

These share a ligand series even where the sequences have diverged, which is
why this is the grouping a reviewer asks for.

**Every receptor as one draw.** 63 units. Too aggressive to claim, because a
beta-2 adrenergic receptor and a prostaglandin receptor are genuinely different
targets with different ligands. Reported as the far bound.

## What the headline interval becomes

The point estimate does not move. Median rank correlation stays 0.607 and
median absolute error stays 4.6 fold under every grouping.

| Resampling | 95 percent interval on Spearman | Width |
|---|---|---|
| Targets, as published until today | 0.546 to 0.654 | 0.108 |
| Sequence groups, 113 units | 0.541 to 0.652 | 0.111 |
| Protein name units, 87 | **0.503 to 0.654** | 0.151 |
| Every receptor as one, 63 units | 0.498 to 0.662 | 0.164 |

Grouping by protein name widens the interval by 40 percent and moves the lower
bound from 0.546 to **0.503**. The far bound moves it to 0.498.

The fold error interval is unchanged at 4.2 to 5.0 by sequence, 4.3 to 5.0 by
protein name, and 4.1 to 5.0 under the far bound.

## What we have changed

The published interval on the corpus rank correlation is now **0.503 to
0.654**, resampling 87 protein units rather than 123 targets. The old interval
is recorded in `benchmarks/results/CORRECTIONS.md`.

The fold error interval stays at 4.3 to 5.0, which is where the protein unit
resampling puts it and is inside the previously published 4.2 to 5.0.

## What the audit did not support

An outside reader told us the corpus holds five dihydrofolate reductases that
the bootstrap treats as independent, and that is correct. The same reader
suggested this was a large effect. On these numbers it moves the lower bound by
0.043 and leaves the point estimate alone, so it is a real correction and a
modest one.

## Composition, stated rather than left to be discovered

Fifty six of the 123 targets are G protein coupled receptors. By organism, 102
human, 8 rat, 5 mouse, 2 E. coli, and one each from Pneumocystis carinii and
Cavia porcellus. Rat dihydrofolate reductase scores 0.901 and is not itself a
drug discovery target. It is in the corpus because it has enough chemically
diverse public measurement to score, which is the only selection rule the
corpus has ever used, and that rule is the reason the corpus is not a random
sample of proteins.

## Files

- `benchmarks/results/target-independence.json`, every pair above the
  threshold, all three groupings and all three intervals.
- `scripts/target_independence.py`, the audit.
