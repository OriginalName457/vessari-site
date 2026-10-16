# How much of our screening library anybody can buy

Measured 16 October 2026 against PubChem. Exploratory, with the sample size
chosen for cost rather than for power, and the one comparison it suggests is
not established.

## The question

A ranked shortlist is worth something when the compounds on it can be ordered.
Our libraries are built from compounds measured against a target in ChEMBL,
which are compounds somebody published. A published compound and a catalogue
compound are different things and we had never checked how far apart they are.

## Method

Forty five compounds sampled with a fixed seed from the screening libraries,
fifteen from each of three groups: known binders, decoys, and the top 50 of
our own co-folded rankings. Each was resolved to a PubChem record by its
ChEMBL identifier, and counted as purchasable when PubChem's categories view
lists at least one chemical vendor for it.

All 45 resolved to a PubChem record, so the lookup found everything it was
asked about.

## What we found

| Group | With a vendor | Share | 95 percent interval |
|---|---|---|---|
| Known binders | 3 of 15 | 0.20 | 0.07 to 0.45 |
| Decoys | 5 of 15 | 0.33 | 0.15 to 0.58 |
| Top 50 of our ranking | 1 of 15 | 0.07 | 0.01 to 0.30 |
| **All sampled** | **9 of 45** | **0.20** | **0.11 to 0.34** |

**One compound in five from a ChEMBL built screening library has a chemical
vendor.** The other four are in the literature and not on a shelf.

## The pattern this suggests, and does not establish

The top of our own ranking is the least purchasable part of the library, 1 of
15 against 5 of 15 for the decoys. A two sided exact test gives p equal to
0.141 against the decoys and 0.568 against the known binders, so at fifteen
compounds a group this is a direction and not a result.

There is a reason to expect it. Our top picks are recent, potent compounds
from papers and patents, and those are the ones least likely to be stocked.
The single purchasable compound in our top 50 is CHEMBL5922366, listed by
EvitaChem, Key Organics and Enamine. The most widely stocked compound in the
whole sample is a decoy with 70 vendors.

Testing this properly needs a few hundred compounds per group rather than
fifteen, which is an afternoon of polite requests and is worth doing before
anyone repeats the suggestion as a finding.

## What this changes about what we claim

The retrospective screen measures whether the pipeline can recover binders
hidden in a library. It does that and the numbers are on the screen page. It
does not demonstrate that the output is an order form, because four compounds
in five on it cannot be ordered.

Those are two different claims and only the first one is ours today.

## What closes it

Screening a purchasable library rather than a measured one. Enamine REAL holds
more than 100 billion make on demand compounds and ZINC-22 holds billions
built in three dimensions, both with catalogue identifiers on every row. The
cost is not the screen, it is that a purchasable library has no measured
affinities in it, so the result becomes a prospective prediction that needs a
laboratory to check rather than a retrospective recovery we can score
ourselves.

So this is the point where the retrospective road ends and Phase 4 begins.

## Files

- `benchmarks/results/purchasability.json`, every compound sampled with its
  PubChem identifier and its vendor count.
- `scripts/purchasability.py`, the run.
