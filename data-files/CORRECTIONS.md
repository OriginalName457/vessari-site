# Corrections

Numbers in this repository that were published and later found wrong, with what
changed and why. A result that moves without a record of having moved is worse
than one that was never published, so this file exists to make the movement
visible rather than to tidy it away.

## ABL1 affinity ranking, corrected twice

**Reported first:** Spearman 0.563 on 30 held-out compounds, commit `85703ae`.

**Corrected to:** Spearman 0.284, 95% CI [-0.121, 0.636], commit `b29006b`.
Regenerate with `scripts/score_holdout.py`.

Bemis-Murcko scaffold splitting, the field-standard rule and the default in most
benchmark suites, admitted eight members of one congeneric series into the
held-out set. The eight share a benzamide, a piperazinylmethyl, a
trifluoromethyl and an alkyne, and differ only in a fused heteroaryl cap. That
cap is part of the ring system, so Murcko sees eight scaffolds where a chemist
sees one series. Removing them is not the same as removing any nine compounds:
keeping one per Tanimoto cluster gives 0.250 where dropping nine at random leaves
0.556, and a random subset does as badly as declustering 0.25% of the time. An
earlier version of this paragraph said the eight took every sub-nanomolar slot,
which is false and is retracted at the bottom of this file.

Two further defects were found and fixed in the same pass. Medians were taken
in linear nanomolar on log-normal data, which for a compound measured three
times at 2 nM and three times at 18 nM returns 10 nM where the correct central
value is 6; nineteen of the thirty compounds had an even number of assays and
were therefore affected. And two compounds carried three identical records each
of exactly 10,000 and exactly 20,000 nM, which is an assay ceiling deposited
three times rather than three assays agreeing.

Selection is now single-linkage ECFP4 Tanimoto at 0.6, one compound per series.

## The training split leaked in the same way

**Found while rebuilding.** Training compounds were excluded from the split if
they shared a Murcko scaffold with a held-out compound, which removed 111 of
2,983. Excluding by ECFP4 Tanimoto at 0.6 instead removes 441. So 330 near
neighbours of held-out compounds were sitting in the training set, and every
ligand-baseline number measured on that split is inflated, including the ones
that beat us. Both arms were re-measured on the corrected split.

## The crossover claim

**Claimed in `b5fe27d`:** "Structure is the better move below roughly ten
compounds and is behind above sixty."

**Withdrawn.** That curve compared the ligand model against a hardcoded
structure score of 0.546, which came from the superseded set. Against the
corrected 0.284 there is no training-set size at which structure is preferable
for this target: a random forest given five compounds already ranks better than
zero-shot structure prediction on more than half of random draws.

The threshold is no longer a constant. `scripts/crossover_rf.py` reads it from
the stats file at run time and records the file's digest in every result, so a
claim cannot outlive the number beneath it.

## What did not change

The pipeline reproduces the published regime when given a published-style
benchmark: 52 FEP+ compounds, Pearson 0.596 and Kendall 0.433, against Boltz-2's
reported 0.66 and 0.48. The corrections above are about what we measured and
claimed, not about whether the code runs correctly.

## The paired intervals were too narrow

**Published:** direction right 85.3% of the time on pairs whose measured change
exceeds 1 kcal/mol, 95% interval 83.8 to 86.7.

**Corrected to:** the same 85.3%, interval 83.1 to 87.3. Regenerate with
`scripts/paired_validation.py`.

364 compounds generate 4,899 within-target pairs, so each compound appears in
about twenty-seven of them and the pairs are nowhere near independent.
Resampling pairs for the interval treats them as though they were, and returns
a precision the evidence does not support. The interval now resamples compounds
and keeps every pair among those drawn.

The point estimate did not move. Only the claimed precision did, and only by
about a point at each end. It is recorded here because a number that was on a
public page for a day and then changed is exactly what this file is for.

## A false sentence about the ABL1 series was published

**Published:** "The eight took every sub-nanomolar slot", on the website and in
this file.

**Corrected to:** three of the five sub-nanomolar compounds belong to the series
and two do not, and the series spans 0.34 to 31.95 nM, a 94-fold range.

It was written as a plausible explanation of a real effect and never checked
against the compound list. The effect survives: keeping one compound per
Tanimoto cluster gives Spearman 0.250 where dropping the same number of
compounds at random leaves 0.556, and a random subset does as badly as
declustering 0.25 percent of the time. What did not survive is the story told
about why.

Two smaller claims in the same sentence were also loose. Seven of the eight
share a benzamide, not eight: CHEMBL2324925 carries a urea on a pyrazole. And
six of the eight differ only in the fused heteroaryl cap; CHEMBL2316585 also
swaps a methyl for cyclopropyl.

The finding is a replication rather than a discovery, which the page now says.
Steshin's Lo-Hi benchmark measured scaffold-split leakage across four public
datasets in 2023, and Guo, Hernandez-Hernandez and Ballester titled a 2024 paper
"Scaffold Splits Overestimate Virtual Screening Performance" over 2,100 models.

## A commit described a function that was never written

**Claimed in `243bd55`:** "So `predict_replicates` runs the prediction under
several seeds and averages in log space", with a paragraph on how three
replicates narrow the interval on a ratio from times-or-divide 1.34 to 1.18.

**Corrected:** that function does not exist and never did. `git log -S "def
predict_replicates"` finds no commit that added or removed it.

The edit that was supposed to add it failed at the time with an ImportError.
The error was visible in the output, was read as a different problem, a
different thing was fixed in the same breath, and the function was never
checked for again. The commit message was written from what the edit was
intended to do rather than from what the file contained.

Nothing downstream broke, because nothing called it. That is the only reason
this went unnoticed for six days, and it is not a reassuring reason: an
uncalled function is exactly the kind that can be described in a commit message
and never exist.

The replicate averaging it described is still worth having and is not yet
written. What has been written and verified to exist is `predict_batch`, which
addresses a different and larger problem: boltz spent about 132 seconds of
every 170 on process setup, so predicting one compound per process ran the card
at a 22 percent duty cycle. Measured on three ABL1 compounds, batching takes
170 seconds each to 114.

## A claim that our uncertainty signal had failed, which it had not

**Said in conversation:** that the InhA run was the first case where pose
confidence failed to warn us, because two compounds were off by 104 and 371
fold while every pose confidence sat between 0.91 and 0.98.

**Corrected:** the correlation on InhA is Spearman -0.900, the strongest of the
three targets measured. Within that set the compounds with lower confidence did
have higher error, exactly as on the other two. The absolute values were all
high because the poses were genuinely good, and the errors came from the
affinity head rather than from placement.

The mistake was reading absolute values and never computing the correlation. It
is the same shape as looking at a table and describing what it seems to show
instead of what it says, which is the error this file exists to record.

With n=5 the interval is [-1.000, -0.111], so InhA on its own settles nothing
either way. The claim that holds is the pooled one across 59 predictions on
three unrelated folds:

    interface pTM above 0.90   n=27   median error    10x   worst      371x
    0.60 to 0.90               n=9    median error   173x   worst   78,734x
    below 0.60                 n=23   median error    43x   worst   18,168x

The useful property is the bound rather than the median. A pose above 0.90 has
not been wrong by more than about 400 fold in anything measured here; below it,
errors of ten thousand fold occur. The thresholds in
src/vessari/uncertainty/pose.py were set from one target and are now set from
three, moving from 0.85 and 0.50 to 0.90 and 0.60.

## Eleven corpus entries recorded a database outage as a fact about a protein

**Written by the worker's first run:** eleven entries in
`~/.vessari/corpus/corpus.jsonl` reading `"failed": true, "reason": "scoring
failed"` against six targets, with those targets marked permanently skipped in
the queue.

**Corrected:** all eleven were deleted before the twelve target analysis was
computed. ChEMBL was returning HTTP 500. The set builder read any non-200
response as the end of the result list, found zero compounds, and the worker
recorded that as a property of the protein. Five of the six targets scored
normally once ChEMBL recovered: dihydrofolate reductase from E. coli and from
human, serine protease 1, 3-oxo-5-alpha-steroid 4-dehydrogenase 1 and InhA. The
sixth, peptidyl-prolyl cis-trans isomerase B, was later declined because only 1
compound survived clustering, which is a reason that holds.

The eleven arrived in two bursts, the first five inside 48 seconds by their own
timestamps. Nothing in the record distinguished them from a real failure, which
is the part that mattered: a skipped target is never retried, so an outage of a
few minutes would have removed five proteins from the corpus for good.

The fix is in `scripts/corpus_worker.py`, commit `f505649`. An upstream failure
now raises an Upstream exception that returns the target to the queue and waits,
and the queue records how many activities a target had when it was enqueued, so
finding none now is treated as a contradiction rather than an answer.

## The protein length rule was interpolated from two datapoints

**Said in our own materials:** that proteins under about 400 residues are
comfortable for this pipeline.

**Corrected:** measured across twelve targets, the Spearman correlation between
protein length and per-target ranking performance is -0.336 over lengths of 159
to 419 residues. Inside that span, length does not predict whether the pipeline
ranks a target's compounds. The best target in the corpus is 271 residues and
the second best is 413.

The claim came from two measurements of a different quantity: ABL1's kinase
domain at 254 residues gave interface pTM above 0.80 throughout, and
acetylcholinesterase at 583 residues gave a median of 0.27. Those are pose
confidences on two proteins, and a statement about ranking performance as a
function of length does not follow from them.

The 150 to 420 residue bound in `src/vessari/corpus/queue.py` stays, because
nothing here tests it. Every target in the corpus was inside that range by
construction, so the corpus says nothing about the span from 420 to 583 residues
that the bound was written to cover.
