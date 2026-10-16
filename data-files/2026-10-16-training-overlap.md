# Whether our held-out compounds are in the folding model's training set

Audited 16 October 2026 against the Boltz-2 preprint as a primary source,
bioRxiv 10.1101/2025.06.14.659707. No experiment was run for this. It is a
reading of what the model was trained on, set beside what our corpus contains.

## Why this comes before everything else

Every number this project publishes is produced by a model somebody else
trained. Our clustering rule controls similarity inside our held-out sets and
between those compounds and the pool our ligand arm trains on. It says nothing
about whether the folding model has already seen the answer. We own the first
control and we do not own the second one.

## What the model was trained on

The affinity head was trained on ChEMBL version 34 and BindingDB. The
optimisation stage subset, which is the one that predicts a continuous
affinity, holds **1.2 million values across about 2,000 targets and 600,000
compounds**.

The ChEMBL extraction used these filters, quoted from the appendix:

- confidence score equal to 9, the maximum
- target type restricted to SINGLE PROTEIN
- biochemical or functional assays
- standard type in Ki, Kd, IC50, XC50, EC50, AC50
- sources flagged as unreliable excluded
- PAINS removed, molecules over 50 heavy atoms removed

Structures came from every Protein Data Bank entry up to a cutoff of 1 June
2023. **No date cutoff is stated for the affinity values.**

## What our corpus contains

One hundred and twenty three ChEMBL single proteins, 102 of them human. For
the 53 targets whose ChEMBL pool we have fetched and counted, the median pool
holds **730 measured compounds**, the smallest 94 and the largest 2,490. Our
held-out sets take IC50 and Ki values in nanomolar with an exact relation.

Every one of our targets satisfies every filter in the list above.

## The overlap

The model's authors applied one leakage control to the affinity data. Training
proteins with 90 percent or higher sequence identity to a protein in their
validation or test sets were removed, using mmseqs clustering at a minimum
sequence identity of 0.9. That control protected their benchmarks. Our 123
targets were not their benchmarks, so nothing excluded them.

So a ChEMBL single protein with hundreds of measured compounds and maximum
confidence annotations is the kind of target that selection produces, and 2,000
of them were selected. Our targets are very likely among them and our compounds
very likely among the 600,000.

**The direct check cannot be run.** The training pairs are not released. An
issue on the model's repository asking for the target and ligand pairs or the
assay record IDs, specifically so that benchmark overlap can be assessed, was
opened on 27 September 2026 and has no reply. We are not the only group that
cannot do this check.

## What the authors measured where leakage is impossible

The same paper reports the model on **eight blinded private hit-to-lead assays
from Recursion**, each with hundreds of compounds, on targets the appendix
describes as proprietary internal targets not accessible to external sources.
The sequence identity exclusion was not applied to them because it was not
needed.

On those eight assays the model reaches an **average Pearson correlation of
0.39**, against 0.42 on its own validation set, with per assay values from
0.165 to 0.634. Its centred mean absolute error is **1.36 kcal/mol** against
0.86 on validation. The authors write that these results are a reminder that
strong performance on public benchmarks does not always translate to
real-world drug discovery.

## Our number in that frame

Our corpus median rank correlation is 0.607, measured on held-out sets spanning
a median of 4.15 log units of potency. That is the public benchmark regime.

Our within-window median rank correlation is **0.318** across 31 targets, in a
1.5 log potency window with a median of 10 compounds, published at
`benchmarks/results/2026-10-16-within-series-result.md`.

The authors' blinded private figure is 0.39 Pearson on hundreds of compounds
per assay. Ours is 0.318 Spearman on ten. Different statistics on different
sets, and they land in the same place. Our narrow window measurement agrees
with what the people who built the model measured on data no public corpus can
contaminate.

So the window figure measures the model's accuracy on medicinal chemistry
data, reproduced from public measurements that a buyer can fetch and rerun.

## What the authors measured about compound similarity

For the FEP+ benchmark they computed the maximum Tanimoto similarity of each
test compound to the affinity training set and report no significant
dependence between prediction performance and compound similarity. On CASP16
the maximum similarities were 0.41 and 0.59, which they call low enough to
alleviate concerns about compound level leakage.

That is evidence against compound level memorisation driving the result, it is
their analysis on their benchmark, and it is correlational. It does not
establish that our compounds are absent from their training set.

## What changes because of this

Three things.

The site states that the folding model's training set is not a control we own,
and says what our clustering rule does control.

The corpus median of 0.607 is described as a public benchmark number, which is
what it is.

The within-window figure of 0.318 is published beside it with the authors' own
blinded private figure of 0.39 for comparison, so a reader can see that the two
agree.

## What would close this

A list of the training target and ligand pairs, or the assay record IDs. We
will ask. Until somebody publishes them, no group using these weights on public
affinity data can rule out overlap, and a paper that claims to has not checked.

The alternative that needs no cooperation is a prospective measurement, where
the compound is measured after the prediction is made. That is Phase 4 and it
needs a laboratory.

## Sources

- Boltz-2 preprint, bioRxiv 10.1101/2025.06.14.659707, appendix A.2.1 for the
  affinity curation, appendix E for the blinded private assays, Table 16.
- Issue 706 on the model's repository, opened 27 September 2026, asking for the
  training pairs for overlap checks. No reply as of 16 October 2026.
