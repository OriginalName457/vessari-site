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

## Amendment, 2026-10-14, before any target was scored

A target was queued as data-poor and turned out not to be. Adenosine deaminase
entered the queue at 39 compounds and its real pool is 255. The ligand arm
trained on 247 of them before the run was stopped, with no result written.

### The cause, after a wrong first answer

The first diagnosis was that ChEMBL caps a request at 1000 records and the
scanner read one page, so its count came from a truncated window. That was
checked against a paged recount of all twelve queued targets and it is wrong.
Every count matched exactly: 39 against 39, 35 against 35, 45 against 45.

The real cause is a mismatch between what the scanner selects on and what the
experiment uses. The scanner counts compounds measured in two or more assays,
which is what the held-out builder requires. The ligand arm trains on the whole
pool, which includes every compound measured once. Those are different
populations and for a busy target they are very different sizes. Caspase-7 has
39 compounds measured twice and 471 compounds in total.

So the queue was selecting targets with few well measured compounds, not
targets with little data, and only the second is the regime this registration
is about.

### What changed

1. The scanner records pool size and rejects a target whose pool exceeds 90
   compounds, twice the registered upper bound of 45.
2. The experiment checks the pool size itself, after fetching it, and writes
   any target above the ceiling to `low-data-skipped.json` with the count that
   disqualified it. This sits where the true number is known, so it holds even
   if the scanner is wrong again.
3. The scanner also pages activities to exhaustion rather than reading one
   page. This fixed nothing that was broken, and it is kept as a guard against
   a truncation that has not happened yet rather than as the fix for this.

This enforces the registered bound of 15 to 45 compounds rather than moving it.
The ceiling of 90 is new as a number and is recorded here because the original
text did not name one.

### What the recount did to the queue

Eleven of the twelve queued targets fail the corrected rule. Their pools are
66, 103, 123, 148, 151, 160, 174, 254, 255, 263, 471 and 601 compounds. One
survives, methylated DNA protein cysteine methyltransferase, with 25 compounds
measured twice in a pool of 66.

Each failed target keeps its queue entry with its real pool size and
`eligible` set to false, rather than being removed.

### What this does to the experiment

The scan has examined 925 ChEMBL single proteins and produced one target that
is genuinely in the regime. The registration asks for 25 or as many as exist,
and the honest reading so far is that very few exist among proteins with enough
public measurement to score at all.

That is itself an answer to the question the experiment was asked to settle,
and it is the one the registration already anticipated in its closing section:
the regime where a ligand model cannot be built needs a laboratory, not a
corpus. No result is claimed from it yet. The scan continues.

## Second amendment, 2026-10-14, after one target and before any analysis

The two arms were being scored on different compounds. The structure arm drops
any compound the folding model returns no affinity for, and the ligand arm was
scored on the full held-out set, so on the first target six compounds were
compared against eight. The registration says the held-out set is the same set
for both arms, and it was not.

The ligand arm is now scored on exactly the compounds the structure arm
produced a number for, and a target with fewer than five such compounds is not
compared at all. The ligand arm's result on the full held-out set is still
recorded, under `ligand_on_full_held_out`, so the size of the effect stays
visible.

The expectation going in was that this favoured the structure arm, because a
compound the folding model cannot handle is an unusual one and unusual
compounds are where errors are largest. On the one target available it ran the
other way. The ligand arm fell from 0.881 to 0.657 when restricted to the
shared six, so the mismatch had been flattering the ligand arm and the
correction widens the structure arm's lead. One target is not evidence about
the direction of this bias in general.

The earlier result is kept at `low-data-results-superseded-20261014.jsonl` with
a note, because it was read and discussed before the mismatch was found.

### Where the experiment stands

One target scored. Carbonic anhydrase 2 reached the experiment and produced
only two compounds after clustering, which is not a scorable set, so it is
recorded as declined rather than as a result. The registration asks for 25
targets or as many as exist, and the scan has walked 1,800 of its 6,000 target
cap. No analysis will be run until the scan finishes or the target count is
reached, and the decision rule is unchanged.

## Third amendment, 2026-10-14, with one target scored

Two changes to the search, both made with one result in hand and before the
other eligible targets were run, so neither can have been chosen to suit an
answer. Neither touches a registered bound. The compound range stays 15 to 45,
the residue range stays 150 to 420, and the pool ceiling stays 90.

### The search was counting in the wrong unit

The scan stopped when it had 25 eligible targets. This registration asks for 25
scored targets. Those are different numbers, because an eligible target can
still fail to produce a scorable held-out set when its measured compounds do
not spread across enough distinct chemistry. Of the two eligible targets that
have reached the experiment, one scored and one was declined with two clusters.

At that rate a search stopping at 25 eligible targets would have handed the
analysis about twelve and reported the population as exhausted. The scan now
reads the experiment's results file and stops when 25 targets have been scored.

### The walk covered half the population for no reason

The walk stopped at offset 6000. ChEMBL holds 11,055 single proteins, so the
old cap examined 54 percent of them. The number 6000 was an arbitrary stopping
point for a search, not a scientific bound, and the remaining 46 percent costs
network time and no compute. The walk now asks ChEMBL for the population size
and covers all of it.

### A limitation this creates, stated now

The walk proceeds in ChEMBL target identifier order, which runs roughly from
targets registered long ago to targets registered recently. Older targets carry
more published medicinal chemistry, so extending the walk samples proteins that
are more likely to be data-poor. The targets this experiment scores are
therefore not a random sample of the proteome. They are weighted toward
proteins that entered ChEMBL late, which is the same thing as weighted toward
proteins nobody has run a large screen against.

For the hypothesis this does not matter, because the comparison is within a
target: both arms see the same protein and the same held-out set. For any
statement about how often the data-poor regime occurs, it matters a great deal,
and no such statement will be made from this scan.

### Targets that cannot be scored are now on the record

A target that fails for a reason that will not change, too few compounds
surviving the clustering rule or a pool too small to split, is written to
`low-data-declined.json` with the stage and the reason. Before this it took a
silent branch, so four consecutive runs reached carbonic anhydrase 2, refetched
its pool and failed at the same step.

This file is kept apart from `low-data-skipped.json`. A skipped target never
belonged in the population, because its pool exceeds the ceiling. A declined
target does belong and still cannot be scored. The write-up needs both counts
and needs them separate, or the denominator is wrong.

### An observation about the eligible targets, not a registered analysis

Six of the thirteen eligible targets found so far are pathogen proteins:
Toxoplasma gondii adenosine kinase, Mycobacterium tuberculosis PtpB,
Helicobacter pylori and Methanosarcina thermophila carbonic anhydrases,
Enterococcus faecalis beta-ketoacyl synthase, and Stenotrophomonas maltophilia
beta-lactamase L1. The corpus of 121 scored targets holds two pathogen proteins.

This is an observation about which proteins have little public measurement and
it is labelled exploratory. It was not predicted and no test is attached to it.

## The analysis, written before the results

`scripts/analyse_low_data.py` was committed with one target scored. It
implements the decision rule above without reinterpreting it, applies it to the
Spearman difference alone because the hypothesis names Spearman alone, reports
median fold error without letting it decide anything, and withholds the verdict
until 25 targets are scored or the walk is finished.
