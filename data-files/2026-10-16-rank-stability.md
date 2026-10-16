# Pre-registration: does the top of our ranking survive the model's own disagreement

Written 16 October 2026, before the statistic below has been computed.

## The question

A buyer who is shown a ranked shortlist asks for it to be run again. If the top
ten reshuffles, the ranking they are being sold is noise at the end they care
about, and the interval we publish is measuring the wrong thing.

The honest version of that test is replication across random seeds, which costs
about 17 hours of card time and the card is committed to the screen for several
days. This registers the cheaper bound that can be computed today, and
registers the replicate run for when the card is free.

## What the model already tells us

Boltz-2's affinity head returns two values per compound and our pipeline
records their absolute difference as `ensemble_spread`, in log10 micromolar
units, for all 2,462 compounds in the corpus. A spread of 1.0 means the model's
two heads disagree by a factor of ten about the same compound.

This is not seed variance. It is the disagreement inside one prediction, from
one run, between two heads of the same model. It bounds nothing about the
alignment or the diffusion sampling. It does bound how much a ranking rests on
which head happens to be read.

## What we will compute

For each target in the corpus with 10 or more scored compounds:

1. The recorded ranking, from `predicted_nm`.
2. Ten thousand redrawn rankings. For each compound the predicted log value is
   set to the recorded value plus or minus half its own recorded spread, with
   the sign drawn at random, independently per compound. The two values this
   can take are the two head values the model actually produced, so the noise
   model is measured rather than assumed.

## Primary outcome

**The share of redraws in which the top ranked compound is not the compound
the recorded ranking put first.** Averaged over targets, with a bootstrap
interval over targets.

## Secondary outcomes

- Expected overlap of the top 3 and the top 5 with the recorded ones.
- Spearman between each redrawn ranking and the recorded ranking, averaged.
- The distribution of `ensemble_spread` across all 2,462 compounds, with the
  median and the ninetieth percentile in fold units.
- The same statistics on the 14 congeneric series, where our published rank
  correlation is 0.660, because that is the setting a chemist would use.

## Decision rule, fixed now

- **If the top compound changes in more than one draw in five**, we publish
  that the first place in our ranking is not stable to the model's own
  internal disagreement, we put that beside the published rank correlations,
  and any shortlist we hand anybody carries the spread per compound.
- **If it changes in fewer than one draw in twenty**, we publish that the top
  of the ranking is stable to this source and say plainly that seed
  replication is still untested.
- Between those, we report the number and draw no conclusion either way.

Whatever the result, the published interval on a per-compound affinity is
checked against the spread. If the interval is narrower than the spread, the
interval is understating the uncertainty and we say so.

## The replicate run this does not replace

Five seeds over 100 compounds on two targets, 1,000 predictions, about 17 card
hours. It measures what this cannot: variation from the diffusion sampling and
from the alignment, not only from the choice of head. It is queued behind the
screen. A preprint reports around 1.5 kcal/mol of run to run variation in this
model, so the prior is that seed replication moves the ranking more than the
head disagreement does.

## Prior, stated

Ensemble spread has already been tested as a trust signal in this project and
was null, meaning a large spread did not predict a worse prediction. That is a
different question from whether a large spread moves the ranking. A quantity
can be useless as a warning and still large enough to reshuffle a list.
