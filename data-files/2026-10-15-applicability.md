# Can we tell in advance which targets the ranking will work on

Run 15 October 2026. Numbers in `benchmarks/results/applicability.json`,
reproduce with `scripts/applicability.py`.

## The answer

No. Not with anything we currently know about a protein before we run it.

## Why we asked

The headline is a median rank correlation of 0.607 across 121 proteins. The
spread behind that median is wide. The lower quartile is 0.473, fourteen
proteins sit below 0.3, and four are negative.

A chemist choosing five compounds to make cannot use a method that is right on
a median. They need to know whether their protein is one of the good ones. So
we asked whether the good ones are identifiable in advance.

## What we ran

Ten features, every one of them knowable before a structure is folded: sequence
length, how much measured compound data the protein carries in ChEMBL, how many
distinct chemical clusters the held-out set breaks into, the highest pairwise
similarity inside that set, how many solved structures exist, the held-out set
size, whether the protein is a receptor, a kinase or a soluble enzyme, and
whether it is human.

Nothing computed from a prediction was allowed in, so the model could not reach
the answer through the result.

Ridge regression, standardised features, evaluated leave one out across all 121
proteins. One hundred and twenty one is too few to hold a test set back and
still say anything.

## Result

| | |
|---|---|
| rank correlation, predicted against realised | 0.003 |
| mean absolute error | 0.197 |
| same, predicting the mean every time | 0.187 |
| realised median in the top predicted quarter | 0.622 |
| realised median in the bottom predicted quarter | 0.627 |

The model is worse than predicting the same number for every protein. Sorting
proteins by predicted reliability and taking the best thirty gives a median of
0.622, and taking the worst thirty gives 0.627. There is no separation.

The model is not broken. In sample it reaches an R squared of 0.092 and a rank
correlation of 0.247, so there is a faint pattern in the data. It does not
survive being asked about a protein it has not seen. Ten features on 121
proteins fits noise, and the noise does not transfer.

The strongest single feature is how much public measurement the protein
carries, at a rank correlation of 0.216 with the realised score. Even that is
too weak to act on.

## What this means for what we can promise

We can rank compounds for a protein, and we can say what our error looks like
across a corpus. We cannot yet tell a customer, before running it, whether
their particular protein is one where the ranking will hold. That is now a
measured limit rather than an untested assumption.

It also means the prediction intervals are calibrated across the corpus rather
than conditioned on the target. They cover the measured value 82.8 percent of
the time against a stated 80 percent, and that figure is a population average.

## What would change the answer

Features we do not have. Sequence identity to the nearest protein with a solved
structure in the training data, which would test whether the model is
recognising a homologue rather than predicting physics. Pocket descriptors such
as volume, hydrophobicity and buriedness. Assay heterogeneity inside the
measured set, which is currently invisible to us and is a plausible cause of
the targets that came back negative.

None of those needs new GPU time. All of them need work we have not done.
