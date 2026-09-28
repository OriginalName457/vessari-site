# Control card: Boltz-2 structure + affinity on ABL1 kinase domain

**Boltz-2 structure + affinity does not separate from the strongest control (ligand_gbm, ligand alone, no protein and no structure, best of a cross-validated panel): -0.250 Spearman, 95% CI -0.555 to +0.006, an interval that contains zero.**

This evaluation does not show the structure is contributing over the ligand alone. It also does not separate from nearest_neighbour, molecular_weight.

29 evaluation compounds, 2983 training compounds. Affinities in log10 IC50/Kd, higher is weaker binding. Every control is fitted on the same training split and scored on the same evaluation compounds as the model. Intervals from 10000 paired bootstrap resamples (evaluation-set resampling only; arms fitted once and held fixed).

## Arms

| arm | what it is | Spearman | Pearson | Kendall | MAE | MAE kcal/mol |
|---|---|---:|---:|---:|---:|---:|
| **Boltz-2 structure + affinity** | the caller's predictions | 0.546 | 0.636 | 0.395 | 0.998 | 1.36 |
| `ligand_gbm` | ligand alone, no protein and no structure, best of a cross-validated panel | 0.796 | 0.827 | 0.583 | 0.720 | 0.98 |
| `nearest_neighbour` | label of the nearest training compound, pure recall | 0.570 | 0.597 | 0.397 | 1.169 | 1.59 |
| `molecular_weight` | molecular weight alone, the floor | 0.429 | 0.353 | 0.286 | 1.361 | 1.86 |
| `mean_predictor` | training mean, zero skill | - | - | - | 1.493 | 2.04 |

`ligand_gbm` was selected, not defaulted: **random_forest** won a 5-fold cross-validation inside the training compounds. Cross-validated Spearman of each candidate: gradient_boosting +0.858; random_forest +0.880; tanimoto_knn +0.860. A gap measured against a baseline nobody tried to make strong is an upper bound on the real gap, not the real gap.

Gap on spearman, model minus control, positive favours the model:

| control | compared on | delta | 95% CI | bootstrap p, one-sided | resolves to |
|---|---|---:|---|---:|---|
| `ligand_gbm` | spearman | -0.250 | -0.555 to +0.006 | 0.972 | neither, interval contains zero |
| `nearest_neighbour` | spearman | -0.024 | -0.373 to +0.309 | 0.541 | neither, interval contains zero |
| `molecular_weight` | spearman | +0.118 | -0.352 to +0.550 | 0.292 | neither, interval contains zero |
| `mean_predictor` | mae | +0.495 | +0.103 to +0.876 | 0.007 | **Boltz-2 structure + affinity** |

A control resolves only when the whole interval clears zero. "Neither" means this evaluation cannot tell the two apart, which is not the same as them being equal.

### Every arm on every metric

| control | metric | delta | 95% CI | resolves to |
|---|---|---:|---|---|
| `ligand_gbm` | spearman | -0.250 | -0.555 to +0.006 | neither, interval contains zero |
| `ligand_gbm` | pearson | -0.191 | -0.458 to +0.001 | neither, interval contains zero |
| `ligand_gbm` | kendall | -0.188 | -0.454 to +0.062 | neither, interval contains zero |
| `ligand_gbm` | mae | -0.278 | -0.643 to +0.068 | neither, interval contains zero |
| `nearest_neighbour` | spearman | -0.024 | -0.373 to +0.309 | neither, interval contains zero |
| `nearest_neighbour` | pearson | +0.039 | -0.269 to +0.328 | neither, interval contains zero |
| `nearest_neighbour` | kendall | -0.002 | -0.281 to +0.267 | neither, interval contains zero |
| `nearest_neighbour` | mae | +0.170 | -0.281 to +0.606 | neither, interval contains zero |
| `molecular_weight` | spearman | +0.118 | -0.352 to +0.550 | neither, interval contains zero |
| `molecular_weight` | pearson | +0.283 | -0.115 to +0.698 | neither, interval contains zero |
| `molecular_weight` | kendall | +0.109 | -0.265 to +0.451 | neither, interval contains zero |
| `molecular_weight` | mae | +0.363 | -0.081 to +0.786 | neither, interval contains zero |
| `mean_predictor` | spearman | - | undefined | neither, comparison undefined |
| `mean_predictor` | pearson | - | undefined | neither, comparison undefined |
| `mean_predictor` | kendall | - | undefined | neither, comparison undefined |
| `mean_predictor` | mae | +0.495 | +0.103 to +0.876 | **Boltz-2 structure + affinity** |

**Does not resolve in favour of Boltz-2 structure + affinity on:** ligand_gbm/spearman, -0.250, -0.555 to +0.006; ligand_gbm/pearson, -0.191, -0.458 to +0.001; ligand_gbm/kendall, -0.188, -0.454 to +0.062; ligand_gbm/mae, -0.278, -0.643 to +0.068; nearest_neighbour/spearman, -0.024, -0.373 to +0.309; nearest_neighbour/pearson, +0.039, -0.269 to +0.328; nearest_neighbour/kendall, -0.002, -0.281 to +0.267; nearest_neighbour/mae, +0.170, -0.281 to +0.606; molecular_weight/spearman, +0.118, -0.352 to +0.550; molecular_weight/pearson, +0.283, -0.115 to +0.698; molecular_weight/kendall, +0.109, -0.265 to +0.451; molecular_weight/mae, +0.363, -0.081 to +0.786; mean_predictor/spearman, undefined; mean_predictor/pearson, undefined; mean_predictor/kendall, undefined.

A control with no defined spearman is a constant predictor with no ranking to compare. Those rows fall back to error, so the zero-skill arm stays answerable instead of collapsing into an empty cell.

## Nearest-neighbour similarity

Maximum ECFP4 Tanimoto from each evaluation compound to any training compound. This is what decides whether the split asked the model a new question.

```
0.0-0.1 |                                    0
0.1-0.2 |                                    0
0.2-0.3 | ###########                        3
0.3-0.4 | ###################                5
0.4-0.5 | ###########                        3
0.5-0.6 | ###########                        3
0.6-0.7 | ####                               1
0.7-0.8 | ################################## 9
0.8-0.9 | ###################                5
0.9-1.0 |                                    0
```

Median 0.612, quartiles 0.391 and 0.775, range 0.256 to 0.895.

above 0.4: 21/29  above 0.6: 15/29  above 0.7: 14/29  above 0.9: 0/29

## Caveats

- These controls test whether the structure is contributing over the ligand alone. They cannot test whether the evaluation compounds leaked into the model's own training data. If the model was trained on public ChEMBL or BindingDB, assume they did, and read every arm above as an upper bound.
- n = 29 evaluation compounds. The interval on the headline gap is wide at this size and its sign can change on a different draw of compounds.
- Median nearest-neighbour Tanimoto to the training set is 0.61. Most evaluation compounds have a close analogue in training, so this split measures interpolation within known chemistry, not extrapolation beyond it.
- Recall of the nearest training compound ('nearest_neighbour') is not separated from the model (-0.024 spearman, interval -0.373 to +0.309). Looking up the closest known compound accounts for the result without any structure being involved.
- The trivial control 'molecular_weight' (molecular weight alone, the floor) reaches 0.429 spearman. A property carrying no binding information explains that much of this endpoint, so part of every arm's correlation is a size or composition trend rather than affinity.
- The interval on the headline gap contains zero. That is not a small positive result. On this evaluation the model and the control are not distinguishable, and a larger or a harder holdout is what would settle it, not a different metric.
- The interval covers resampling of the evaluation compounds only. The controls are fitted once on the training split and held fixed, so it answers whether the gap would survive a different draw of test compounds, not a different training set.

## Reproduce

```
affinity-controls 
```

| file | sha256 |
|---|---|
| predictions (`predictions.csv`) | `4cd14bd09bdcfc21` |
| measured (`measured.csv`) | `621a06234e5f545b` |
| split (`split.csv`) | `324bd7224fea9c24` |

Generated 2026-09-19T02:43:36+00:00 by affinity-controls, schema `affinity-controls/1`.
