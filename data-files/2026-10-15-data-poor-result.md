# Result: does a structure help when almost nothing has been measured

Run 13 to 15 October 2026 under the registration at
`benchmarks/preregistered/2026-10-13-data-poor-regime.md`. The numbers are in
`benchmarks/results/low-data-regime.json`.

## The answer

Unresolved. The interval on the mean difference runs from minus 0.212 to plus
0.274 and contains zero. Its width is 0.486. The registration says to report
that width and interpret nothing further, so we stop there.

## What we ran

We searched all 11,055 single proteins in ChEMBL for ones with 15 to 45
measured compounds and 150 to 420 residues. For each one that qualified we
built a held-out set with no two compounds from the same chemical cluster, then
ranked that set twice. Once with the folding pipeline. Once with a random
forest trained on every pool compound we had not held out. Both arms scored the
same compounds.

- 18 proteins scored, against the 25 the registration asked for
- 32 proteins qualified and could not be scored
- mean difference, structure minus ligand, plus 0.033
- 95 percent interval, over targets, minus 0.212 to plus 0.274
- the structure arm ranked better on 7 proteins, the ligand arm on 11

We stopped at 18 rather than 25 because the search ran out of proteins. The
registration allows this: it asks for 25 or as many as exist. Across the whole
of ChEMBL, 50 proteins met the compound and residue bounds and reached the
experiment, and 32 of them held too few distinct chemical clusters to split
into a scorable set. That attrition is itself worth stating. Two thirds of the
proteins in this regime cannot be measured this way at all, because their
compounds are analogues of each other.

## Median fold error

The registration asks for this and names Spearman as the hypothesis, so this
number does not decide anything. The structure arm came in at 3.4 fold and the
ligand arm at 3.91.

## Split by how much the ligand arm had to train on

The registration asks for this split. The bucket edges were fixed before the
data arrived.

| ligand training compounds | proteins | mean difference | 95% interval |
|---|---|---|---|
| 5 to 19 | 2 | +0.444 | −0.071 to +0.959 |
| 20 to 39 | 5 | −0.226 | −0.437 to −0.057 |
| 40 and above | 11 | +0.076 | −0.283 to +0.390 |

The middle bucket excludes zero. We are not treating that as a finding. It is
one of three buckets, it holds five proteins, and we applied no correction for
testing three things at once. A reader who wants to believe the structure arm
is worse between 20 and 39 training compounds should wait for someone to
register that question and test it on its own.

## What this does and does not change

The claim this experiment was built to test is that a structure earns its cost
on a protein where a model trained on known actives has almost nothing to learn
from. We have now measured it on 18 proteins and we cannot tell the two apart.
The claim is not supported. It is also not refuted.

The prior we stated before running was that we leaned against the claim, on the
strength of the ABL1 crossover where a ligand-only model beat the structure arm
at every training set size we tested. The result is consistent with that prior
and does not strengthen it.

What survives is narrower and we should say it plainly. On a protein with no
public measurements at all, nobody can train a ligand model, and we can still
produce a ranking with a calibrated interval. This experiment did not test that
case and cannot, because a protein with no measurements has nothing to score
against. That case needs a laboratory.

## Things that went wrong on the way

Four, all recorded at the time.

The search was selecting proteins with few well measured compounds rather than
proteins with little data, so the first eleven candidates had pools of up to
601 compounds. Our first explanation for that was also wrong.

The two arms were scored on different compounds for the first target, because
the structure arm drops a compound when the model returns no affinity. Fixing
it moved the ligand arm from 0.881 to 0.657, so the error had been flattering
the ligand arm.

The search counted eligible proteins where the registration counts scored ones,
and would have stopped at roughly twelve.

The search then stopped after one page and reported a finished walk, because a
variable holding the population size was overwritten by a per-target count. We
blamed the network first and that was wrong.
