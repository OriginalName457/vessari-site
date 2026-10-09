# Pre-registration: does accuracy survive on compounds published recently

Written 2026-10-09, before any publication year has been fetched.

## Why this is the most valuable test available to us

Every number this project reports is retrospective. All of it comes from ChEMBL
measurements that already existed when the pipeline was pointed at them. A
retrospective result cannot distinguish a method that works from a method whose
underlying model has seen the answer, and that distinction is the one a reviewer
or a partner will press hardest on. No wet lab is available here, so a temporal
holdout is the closest honest approach: test on the compounds that were
published most recently and ask whether accuracy holds.

## What makes this test weaker than it sounds, stated first

Boltz-2's affinity training set has a cutoff date that we could not establish.
The package does not record it and the repository documentation refers to "our
validation cut-off date" without giving it. So this test is deliberately not
built around that date, because a test whose conclusion depends on a number we
had to guess is not evidence.

Instead the statistic is performance against publication year across the whole
range we have. The reasoning does not need the cutoff: if the model were mostly
recalling measurements it had memorised, accuracy would fall on the most
recently published compounds, because those are the ones least likely to be in
any training set assembled before them. Flat accuracy across years is evidence
against that. It is not proof, and the writeup will say so.

A second limit: ChEMBL's document year is when a measurement was published, not
when it was made, and a 2025 paper can report a compound characterised years
earlier. This biases towards finding recent compounds familiar, which makes a
flat result conservative and a declining result hard to explain away.

## The data

Every compound in the 40 scored corpus held-out sets, roughly 1,000 compounds.
For each, the earliest document year among the activities that produced its
measured affinity against that target. Earliest rather than latest, because the
first publication is when the information entered the public record and
therefore when it became available to any training set.

## The statistic

Per target, Spearman between measured and predicted affinity, computed
separately within publication year buckets. Then the primary comparison:

- mean within-target Spearman on compounds first published before 2020
- mean within-target Spearman on compounds first published in 2020 or later
- the difference, with a bootstrap interval over targets

Buckets are chosen now and not after seeing the distribution. If a bucket holds
fewer than 5 compounds on a target, that target contributes to neither bucket,
because a Spearman on four points is noise.

Secondary: Spearman between a compound's publication year and its absolute log
error, pooled within target then averaged, which uses the year as a continuous
variable rather than a split and does not depend on where the boundary is put.

## The decision rule, fixed in advance

- Accuracy is reported as holding if the interval on the difference contains
  zero. That is the result we expect and it is the useful one.
- Accuracy is reported as declining with recency if the interval is entirely
  below zero for the recent bucket. That would be evidence of memorisation and
  would require withdrawing the generalisation claim on the site.
- An improvement on recent compounds is reported as what it is and not
  celebrated: the most likely cause is that recent papers report cleaner assays,
  not that the method is better on new chemistry.

## What is not allowed afterwards

Moving the bucket boundary, dropping a target because it is inconvenient, or
switching to the continuous statistic because the split one came out badly. Both
statistics are specified above and both will be reported whatever they say.
