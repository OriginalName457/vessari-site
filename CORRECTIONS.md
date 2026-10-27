# Corrections

Numbers in this repository that were published and later found wrong, with what
changed and why. A result that moves without a record of having moved is worse
than one that was never published, so this file exists to make the movement
visible rather than to tidy it away.

## The corpus number is not evidence that folding helps

**Reported:** a median rank correlation of 0.607 and a median absolute error
of 4.6 fold across the corpus, presented as what the pipeline achieves by
folding a protein and a compound together.

**Corrected to:** the same numbers, with the control beside them. Across 121
of the 123 targets a random forest on ECFP4 fingerprints, trained on each
target's own prior actives with the held-out compounds removed, reaches a
median rank correlation of **0.736 against the structure arm's 0.607**. The
paired difference is **minus 0.1445 with a 95 percent interval of minus 0.191
to minus 0.0992**, which excludes zero. The structure arm is ahead on 33 of
121 targets. Median fold error is 3.13x for the ligand model against 4.6x for
the structure arm. Regenerate with `scripts/ligand_baseline.py`.

**Why it moved:** the control had never been run across the corpus. It had
been run on one target, ABL1, where the ligand model reached 0.871 against
0.284, and that single result was published and described as a loss on one
dense target. Running it everywhere shows it is not one target.

**What was registered:** the comparison, the three arms, the statistic and the
decision rule were fixed at
`benchmarks/preregistered/2026-10-16-ligand-baseline.md` before any target was
scored. The rule said that an interval entirely below zero means the front
page stops describing the corpus number as evidence that folding helps and
says a ligand model does better on the targets we have scored. A stopping rule
was added at 66 of 123 targets, before the run ended, and no target was
excluded for a fetch failure.

**What did not move:** the corpus numbers themselves. Median rank correlation
0.607, median absolute error 4.6 fold, intervals over 87 protein units. The
combination of the two arms beats the structure arm alone by plus 0.1481,
interval 0.1227 to 0.1743, and does not beat the ligand arm alone.

The full result is `benchmarks/results/2026-10-16-ligand-baseline-result.md`.

## The published intervals were computed over targets that are not independent

**Reported:** median rank correlation 0.607 with a mean Spearman interval of
0.507 to 0.601, and median absolute error 4.6 fold with an interval of 4.2 to
5.0, every interval resampling the 123 targets.

**Corrected to:** the same point estimates, with intervals resampling 87
protein units. Median rank correlation 0.607, interval **0.503 to 0.654**.
Mean Spearman 0.555, interval **0.473 to 0.590**. Median absolute error 4.6
fold, interval **4.3 to 5.0**. Regenerate with
`scripts/target_independence.py` then `scripts/export_site_data.py`.

**Why it moved:** a bootstrap over targets treats the 123 targets as 123
independent draws. The corpus holds dihydrofolate reductase from E. coli,
human, Candida, rat and Pneumocystis, scoring 0.680, 0.648, 0.607, 0.901 and
0.820, and the bootstrap counted those five as five independent units. It also
holds five chemokine receptors, four somatostatin receptors, four carbonic
anhydrases, four sphingosine 1-phosphate receptors, three MAP kinases, three
casein kinases and three cathepsins. Twenty one protein names cover more than
one target.

Grouping by protein name with the species and the isoform stripped gives 87
units and widens the rank correlation interval by 40 percent, moving the lower
bound from 0.546 to 0.503. The point estimates do not move under any grouping.

A sequence based grouping, which only joins close orthologues, gives 113 units
and widens the interval by 3 percent. Treating every one of the 56 receptors as
a single draw gives 63 units and widens it by 52 percent, to 0.498 to 0.662.
That far bound is reported and not adopted, because a beta-2 adrenergic
receptor and a prostaglandin receptor are genuinely different targets.

**Found by:** an outside reader agent, which said the corpus holds five
dihydrofolate reductases that the bootstrap treats as independent. That was
correct. The reader also suggested the effect was large, and it moves the lower
bound by 0.043.

The audit is `benchmarks/results/2026-10-16-target-independence.md`.

## The corpus headline moved from 4.4 fold to 4.6 fold

**Reported:** median absolute error 4.4 fold, 95 percent interval 4.0 to 4.8,
across 121 proteins and 2,777 held-out compounds.

**Corrected to:** 4.6 fold, interval 4.3 to 5.0, across 123 proteins and 2,462
compounds. Regenerate with `scripts/rebuild_corpus.py` then
`scripts/summarise_corpus.py ~/.vessari/corpus/corpus-v2.jsonl`.

Every number on the site was computed before two defects were fixed. One was a
clustering rule documented one way and implemented another. The other was a
corpus gate comparing against the wrong variable. We rescored all of them.

On the same 123 targets, scored both ways, the median fold error went from 4.50
to 4.60 and the mean per-target rank correlation changed by minus 0.0177 with
an interval of minus 0.039 to plus 0.004. That interval contains zero, so the
corrected pipeline is not measurably better or worse at ranking. The ranking
median is unchanged at 0.607.

The compound count fell because the corrected rule clusters over the whole
candidate pool rather than the selected set, so each held-out set is smaller
and its compounds are less like each other. That is a harder test, which is
the direction the error moved.

Twice during the run we read the interval on the rank correlation as excluding
zero, at 106 targets and again at 119. The last four targets moved it back
across. Both interim readings are in this conversation's record and both were
wrong about the final answer. The full write-up is
`benchmarks/results/2026-10-16-rebuild-result.md`.

## We simulated a membrane receptor without a membrane, and called the result a null

**Reported:** five candidate ways to tell a trustworthy prediction from an
untrustworthy one were tested and all five came back null. The fifth was
stability under molecular dynamics.

**Corrected to:** four signals tested, four null. The fifth is withdrawn. We
cannot say whether pose stability carries information, because the measurement
we ran cannot answer it.

The two complexes we simulated are P30556, the angiotensin II type 1 receptor.
That is a class A G protein coupled receptor with seven transmembrane helices.
We built the system with `addSolvent`, amber14 and TIP3P water, and ran it with
29,094 waters in a 9.9 nm box. There is no lipid in the build. We put a
membrane protein in a box of water.

A seven helix bundle has no reason to hold its packing without the membrane
that normally surrounds it. So the 4.24 angstrom scatter between replicas,
which we reported as the reason the measurement could not separate the two
poses, is at least partly the receptor coming apart for a reason that has
nothing to do with the ligand. We read an instrument that was not connected.

The pre-registration is `benchmarks/preregistered/2026-10-12-pose-stability-v2.md`.
It caught five protocol divergences against the published literature. It did
not specify a membrane, and neither did the first version. We checked the
protocol against papers and did not check it against the protein.

This does not turn the null into a positive result. We do not know whether a
pose that falls apart under dynamics is a pose whose affinity was wrong. We
know that we have not measured it.

What it costs: one of the five entries in "we cannot tell you which predictions
to trust" was not evidence. The claim that we cannot tell you stands, because
four signals remain null and no signal came back positive. The count was wrong
and the count is on three pages.

Found by an outside reader asked to look at the site as a biochemist. The same
reader said we hide our loss to a molecular weight baseline. That one is wrong,
and it is recorded here because we checked it: the arm is on the front page,
and on the current split we score 0.284 against molecular weight's 0.209. The
reader was reading `abl1-controls-v2.json`, which the site stopped using.

## The published pre-registration was missing two of its amendments

**Published:** the data-poor registration as it stood on 14 October at 01:50,
156 lines, carrying its first amendment only.

**Corrected to:** the current file, 264 lines, carrying all three. Regenerate
with `scripts/export_data_index.py`.

The registration lives in `benchmarks/preregistered`. The publisher read only
`benchmarks/results`, where a copy of it had been made so the publisher could
find it. Amendments were written to the real file and the copy never moved, so
the site served a registration without its second amendment for about twelve
hours and without its third from the moment it was written.

The second amendment is the one that matters here. It records that the two arms
had been scored on different compounds, that the fix moved the ligand arm from
0.881 to 0.657, and that the mismatch had been flattering the ligand arm rather
than ours. A reader of the site during that window saw a registration that did
not mention it.

Nothing computed from the registration was wrong. What was wrong is that a
correction we had already made was not visible to anyone reading the public
copy, which defeats the point of publishing it.

Three other registrations were duplicated the same way and happened to still
match. The publisher now searches both directories and refuses to publish a
filename that exists in both with different contents, naming the file and
stopping rather than letting one copy win silently. The duplicates in
`benchmarks/results` are deleted, so each registration has one source.

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
value is 6. Nineteen of the thirty compounds had an even number of assays and
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
six of the eight differ only in the fused heteroaryl cap. CHEMBL2316585 also
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
not been wrong by more than about 400 fold in anything measured here. Below it,
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

## Interface pTM does not predict affinity error

Withdrawn 2026-10-03. Measured on 325 predictions across fifteen targets.

`vessari/uncertainty/pose.py` claimed that the model's own confidence in the
ligand interface predicts how wrong the affinity will be, and used it to sort
predictions into good, marginal and poor. That claim came from three targets. It
does not survive fifteen, and the three ways it was stated fail separately.

**As a correlation.** Per-target Spearman between interface pTM and absolute log
error, averaged over fifteen targets: **-0.067**, bootstrap interval over targets
**[-0.209, +0.085]**. Nine of fifteen negative. Wilcoxon against zero p = 0.277.
The figure first reported, about -0.57, was the mean of ABL1 (-0.426), AChE
(-0.380) and InhA (-0.900), which were the three targets measured first. Re-run
now at n=13, InhA comes back **+0.577**, so even that set does not reproduce.

**As a bound on the worst case.** The claim was that a pose above 0.90 is never
wrong by more than about 400 fold. **Eight of 244** such poses exceed it, the
worst by **132,867 fold at an interface pTM of 0.961** (dihydrofolate reductase,
P00374).

**As a filter on bad poses.** Predictions below 0.60 do show a higher median
error, 43 fold against 5, Mann-Whitney p = 0.0005. The test is void: all 23 of
those predictions come from one target, acetylcholinesterase. It compares one
hard protein against fourteen others and says nothing about the pose score.

| bin | n | median | 90th pct | worst |
|---|---|---|---|---|
| above 0.90 | 244 | 5x | 118x | 132,867x |
| 0.60 to 0.90 | 58 | 5x | 385x | 78,734x |
| below 0.60 | 23 | 43x | 2,168x | 18,168x |

The top two bins have the same median.

**What changed.** `GOOD_POSE` and `POOR_POSE` are removed rather than retuned,
because retuning them on the 325 predictions that refuted them would fit this
corpus and claim nothing about the next target. `assess_pose` now returns a
single verdict, `recorded`, carrying the number. The dossier and the assessment
summary print the interface pTM instead of a warning. Nothing downstream
weights, gates or filters on it.

**Why it took this long.** The original three targets were not a sample, they
were the first three available, and two of the three happened to be the ones
where the model placed some ligands badly. On a target where every pose comes
back confident the correlation cannot be measured at all, which is most targets:
244 of 325 predictions sit above 0.90. The signal that was reported was the
favourable tail of a distribution centred near zero.

**Still open.** Error prediction remains unsolved. The ensemble spread between
the two affinity modules is recorded on every prediction and has not been tested
against error across the corpus. That is the next candidate and it should be
pre-registered before it is measured, not after.

## Running four free energy legs on one card made the card slower

**Reported:** that throughput off card 2 rises with every leg added to it. Two
legs 330 ns/day between them, three legs 553, four legs 707, published in
`docs/PHYSICS-ARM.md` on 18 October with the reading that each leg costs the
others about 7 percent and brings far more than it costs. The full twelve edge
tyk2 map was estimated at 5.6 days on that basis.

**Corrected to:** four legs produce less sampling an hour than two. Counted
from the iteration dimension inside each leg's `simulation.nc`, the solvent leg
of the jmc_23 to jmc_28 edge reached 100 of its 2,001 iterations in the 109
minutes from 11:57 to 13:46 on 19 October with three other legs on the card,
which is 0.92 iterations a minute. Two legs were stopped at 13:47 and the same
leg ran at 10.4 iterations a minute, reaching 160 iterations by 13:51.

The complex leg of the 31 to 45 edge shows it across four repeats of one
system with nobody intervening. Repeats 1 and 2 ran against three other legs
at 2.95 and 2.60 iterations a minute, taking 679 and 769 minutes. Repeats 3
and 4 ran after the 24 hour timeout had killed the other legs overnight, at
7.03 and 7.76 iterations a minute, taking 285 and 258 minutes. That is the
same leg and the same ligands running 2.7 times faster with the card to
itself.

**Why it moved:** the first numbers were the `ns/day` figures openfe prints
from inside a running leg, read shortly after each leg was added. That figure
is an instantaneous rate and it does not count the time a leg spends waiting
for the CPU. The host is a two core Celeron G3930 and a sampling leg holds
about one core feeding the card, so four legs on two cores leave each one
short of the CPU the GPU is waiting on. While the four legs ran the run queue
stood at 5 to 7 with user time at 89 to 98 percent, and the legs held no swap
at all, so the cause is CPU starvation rather than memory.

**What it cost:** most of 19 October. Four legs were started that morning on
the strength of the old table, and `scripts/keep_card_busy.py` was written to
hold the card at four. The two legs stopped at 13:47 had each reached
iteration 1 of 2,001 after almost two hours. Both are resumable and neither
lost completed work.

**What did not move:** the single leg measurements in the same section. A
sampling leg still holds about 1.2 GB of host memory and 4.41 GB of GPU
memory, and the setup phase still peaks near 9.7 GB across three setup units.
Those were read directly rather than inferred from a printed rate.

**Still open:** the twelve edge map has no revised schedule. The old 5.6 day
estimate came from the wrong table and no replacement has been measured over
a full edge at two legs.

## Two arms on one host, said twice and wrong the first time

**Reported:** On 19 October at 21:39 the free energy map was dropped to one
leg so the second core could run the structure arm of the design experiment,
on the reasoning that a sampling leg holds about one core and a folding lane
about 1.3 of them, so one of each fits on two cores.

**Corrected to:** They do not fit, and the binding constraint is memory rather
than the CPU. One boltz prediction with the affinity head peaked at 9.3 GB of
host memory against a leg holding 1.8 GB, on a host with 15.9 GB. The first
attempt, on a 325 residue target in batches of four, took the host to 1.0 GB
available with 1.4 GB in swap. The second, on a 254 residue target in batches
of two, was stopped by its own guard at 2.4 GB available after three minutes.

**Why it moved:** The CPU measurement was correct and incomplete. Host memory
per folding lane had been recorded at 4.1 GB for a 233 residue protein, which
is a structure prediction without the affinity head. With the head on, the
peak is 9.3 GB at 254 residues and does not fall with sequence length in this
range.

**What it cost:** About twenty minutes of card time across two aborted folding
runs, and seven background shells the harness stopped while the host was in
swap. No prediction and no sampling was lost. The leg kept its minimisation
and is still running.

**What did not move:** The CPU is still the first thing to buy. A quad core is
what lets this host run two legs, or a leg and a lane once the memory is
there.

**Still open:** The two arms now run one after the other. The structure arm is
955 jobs at about a minute each, so it waits for the jmc complex leg.

## The structure arm did not reach the 81.9 percent its own calibration predicted

**Reported:** `src/vessari/design/ranking.py` turns a predicted affinity gap
into a probability of calling the direction right, with sigma 0.7624 log10
fitted on earlier data. Applied to the 559 matched pairs of the design
experiment it predicted **81.9 percent**, and the registration of 18 October
carried that prediction forward as the number the structure arm would reach.
The registration also set the bar at 75.7 percent, the top of the control's
interval, for the arm to count as beating the fingerprint.

**Corrected to:** The arm called **403 of 559, 72.09 percent**. The control
called 398 of 559, 71.20 percent. The paired difference is **+0.89 percentage
points with a 95 percent interval of -4.97 to +6.45** over the 189 papers, so
the two arms are indistinguishable on this set. The arm did not reach 81.9 and
it did not reach 75.7.

**Why it moved:** The 81.9 percent was computed by feeding the calibration the
**measured** gaps instead of the model's **predicted** gaps. Averaging
Phi(measured gap / 0.7624) over the 559 pairs gives **0.8186**, which is the
81.9 in the registration to the digit. Averaging Phi(predicted gap / 0.7624)
over the structure arm's own 556 scored gaps gives **0.676**.

Those are two different questions. The first asks how often a model whose
predictions scatter around the truth with that width would call a gap of this
size correctly, which is a statement about an idealised model and about the
difficulty of the set. The second asks how confident to be in the call this
model actually made. A benchmark prediction needs the second one.

Refitting sigma on this set, which the registration asked for as a secondary
outcome, gives **0.5977 for the fingerprint control and 0.5876 for the
structure arm**, both tighter than the published 0.7624. At those values the
correct calculation predicts 69.0 and 71.3 percent against 71.2 and 72.5
observed, so sigma itself was close to right. Feeding the same wrong quantity
into the refitted sigma would have predicted 86.7 percent and been further
out, so the error was never about the width.

**Correction to this entry, made the same evening.** The first version said the
calibration failed because the two predictions in a matched pair share a
protein and a pose pipeline, so their errors are correlated and the gap carries
less information than independence would give. Matched pairs do have that property, and it did not produce the
ten point miss. The miss came from applying the formula to the answer rather
than to the prediction. Computing both and seeing 0.8186 come back is what
showed it.

**What it cost:** 955 co-folding jobs, about 18 hours of card time, plus the
pose check and the relaxation of 65 poses. The number it produced is the
registered primary outcome and it stands.

**What did not move:** The pose work. 887 of 952 poses passed every PoseBusters
check first time, 93.2 percent, and the restrained minimisation fixed all 65
that failed, so every pose cleared the gate. Three pairs failed because Boltz
produced a structure and declined to score it, and those three count as wrong.
The stratification also held: both arms do better on changes of 5 fold and
above than below, 77.4 against 67.3 for the structure arm.

**Still open:** The two arms disagree on 207 of the 559 pairs and split those
almost evenly, 106 to the structure arm and 101 to the control. One of them is
right on **504 of 559 pairs, 90.2 percent**. Whether a rule can be learned that
picks the right arm per pair is the question this result raises, and it has not
been tested.

## The physics arm ran on OpenMM 8.4, not the 8.6.1 we recorded

**Reported:** `docs/PHYSICS-ARM.md` said the environment holds OpenMM 8.6.1,
written on 18 October when the CUDA version conflict was fixed.

**Corrected to:** OpenMM **8.4**. Read from the installed package with
`~/miniconda3/envs/vessari-fep/bin/python -c "import openmm;
print(openmm.__version__)"`, which returns 8.4. OpenFF toolkit 0.19.0 and
openfe 1.13.0 in the same environment are both correct as recorded.

**Why it moved:** The 8.6.1 came from reading a conda solve rather than the
installed package. A solve lists what it intends to install and the environment
holds what it installed, and those differ when a pin forces a downgrade, which
is exactly what pinning `cuda-version=13.1` did.

**What it cost:** Nothing in the science. Every free energy number this arm has
produced came from 8.4 and the version recorded beside them was wrong, so what
it cost is traceability. A reviewer checking our stated environment against our
own machine would have found it before we did.

**What did not move:** All five completed edges and their estimates stand. The
version was never an input to the calculation, only to the record of it.

**Nothing else in that paragraph moved.** Re-checked against the installed
packages on 24 October: `cuda-version 13.1 h2ff5cdb_3` and
`cuda-nvrtc 13.1.115 hecca717_0` in the vessari-fep environment, against an
NVIDIA driver reporting 590.48.01. The pin holds and the CUDA figures in that
paragraph are what is installed.

## We are not three times worse than the commercial standard

**Reported:** On 22 and 23 October this project reported that its free energy
arm is "about 3x worse than the commercial standard", from an RMSE of 0.626
kcal/mol over five tyk2 edges against FEP+'s 0.210 on the same five.

**Corrected to:** Both numbers are right and the comparison is not. Three
things were missing from it.

FEP+'s 0.210 on those five edges sits **outside its own published figure for
the whole tyk2 set, 0.447**. Bootstrapped over the five edges at 20,000
resamples, FEP+ is 0.210 with a 95 percent interval of 0.154 to 0.250 and we
are 0.626 with an interval of 0.403 to 0.793. An interval that excludes the
method's own full set value means these five edges are among the ones it does
best on, so the ratio measured on them flatters FEP+ against itself.

The right comparator for our stack is **openfe, which reports 0.59 kcal/mol on
tyk2** in the OpenFE Industry Benchmarks. Our 0.626 over five edges is that
number. On the metric an independent 2026 evaluation used, mean unsigned error,
we are at 0.555 against FEP+'s published 0.46 over 34 transformations and 21
proteins, which is a factor of 1.2.

The published classical force field baseline on this target under a matched
protocol is **0.86 with an interval of 0.57 to 1.13** (Farr and De Fabritiis,
arXiv 2608.13355). Our 0.626 is inside it.

**Why it moved:** A five edge subsample was compared against a five edge
subsample without bootstrapping either, and the comparator chosen was a
commercial code with a different ligand force field rather than the open code
we actually run. The protocol audit that found this also established that our
settings are the published openfe reference protocol field by field, 11 lambda
windows at 5 ns across 3 repeats for 165 ns per leg, every value an openfe
1.13.0 default. There is no misconfiguration to find.

**What it cost:** Two days of looking for a configuration bug that does not
exist, and a status report to the project owner that overstated the problem.

**What did not move:** The five edge numbers themselves, and the fact that FEP+
beats us on these five edges. The remaining gap is attributable mostly to the
ligand potential, Sage 2.2.1 with AM1-BCC charges against OPLS4, which cannot
be changed on this rig and which published work sizes at 0.3 to 0.5 kcal/mol
on tyk2.

**Still open:** What a defensible tyk2 number looks like over the full twelve
edge map rather than five, and whether the claim we can actually make is about
ranking rather than about RMSE. The consortium that maintains our stack writes
that "OpenFE shows competitive performance with state-of-the-art commercial
software at ranking compounds" while FEP+ "shows superior low error
performance", so parity exists on ranking and not on error.

## openfe's quoted uncertainty is the across-repeat spread, and an adversarial review said otherwise

**Reported:** An adversarial reviewer in the 23 October protocol audit reported
that "every complex leg's repeat spread exceeds its quoted MBAR error by 1.6 to
2.65 times", and used that to reject all three proposed experiment designs on
the grounds that their thresholds were built on understated error bars.

**Corrected to:** The quoted uncertainty **is** the across-repeat sample
standard deviation. On the jmc_23 to jmc_28 complex leg the three repeats are
16.8571, 16.9860 and 17.0874 kcal/mol, whose sample standard deviation is
0.1154, and the leg's quoted uncertainty is 0.1154 to four decimal places. The
same holds on all ten completed legs.

**Why it moved:** `result.json` lists each repeat twice, once under a data hash
and once under a `ProtocolUnitResult` key, so a naive walk collects six values
for three repeats. The standard deviation of three values each duplicated is
the true one times the square root of 0.8, which is 0.894, and that is exactly
the constant ratio measured across all ten legs before deduplication. A
reviewer comparing per-window MBAR errors from inside the analysis units
against the leg level uncertainty is comparing two different quantities.

**What it cost:** Three experiment designs were rejected partly on this, one of
them unanimously. The rejections stand on their other grounds, which include a
real bug in `scripts/keep_card_busy.py` and a point prediction that was
algebraically trivial, so the review was still worth its cost.

**What did not move:** The cycle closure. The triangle closes to 0.193 against
a combined claimed uncertainty of 0.201, which is 0.96 sigma, and that
arithmetic used the quoted uncertainties, which are the honest ones.

## The per-ligand error decomposition was a tautology, not a finding

**Reported:** On 24 October the protocol audit reported, and this project
recorded in `docs/PHYSICS-ARM.md`, that our tyk2 error "has a per-ligand
shape": fitting one offset per ligand to the edge errors left an RMS residual
of 0.050 against an RMS error of 0.626, and the ranking of candidate causes was
built on it, putting every per-ligand cause above every per-edge cause.

**Corrected to:** The decomposition is forced by the geometry of the network and
it distinguishes nothing. The same fit applied to **FEP+'s errors on the same
seven edges leaves an RMS residual of 0.000**, so FEP+'s error is 100 percent
per-ligand by this measure and ours is 99.4 percent. A measure that both
methods saturate is measuring the fit and not the physics.

Seven edges over eight ligands in two connected components give an incidence
matrix of rank six, so the fit has **one degree of freedom**. That one degree of
freedom is the lig_ejm_31 triangle, and the residual is the cycle closure error
spread over three edges.

**Why it moved:** Nobody computed the degrees of freedom before quoting the
variance explained, and nobody ran the same fit on the comparator. The
`PHYSICS-ARM.md` entry of 24 October did say the 99 percent was not meaningful
and gave the arithmetic linking it to the cycle closure, so the caveat was
published with the claim. The ranking of causes built on top of it is what
needs the correction.

**What it cost:** Nothing yet. The ranking it produced put the ligand force
field and the charges first, and the heavy atom hypothesis it displaced was
refuted by experiment on 24 October, so the ranking happened to be right. The write-up claimed a stronger reason for that ranking than the data supports.

**What did not move:** The cycle closure itself, which is a real measurement on
real data, and the conclusion that a per-edge error cannot produce it.

**Still open, and it changes how the next map is planned.** The finished twelve
edge map will not fix this. The planned network is a minimal spanning tree over
thirteen ligands, so twelve edges give rank twelve and zero degrees of freedom,
and the single separately planned cycle edge is the only redundancy in the whole
map. Testing whether the error is per-ligand needs edges that close cycles, and
the current plan contains one. Any future map should be planned with redundancy
rather than as a spanning tree.

## The 0.59 we compared ourselves against could not be sourced

**Reported:** From 24 to 26 October, `docs/PHYSICS-ARM.md`, the homepage and
three commit messages said "openfe publishes 0.59 kcal/mol on tyk2" and used it
as the comparator for our own 0.598 and then 0.616. The sentence "we are at the
published accuracy of the stack we run" rested entirely on it.

**Corrected to:** Withdrawn. The figure came from one agent's literature search
during the protocol audit of 23 October and was never checked against a
primary source. Two searches on 26 October could not find it. The published
collaborative assessment of the OpenFE protocol, by 15 pharmaceutical companies
over more than 1,700 ligands, **reports no per-target figure for tyk2 at all.**

What it does report, and what now stands in its place:

| | |
|---|---|
| OpenFE default protocol, 58 public systems | **1.73 kcal/mol** weighted RMSE, 95 percent interval 1.53 to 1.96 |
| sub kcal/mol systems | 10 of 58 |
| per system range | 0.6 to 5.0 |
| OpenFE on 37 blinded industrial systems | **2.44 kcal/mol**, 2 of 37 under 1 |
| optimised FEP+ on the public set | **1.20 kcal/mol**, 19 systems under 1 |

Source: Large-scale collaborative assessment of binding free energy
calculations for drug discovery using OpenFE, JCIM 10.1021/acs.jcim.6c00089,
with the ChemRxiv v2 preprint dated March 2026.

**Why it moved:** An agent reported a number, it fitted our own figure almost
exactly, and the coincidence made it feel confirmed rather than unchecked. It
went onto the homepage three days later and stayed there for two.

**What it cost:** Two days with an unsourced number as the central claim of the
front page. No measurement changes.

**What this does NOT let us claim.** Our 0.616 over 8 tyk2 edges sits at the
bottom of that 0.6 to 5.0 per system range, and tyk2 is a well behaved
congeneric series that sits at the easy end of any benchmark it appears in. So
our figure is **not** evidence of beating the collaborative benchmark, and the
site now says that in the same tile as the number. The honest comparator for
tyk2 is FEP+ on these same edges, which is 0.400, and the paired interval on
mean unsigned error contains zero while the one on squared error does not.

**What did not move:** The settings claim, which was the other thing that agent
established and the only one of the two that carried a check. Re-verified on 26
October by dumping `RelativeHybridTopologyProtocol.default_settings()` from the
installed openfe 1.13.0 and comparing field by field against the settings
serialised in a transformation we actually ran. 11 lambda windows, 11 replicas,
5.0 ns production, 1.0 ns equilibration, 3 repeats, 4.0 fs timestep, hydrogen
mass 3.0, openff-2.2.1, amber ff14SB, tip3p, am1bcc, gapsys soft core. Every
value matches, and the one difference is the complex leg's 1.0 nm solvent
padding against the 1.5 nm default, which openfe sets itself.

## "53 of 55 make the same wrong call" was forced by the arithmetic

**Reported:** On 26 October, in `benchmarks/results/mmp-error-types.md`, in a
commit message and to the project owner in conversation: the two arms are both
wrong on 55 of the 559 pairs and on 53 of those they make the same wrong call,
therefore both methods are blind to the same thing and the 9.8 percent below
the oracle ceiling is shared failure rather than something a better switch
could rescue.

**Corrected to:** Withdrawn. The outcome is binary. If the measured direction
is improved and a method is wrong, it said worse, and there is no other way to
be wrong, so two wrong methods must agree. The two exceptions are exactly the
two pairs where the structure arm returned no prediction at all, and 53 plus 2
is 55. The number was determined before any data was looked at.

**What the data says when asked properly.** Stratify the 559 pairs on the size
of the measured change, then compare the observed joint failures in each
stratum against the product of that stratum's marginal failure rates. That
gives 55 observed against **48.9** expected under independence. The excess is +6.1
pairs, a ratio of **1.13**. Once difficulty is held fixed, the two arms fail
very nearly independently and there is no shared blind spot in this data.

**Why it moved:** 53 of 55 is a striking looking fraction and it was not asked
where it came from. The check was one line of reasoning about a binary outcome
and it took two minutes once asked.

**What it cost:** Twenty minutes, one chat message to the owner, one commit
message and one results file. Caught in the same session that wrote it, while
trying to find what the 55 pairs had in common, which is how the forcing became
obvious.

**What did not move:** The 90.2 percent oracle ceiling, the confusion matrix,
and the held-out calibration. And the corrected reading is the better news:
nearly independent failures mean a rule that picks the right arm per case is
worth building, where correlated failures would have made it worthless.

## Seven crystallographic waters was two, and two in ligand contact was one

**Reported:** On 26 October, in `docs/EXPERIMENT-DESIGN.md` and in the brief
given to a workflow, that `~/.vessari/fep-inputs/tyk2/protein.pdb` holds seven
crystallographic waters with two of them in ligand contact. The figure was used
to argue that swapping the starting structure changes four things at once.

**Corrected to:** **Two** water molecules, residues 1318 and 1325. The file
holds 18 HETATM records, 6 ACE and 6 NME capping groups and 6 HOH, and those 6
HOH records are two waters of three atoms each. **One** of the two touches the
ligand: A1325 at 2.33 angstroms, a hydrogen bond. A1318's closest approach to
the crystal ligand is 3.66 angstroms, which is not a contact.

**Why it moved:** `grep -c "HOH"` returned 7 because it matched a `FORMUL`
header line in addition to the 6 atom records, and nobody asked why a protein
would hold an odd number of water atoms. Caught by an agent re-deriving the
count during the 26 October workflow and then re-verified here against the
coordinates.

**What it cost:** Nothing yet. The figure appeared in the paragraph of the
rule file written to stop exactly this, and an unchecked one liner of the kind
that file names is what produced it.

**What this changes in the science.** The water confound is one bridging water
in the hinge, not seven, and it contacts the invariant core of the series rather
than the part that changes. A contact that is geometrically the same at both
alchemical endpoints cancels to first order in a relative free energy, so the
water term is bounded near zero on every planned edge at no card cost. This also explains the null in `benchmarks/results/fep-water-occupancy.json`.
That measurement counted bulk shell occupancy around the whole ligand, and the
one structured water does not move.

**Still true.** openfe did keep both waters in every system it simulated, so
they were a real presence in all nine published edges rather than a
hypothetical. No edge is worth spending to isolate them.
