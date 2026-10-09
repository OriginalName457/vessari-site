# Pre-registration: what explains our error, and how much of it is ours

Written 2026-10-09, before either statistic has been computed. Both questions
use data already on disk, so the registration exists to stop the analysis being
steered by what the data turns out to look like.

## Question 1: can we tell which predictions to trust

This is the product claim. A user with forty ideas wants the five worth testing,
and that requires ranking predictions by how much they can be believed rather
than by their predicted affinity. We cannot currently do it. Interface pTM was
the candidate and it failed at fifteen targets: mean within-target Spearman
against absolute log error -0.067, interval [-0.209, +0.085].

The remaining candidate that costs nothing is `ensemble_spread`, the
disagreement between the two affinity modules boltz runs. Disagreement between
members of an ensemble is a standard uncertainty estimate and it is recorded on
every prediction we have ever made.

**Hypothesis.** Ensemble spread is positively correlated with absolute log
error, within target.

**Statistic.** Spearman between ensemble spread and absolute log error, computed
within each target, averaged over targets, bootstrap interval over targets.
Within target first, because a between-target correlation can be produced
entirely by some proteins being harder than others. That mistake is what made
the low interface pTM bin look significant when all 23 of its points came from
one protein.

**Decision rule, fixed now.**
- Adopt as a triage signal only if the mean is at least +0.30 and the lower
  bound of the interval is above zero.
- Report as a null if the interval contains zero.
- A mean below +0.30 with an interval above zero is reported as real and too
  weak to act on. It does not become a filter.

If it is adopted, the operating threshold is chosen on a random half of the
targets and reported on the other half. No threshold fitted to all forty
targets will be described as a calibration.

## Question 2: how much of the error is the measurement

Our error is reported as the gap between predicted and measured affinity, which
silently treats the measured value as truth. It is not truth. The same compound
against the same protein, measured in different labs, disagrees. Our held-out
sets record `assay_spread_log`, the spread across the assays behind each
compound's value, and `n_assays`. That spread is a floor: no method can do
better than the disagreement in its own answer key.

**Hypothesis.** Part of the error attributed to the method is measurement
disagreement, so compounds whose assays agree closely will show lower
prediction error than compounds whose assays disagree.

**Statistics.**
1. The distribution of `assay_spread_log` across the corpus, and its median,
   as the experimental reproducibility floor in log units.
2. Spearman between `assay_spread_log` and absolute log error, within target,
   averaged over targets, with an interval. Positive means noisy measurements
   coincide with large apparent error.
3. Median absolute log error restricted to compounds backed by at least three
   assays whose spread is in the lowest quartile, which is the cleanest subset
   of the answer key. Reported next to the median on everything.

**What will not be claimed.** That our error equals the floor, or that
subtracting the floor gives a corrected accuracy. The clean subset number is
reported as what it is: performance where the answer key is most trustworthy,
on a subset chosen by a rule stated here in advance. It will be reported
alongside the full-corpus number and never instead of it.

**A trap to avoid.** Compounds with many assays are usually well studied, which
makes them more likely to appear in any model's training data. So a better
result on the clean subset has at least two explanations and the writeup must
say both. The number of assays will be reported for the subset so a reader can
judge it.

## Both questions

Whatever these return gets published, including a null, and including a result
that makes our headline number look worse.

---

## Question 3, added 2026-10-09 before computing it: can we predict which targets we will do badly on

Two per-compound triage signals have failed. The per-target version of the
question is more tractable and more useful to a user: before spending GPU time
on a protein, can we say whether it is within our competence.

There is also a confound here that should have been checked much earlier.
Spearman measures rank agreement, and its value depends on how much the ranks
can spread. A held-out set whose compounds all have similar potency will score a
low Spearman however good the predictions are, because there is barely a true
ordering to recover. If our low-scoring targets are the narrow-range ones, part
of the variation we have been reporting as method performance is a property of
the answer key.

**Five candidate explanations, all named now so none can be chosen afterwards.**

1. Spread of measured affinity in the held-out set, as the standard deviation of
   log measured affinity. The confound above.
2. Number of compounds in the held-out set.
3. Protein length in residues.
4. Effective number of independent chemical series.
5. Maximum pairwise Tanimoto within the set, as how chemically similar the
   compounds are to each other.

**Statistic.** For each, Spearman between that feature and the per-target
Spearman, across the 41 scored targets, with a bootstrap interval over targets.

**Multiple comparisons.** Five features on 41 targets will produce one
nominally significant result by chance about a quarter of the time. All five
will be reported with their intervals whatever they show, and a single feature
will be called real only if its interval excludes zero after a Bonferroni
correction, meaning a 99 percent interval rather than 95. Features that clear
the uncorrected bar only are reported as suggestive and not acted on.

**If feature 1 is significant.** The per-target Spearmans are partly a measure
of the sets rather than the method, and the corpus aggregate has to be reported
with that stated. It does not invalidate the median fold error, which does not
depend on range, so that becomes the headline number instead.
