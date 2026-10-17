# Pre-registration: does the structure arm beat a ligand only model across the corpus

Written 16 October 2026, before any corpus wide ligand baseline exists.

## Why this is the control we are missing

The headline is a median rank correlation of 0.607 across 123 proteins. There
is no ligand only baseline beside it. We have one on a single target, ABL1,
and we lose it badly: a random forest on ECFP4 fingerprints scores 0.871 where
the structure pipeline scores 0.284.

If that result holds across the corpus, the headline is not evidence that
folding a complex helps, and a medicinal chemist will find this in the first
conversation. Running it on one target and not on the other 122 is the kind of
gap we publish other people's work for having.

This is the most damaging experiment available to us and that is the reason to
run it.

## Hypothesis

Across the corpus, the structure arm's per-target Spearman exceeds that of a
ligand only random forest trained on the compounds not held out.

**Stated prior: we expect to lose.** The ABL1 control is unambiguous, the
registered data-poor experiment came back unresolved with the ligand arm
winning 11 of 18, and nothing we have measured suggests the structure arm wins
on targets with plenty of training data. We are running this expecting the
answer to go against us.

## Arms, scored on the same compounds

1. **Structure.** The predictions already recorded for each target, unchanged.
2. **Ligand only.** Random forest, 100 trees, ECFP4 at 2048 bits and radius 2,
   trained on every pool compound not in the held-out set. This is the same
   model as the published ABL1 crossover and the data-poor experiment, chosen
   before this registration and not tuned for it.
3. **Combination.** The rank average of the two arms. A fixed rule with
   nothing fitted, because anything fitted on the held-out set would not be a
   held-out result.

The ligand arm is scored on exactly the compounds the structure arm produced a
number for. A target with fewer than five such compounds is not compared.

## Targets

Every target in the rebuilt corpus with a recorded Spearman, which is 123. No
target is dropped after seeing its result. A target whose pool cannot be
refetched from ChEMBL is reported as a fetch failure and counted separately,
because a network outage is not a result.

## Statistics

Per target, Spearman and median fold error for all three arms. Then the mean
per-target difference with a bootstrap interval over targets, resampling
targets and not compounds.

Three comparisons: structure against ligand, combination against structure,
combination against ligand. Three tests on one dataset, so the interval for
each is widened to 98.3 percent, which is the Bonferroni correction for three
comparisons at 95 percent.

## Decision rule, fixed now

On structure against ligand:

- **Structure helps** if the interval lies entirely above zero.
- **The headline is not a structure result** if the interval lies entirely
  below zero. In that case the front page stops describing the corpus number
  as evidence that folding helps, and says instead that a ligand model does
  better on the targets we have scored. The number itself stays, with that
  sentence beside it.
- **Unresolved** if the interval contains zero, reported with its width.

On the combination: if the combination beats the better of the two single arms
with an interval excluding zero, that is a result worth having even when the
structure arm loses on its own, because it means the structure carries
information the ligand model does not. If it does not, we say so.

## What will not be done afterwards

Dropping targets where the ligand model did well. Tuning the random forest.
Swapping the fingerprint. Reporting the combination and omitting the head to
head. Re-running on a subset and calling it the corpus.

## What this cannot show

A ligand model needs training compounds. Every target here has at least 190,
so this measures the regime where a ligand model is strongest. It says nothing
about a protein with nothing measured, which the data-poor experiment already
tried to answer and could not.

## Amendment, 16 October 2026, a stopping rule the registration did not have

The registration fixed a decision rule and never said when to apply it. That
is a gap, and it is being closed now rather than at the moment the data makes
the choice attractive.

At the time of writing the run has scored 66 of 123 targets. The interim
reading is recorded at the end of this amendment and it is not a verdict.

### When the run is finished

The run concludes when every one of the 123 targets has either a result or
**six recorded fetch failures**. A target that cannot be fetched after six
passes is an exclusion, not a result, and it is reported by name with its
count beside the headline.

Six rather than three because ChEMBL was unavailable for part of 16 October,
returning HTTP 500 to a five row query while every other host answered in
under a second. A target that failed during an outage has not been shown to be
unfetchable. Seven targets currently sit at three or more failures and would
have been wrongly excluded under a lower threshold.

### What gets reported either way

The number of targets scored, the number excluded with their names and failure
counts, and the interval over scored targets. If more than 20 of the 123 are
excluded, the write-up states that the sample is no longer the published
corpus and says which families went missing.

### No early stop

There is no stopping rule for a favourable interim. The run goes to the end
even if the interval moves above zero on the way, because stopping on a
reading is how an interval gets manufactured. This project has reported an
interim reading as a conclusion twice and been wrong both times, and both
corrections are in `benchmarks/results/CORRECTIONS.md`.

### The interim, recorded because it exists

At 66 of 123 targets. Structure median 0.585, ligand median 0.745,
combination median 0.756. Structure minus ligand mean minus 0.1702 with a 95
percent interval of minus 0.2423 to minus 0.1014, structure ahead on 16 of 66.
Combination minus the better single arm mean minus 0.0469, interval minus
0.0748 to minus 0.0209, better on 24 of 66.

At 38 targets the same difference stood at minus 0.161. It has moved by 0.009
over 28 more targets, which is the stability an interim reading usually
lacks. It is still not a verdict and the front page does not move on it.
