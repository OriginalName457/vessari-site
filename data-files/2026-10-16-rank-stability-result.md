# Does the top of our ranking survive the model's own disagreement

Registered at `benchmarks/preregistered/2026-10-16-rank-stability.md` before
the statistic was computed. The registered decision rule fires and the site
changes because of it.

## What was measured

The affinity head returns two values per compound and our pipeline records
their absolute difference as `ensemble_spread` for all 2,462 compounds in the
corpus. Each redrawn ranking sets every compound to its recorded value plus or
minus half its own spread, with the sign drawn independently per compound, so
the two values a compound can take are the two values the model produced for
it. Ten thousand redraws per target, 112 targets with 10 or more scored
compounds.

## The two heads disagree more than we had reported

Median disagreement **2.76 fold**. Ninetieth percentile **13.9 fold**. The
widest is 373 fold. Three hundred and fifty three of the 2,462 compounds have
the two heads disagreeing by more than tenfold about the same compound.

Our published median absolute error is 4.6 fold. The model's own internal
disagreement is 2.76 fold, so a large part of the error we report is the model
disagreeing with itself rather than with the laboratory.

## The primary outcome

**The top ranked compound changes in 40.2 percent of redraws.** Median across
targets 44.1 percent, bootstrap interval over targets 35.4 to 44.9 percent.
Ninety one of 112 targets exceed one draw in five. Twenty one fall below one in
twenty.

The registered rule said that above one in five we publish that first place is
not stable to the model's internal disagreement. It is 40 percent, so we
publish it.

## The ordering holds up better than the winner

- Spearman between a redrawn ranking and the recorded one, averaged: **0.892**
- Expected overlap of the top three: **0.747**
- Expected overlap of the top five: **0.787**

So the list is largely the same list and the winner is close to a coin flip.
Ranking at the scale of a shortlist survives. Picking one compound out of it
does not.

## What this means for a shortlist

Three changes follow.

A shortlist from the screening pipeline now carries the head disagreement for
every compound, in log units and in fold, written beside the predicted
affinity and the pose confidence. The compound pages on this site already
carried it per compound. Nobody should read a first place without seeing how
far the model disagrees with itself about it.

Every shortlist file states that the top five is the unit rather than the first
row. On the corpus the top five recovers 78.7 percent of itself under redraw
while first place recovers 59.8 percent.

The published affinity interval is checked against the spread, which the
registration required. The conformal interval has a median width of 2.14 log
units across the 12 calibrated targets, which is 4.8 times the median spread of
0.442 log units, and its coverage is 82.4 percent against a stated 80. The
interval is wider than the disagreement, so it is not understating this source
of uncertainty.

## What this does not measure

Only the choice of head. One run, one seed, one alignment. It says nothing
about variation from the diffusion sampling or from the alignment, and a
preprint reports around 1.5 kcal/mol of run to run variation in this model,
which is larger than the median spread here.

The replicate run that would measure it is five seeds over 100 compounds on two
targets, 1,000 predictions, about 17 card hours. It is queued behind the
virtual screen. The registration states the prior, which is that seed
replication will move the ranking more than the head choice does.

## Note on a prior result

Ensemble spread was tested in this project as a trust signal and was null: a
large spread did not predict a worse prediction. That result stands and it is a
different question. A quantity can be useless as a warning about accuracy and
still large enough to reshuffle a list, and both are now measured.

## Files

- `benchmarks/results/rank-stability.json`, per target and in aggregate.
- `scripts/rank_stability.py`, the run.
