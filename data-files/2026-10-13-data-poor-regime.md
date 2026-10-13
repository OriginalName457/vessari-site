# Pre-registration: does structure help when there is almost no ligand data

Written 2026-10-13, before any low-data target has been scored.

## Why this is the experiment that should have been run first

This project's reason to exist is that a structure-based prediction is worth
its cost on a target where little is known, because a model trained on known
actives cannot be built without known actives. Nothing here has ever tested it.

Every one of the 121 targets scored so far has at least 190 measured compounds
and the median has 1,239, because the queue admits targets with 40 to 4,000.
On ABL1, the one target with a full control battery, a ligand-only random
forest beats the structure arm 60.8 percent of the time with five training
compounds, 97.5 percent with twenty five, and 100 percent beyond sixty. The
crossover is recorded as unresolved because the ligand arm wins at every size
tested.

So the evidence we have points against the claim, and the regime the claim is
about has never been measured. That is the gap this closes, and the result may
retire the product claim rather than support it. It is registered in advance
for that reason.

## Hypothesis

On targets with few measured compounds, the structure arm's per-target Spearman
exceeds that of a ligand-only model trained on the compounds not held out.

Stated prior: uncertain, leaning against. The ABL1 crossover suggests the
ligand arm wins even at five training compounds, though on one target, at one
point, and with the structure arm now known to have been inflated by a
clustering leak that put its true value nearer 0.207 than 0.284.

## Targets

ChEMBL single proteins with **15 to 45** measured activities in nM with an
equality relation and at least two assays per compound, 150 to 420 residues,
excluding every accession already in the corpus. The lower bound is 15 rather
than 40 because that is the point of the experiment, and 15 is the smallest
number that leaves a scorable held-out set and a training set at all.

Target count: 25, or as many as exist.

## Arms, both run on the same split

1. **Structure.** The existing pipeline, unchanged.
2. **Ligand only.** Random forest, 100 trees, ECFP4 at 2048 bits, the same
   model as the published crossover, trained on every compound not in the
   held-out set.

The held-out set is built by the corrected single-linkage rule and is **the
same set for both arms**. A comparison on different splits measures the splits.

Held-out size: `min(12, floor(n_compounds / 2))`. Twelve is the project's
existing minimum for a scorable set. Halving is the cap so the ligand arm is
never left with fewer compounds than the held-out set, which would make the
comparison a foregone conclusion in our favour.

## Statistics

Per target, Spearman and median fold error for both arms. Then:

- mean per-target difference, structure minus ligand, with a bootstrap
  interval over targets
- the number of targets on which each arm wins
- the same split by how many compounds the ligand arm had to train on

## Decision rule, fixed now

- **Supported** if the interval on the mean difference lies entirely above
  zero. The product claim is then evidenced and the boundary is reported as
  the training set size where the advantage disappears.
- **Retired** if the interval lies entirely below zero. The claim that
  structure helps in the data-poor regime is then withdrawn from the site and
  from any application, and the honest positioning becomes narrower: a
  calibrated estimate for a protein with no measured compounds at all, where
  no ligand model can be built, which is a real but much smaller claim.
- **Unresolved** if the interval contains zero, reported as such with the
  width stated. No interpretation beyond that.

## What will not be done afterwards

Moving the compound count bounds, dropping targets where the ligand arm did
well, or switching the ligand model for a weaker one. The ligand arm is the
same random forest already published in the crossover, chosen before seeing any
of these targets.

## A limit stated in advance

A target with 15 to 45 measured compounds is not the same as a target with
none. The regime where a ligand model cannot be built at all is still not
tested by this and cannot be tested retrospectively, because a target with no
public measurements has nothing to score against. That regime needs a
laboratory, not a corpus.
