# Pre-registration: can this platform find actives hidden in a library

Written 16 October 2026, before any screen has been run.

## Why this is the gap that matters

Vessari ranks a compound list somebody hands it. Drug discovery starts earlier
than that, with a library and a question: which of these thousands of molecules
is worth making. A platform that cannot answer that is a scoring function, not
a discovery platform, and the word we want to use requires the earlier step.

The method cannot screen a large library directly. One co-folded complex costs
about 72 seconds, so a hundred thousand compounds is eighty three days on one
card. Every group in this field solves that the same way, with a funnel: a
cheap model over everything, an expensive model over the survivors.

## What we will build

Two stages.

1. **Prefilter.** A ligand only random forest on ECFP4, trained on the known
   actives for that target, scoring the whole library. The same model as our
   published control.
2. **Co-folding.** The top 1 percent by prefilter score, folded and scored by
   the structure pipeline.

The output is a ranked shortlist.

## How we will measure it

Retrospectively, because we have no laboratory. For each target we take its
known actives from ChEMBL and hide them in a pool of decoys drawn from
compounds measured against unrelated proteins, matched on molecular weight and
logP so the task is not solved by size alone.

**Primary outcome: enrichment at 1 percent.** The share of known actives
appearing in the top 1 percent of the ranked library, divided by the share
expected at random. An enrichment of 1 is no better than picking at random.

**Secondary: enrichment at 1 percent for the prefilter alone.** This is the
control that decides whether the co-folding stage earns its cost. If the
funnel and the prefilter enrich equally, the expensive stage is decoration.

## Targets

Every target in the corpus with at least 50 known actives and a trained
prefilter. Decoys are drawn fresh per target.

## Decision rule, fixed now

- **The funnel works** if enrichment at 1 percent exceeds 1 with an interval
  over targets excluding 1.
- **The co-folding stage earns its cost** if the funnel's enrichment exceeds
  the prefilter's alone, with an interval over targets excluding zero.
- If the funnel enriches and the co-folding stage adds nothing, we say so and
  the honest product is the prefilter, which we did not need three graphics
  cards to run.

## What this cannot show

A retrospective screen uses actives somebody already found. The compounds are
in ChEMBL because they worked, and they were often made as a series, so a
fingerprint model can recognise the series rather than the binding. Decoy
matching reduces that and does not remove it. The field has been criticised
for exactly this since DUD-E, and the criticism is correct.

This measures whether we can recover known actives. It does not measure
whether we can find new ones, and nothing retrospective can.

## Amendment, 16 October 2026, before any enrichment was computed

Two faults in the design above were found while writing the code. Both are
fixed here, and the fix is recorded rather than quietly applied. No enrichment
number had been produced when this was written. Stage one had built two
libraries and stopped.

### The prefilter was going to be trained on the compounds it ranks

The plan said the prefilter trains on the known actives for the target and
then scores a library containing those actives. A random forest asked to
recognise molecules it was fitted on will recognise them, and the enrichment
would measure memory.

The fix is a split by chemical series. All actives for a target are clustered
by single linkage on ECFP4 Tanimoto at 0.6, which is the rule the held-out
builder already uses. Whole clusters go to training or to test, never split
across both, and the assignment aims at half the actives in each side. The
prefilter trains on the training clusters plus every pool compound measured
above 1 micromolar. The library holds the test clusters and the decoys. A
compound in the library has never been seen by the model, and neither has any
close analogue of it.

### Enrichment at 1 percent could not tell the two arms apart

If the co-folding stage receives exactly the top 1 percent of the prefilter
ranking, both arms hold the same compounds in their top 1 percent and the
enrichment is identical whatever the co-folding predicts. The comparison was
empty.

The prefilter now passes a wider cut. It sends its top 300 compounds to
co-folding, which re-ranks them by predicted affinity, and the funnel ranking
is those 300 in their new order followed by the rest in prefilter order.
Enrichment is measured at 1 percent of the whole library for both arms. For a
library of ten thousand that compares the best 100 chosen by the prefilter
against the best 100 chosen by co-folding out of 300 candidates.

Three hundred comes from the compute budget. One co-folded
complex costs 70 seconds on one card, measured across the 2,462 complexes in
the corpus, so 300 compounds is about six card hours and two hours on the
three cards in the rig.

### Decoys

The original ratio of 50 decoys per active is dropped. Every compound in the
universe that falls in the weight and logP window and was measured against an
unrelated protein becomes a decoy. The universe is small enough that a ratio
only throws away decoys and raises the share of actives, which inflates
enrichment. The share of actives is reported on every row.

### What the decision rule becomes

Unchanged in substance. Enrichment at 1 percent above 1 with an interval over
targets excluding 1 means the funnel finds actives. The funnel's enrichment
above the prefilter's with an interval over targets excluding zero means the
co-folding stage earns its cost. If the prefilter alone matches the funnel we
report that the prefilter is the product.

## Second amendment, 16 October 2026, after one pilot target

The amendment above was written, the code built, and one target run as a
pilot. The pilot produced a number and that number is reported here because it
exists. TNF, accession P01375, 415 test actives hidden in a library of 30,298,
prefilter enrichment at 1 percent of 4.34, with 18 of the top 303 being test
actives. It is reported and it is not a result for the registered question,
because the pilot showed the design still cannot compare the two arms.

The library was 30,298 compounds, so 1 percent of it is 303 compounds, and the
prefilter was handing 300 compounds to co-folding. The slice being measured and
the shortlist being re-ranked were the same size. Re-ordering 300 compounds
cannot change which 303 compounds sit in the top 303.

### The library is now fixed in size and in density

Every library is built to 5,000 compounds holding 50 test actives, which is 1
percent. One percent is what a real screening library holds, and the first
registration admitted that our libraries were denser than that and inflated the
enrichment. Fixing the size fixes both problems at once.

The 50 test actives are taken as whole series clusters from the test side, in a
seeded order, until 50 are collected. Test actives beyond 50 are left out of
the library rather than used anywhere else. Decoys are sampled from the window
matched set to fill the remaining 4,950 places.

One percent of 5,000 is 50 compounds. The prefilter still hands 300 to
co-folding, so co-folding chooses 50 from 300 while the prefilter chooses its
own 50 from 5,000. The arms can now disagree.

### What stays fixed

The series split, the training set, the analogue exclusion, the enrichment
definition, and the decision rule are all unchanged. The pilot number above is
superseded by the run under this design and is kept here as a record of what
was seen first.

## Third amendment, 16 October 2026, two numbers measured rather than assumed

Two numbers in the amendments above were wrong or unmeasured and are corrected
here. Stage one has run across 45 targets. Stage two has not run at all, so no
co-folding result exists for either arm.

### The cost per complex

The second amendment said 70 seconds per complex, divided from the 48.1 GPU
hours and 2,462 complexes recorded for the corpus. Reading the per-target
durations instead of the total gives a median of 78 seconds per complex, with
the tenth percentile at 66 and the ninetieth at 120. Two of the 123 targets
carry a duration that cannot be used, one of them negative, because the run was
resumed and the recorded start time belongs to the first attempt. Those two are
excluded from the median and the fault in how duration is recorded is noted
here rather than fixed quietly.

A docstring in `scripts/run_holdout.py` still says thirty predictions take four
to five hours, which is 540 seconds each. That sentence was written before the
batch path existed and it is stale. The corpus itself is the measurement.

### Co-folding depth is 150, set by the measured throughput

At 78 seconds per complex, 45 targets at 300 compounds each is 292 hours.

The rig has three cards and that does not divide the time by three. The host
has 15 GB of system memory and Boltz needs 5 to 8.5 GB of it per process, so
`src/vessari/assess/lease.py` holds an exclusive lock and one folding job runs
at a time. Two running together is an out of memory kill, which cost four
predictions on 14 October and is why the lock exists. The constraint on this
rig is the host, not the cards.

Co-folding depth is therefore 150 compounds per target. A pilot of six
compounds on 16 October ran at 59 seconds each, so 45 targets at 150 is about
111 hours, or four and a half days of continuous running. The slice being
measured stays at 50, so co-folding chooses 50 out of 150 while the prefilter
chooses 50 out of 5,000. The arms can still disagree.

The shortlist files on disk hold 300 compounds each, in prefilter order, so the
depth can be extended later without rebuilding anything.

### The order targets are run in is fixed now

Targets are co-folded in a seeded random order, seed 20261016, written to
`benchmarks/results/screen-stage2-order.json` before stage two starts. Whatever
is complete when the decision rule is applied is therefore a random sample of
the 45 rather than a set chosen by its result.

### Stage one, reported now because it is finished

The prefilter alone, across 45 targets, each a library of 5,000 compounds
holding 50 actives: mean enrichment at 1 percent of 13.26, bootstrap 95 percent
interval over targets 8.63 to 18.68, median 8.0, range 0 to 88. Zero enrichment
on 12 of 45 targets. The interval excludes 1, so the prefilter finds actives.

The 300 compound shortlists hold 652 of the 2,250 test actives in total, a
median of 9 per target, against 298 found by the prefilter in its own top 50.
If co-folding ranked each shortlist perfectly the funnel would reach a mean
enrichment of 28.98. That number is the ceiling on what stage two can show, and
it is not a prediction.

## Fourth amendment, 16 October 2026, after one target of stage two

Stage two has produced one row. Seven of the 45 targets are set aside and the
reason is written here before their rows exist, because the change cuts in the
direction of finding an effect and nobody should have to take it on trust.

### The seven cannot tell the arms apart

The prefilter hands co-folding its top 150 compounds. On seven targets that
shortlist holds **no known active at all**, and on those same seven the
prefilter found none in its own top 50 either. Both arms therefore score an
enrichment of zero and a difference of exactly zero, whatever co-folding
predicts. The rows carry no information about the registered question and cost
2.6 card hours each, 18 in total.

The seven are P34995, P07607, Q6GI75, P22906, Q16739, P30874 and P30969.

### Why this is not selection on the outcome

Whether a shortlist holds an active is a property of the prefilter, which is
the control arm, and it is known before a single complex is folded. It is not a
property of the co-folding result being tested. A target excluded this way is a
tied pair in a sign test rather than a target that performed badly.

### Both intervals get reported

Setting a guaranteed zero aside raises the mean difference, so the write-up
will carry two numbers rather than one.

- The paired interval over the targets whose shortlist holds at least one
  active, which is the sharper test.
- The paired interval over all 45, with the seven entered at a difference of
  zero, which is the conservative one.

The decision rule applies to the second one. If the conservative interval
excludes zero, the co-folding stage earns its cost. If only the sharper one
does, we say that and we say which targets the difference rests on.

### What stage one already told us about these seven

The prefilter recovered nothing on them. That is a finding about the prefilter
and it is already in the stage one numbers, where 12 of 45 targets came back at
an enrichment of zero. Setting seven aside for stage two does not remove them
from stage one.
